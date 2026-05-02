import { monitoringSearchableFields, TimePeriod } from "./monitoring.constant";
import { Monitoring, Prisma } from "@prisma/client";
import ApiError from "../../error/ApiError";
import httpStatus from "http-status";
import prisma from "../../shared/prisma";
import config from "../../config";
import { IPaginationOptions } from "../../interfaces/pagination";
import { TMonitoringFilterRequest } from "./monitoring.interface";
import calculatePagination from "../../helper/paginationHelper";
import getDateRangeForPeriod from "../../../utility/DateRange/getDateRangeForPeriod";
import { AppError } from "../../middleware/golobalErrorHnadelar";

// In-memory cache for IP locations
const ipLocationCache = new Map<
  string,
  {
    country_name: string;
    city: string;
    timestamp: number;
  }
>();
const CACHE_DURATION = 24 * 60 * 60 * 1000;

// Batch processing constants
const BATCH_SIZE = 100;
const BATCH_INTERVAL = 5000;

let batchQueue: Monitoring[] = [];
let batchTimeout: NodeJS.Timeout | null = null;

// Cache for monitoring records to reduce database queries
const monitoringCache = new Map<string, any>();
async function getIpLocation(ipAddress: string): Promise<{ country: string; city: string }> {
  const now = Date.now();
  const cached = ipLocationCache.get(ipAddress);

  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return { country: cached.country_name, city: cached.city };
  }

  try {
    const response = await fetch(`${config.ipaddress_tracker}/${ipAddress}`);
    const data = await response.json();

    ipLocationCache.set(ipAddress, {
      country_name: data.country,
      city: data.city,
      timestamp: now,
    });

    return { country: data.country, city: data.city };
  } catch (error: any) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      `Failed to fetch location for IP ${ipAddress}`,
      error?.message
    );
  }
}

/**
 * Process a batch of monitoring records
 */
async function processBatch(records: Monitoring[]) {
  const uniqueIps = [...new Set(records.map((r) => r.ipaddress))];

  const existingRecords = await prisma.monitoring.findMany({
    where: {
      ipaddress: {
        in: uniqueIps,
      },
    },
    select: {
      id: true,
      ipaddress: true,
      visitcount: true,
    },
  });

  existingRecords.forEach((record) => {
    monitoringCache.set(record.ipaddress, record as Monitoring);
  });

  const existingMap = new Map(existingRecords.map((record) => [record.ipaddress, record]));

  const ipLocations = await Promise.all(uniqueIps.map((ip) => getIpLocation(ip)));
  const ipLocationMap = new Map(
    uniqueIps.map((ip, index) => [ip, ipLocations[index]])
  );

  const operations = records.map((payload) => {
    const existing = existingMap.get(payload.ipaddress);
    const { country, city } = ipLocationMap.get(payload.ipaddress) || { country: "Unknown", city: "Unknown" };

    if (existing) {
      return prisma.monitoring.update({
        where: { id: existing.id },
        data: {
          ...payload,
          country,
          city,
          visitcount: (existing.visitcount || 0) + 1,
          updatedAt: new Date(),
        },
      });
    } else {
      return prisma.monitoring.create({
        data: {
          ...payload,
          country,
          city,
          visitcount: 1,
          updatedAt: new Date(),
        },
      });
    }
  });

  return await prisma.$transaction(operations);
}

/**
 * Queue a monitoring record for batch processing
 */
const queueForBatch = (payload: Monitoring) => {
  batchQueue.push(payload);

  if (batchQueue.length >= BATCH_SIZE) {
    const currentBatch = [...batchQueue];
    batchQueue = [];
    return processBatch(currentBatch);
  }

  if (!batchTimeout) {
    batchTimeout = setTimeout(() => {
      if (batchQueue.length > 0) {
        const currentBatch = [...batchQueue];
        batchQueue = [];
        batchTimeout = null;
        processBatch(currentBatch).catch(console.error);
      }
    }, BATCH_INTERVAL);
  }

  return Promise.resolve(null);
};


