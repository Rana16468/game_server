import { Monitoring, Prisma, User, UserRole, UserStatus } from "@prisma/client";
import bcrypt from "bcrypt";
import NodeCache from "node-cache";
import config from "../../config";
import ApiError from "../../error/ApiError";
import httpStatus from "http-status";
import prisma from "../../shared/prisma";
import CheckedUser from "../../shared/CheckedUser/CheckedUser";
import { AppError } from "../../middleware/golobalErrorHnadelar";
import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import { IFile } from "../../interfaces/IFile";
import sendImageToCloudinary from "../../../utility/Image/sendImageToCloudinary";
import { jwtHalpers } from "../../helper/jwtHealpers";
import sendEmail from "../../../utility/Email/sendEmail";
import AuthenticationEmailBody from "../../../utility/Email/EmailBody/AuthenticationEmailBody";
import { TUserFilterRequest } from "./users.interface";
import { TimePeriod } from "../../shared/common/commontypes";
import { IPaginationOptions } from "../../interfaces/pagination";
import calculatePagination from "../../helper/paginationHelper";
import { userSearchableFields } from "./users.constant";
import getDateRangeForPeriod from "../../../utility/DateRange/getDateRangeForPeriod";

// Cache configuration with NodeCache
const appCache = new NodeCache({
  stdTTL: 86400, // 24 hours in seconds
  checkperiod: 3600 // Automatic delete check every hour
});

const createUserIntoDb = async (payload: User & Monitoring) => {
  const {
    username,
    email,
    password,
    ipaddress,
    phonenumber,
    role,
    photo,
    os,
    browser,
    device,
  } = payload || {};

  try {
    const cacheKey = `ip_${ipaddress}`;
    let ipData = appCache.get(cacheKey);

    if (!ipData) {
      const response = await fetch(`${config.ipaddress_tracker}/${ipaddress}`);
      ipData = await response.json();
      appCache.set(cacheKey, ipData);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });

    if (existingUser) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "User already exists with this email",
        ""
      );
    }

    const hashedPassword = await bcrypt.hash(
      password as string,
      Number(config.bcrypt_salt_rounds)
    );

    const newUser = await prisma.$transaction(
      async (tx) => {
        const createdUser = await tx.user.create({
          data: {
            username,
            email,
            password: hashedPassword,
            ipaddress,
            phonenumber,
            role,
            photo,
          },
          select: { id: true, email: true, role: true, username: true },
        });

        // Check if a monitoring record already exists for this IP
        const monitoringRecord = await tx.monitoring.findFirst({
          where: { ipaddress, userId: createdUser.id },
          select: {
            id: true
          }
        });

        if (monitoringRecord) {
          // If exists, update monitoring data
          await tx.monitoring.update({
            where: { id: monitoringRecord.id },
            data: {
              visitcount: { increment: 1 },
              os,
              browser,
              device,
              country: (ipData as any)?.country,
              city: (ipData as any)?.city,
              user: {
                connect: { id: createdUser.id }
              }
            },
            select: {
              id: true
            }
          });
        } else {
          // If not exists, create new monitoring record
          await tx.monitoring.create({
            data: {
              ipaddress,
              country: (ipData as any)?.country,
              visitcount: 1,
              os,
              browser,
              device,
              city: (ipData as any)?.city,
              user: {
                connect: { id: createdUser.id }
              }
            },
            select: { id: true }
          });
        }

        return createdUser;
      },
      { timeout: 10000 }
    );

    const authenticationToken = jwtHalpers.generateToken(
      { email: newUser.email, role: newUser.role, id: newUser.id },
      config.jwt_access_srcret as string,
      config.forgot_token_expries_in as string
    );

    const verifiedAuthenticationLink = `${config.frontend_link}/auth?id=${newUser.id}&token=${authenticationToken}`;
    const authBody = await AuthenticationEmailBody(newUser, verifiedAuthenticationLink);

    await sendEmail(newUser.email, authBody);

    // Cache temporary user data
    appCache.set(`temp_user_${newUser.id}`, newUser, 3600); // 1 hour cache

    return {
      success: true,
      message: "User created successfully. Check your mailbox or spam folder",
      user: verifiedAuthenticationLink,
    };
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      "User registration failed due to server issues",
      error.message
    );
  }
};

