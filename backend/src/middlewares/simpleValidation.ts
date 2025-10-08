import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/express';

// Simple validation functions without external dependencies
export const validateRegister = (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  const { name, email, password, confirmPassword } = req.body;
  
  // Check required fields
  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required',
      error: 'Missing required fields: name, email, password, confirmPassword'
    });
  }
  
  // Validate name
  if (typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Invalid name',
      error: 'Name must be at least 2 characters long'
    });
  }
  
  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email',
      error: 'Please provide a valid email address'
    });
  }
  
  // Validate password
  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Invalid password',
      error: 'Password must be at least 8 characters long'
    });
  }
  
  // Check password strength - must contain letters, numbers, and symbols
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSymbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);
  
  if (!hasLowerCase || !hasUpperCase || !hasNumbers || !hasSymbols) {
    return res.status(400).json({
      success: false,
      message: 'Invalid password',
      error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol (!@#$%^&*()_+-=[]{};\':"|,.<>/?~`)'
    });
  }
  
  // Check password confirmation
  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Password confirmation failed',
      error: 'Passwords do not match'
    });
  }
  
  next();
};

export const validateLogin = (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  const { email, password } = req.body;
  
  // Check required fields
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
      error: 'Missing required fields'
    });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format',
      error: 'Please provide a valid email address'
    });
  }
  
  next();
};

export const validateRefreshToken = (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token is required',
      error: 'Missing refresh token'
    });
  }
  
  next();
};
