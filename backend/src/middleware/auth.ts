import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole, JwtPayload } from '../types';
import { createAppError } from './errorHandler';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

/**
 * Auth middleware - verifies JWT token from Authorization header
 * Extracts user data and attaches to request object
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      next(createAppError('No authentication token provided', 401));
      return;
    }

    // Check for Bearer token format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      next(createAppError('Invalid token format. Use: Bearer <token>', 401));
      return;
    }

    const token = parts[1];

    // Verify token
    const secret = process.env.JWT_SECRET || 'default_secret_change_this';

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, secret) as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        next(createAppError('Token has expired', 401));
        return;
      }
      if (error instanceof jwt.JsonWebTokenError) {
        next(createAppError('Invalid token', 401));
        return;
      }
      next(createAppError('Token verification failed', 401));
      return;
    }

    // Attach user data to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    next(createAppError('Authentication failed', 401));
  }
};

/**
 * Optional auth middleware - attempts to verify token but doesn't fail if missing
 * Useful for endpoints that can work with or without authentication
 */
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      // No token provided, continue without user
      return next();
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      // Invalid format, continue without user
      return next();
    }

    const token = parts[1];
    const secret = process.env.JWT_SECRET || 'default_secret_change_this';

    try {
      const decoded = jwt.verify(token, secret) as JwtPayload;
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };
    } catch {
      // Token invalid, continue without user
    }

    next();
  } catch (error) {
    // Any error, continue without user
    next();
  }
};

/**
 * Verify that user is authenticated (wrapper for authenticate)
 * Use this when you want more explicit code
 */
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    next(createAppError('Authentication required', 401));
    return;
  }
  next();
};

/**
 * Check if user has valid authentication (alias for authenticate)
 */
export const isAuthenticated = authenticate;