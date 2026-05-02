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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../shared/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwtHealpers_1 = require("../../helper/jwtHealpers");
const config_1 = __importDefault(require("../../config"));
const ApiError_1 = __importDefault(require("../../error/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const golobalErrorHnadelar_1 = require("../../middleware/golobalErrorHnadelar");
const sendEmail_1 = __importDefault(require("../../../utility/Email/sendEmail"));
const ForgotPasswordBody_1 = __importDefault(require("../../../utility/Email/EmailBody/ForgotPasswordBody"));
const node_cache_1 = __importDefault(require("node-cache"));
const cache = new node_cache_1.default({
    stdTTL: 3600,
    checkperiod: 600,
    maxKeys: 100000,
});
// Cache keys
const CACHE_KEYS = {
    USER_AUTH: "auth:user:",
    TOKEN_BLACKLIST: "auth:blacklist:",
    PASSWORD_ATTEMPTS: "auth:attempts:",
    RESET_TOKENS: "auth:reset:",
};
const RATE_LIMIT = {
    MAX_ATTEMPTS: 5,
    WINDOW_MS: 15 * 60 * 1000,
};
const loginUserIntoDb = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const cacheKey = `${CACHE_KEYS.USER_AUTH}${payload.email}`;
    const attemptsKey = `${CACHE_KEYS.PASSWORD_ATTEMPTS}${payload.email}`;
    const attempts = cache.get(attemptsKey) || 0;
    if (attempts >= RATE_LIMIT.MAX_ATTEMPTS) {
        throw new ApiError_1.default(http_status_1.default.TOO_MANY_REQUESTS, "Too many login attempts. Please try again later.", "");
    }
    try {
        let userData = cache.get(cacheKey);
        if (!userData) {
            userData = yield prisma_1.default.user.findUniqueOrThrow({
                where: {
                    email: payload.email,
                    status: client_1.UserStatus.ACTIVE,
                },
            });
            cache.set(cacheKey, userData, 3600); // Cache for 1 hour
        }
        const isCorrectPassword = yield bcrypt_1.default.compare(payload.password, userData.password);
        if (!isCorrectPassword) {
            cache.set(attemptsKey, attempts + 1, RATE_LIMIT.WINDOW_MS / 1000);
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Password Incorrect", "");
        }
        cache.del(attemptsKey);
        const accessToken = jwtHealpers_1.jwtHalpers.generateToken({ email: userData.email, role: userData.role, id: userData.id }, config_1.default.jwt_access_srcret, config_1.default.token_expire_in);
        const refreshToken = jwtHealpers_1.jwtHalpers.generateToken({ email: userData.email, role: userData.role, id: userData.id }, config_1.default.jwt_refeesh_srcret, config_1.default.refresh_token_expire_in);
        return { accessToken, refreshToken };
    }
    catch (error) {
        if (error instanceof ApiError_1.default)
            throw error;
        throw new ApiError_1.default(http_status_1.default.SERVICE_UNAVAILABLE, "Login failed", "");
    }
});
const refreshTokenIntoDb = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const blacklistKey = `${CACHE_KEYS.TOKEN_BLACKLIST}${token}`;
    if (cache.get(blacklistKey)) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Token is invalid", "");
    }
    try {
        const decodedData = jwtHealpers_1.jwtHalpers.varifyToken(token, config_1.default.jwt_refeesh_srcret);
        const cacheKey = `${CACHE_KEYS.USER_AUTH}${decodedData.email}`;
        let userData = cache.get(cacheKey);
        if (!userData) {
            userData = yield prisma_1.default.user.findUniqueOrThrow({
                where: {
                    email: decodedData.email,
                    status: client_1.UserStatus.ACTIVE,
                    isVerified: true,
                },
                select: {
                    id: true,
                    email: true,
                    role: true,
                },
            });
            cache.set(cacheKey, userData);
        }
        cache.set(blacklistKey, true, 24 * 3600); // Store for 24 hours
        return jwtHealpers_1.jwtHalpers.generateToken({ email: userData.email, role: userData.role, id: userData.id }, config_1.default.jwt_access_srcret, config_1.default.token_expire_in);
    }
    catch (error) {
        throw new golobalErrorHnadelar_1.AppError(http_status_1.default.UNAUTHORIZED, "Invalid refresh token", "");
    }
});
const changePasswordIntoDb = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const cacheKey = `${CACHE_KEYS.USER_AUTH}${user.email}`;
    try {
        let userData = cache.get(cacheKey);
        if (!userData) {
            userData = yield prisma_1.default.user.findUniqueOrThrow({
                where: {
                    email: user.email,
                    status: client_1.UserStatus.ACTIVE,
                    isVerified: true,
                },
                select: {
                    password: true,
                    updatedAt: true,
                },
            });
        }
        if (!(yield bcrypt_1.default.compare(payload.oldPassword, userData.password))) {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Password Incorrect", "");
        }
        if (new Date().getTime() - new Date(userData.updatedAt).getTime() <
            24 * 60 * 60 * 1000) {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You can only change your password once per day", "");
        }
        const hashedPassword = yield bcrypt_1.default.hash(payload.newPassword, Number(config_1.default.bcrypt_salt_rounds));
        const result = yield prisma_1.default.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
            select: {
                id: true,
                updatedAt: true,
            },
        });
        cache.del(cacheKey);
        return result;
    }
    catch (error) {
        throw new golobalErrorHnadelar_1.AppError(http_status_1.default.SERVICE_UNAVAILABLE, "Password change failed", "");
    }
});
const forgotPasswordFromDb = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const cacheKey = `${CACHE_KEYS.USER_AUTH}${payload.email}`;
    try {
        let userData = cache.get(cacheKey);
        if (!userData) {
            userData = yield prisma_1.default.user.findUniqueOrThrow({
                where: {
                    email: payload.email,
                    status: client_1.UserStatus.ACTIVE,
                    isVerified: true,
                },
                select: {
                    email: true,
                    username: true,
                    role: true,
                    id: true,
                },
            });
        }
        const resetToken = jwtHealpers_1.jwtHalpers.generateToken({ email: userData.email, role: userData.role, id: userData.id }, config_1.default.jwt_reset_token, config_1.default.forgot_token_expries_in);
        const resetKey = `${CACHE_KEYS.RESET_TOKENS}${userData.id}`;
        cache.set(resetKey, resetToken, 3600); // 1 hour TTL
        const resetLink = `${config_1.default.frontend_link}/reset-pass?id=${userData.id}&token=${resetToken}`;
        const emailBody = yield (0, ForgotPasswordBody_1.default)(userData, resetLink);
        yield (0, sendEmail_1.default)(userData.email, emailBody);
        return "Check your email for password reset instructions";
    }
    catch (error) {
        throw new golobalErrorHnadelar_1.AppError(http_status_1.default.SERVICE_UNAVAILABLE, "Failed to process forgot password request", "");
    }
});
const resetPasswordFromDb = (token, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const resetKey = `${CACHE_KEYS.RESET_TOKENS}${payload.id}`;
    const cachedToken = cache.get(resetKey);
    if (!cachedToken || cachedToken !== token) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Invalid or expired reset token", "");
    }
    try {
        const isValidToken = jwtHealpers_1.jwtHalpers.varifyToken(token, config_1.default.jwt_reset_token);
        const hashedPassword = yield bcrypt_1.default.hash(payload.password, Number(config_1.default.bcrypt_salt_rounds));
        yield prisma_1.default.user.update({
            where: { id: payload.id },
            data: { password: hashedPassword },
        });
        // Invalidate caches
        cache.del(resetKey);
        cache.del(`${CACHE_KEYS.USER_AUTH}${isValidToken.email}`);
        return "Password reset successfully";
    }
    catch (error) {
        throw new golobalErrorHnadelar_1.AppError(http_status_1.default.SERVICE_UNAVAILABLE, "Password reset failed", "");
    }
});
const cleanupCache = () => {
    cache.flushStats();
};
setInterval(cleanupCache, 60 * 60 * 1000);
const AuthServices = {
    loginUserIntoDb,
    refreshTokenIntoDb,
    changePasswordIntoDb,
    forgotPasswordFromDb,
    resetPasswordFromDb,
};
exports.default = AuthServices;
