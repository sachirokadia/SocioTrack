import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: number | string; // For MongoDB duplicate key errors (code 11000)
}

/**
 * Centralized error handling middleware for Express
 */
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default values
  err.statusCode = err.statusCode || 500;
  err.isOperational = err.isOperational || false;

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('🔴 Error:', {
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
      body: req.body,
      query: req.query,
      params: req.params,
      timestamp: new Date().toISOString()
    });
  } else {
    console.error('🔴 Error:', {
      message: err.message,
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }

  // Determine response based on environment
  const response = {
    success: false,
    message: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && {
      error: err.message,
      stack: err.stack
    })
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    err.statusCode = 400;
    response.message = 'Validation Error';
  } else if (err.name === 'CastError') {
    err.statusCode = 400;
    response.message = 'Invalid ID format';
  } else if (err.code === 11000) {
    err.statusCode = 409;
    response.message = 'Duplicate field value entered';
  } else if (err.name === 'JsonWebTokenError') {
    err.statusCode = 401;
    response.message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    err.statusCode = 401;
    response.message = 'Token expired';
  }

  res.status(err.statusCode).json(response);
};

/**
 * Async error handler wrapper to catch async errors in Express routes
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found handler middleware
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error: AppError = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Create custom AppError
 */
export const createAppError = (
  message: string,
  statusCode: number,
  isOperational: boolean = true
): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = isOperational;
  return error;
};