import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/express';

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
  let message = err.message || 'Internal Server Error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value';
  }

  // Log error for debugging (in production, use proper logging service)
  if (process.env.NODE_ENV === 'development') {
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
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
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
