import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { RegisterRequest, LoginRequest, RefreshTokenRequest } from '../types/auth';
import { ApiResponse, AuthenticatedRequest } from '../types/express';
import { asyncHandler } from '../middlewares/errorHandler';

export class AuthController {
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

      // Set HTTP-only cookies for tokens
      res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
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
        message: (error as Error).message
      });
    }
  });

  static login = asyncHandler(async (
    req: Request<{}, ApiResponse, LoginRequest>,
    res: Response<ApiResponse>
  ) => {
    const { email, password } = req.body;

    try {
      const { user, tokens } = await AuthService.login({
        email,
        password
      });

      // Set HTTP-only cookies for tokens
      res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
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
        message: (error as Error).message
      });
    }
  });

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
        message: (error as Error).message
      });
    }
  });

  static logout = asyncHandler(async (
    req: AuthenticatedRequest,
    res: Response<ApiResponse>
  ) => {
    
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  });

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

  static verifyEmail = asyncHandler(async (
    req: Request<{}, ApiResponse, { token: string }>,
    res: Response<ApiResponse>
  ) => {
    res.status(200).json({
      success: true,
      message: 'Email verification endpoint - to be implemented'
    });
  });

  static forgotPassword = asyncHandler(async (
    req: Request<{}, ApiResponse, { email: string }>,
    res: Response<ApiResponse>
  ) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    try {
      await AuthService.forgotPassword(email);
      
      res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while processing your request',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  });

  static resetPassword = asyncHandler(async (
    req: Request<{}, ApiResponse, { token: string; password: string; confirmPassword: string }>,
    res: Response<ApiResponse>
  ) => {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token, password, and confirm password are required'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    try {
      await AuthService.resetPassword(token, password);
      
      res.status(200).json({
        success: true,
        message: 'Password has been reset successfully. You can now log in with your new password.'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: (error as Error).message
      });
    }
  });

  static verifyResetToken = asyncHandler(async (
    req: Request<{ token: string }, ApiResponse>,
    res: Response<ApiResponse>
  ) => {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Reset token is required'
      });
    }

    try {
      const isValid = await AuthService.verifyResetToken(token);
      
      if (isValid) {
        res.status(200).json({
          success: true,
          message: 'Reset token is valid'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Reset token is invalid or has expired'
        });
      }
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Invalid reset token'
      });
    }
  });

  static googleAuth = asyncHandler(async (
    req: Request<{}, ApiResponse, { token: string }>,
    res: Response<ApiResponse>
  ) => {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Google token is required'
      });
    }

    try {
      const { user, tokens } = await AuthService.googleAuth(token);

      res.status(200).json({
        success: true,
        message: 'Google authentication successful',
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
          },
          tokens
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: (error as Error).message
      });
    }
  });
}
