import { 
  PrismaClientKnownRequestError, 
  PrismaClientValidationError, 
  PrismaClientInitializationError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError
} from "@prisma/client/runtime/library";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { ERROR_CODES } from "./errorcode.constant";
import logError from "./logError";
import config from "../config";

export class AppError extends Error {
  constructor(
      public statusCode: number,
      public status: string,
      message: string,
      public isOperational = true
  ) {
      super(message);
      Object.setPrototypeOf(this, AppError.prototype);
      Error.captureStackTrace(this, this.constructor);
  }
}

interface ErrorResponse {
  success: boolean;
  status: string;
  message: string;
  errorCode?: string;
  errors?: any[];
  stack?: string;
}

type PrismaErrorMapping = {
  [key: string]: {
      status: number;
      message: string;
  }
};

const handlePrismaError = (err: PrismaClientValidationError | PrismaClientKnownRequestError | PrismaClientInitializationError | PrismaClientRustPanicError | PrismaClientUnknownRequestError): ErrorResponse => {
  if (err instanceof PrismaClientValidationError) {
      return {
          success: false,
          status: 'error',
          message: 'Database validation error',
          errorCode: ERROR_CODES.VALIDATION.SCHEMA_VALIDATION,
          errors: [{ message: err.message }]
      };
  }

  if (err instanceof PrismaClientKnownRequestError) {
      const errorMapping: PrismaErrorMapping = {
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
          errorCode: ERROR_CODES.PRISMA[err.code as keyof typeof ERROR_CODES.PRISMA] || 'DATABASE_ERROR',
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

interface ValidationError extends Error {
  name: string;
  errors?: any[];
}

interface JWTError extends Error {
  name: 'JsonWebTokenError' | 'TokenExpiredError';
}

const globalErrorHandler = (
  err: Error | AppError | ValidationError | JWTError | PrismaClientKnownRequestError | PrismaClientValidationError | PrismaClientInitializationError | PrismaClientRustPanicError | PrismaClientUnknownRequestError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logError(err, req);

  let errorResponse: ErrorResponse = {
      success: false,
      status: 'error',
      message: 'Internal server error',
  };

  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;

  if (err instanceof PrismaClientValidationError || 
      err instanceof PrismaClientKnownRequestError || 
      err instanceof PrismaClientInitializationError || 
      err instanceof PrismaClientRustPanicError || 
      err instanceof PrismaClientUnknownRequestError) {
      errorResponse = handlePrismaError(err);
      statusCode = err instanceof PrismaClientKnownRequestError && err.code === 'P2025' 
          ? httpStatus.NOT_FOUND 
          : httpStatus.BAD_REQUEST;
  }
  else if (err.name === 'JsonWebTokenError') {
      statusCode = httpStatus.UNAUTHORIZED;
      errorResponse = {
          success: false,
          status: 'error',
          message: 'Invalid authentication token',
          errorCode: ERROR_CODES.AUTH.INVALID_TOKEN
      };
  }
  else if (err.name === 'TokenExpiredError') {
      statusCode = httpStatus.UNAUTHORIZED;
      errorResponse = {
          success: false,
          status: 'error',
          message: 'Authentication token expired',
          errorCode: ERROR_CODES.AUTH.TOKEN_EXPIRED
      };
  }
  else if (err.name === 'ValidationError') {
      statusCode = httpStatus.BAD_REQUEST;
      errorResponse = {
          success: false,
          status: 'error',
          message: 'Validation failed',
          errorCode: ERROR_CODES.VALIDATION.INPUT_VALIDATION,
          errors: Array.isArray((err as ValidationError).errors) ? (err as ValidationError).errors : [err]
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

  if (config.NODE_ENV === 'development') {
      errorResponse.stack = err.stack;
  }

  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  res.status(statusCode).json(errorResponse);
};

export default globalErrorHandler;