const myProfileFromDb = async (user: JwtPayload) => {
  try {
    const cacheKey = `user_profile_${user.id}`;
    const cachedProfile = appCache.get(cacheKey);

    if (cachedProfile) {
      return cachedProfile;
    }

    const result = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        username: true,
        email: true,
        role: true,
        phonenumber: true,
        photo: true,
        status: true,
        Monitoring: {
          where: { userId: user.id },
          select: { browser: true, device: true, os: true, updatedAt: true },
        },
      },
    });

    if (result) {
      appCache.set(cacheKey, result);
    }

    return result;
  } catch (error: any) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      "Specific profile data filtering issues",
      error
    );
  }
};

const updateMyProfileIntoDb = async (user: JwtPayload, req: Request) => {
  return prisma.$transaction(async (tx) => {
    try {
      const file = req.file as IFile;
      if (!file) throw new AppError(httpStatus.NOT_FOUND, "No file uploaded", "");

      const { secure_url } = (await sendImageToCloudinary(
        file.filename,
        file.path
      )) as any;
      if (!secure_url) throw new AppError(httpStatus.NOT_FOUND, "Image upload failed", "");

      const result = await tx.user.update({
        where: { id: user.id },
        data: { photo: secure_url, username: req.body.username },
        select: { username: true, id: true },
      });

      // Invalidate cache and update with new data
      appCache.del(`user_profile_${user.id}`);
      const newProfile = await myProfileFromDb(user);
      if (newProfile) {
        appCache.set(`user_profile_${user.id}`, newProfile);
      }

      return result;
    } catch (error: any) {
      throw new AppError(
        httpStatus.SERVICE_UNAVAILABLE,
        "Transaction Failed",
        error
      );
    }
  });
};

const chnageProfileStatusFromDb = async (
  payload: { role: UserRole },
  userId: string,
  user: { id: string }
) => {
  const isAdminExist = await CheckedUser({ id: user.id, role: UserRole.ADMIN });
  if (!isAdminExist?.isVerified) {
    throw new AppError(httpStatus.BAD_REQUEST, "Admin Not Founded", "");
  }

  const result = await prisma.user.update({
    where: { id: userId, isVerified: true, status: UserStatus.ACTIVE },
    data: { role: payload?.role },
    select: { id: true, role: true },
  });

  // Invalidate relevant caches
  appCache.del(`user_profile_${userId}`);
  appCache.del(`user_profile_${user.id}`);

  return result;
};

// Initialize caches with 10 minute TTL
const userProfileCache = new NodeCache({ stdTTL: 600 });
const userListingCache = new NodeCache({ stdTTL: 600 });

const userVarificationStatusChangeFromDb = async (payload: {
  id: string;
  email: string;
}) => {
  try {
    const result = await prisma.user.update({
      where: {
        id: payload.id,
        email: payload?.email,
      },
      data: {
        isVerified: true,
      },
      select: {
        isVerified: true,
      },
    });

    // Invalidate cached user profile and listings
    userProfileCache.del(payload.id);
    userListingCache.flushAll();

    return result;
  } catch (error: any) {
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      "User verification status change failed due to server issues",
      error
    );
  }
};

const findAllUserFromDb = async (
  filters: TUserFilterRequest & { timePeriod?: TimePeriod },
  options: IPaginationOptions
) => {
  const cacheKey = JSON.stringify({ filters, options });
  const cachedData = userListingCache.get(cacheKey);

  if (cachedData) {
    return cachedData as {
      meta: { total: number; page: number; limit: number };
      data: User[];
    };
  }

  const { limit, page, skip } = calculatePagination(options);
  const { searchTerm, timePeriod, ...filterData } = filters;
  const andConditions: Prisma.UserWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: userSearchableFields?.map((field) => ({
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

  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  try {
    const [result, total] = await Promise.all([
      prisma.user.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy:
          options.sortBy && options.orderBy
            ? { [options.sortBy]: options.orderBy }
            : { updatedAt: "desc" },
        include: {
          Monitoring: true,
        },
      }),
      prisma.user.count({
        where: whereConditions,
      }),
    ]);

    const finalResult = {
      meta: {
        total,
        page,
        limit,
      },
      data: result,
    };

    // Cache the result with TTL
    userListingCache.set(cacheKey, finalResult);
    return finalResult;
  } catch (error: any) {
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      "All recorded user activity issues",
      error?.message
    );
  }
};


