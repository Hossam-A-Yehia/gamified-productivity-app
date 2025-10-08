import { Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { AuthenticatedRequest, ApiResponse } from '../types/express';
import { asyncHandler } from './errorHandler';

// JWT Authentication middleware
export const authenticate = asyncHandler(async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    const payload = AuthService.verifyAccessToken(token);
    const user = await AuthService.getUserById(payload.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
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
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
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
