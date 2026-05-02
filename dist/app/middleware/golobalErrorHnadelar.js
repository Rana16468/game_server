"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
const library_1 = require("@prisma/client/runtime/library");
const http_status_1 = __importDefault(require("http-status"));
const errorcode_constant_1 = require("./errorcode.constant");
const logError_1 = __importDefault(require("./logError"));
const config_1 = __importDefault(require("../config"));
class AppError extends Error {
    constructor(statusCode, status, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.status = status;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, AppError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const handlePrismaError = (err) => {
    if (err instanceof library_1.PrismaClientValidationError) {
        return {
            success: false,
            status: 'error',
            message: 'Database validation error',
            errorCode: errorcode_constant_1.ERROR_CODES.VALIDATION.SCHEMA_VALIDATION,
            errors: [{ message: err.message }]
        };
    }
    if (err instanceof library_1.PrismaClientKnownRequestError) {
        const errorMapping = {
            P2002: { status: 409, message: 'Duplicate entry for unique field' },
            P2003: { status: 400, message: 'Invalid reference to a related record' },
            P2025: { status: 404, message: 'Record not found' },
            P2014: { status: 400, message: 'Invalid ID provided' },
            P2021: { status: 500, message: 'Database table not found' }
        };
        const error = errorMapping[err.code] || {
            status: 500,
            message: 'Database operation failed'
        };
        return {
            success: false,
            status: 'error',
            message: error.message,
            errorCode: errorcode_constant_1.ERROR_CODES.PRISMA[err.code] || 'DATABASE_ERROR',
            errors: [{ code: err.code, meta: err.meta }]
        };
    }
    return {
        success: false,
        status: 'error',
        message: 'Database error occurred',
        errorCode: 'DATABASE_ERROR'
    };
};
const globalErrorHandler = (err, req, res, next) => {
    (0, logError_1.default)(err, req);
    let errorResponse = {
        success: false,
        status: 'error',
        message: 'Internal server error',
    };
    let statusCode = http_status_1.default.INTERNAL_SERVER_ERROR;
    if (err instanceof library_1.PrismaClientValidationError ||
        err instanceof library_1.PrismaClientKnownRequestError ||
        err instanceof library_1.PrismaClientInitializationError ||
        err instanceof library_1.PrismaClientRustPanicError ||
        err instanceof library_1.PrismaClientUnknownRequestError) {
        errorResponse = handlePrismaError(err);
        statusCode = err instanceof library_1.PrismaClientKnownRequestError && err.code === 'P2025'
            ? http_status_1.default.NOT_FOUND
            : http_status_1.default.BAD_REQUEST;
    }
    else if (err.name === 'JsonWebTokenError') {
        statusCode = http_status_1.default.UNAUTHORIZED;
        errorResponse = {
            success: false,
            status: 'error',
            message: 'Invalid authentication token',
            errorCode: errorcode_constant_1.ERROR_CODES.AUTH.INVALID_TOKEN
        };
    }
    else if (err.name === 'TokenExpiredError') {
        statusCode = http_status_1.default.UNAUTHORIZED;
        errorResponse = {
            success: false,
            status: 'error',
            message: 'Authentication token expired',
            errorCode: errorcode_constant_1.ERROR_CODES.AUTH.TOKEN_EXPIRED
        };
    }
    else if (err.name === 'ValidationError') {
        statusCode = http_status_1.default.BAD_REQUEST;
        errorResponse = {
            success: false,
            status: 'error',
            message: 'Validation failed',
            errorCode: errorcode_constant_1.ERROR_CODES.VALIDATION.INPUT_VALIDATION,
            errors: Array.isArray(err.errors) ? err.errors : [err]
        };
    }
    else if (err instanceof AppError) {
        statusCode = err.statusCode;
        errorResponse = {
            success: false,
            status: err.status,
            message: err.message,
            errors: [{ message: err.message }]
        };
    }
    if (config_1.default.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
    }
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.status(statusCode).json(errorResponse);
};
exports.default = globalErrorHandler;
