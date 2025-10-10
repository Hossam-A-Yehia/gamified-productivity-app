import { Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { AuthenticatedRequest, ApiResponse } from '../types/express';
import { asyncHandler } from './errorHandler';
import { AUTH, ERROR_MESSAGES } from '../constants';

// JWT Authentication middleware
export const authenticate = asyncHandler(async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith(AUTH.BEARER_PREFIX)) {
    return res.status(401).json({
      success: false,
      message: ERROR_MESSAGES.ACCESS_TOKEN_REQUIRED
    });
  }

  const token = authHeader.substring(AUTH.BEARER_PREFIX_LENGTH); // Remove 'Bearer ' prefix

  try {
    const payload = AuthService.verifyAccessToken(token);
    const user = await AuthService.getUserById(payload.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: ERROR_MESSAGES.INVALID_OR_EXPIRED_TOKEN
    });
  }
});

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = asyncHandler(async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith(AUTH.BEARER_PREFIX)) {
    const token = authHeader.substring(AUTH.BEARER_PREFIX_LENGTH);
    
    try {
      const payload = AuthService.verifyAccessToken(token);
      const user = await AuthService.getUserById(payload.userId);
      
      if (user) {
        req.user = user;
      }
    } catch (error) {
      // Silently fail for optional auth
    }
  }
  
  next();
});
