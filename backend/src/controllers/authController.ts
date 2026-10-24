import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { asyncHandler, createAppError } from '../middleware/errorHandler';
import { UserRole, JwtPayload, RegisterRequest, LoginRequest, ApiResponse } from '../types';

// Generate JWT token
const generateToken = (user: IUser): string => {
  const payload: JwtPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const secret = process.env.JWT_SECRET || 'default_secret_change_this';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

// Register new user
export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, role, phone, flatNumber } = req.body as RegisterRequest & { phone?: string };

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(createAppError('Email already registered', 409));
    }

    // Create user (password will be hashed by pre-save middleware)
    const user = await User.create({
      name,
      email,
      password, // Will be hashed by pre-save middleware
      role: role || UserRole.RESIDENT, // Default to resident if not specified
      phone,
      flatNumber,
    });

    // Generate token
    const token = generateToken(user);

    // Return user and token (password excluded by toJSON transform)
    const response: ApiResponse<{ user: IUser; token }> = {
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token,
      },
    };

    res.status(201).json(response);
  }
);

// Login user
export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body as LoginRequest;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(createAppError('Invalid email or password', 401));
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(createAppError('Invalid email or password', 401));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(createAppError('Account is deactivated. Please contact administrator.', 401));
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken(user);

    // Return user and token (password excluded by toJSON transform)
    const response: ApiResponse<{ user: IUser; token }> = {
      success: true,
      message: 'Login successful',
      data: {
        user,
        token,
      },
    };

    res.status(200).json(response);
  }
);

// Get current user
export const getMe = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // req.user is set by auth middleware
    const userId = req.user?.userId;

    if (!userId) {
      return next(createAppError('User not authenticated', 401));
    }

    const user = await User.findById(userId);

    if (!user) {
      return next(createAppError('User not found', 404));
    }

    if (!user.isActive) {
      return next(createAppError('Account is deactivated', 401));
    }

    const response: ApiResponse<IUser> = {
      success: true,
      message: 'User retrieved successfully',
      data: user,
    };

    res.status(200).json(response);
  }
);

// Logout (client-side token removal, but we can track it if needed)
export const logout = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // In a stateless JWT setup, logout is handled client-side
    // This endpoint is just for API completeness
    const response: ApiResponse = {
      success: true,
      message: 'Logged out successfully',
    };

    res.status(200).json(response);
  }
);

// Refresh token
export const refreshToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;

    if (!userId) {
      return next(createAppError('User not authenticated', 401));
    }

    const user = await User.findById(userId);

    if (!user || !user.isActive) {
      return next(createAppError('User not found or inactive', 401));
    }

    // Generate new token
    const token = generateToken(user);

    const response: ApiResponse<{ token: string }> = {
      success: true,
      message: 'Token refreshed successfully',
      data: { token },
    };

    res.status(200).json(response);
  }
);