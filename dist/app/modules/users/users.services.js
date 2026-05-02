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
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const node_cache_1 = __importDefault(require("node-cache"));
const config_1 = __importDefault(require("../../config"));
const ApiError_1 = __importDefault(require("../../error/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const prisma_1 = __importDefault(require("../../shared/prisma"));
const CheckedUser_1 = __importDefault(require("../../shared/CheckedUser/CheckedUser"));
const golobalErrorHnadelar_1 = require("../../middleware/golobalErrorHnadelar");
const sendImageToCloudinary_1 = __importDefault(require("../../../utility/Image/sendImageToCloudinary"));
const jwtHealpers_1 = require("../../helper/jwtHealpers");
const sendEmail_1 = __importDefault(require("../../../utility/Email/sendEmail"));
const AuthenticationEmailBody_1 = __importDefault(require("../../../utility/Email/EmailBody/AuthenticationEmailBody"));
const paginationHelper_1 = __importDefault(require("../../helper/paginationHelper"));
const users_constant_1 = require("./users.constant");
const getDateRangeForPeriod_1 = __importDefault(require("../../../utility/DateRange/getDateRangeForPeriod"));
// Cache configuration with NodeCache
const appCache = new node_cache_1.default({
    stdTTL: 86400, // 24 hours in seconds
    checkperiod: 3600 // Automatic delete check every hour
});
const createUserIntoDb = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password, ipaddress, phonenumber, role, photo, os, browser, device, } = payload || {};
    try {
        const cacheKey = `ip_${ipaddress}`;
        let ipData = appCache.get(cacheKey);
        if (!ipData) {
            const response = yield fetch(`${config_1.default.ipaddress_tracker}/${ipaddress}`);
            ipData = yield response.json();
            appCache.set(cacheKey, ipData);
        }
        const existingUser = yield prisma_1.default.user.findUnique({
            where: { email },
            select: { id: true }
        });
        if (existingUser) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "User already exists with this email", "");
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, Number(config_1.default.bcrypt_salt_rounds));
        const newUser = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const createdUser = yield tx.user.create({
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
            const monitoringRecord = yield tx.monitoring.findFirst({
                where: { ipaddress, userId: createdUser.id },
                select: {
                    id: true
                }
            });
            if (monitoringRecord) {
                // If exists, update monitoring data
                yield tx.monitoring.update({
                    where: { id: monitoringRecord.id },
                    data: {
                        visitcount: { increment: 1 },
                        os,
                        browser,
                        device,
                        country: ipData === null || ipData === void 0 ? void 0 : ipData.country,
                        city: ipData === null || ipData === void 0 ? void 0 : ipData.city,
                        user: {
                            connect: { id: createdUser.id }
                        }
                    },
                    select: {
                        id: true
                    }
                });
            }
            else {
                // If not exists, create new monitoring record
                yield tx.monitoring.create({
                    data: {
                        ipaddress,
                        country: ipData === null || ipData === void 0 ? void 0 : ipData.country,
                        visitcount: 1,
                        os,
                        browser,
                        device,
                        city: ipData === null || ipData === void 0 ? void 0 : ipData.city,
                        user: {
                            connect: { id: createdUser.id }
                        }
                    },
                    select: { id: true }
                });
            }
            return createdUser;
        }), { timeout: 10000 });
        const authenticationToken = jwtHealpers_1.jwtHalpers.generateToken({ email: newUser.email, role: newUser.role, id: newUser.id }, config_1.default.jwt_access_srcret, config_1.default.forgot_token_expries_in);
        const verifiedAuthenticationLink = `${config_1.default.frontend_link}/auth?id=${newUser.id}&token=${authenticationToken}`;
        const authBody = yield (0, AuthenticationEmailBody_1.default)(newUser, verifiedAuthenticationLink);
        yield (0, sendEmail_1.default)(newUser.email, authBody);
        // Cache temporary user data
        appCache.set(`temp_user_${newUser.id}`, newUser, 3600); // 1 hour cache
        return {
            success: true,
            message: "User created successfully. Check your mailbox or spam folder",
            user: verifiedAuthenticationLink,
        };
    }
    catch (error) {
        if (error instanceof ApiError_1.default)
            throw error;
        throw new ApiError_1.default(http_status_1.default.SERVICE_UNAVAILABLE, "User registration failed due to server issues", error.message);
    }
});
const myProfileFromDb = (user) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cacheKey = `user_profile_${user.id}`;
        const cachedProfile = appCache.get(cacheKey);
        if (cachedProfile) {
            return cachedProfile;
        }
        const result = yield prisma_1.default.user.findUnique({
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
    }
    catch (error) {
        throw new golobalErrorHnadelar_1.AppError(http_status_1.default.SERVICE_UNAVAILABLE, "Specific profile data filtering issues", error);
    }
});
const updateMyProfileIntoDb = (user, req) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const file = req.file;
            if (!file)
                throw new golobalErrorHnadelar_1.AppError(http_status_1.default.NOT_FOUND, "No file uploaded", "");
            const { secure_url } = (yield (0, sendImageToCloudinary_1.default)(file.filename, file.path));
            if (!secure_url)
                throw new golobalErrorHnadelar_1.AppError(http_status_1.default.NOT_FOUND, "Image upload failed", "");
            const result = yield tx.user.update({
                where: { id: user.id },
                data: { photo: secure_url, username: req.body.username },
                select: { username: true, id: true },
            });
            // Invalidate cache and update with new data
            appCache.del(`user_profile_${user.id}`);
            const newProfile = yield myProfileFromDb(user);
            if (newProfile) {
                appCache.set(`user_profile_${user.id}`, newProfile);
            }
            return result;
        }
        catch (error) {
            throw new golobalErrorHnadelar_1.AppError(http_status_1.default.SERVICE_UNAVAILABLE, "Transaction Failed", error);
        }
    }));
});
const chnageProfileStatusFromDb = (payload, userId, user) => __awaiter(void 0, void 0, void 0, function* () {
    const isAdminExist = yield (0, CheckedUser_1.default)({ id: user.id, role: client_1.UserRole.ADMIN });
    if (!(isAdminExist === null || isAdminExist === void 0 ? void 0 : isAdminExist.isVerified)) {
        throw new golobalErrorHnadelar_1.AppError(http_status_1.default.BAD_REQUEST, "Admin Not Founded", "");
    }
    const result = yield prisma_1.default.user.update({
        where: { id: userId, isVerified: true, status: client_1.UserStatus.ACTIVE },
        data: { role: payload === null || payload === void 0 ? void 0 : payload.role },
        select: { id: true, role: true },
    });
    // Invalidate relevant caches
    appCache.del(`user_profile_${userId}`);
    appCache.del(`user_profile_${user.id}`);
    return result;
});
// Initialize caches with 10 minute TTL
const userProfileCache = new node_cache_1.default({ stdTTL: 600 });
const userListingCache = new node_cache_1.default({ stdTTL: 600 });
const userVarificationStatusChangeFromDb = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield prisma_1.default.user.update({
            where: {
                id: payload.id,
                email: payload === null || payload === void 0 ? void 0 : payload.email,
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
    }
    catch (error) {
        throw new ApiError_1.default(http_status_1.default.SERVICE_UNAVAILABLE, "User verification status change failed due to server issues", error);
    }
});
const findAllUserFromDb = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const cacheKey = JSON.stringify({ filters, options });
    const cachedData = userListingCache.get(cacheKey);
    if (cachedData) {
        return cachedData;
    }
    const { limit, page, skip } = (0, paginationHelper_1.default)(options);
    const { searchTerm, timePeriod } = filters, filterData = __rest(filters, ["searchTerm", "timePeriod"]);
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: users_constant_1.userSearchableFields === null || users_constant_1.userSearchableFields === void 0 ? void 0 : users_constant_1.userSearchableFields.map((field) => ({
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
        const [result, total] = yield Promise.all([
            prisma_1.default.user.findMany({
                where: whereConditions,
                skip,
                take: limit,
                orderBy: options.sortBy && options.orderBy
                    ? { [options.sortBy]: options.orderBy }
                    : { updatedAt: "desc" },
                include: {
                    Monitoring: true,
                },
            }),
            prisma_1.default.user.count({
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
    }
    catch (error) {
        throw new ApiError_1.default(http_status_1.default.SERVICE_UNAVAILABLE, "All recorded user activity issues", error === null || error === void 0 ? void 0 : error.message);
    }
});
const getIpLocation = (ip) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield fetch(`${config_1.default.ipaddress_tracker}/${ip}`);
        if (!response.ok) {
            throw new golobalErrorHnadelar_1.AppError(http_status_1.default.BAD_GATEWAY, `Failed to fetch IP location: ${response.statusText}`, '');
        }
        return yield response.json();
    }
    catch (error) {
        console.error('IP location fetch error:', error);
        return null;
    }
});
const socialMediaLoginIntoDb = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, ipaddress, phonenumber, password, role, photo, os, browser, device, } = payload || {};
    try {
        const ipData = yield getIpLocation(ipaddress);
        const existingUser = yield prisma_1.default.user.findUnique({
            where: { email },
        });
        const existingMonitoring = existingUser
            ? yield prisma_1.default.monitoring.findFirst({
                where: { ipaddress, userId: existingUser.id },
            })
            : null;
        if (existingUser) {
            const loginUser = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
                const updatedUser = yield tx.user.update({
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
                    yield tx.monitoring.update({
                        where: { id: existingMonitoring.id },
                        data: {
                            visitcount: { increment: 1 },
                            os,
                            browser,
                            device,
                            ipaddress,
                            country: ipData === null || ipData === void 0 ? void 0 : ipData.country,
                            city: ipData === null || ipData === void 0 ? void 0 : ipData.city,
                        },
                    });
                }
                else {
                    yield tx.monitoring.create({
                        data: {
                            ipaddress,
                            country: ipData === null || ipData === void 0 ? void 0 : ipData.country,
                            city: ipData === null || ipData === void 0 ? void 0 : ipData.city,
                            visitcount: 1,
                            os,
                            browser,
                            device,
                            userId: updatedUser.id,
                        },
                    });
                }
                return updatedUser;
            }), { timeout: 10000 });
            const accessToken = jwtHealpers_1.jwtHalpers.generateToken({ email: loginUser.email, role: loginUser.role, id: loginUser.id }, config_1.default.jwt_access_srcret, config_1.default.token_expire_in);
            const refreshToken = jwtHealpers_1.jwtHalpers.generateToken({ email: loginUser.email, role: loginUser.role, id: loginUser.id }, config_1.default.jwt_refeesh_srcret, config_1.default.refresh_token_expire_in);
            userProfileCache.set(loginUser.id, loginUser);
            return { accessToken, refreshToken };
        }
        const newUser = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const createdUser = yield tx.user.create({
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
            yield tx.monitoring.create({
                data: {
                    ipaddress,
                    country: ipData === null || ipData === void 0 ? void 0 : ipData.country,
                    city: ipData === null || ipData === void 0 ? void 0 : ipData.city,
                    visitcount: 1,
                    os,
                    browser,
                    device,
                    userId: createdUser.id,
                },
            });
            return createdUser;
        }), { timeout: 10000 });
        const accessToken = jwtHealpers_1.jwtHalpers.generateToken({ email: newUser.email, role: newUser.role, id: newUser.id }, config_1.default.jwt_refeesh_srcret, config_1.default.token_expire_in);
        const refreshToken = jwtHealpers_1.jwtHalpers.generateToken({ email: newUser.email, role: newUser.role, id: newUser.id }, config_1.default.jwt_refeesh_srcret, config_1.default.refresh_token_expire_in);
        userProfileCache.set(newUser.id, newUser);
        return { accessToken, refreshToken };
    }
    catch (error) {
        if (error instanceof ApiError_1.default)
            throw error;
        throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'social_medial_login server issues', error);
    }
});
const UsersServices = {
    createUserIntoDb,
    chnageProfileStatusFromDb,
    updateMyProfileIntoDb,
    myProfileFromDb,
    userVarificationStatusChangeFromDb,
    findAllUserFromDb,
    socialMediaLoginIntoDb
};
exports.default = UsersServices;
