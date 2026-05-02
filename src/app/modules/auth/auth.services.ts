import { UserStatus } from "@prisma/client";
import prisma from "../../shared/prisma";
import bcrypt from "bcrypt";
import { jwtHalpers } from "../../helper/jwtHealpers";
import config from "../../config";
import ApiError from "../../error/ApiError";
import httpStatus from "http-status";
import { AppError } from "../../middleware/golobalErrorHnadelar";
import { JwtPayload, Secret } from "jsonwebtoken";
import sendEmail from "../../../utility/Email/sendEmail";
import ForgotPasswordBody from "../../../utility/Email/EmailBody/ForgotPasswordBody";
import NodeCache from "node-cache";

const cache = new NodeCache({
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

const loginUserIntoDb = async (payload: {
  email: string;
  password: string;
}) => {
  const cacheKey = `${CACHE_KEYS.USER_AUTH}${payload.email}`;
  const attemptsKey = `${CACHE_KEYS.PASSWORD_ATTEMPTS}${payload.email}`;

  const attempts = cache.get<number>(attemptsKey) || 0;
  if (attempts >= RATE_LIMIT.MAX_ATTEMPTS) {
    throw new ApiError(
      httpStatus.TOO_MANY_REQUESTS,
      "Too many login attempts. Please try again later.",
      ""
    );
  }

  try {
    let userData = cache.get<any>(cacheKey);

    if (!userData) {
      userData = await prisma.user.findUniqueOrThrow({
        where: {
          email: payload.email,
          status: UserStatus.ACTIVE,
        },
      });

      cache.set(cacheKey, userData, 3600); // Cache for 1 hour
    }

    const isCorrectPassword = await bcrypt.compare(
      payload.password,
      userData.password
    );

    if (!isCorrectPassword) {
      cache.set(attemptsKey, attempts + 1, RATE_LIMIT.WINDOW_MS / 1000);
      throw new ApiError(httpStatus.BAD_REQUEST, "Password Incorrect", "");
    }
    cache.del(attemptsKey);

    const accessToken = jwtHalpers.generateToken(
      { email: userData.email, role: userData.role, id: userData.id },
      config.jwt_access_srcret as string,
      config.token_expire_in as string
    );

    const refreshToken = jwtHalpers.generateToken(
      { email: userData.email, role: userData.role, id: userData.id },
      config.jwt_refeesh_srcret as string,
      config.refresh_token_expire_in as string
    );

    return { accessToken, refreshToken };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, "Login failed", "");
  }
};

const refreshTokenIntoDb = async (token: string) => {
  const blacklistKey = `${CACHE_KEYS.TOKEN_BLACKLIST}${token}`;

  if (cache.get(blacklistKey)) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Token is invalid", "");
  }

  try {
    const decodedData = jwtHalpers.varifyToken(
      token,
      config.jwt_refeesh_srcret as string
    );

    const cacheKey = `${CACHE_KEYS.USER_AUTH}${decodedData.email}`;
    let userData = cache.get<any>(cacheKey);

    if (!userData) {
      userData = await prisma.user.findUniqueOrThrow({
        where: {
          email: decodedData.email,
          status: UserStatus.ACTIVE,
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

    return jwtHalpers.generateToken(
      { email: userData.email, role: userData.role, id: userData.id },
      config.jwt_access_srcret as string,
      config.token_expire_in as string
    );
  } catch (error) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid refresh token", "");
  }
};

const changePasswordIntoDb = async (
  user: JwtPayload,
  payload: { newPassword: string; oldPassword: string }
) => {
  const cacheKey = `${CACHE_KEYS.USER_AUTH}${user.email}`;

  try {
    let userData = cache.get<any>(cacheKey);

    if (!userData) {
      userData = await prisma.user.findUniqueOrThrow({
        where: {
          email: user.email,
          status: UserStatus.ACTIVE,
          isVerified: true,
        },
        select: {
          password: true,
          updatedAt: true,
        },
      });
    }

    if (!(await bcrypt.compare(payload.oldPassword, userData.password))) {
      throw new ApiError(httpStatus.FORBIDDEN, "Password Incorrect", "");
    }

    if (
      new Date().getTime() - new Date(userData.updatedAt).getTime() <
      24 * 60 * 60 * 1000
    ) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You can only change your password once per day",
        ""
      );
    }

    const hashedPassword = await bcrypt.hash(
      payload.newPassword,
      Number(config.bcrypt_salt_rounds)
    );

    const result = await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
      select: {
        id: true,
        updatedAt: true,
      },
    });

    cache.del(cacheKey);

    return result;
  } catch (error) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      "Password change failed",
      ""
    );
  }
};

const forgotPasswordFromDb = async (payload: { email: string }) => {
  const cacheKey = `${CACHE_KEYS.USER_AUTH}${payload.email}`;

  try {
    let userData = cache.get<any>(cacheKey);

    if (!userData) {
      userData = await prisma.user.findUniqueOrThrow({
        where: {
          email: payload.email,
          status: UserStatus.ACTIVE,
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

    const resetToken = jwtHalpers.generateToken(
      { email: userData.email, role: userData.role, id: userData.id },
      config.jwt_reset_token as string,
      config.forgot_token_expries_in as string
    );

    const resetKey = `${CACHE_KEYS.RESET_TOKENS}${userData.id}`;
    cache.set(resetKey, resetToken, 3600); // 1 hour TTL

    const resetLink = `${config.frontend_link}/reset-pass?id=${userData.id}&token=${resetToken}`;
    const emailBody = await ForgotPasswordBody(userData, resetLink);
    await sendEmail(userData.email, emailBody);

    return "Check your email for password reset instructions";
  } catch (error) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      "Failed to process forgot password request",
      ""
    );
  }
};

const resetPasswordFromDb = async (
  token: string,
  payload: { id: string; password: string }
) => {
  const resetKey = `${CACHE_KEYS.RESET_TOKENS}${payload.id}`;
  const cachedToken = cache.get<string>(resetKey);

  if (!cachedToken || cachedToken !== token) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Invalid or expired reset token",
      ""
    );
  }

  try {
    const isValidToken = jwtHalpers.varifyToken(
      token,
      config.jwt_reset_token as Secret
    );

    const hashedPassword = await bcrypt.hash(
      payload.password,
      Number(config.bcrypt_salt_rounds)
    );

    await prisma.user.update({
      where: { id: payload.id },
      data: { password: hashedPassword },
    });

    // Invalidate caches
    cache.del(resetKey);
    cache.del(`${CACHE_KEYS.USER_AUTH}${isValidToken.email}`);

    return "Password reset successfully";
  } catch (error) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      "Password reset failed",
      ""
    );
  }
};

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

export default AuthServices;
