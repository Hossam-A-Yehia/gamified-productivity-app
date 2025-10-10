import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/express';
import { ERROR_NAMES, ERROR_MESSAGES, ENVIRONMENT } from '../constants';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// Global error handler middleware
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR;

  // Handle specific error types
  if (err.name === ERROR_NAMES.VALIDATION_ERROR) {
    statusCode = 400;
    message = ERROR_MESSAGES.VALIDATION_ERROR;
  } else if (err.name === ERROR_NAMES.CAST_ERROR) {
    statusCode = 400;
    message = ERROR_MESSAGES.INVALID_ID_FORMAT;
  } else if (err.name === ERROR_NAMES.JWT_ERROR) {
    statusCode = 401;
    message = ERROR_MESSAGES.INVALID_TOKEN;
  } else if (err.name === ERROR_NAMES.TOKEN_EXPIRED_ERROR) {
    statusCode = 401;
    message = ERROR_MESSAGES.TOKEN_EXPIRED;
  } else if (err.name === ERROR_NAMES.MONGO_SERVER_ERROR && (err as any).code === 11000) {
    statusCode = 400;
    message = ERROR_MESSAGES.DUPLICATE_FIELD;
  }

  // Log error for debugging (in production, use proper logging service)
  if (process.env.NODE_ENV === ENVIRONMENT.DEVELOPMENT) {
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      statusCode,
      url: req.url,
      method: req.method,
      body: req.body
    });
  }

  res.status(statusCode).json({
    success: false,
    message
  });
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
export const notFound = (req: Request, res: Response<ApiResponse>) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
};