const getIpLocation = async (ip: string) => {
  try {
    const response = await fetch(`${config.ipaddress_tracker}/${ip}`);
    if (!response.ok) {
      throw new AppError(
        httpStatus.BAD_GATEWAY,
        `Failed to fetch IP location: ${response.statusText}`,
        ''
      );
    }
    return await response.json();
  } catch (error) {
    console.error('IP location fetch error:', error);
    return null;
  }
};

const socialMediaLoginIntoDb = async (payload: User & Monitoring) => {
  const {
    username,
    email,
    ipaddress,
    phonenumber,
    password,
    role,
    photo,
    os,
    browser,
    device,
  } = payload || {};

  try {
    const ipData = await getIpLocation(ipaddress);

  

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    const existingMonitoring = existingUser
      ? await prisma.monitoring.findFirst({
        where: { ipaddress, userId: existingUser.id },
      })
      : null;

    if (existingUser) {
      const loginUser = await prisma.$transaction(
        async (tx) => {
          const updatedUser = await tx.user.update({
            where: { email },
            data: {
              username,
              ipaddress,
              photo,
            },
            select: {
              id: true,
              email: true,
              role: true,
              username: true,
              photo: true,
            },
          });

          if (existingMonitoring) {
            await tx.monitoring.update({
              where: { id: existingMonitoring.id },
              data: {
                visitcount: { increment: 1 },
                os,
                browser,
                
                device,
                ipaddress,
                country: ipData?.country,
                city: ipData?.city,
              },
            });
          } else {
            await tx.monitoring.create({
              data: {
                ipaddress,
                country: ipData?.country,
              
                city: ipData?.city,
                visitcount: 1,
                os,
                browser,
                device,
                userId: updatedUser.id,
                
              },
            });
          }

          return updatedUser;
        },
        { timeout: 10000 }
      );

      const accessToken = jwtHalpers.generateToken(
        { email: loginUser.email, role: loginUser.role, id: loginUser.id },
        config.jwt_access_srcret as string,
        config.token_expire_in as string
      );

      const refreshToken = jwtHalpers.generateToken(
        { email: loginUser.email, role: loginUser.role, id: loginUser.id },
        config.jwt_refeesh_srcret as string,
        config.refresh_token_expire_in as string
      );

      userProfileCache.set(loginUser.id, loginUser);
      return { accessToken, refreshToken };
    }

    const newUser = await prisma.$transaction(
      async (tx) => {
        const createdUser = await tx.user.create({
          data: {
            username,
            email,
            ipaddress,
            phonenumber,
            role,
            photo,
            isVerified: true,
            password
          },
          select: {
            id: true,
            email: true,
            role: true,
            username: true,
            photo: true,
          },
        });

        await tx.monitoring.create({
          data: {
            ipaddress,
            country: ipData?.country,
            city: ipData?.city,
            visitcount: 1,
            os,
            browser,
            device,
            userId: createdUser.id,
          },
        });

        return createdUser;
      },
      { timeout: 10000 }
    );

    const accessToken = jwtHalpers.generateToken(
      { email: newUser.email, role: newUser.role, id: newUser.id },
      config.jwt_refeesh_srcret as string,
      config.token_expire_in as string
    );

    const refreshToken = jwtHalpers.generateToken(
      { email: newUser.email, role: newUser.role, id: newUser.id },
      config.jwt_refeesh_srcret as string,
      config.refresh_token_expire_in as string
    );

    userProfileCache.set(newUser.id, newUser);
    return { accessToken, refreshToken };
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'social_medial_login server issues',
      error
    );
  }
};

const UsersServices = {
  createUserIntoDb,
  chnageProfileStatusFromDb,
  updateMyProfileIntoDb,
  myProfileFromDb,
  userVarificationStatusChangeFromDb,
  findAllUserFromDb,
  socialMediaLoginIntoDb
};

export default UsersServices;