/**
 * Record user activity into the database
 */
const recordedUserActivityIntoDb = async (payload: Monitoring) => {
  try {
    return await queueForBatch(payload);
  } catch (error: any) {
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      "Monitoring recorded issues",
      error?.message
    );
  }
};

/**
 * Cleanup pending batches
 */
const cleanup = async () => {
  if (batchTimeout) {
    clearTimeout(batchTimeout);
    batchTimeout = null;
  }

  if (batchQueue.length > 0) {
    const finalBatch = [...batchQueue];
    batchQueue = [];
    await processBatch(finalBatch);
  }
};

/**
 * Fetch all recorded user activities from the database
 */
const allrecordedUserActivity_FromDb = async (
  filters: TMonitoringFilterRequest & { timePeriod?: TimePeriod },
  options: IPaginationOptions
) => {
  const { limit, page, skip } = calculatePagination(options);
  const { searchTerm, user, timePeriod, ...filterData } = filters;
  const andConditions: Prisma.MonitoringWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: monitoringSearchableFields?.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (timePeriod) {
    const dateRange = getDateRangeForPeriod(timePeriod);
    andConditions.push({
      updatedAt: dateRange,
    });
  }

  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.keys(filterData).map((key) => ({
      [key]: {
        equals: (filterData as any)[key],
      },
    }));
    andConditions.push(...filterConditions);
  }

  const whereConditions: Prisma.MonitoringWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  try {
    const cacheKey = JSON.stringify({ filters, options });
    const cachedResult = monitoringCache.get(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    // Fetch data from the database
    const result = await prisma.monitoring.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy:
        options.sortBy && options.orderBy
          ? { [options.sortBy]: options.orderBy }
          : { visitcount: "desc" },
      include: {
        user: {
          include: {
            Monitoring: true,
          },
        },
      },
    });

    const total = await prisma.monitoring.count({
      where: whereConditions,
    });

    const response = {
      meta: {
        total,
        page,
        limit,
      },
      data: result,
    };

    monitoringCache.set(cacheKey, response);
    return response;
    
  } catch (error: any) {
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      "All recorded user activity issues",
      error?.message
    );
  }
};

/**
 * Find a specific monitoring record by ID
 */
const findSpecificRecordFromDb = async (id: string) => {
  try {
    const cacheKey = `specificRecord-${id}`;
    const cachedResult = monitoringCache.get(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    const result = await prisma.monitoring.findFirstOrThrow({
      where: { id },
    });

    monitoringCache.set(cacheKey, result);

    return result;
  } catch (error: any) {
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      "find specific record activity issues",
      error?.message
    );
  }
};

/**
 * Update a monitoring record by ID
 */

const updateMonitoringRecordFromDb = async (
  id: string,
  payload: Monitoring
) => {
  try {
    const result = await prisma.monitoring.update({
      where: {
        id,
      },
      data: payload,
    });

    monitoringCache.delete(`specificRecord-${id}`);

    return result ? { message: "Successfully Recorded" } : null;
  } catch (error: any) {
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      "update monitoring record issues",
      error?.message
    );
  }
};

const deleteMultipleMonitoringRecordsFromDb = async (ids: string[]) => {
  try {
    const result = await prisma.monitoring.deleteMany({
      where: {
        id: { in: ids },
      },
    });
    ids.forEach((id) => monitoringCache.delete(`specificRecord-${id}`));

    return { success: true, message: `${result.count} records deleted.` };
  } catch (error: any) {
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      "delete multiple monitoring records issues",
      error?.message
    );
  }
};

const UserMonitoringServices = {
  recordedUserActivityIntoDb,
  cleanup,
  allrecordedUserActivity_FromDb,
  findSpecificRecordFromDb,
  updateMonitoringRecordFromDb,
  deleteMultipleMonitoringRecordsFromDb,
};

export default UserMonitoringServices;
