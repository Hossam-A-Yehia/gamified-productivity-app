import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { RegisterRequest, LoginRequest, RefreshTokenRequest } from '../types/auth';
import { ApiResponse, AuthenticatedRequest } from '../types/express';
import { asyncHandler } from '../middlewares/errorHandler';
import { SUCCESS_MESSAGES, ERROR_MESSAGES, COOKIE_CONFIG, ENVIRONMENT } from '../constants';

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
        httpOnly: COOKIE_CONFIG.HTTP_ONLY,
        secure: process.env.NODE_ENV === ENVIRONMENT.PRODUCTION,
        sameSite: COOKIE_CONFIG.SAME_SITE,
        maxAge: COOKIE_CONFIG.ACCESS_TOKEN_MAX_AGE
      });

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: COOKIE_CONFIG.HTTP_ONLY,
        secure: process.env.NODE_ENV === ENVIRONMENT.PRODUCTION,
        sameSite: COOKIE_CONFIG.SAME_SITE,
        maxAge: COOKIE_CONFIG.REFRESH_TOKEN_MAX_AGE
      });

      res.status(201).json({
        success: true,
        message: SUCCESS_MESSAGES.USER_REGISTERED,
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
        httpOnly: COOKIE_CONFIG.HTTP_ONLY,
        secure: process.env.NODE_ENV === ENVIRONMENT.PRODUCTION,
        sameSite: COOKIE_CONFIG.SAME_SITE,
        maxAge: COOKIE_CONFIG.ACCESS_TOKEN_MAX_AGE
      });

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: COOKIE_CONFIG.HTTP_ONLY,
        secure: process.env.NODE_ENV === ENVIRONMENT.PRODUCTION,
        sameSite: COOKIE_CONFIG.SAME_SITE,
        maxAge: COOKIE_CONFIG.REFRESH_TOKEN_MAX_AGE
      });

      res.status(200).json({
        success: true,
        message: SUCCESS_MESSAGES.LOGIN_SUCCESSFUL,
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
        message: SUCCESS_MESSAGES.TOKEN_REFRESHED,
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
      message: SUCCESS_MESSAGES.LOGOUT_SUCCESSFUL
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
        message: ERROR_MESSAGES.USER_NOT_AUTHENTICATED
      });
    }

    res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.PROFILE_RETRIEVED,
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

  static forgotPassword = asyncHandler(async (
    req: Request<{}, ApiResponse, { email: string }>,
    res: Response<ApiResponse>
  ) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.EMAIL_REQUIRED
      });
    }

    try {
      await AuthService.forgotPassword(email);
      
      res.status(200).json({
        success: true,
        message: SUCCESS_MESSAGES.EMAIL_VERIFICATION_SENT
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: SUCCESS_MESSAGES.PROCESSING_ERROR,
        error: process.env.NODE_ENV === ENVIRONMENT.DEVELOPMENT ? (error as Error).message : undefined
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
        message: ERROR_MESSAGES.PASSWORDS_DO_NOT_MATCH
      });
    }

    try {
      await AuthService.resetPassword(token, password);
      
      res.status(200).json({
        success: true,
        message: SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS
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
        message: ERROR_MESSAGES.RESET_TOKEN_REQUIRED
      });
    }

    try {
      const isValid = await AuthService.verifyResetToken(token);
      
      if (isValid) {
        res.status(200).json({
          success: true,
          message: SUCCESS_MESSAGES.RESET_TOKEN_VALID
        });
      } else {
        res.status(400).json({
          success: false,
          message: ERROR_MESSAGES.RESET_TOKEN_INVALID
        });
      }
    } catch (error) {
      res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_RESET_TOKEN
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
        message: ERROR_MESSAGES.GOOGLE_TOKEN_REQUIRED
      });
    }

    try {
      const { user, tokens } = await AuthService.googleAuth(token);

      res.status(200).json({
        success: true,
        message: SUCCESS_MESSAGES.GOOGLE_AUTH_SUCCESS,
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
