"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const monitoring_constant_1 = require("./monitoring.constant");
const ApiError_1 = __importDefault(require("../../error/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const prisma_1 = __importDefault(require("../../shared/prisma"));
const config_1 = __importDefault(require("../../config"));
const paginationHelper_1 = __importDefault(require("../../helper/paginationHelper"));
const getDateRangeForPeriod_1 = __importDefault(require("../../../utility/DateRange/getDateRangeForPeriod"));
const golobalErrorHnadelar_1 = require("../../middleware/golobalErrorHnadelar");
// In-memory cache for IP locations
const ipLocationCache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000;
// Batch processing constants
const BATCH_SIZE = 100;
const BATCH_INTERVAL = 5000;
let batchQueue = [];
let batchTimeout = null;
// Cache for monitoring records to reduce database queries
const monitoringCache = new Map();
function getIpLocation(ipAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const now = Date.now();
        const cached = ipLocationCache.get(ipAddress);
        if (cached && now - cached.timestamp < CACHE_DURATION) {
            return { country: cached.country_name, city: cached.city };
        }
        try {
            const response = yield fetch(`${config_1.default.ipaddress_tracker}/${ipAddress}`);
            const data = yield response.json();
            ipLocationCache.set(ipAddress, {
                country_name: data.country,
                city: data.city,
                timestamp: now,
            });
            return { country: data.country, city: data.city };
        }
        catch (error) {
            throw new golobalErrorHnadelar_1.AppError(http_status_1.default.SERVICE_UNAVAILABLE, `Failed to fetch location for IP ${ipAddress}`, error === null || error === void 0 ? void 0 : error.message);
        }
    });
}
/**
 * Process a batch of monitoring records
 */
function processBatch(records) {
    return __awaiter(this, void 0, void 0, function* () {
        const uniqueIps = [...new Set(records.map((r) => r.ipaddress))];
        const existingRecords = yield prisma_1.default.monitoring.findMany({
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
            monitoringCache.set(record.ipaddress, record);
        });
        const existingMap = new Map(existingRecords.map((record) => [record.ipaddress, record]));
        const ipLocations = yield Promise.all(uniqueIps.map((ip) => getIpLocation(ip)));
        const ipLocationMap = new Map(uniqueIps.map((ip, index) => [ip, ipLocations[index]]));
        const operations = records.map((payload) => {
            const existing = existingMap.get(payload.ipaddress);
            const { country, city } = ipLocationMap.get(payload.ipaddress) || { country: "Unknown", city: "Unknown" };
            if (existing) {
                return prisma_1.default.monitoring.update({
                    where: { id: existing.id },
                    data: Object.assign(Object.assign({}, payload), { country,
                        city, visitcount: (existing.visitcount || 0) + 1, updatedAt: new Date() }),
                });
            }
            else {
                return prisma_1.default.monitoring.create({
                    data: Object.assign(Object.assign({}, payload), { country,
                        city, visitcount: 1, updatedAt: new Date() }),
                });
            }
        });
        return yield prisma_1.default.$transaction(operations);
    });
}
/**
 * Queue a monitoring record for batch processing
 */
const queueForBatch = (payload) => {
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
const recordedUserActivityIntoDb = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield queueForBatch(payload);
    }
    catch (error) {
        throw new ApiError_1.default(http_status_1.default.SERVICE_UNAVAILABLE, "Monitoring recorded issues", error === null || error === void 0 ? void 0 : error.message);
    }
});
/**
 * Cleanup pending batches
 */
const cleanup = () => __awaiter(void 0, void 0, void 0, function* () {
    if (batchTimeout) {
        clearTimeout(batchTimeout);
        batchTimeout = null;
    }
    if (batchQueue.length > 0) {
        const finalBatch = [...batchQueue];
        batchQueue = [];
        yield processBatch(finalBatch);
    }
});
/**
 * Fetch all recorded user activities from the database
 */
const allrecordedUserActivity_FromDb = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = (0, paginationHelper_1.default)(options);
    const { searchTerm, user, timePeriod } = filters, filterData = __rest(filters, ["searchTerm", "user", "timePeriod"]);
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: monitoring_constant_1.monitoringSearchableFields === null || monitoring_constant_1.monitoringSearchableFields === void 0 ? void 0 : monitoring_constant_1.monitoringSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }
    if (timePeriod) {
        const dateRange = (0, getDateRangeForPeriod_1.default)(timePeriod);
        andConditions.push({
            updatedAt: dateRange,
        });
    }
    if (Object.keys(filterData).length > 0) {
        const filterConditions = Object.keys(filterData).map((key) => ({
            [key]: {
                equals: filterData[key],
            },
        }));
        andConditions.push(...filterConditions);
    }
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    try {
        const cacheKey = JSON.stringify({ filters, options });
        const cachedResult = monitoringCache.get(cacheKey);
        if (cachedResult) {
            return cachedResult;
        }
        // Fetch data from the database
        const result = yield prisma_1.default.monitoring.findMany({
            where: whereConditions,
            skip,
            take: limit,
            orderBy: options.sortBy && options.orderBy
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
        const total = yield prisma_1.default.monitoring.count({
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
    }
    catch (error) {
        throw new ApiError_1.default(http_status_1.default.SERVICE_UNAVAILABLE, "All recorded user activity issues", error === null || error === void 0 ? void 0 : error.message);
    }
});
/**
 * Find a specific monitoring record by ID
 */
const findSpecificRecordFromDb = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cacheKey = `specificRecord-${id}`;
        const cachedResult = monitoringCache.get(cacheKey);
        if (cachedResult) {
            return cachedResult;
        }
        const result = yield prisma_1.default.monitoring.findFirstOrThrow({
            where: { id },
        });
        monitoringCache.set(cacheKey, result);
        return result;
    }
    catch (error) {
        throw new ApiError_1.default(http_status_1.default.SERVICE_UNAVAILABLE, "find specific record activity issues", error === null || error === void 0 ? void 0 : error.message);
    }
});
/**
 * Update a monitoring record by ID
 */
const updateMonitoringRecordFromDb = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield prisma_1.default.monitoring.update({
            where: {
                id,
            },
            data: payload,
        });
        monitoringCache.delete(`specificRecord-${id}`);
        return result ? { message: "Successfully Recorded" } : null;
    }
    catch (error) {
        throw new ApiError_1.default(http_status_1.default.SERVICE_UNAVAILABLE, "update monitoring record issues", error === null || error === void 0 ? void 0 : error.message);
    }
});
const deleteMultipleMonitoringRecordsFromDb = (ids) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield prisma_1.default.monitoring.deleteMany({
            where: {
                id: { in: ids },
            },
        });
        ids.forEach((id) => monitoringCache.delete(`specificRecord-${id}`));
        return { success: true, message: `${result.count} records deleted.` };
    }
    catch (error) {
        throw new ApiError_1.default(http_status_1.default.SERVICE_UNAVAILABLE, "delete multiple monitoring records issues", error === null || error === void 0 ? void 0 : error.message);
    }
});
const UserMonitoringServices = {
    recordedUserActivityIntoDb,
    cleanup,
    allrecordedUserActivity_FromDb,
    findSpecificRecordFromDb,
    updateMonitoringRecordFromDb,
    deleteMultipleMonitoringRecordsFromDb,
};
exports.default = UserMonitoringServices;
