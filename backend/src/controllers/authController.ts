import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { RegisterRequest, LoginRequest, RefreshTokenRequest } from '../types/auth';
import { ApiResponse, AuthenticatedRequest } from '../types/express';
import { asyncHandler } from '../middlewares/errorHandler';

export class AuthController {
  // Register new user
  static register = asyncHandler(async (
    req: Request<{}, ApiResponse, RegisterRequest>,
    res: Response<ApiResponse>
  ) => {
    
    const { name, email, password } = req.body;

    try {
      const { user, tokens } = await AuthService.register({
        name,
        email,
        password
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            level: user.level,
            xp: user.xp,
            coins: user.coins,
            streak: user.streak,
            avatarUrl: user.avatarUrl,
            settings: user.settings,
            stats: user.stats,
            createdAt: user.createdAt
          },
          tokens
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Registration failed',
        error: (error as Error).message
      });
    }
  });

  // Login user
  static login = asyncHandler(async (
    req: Request<{}, ApiResponse, LoginRequest>,
    res: Response<ApiResponse>
  ) => {
    console.log('Login request body:', req.body);
    console.log('Login request content-type:', req.get('Content-Type'));
    
    const { email, password } = req.body;

    try {
      const { user, tokens } = await AuthService.login({
        email,
        password
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            level: user.level,
            xp: user.xp,
            coins: user.coins,
            streak: user.streak,
            avatarUrl: user.avatarUrl,
            settings: user.settings,
            stats: user.stats,
            lastActiveDate: user.lastActiveDate
          },
          tokens
        }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Login failed',
        error: (error as Error).message
      });
    }
  });

  // Refresh access token
  static refreshToken = asyncHandler(async (
    req: Request<{}, ApiResponse, RefreshTokenRequest>,
    res: Response<ApiResponse>
  ) => {
    const { refreshToken } = req.body;

    try {
      const tokens = await AuthService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: { tokens }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Token refresh failed',
        error: (error as Error).message
      });
    }
  });

  // Logout user (client-side token removal)
  static logout = asyncHandler(async (
    req: AuthenticatedRequest,
    res: Response<ApiResponse>
  ) => {
    // In a more advanced implementation, you might want to blacklist the token
    // For now, we'll just return a success message as the client will remove the token
    
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  });

  // Get current user profile
  static getProfile = asyncHandler(async (
    req: AuthenticatedRequest,
    res: Response<ApiResponse>
  ) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          level: user.level,
          xp: user.xp,
          coins: user.coins,
          streak: user.streak,
          avatarUrl: user.avatarUrl,
          avatarCustomization: user.avatarCustomization,
          achievements: user.achievements,
          settings: user.settings,
          stats: user.stats,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  });

  // Verify email (placeholder for future implementation)
  static verifyEmail = asyncHandler(async (
    req: Request<{}, ApiResponse, { token: string }>,
    res: Response<ApiResponse>
  ) => {
    // TODO: Implement email verification logic
    res.status(200).json({
      success: true,
      message: 'Email verification endpoint - to be implemented'
    });
  });

  // Forgot password (placeholder for future implementation)
  static forgotPassword = asyncHandler(async (
    req: Request<{}, ApiResponse, { email: string }>,
    res: Response<ApiResponse>
  ) => {
    // TODO: Implement forgot password logic with email sending
    res.status(200).json({
      success: true,
      message: 'Forgot password endpoint - to be implemented'
    });
  });

  // Reset password (placeholder for future implementation)
  static resetPassword = asyncHandler(async (
    req: Request<{}, ApiResponse, { token: string; password: string; confirmPassword: string }>,
    res: Response<ApiResponse>
  ) => {
    // TODO: Implement password reset logic
    res.status(200).json({
      success: true,
      message: 'Reset password endpoint - to be implemented'
    });
  });
}
