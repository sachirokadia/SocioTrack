import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';
import { createAppError } from './errorHandler';

/**
 * Role middleware factory - creates middleware that restricts access to specific roles
 * 
 * @param allowedRoles - Array of roles that are allowed to access the route
 * @returns Express middleware function
 * 
 * @example
 * // Only admin can access
 * router.get('/admin-only', authenticate, role(['admin']), adminHandler);
 * 
 * @example
 * // Admin and technician can access
 * router.get('/maintenance', authenticate, role(['admin', 'technician']), maintenanceHandler);
 */
export const role = (allowedRoles: UserRole[]) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    // Check if user is authenticated (should be set by auth middleware)
    if (!req.user) {
      next(createAppError('Authentication required', 401));
      return;
    }

    const userRole = req.user.role;

    // Check if user's role is in the allowed list
    if (!allowedRoles.includes(userRole)) {
      next(
        createAppError(
          `Access denied. ${userRole} role is not authorized to access this route.`,
          403
        )
      );
      return;
    }

    // User is authorized
    next();
  };
};

/**
 * Admin-only middleware - convenience function for admin-only routes
 */
export const adminOnly = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  role([UserRole.ADMIN])(req, res, next);
};

/**
 * Technician-only middleware - convenience function for technician-only routes
 */
export const technicianOnly = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  role([UserRole.TECHNICIAN])(req, res, next);
};

/**
 * Resident-only middleware - convenience function for resident-only routes
 */
export const residentOnly = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  role([UserRole.RESIDENT])(req, res, next);
};

/**
 * Admin or Technician middleware - for routes accessible by admin or technician
 */
export const adminOrTechnician = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  role([UserRole.ADMIN, UserRole.TECHNICIAN])(req, res, next);
};

/**
 * Admin or Resident middleware - for routes accessible by admin or resident
 */
export const adminOrResident = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  role([UserRole.ADMIN, UserRole.RESIDENT])(req, res, next);
};

/**
 * All authenticated users (any role) middleware
 * This is useful as documentation that the route requires authentication
 */
export const authenticatedOnly = (
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
 * Self or admin middleware - allows users to access their own resources
 * or admins to access any resource
 * 
 * @param getResourceUserId - Function to extract the user ID from the resource
 * 
 * @example
 * // Protect user profile - only the user themselves or admin can view
 * router.get(
 *   '/users/:id',
 *   authenticate,
 *   selfOrAdmin((req) => req.params.id),
 *   getUserProfile
 * );
 */
export const selfOrAdmin = (
  getResourceUserId: (req: Request) => string | undefined
) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      next(createAppError('Authentication required', 401));
      return;
    }

    // Admin can access any resource
    if (req.user.role === UserRole.ADMIN) {
      next();
      return;
    }

    // Check if user is accessing their own resource
    const resourceUserId = getResourceUserId(req);
    if (resourceUserId === req.user.userId) {
      next();
      return;
    }

    next(
      createAppError(
        'Access denied. You can only access your own resources.',
        403
      )
    );
  };
};