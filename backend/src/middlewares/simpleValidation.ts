import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/express';
import { AUTH, ERROR_MESSAGES, DEFAULTS } from '../constants';

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
  
  if (typeof name !== AUTH.STRING_TYPE || name.trim().length < DEFAULTS.MIN_NAME_LENGTH) {
    return res.status(400).json({
      success: false,
      message: ERROR_MESSAGES.INVALID_NAME,
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

export const validateForgotPassword = (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  const { email } = req.body;
  
  // Check required field
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
      error: 'Missing email field'
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

export const validateResetPassword = (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  const { token, password, confirmPassword } = req.body;
  
  // Check required fields
  if (!token || !password || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Token, password, and confirm password are required',
      error: 'Missing required fields'
    });
  }
  
  if (typeof token !== AUTH.STRING_TYPE || token.length !== AUTH.TOKEN_LENGTH || !AUTH.HEX_REGEX.test(token)) {
    return res.status(400).json({
      success: false,
      message: ERROR_MESSAGES.INVALID_RESET_TOKEN_FORMAT,
      error: 'Reset token must be a valid hex string'
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
  
  // Check password strength
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSymbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);
  
  if (!hasLowerCase || !hasUpperCase || !hasNumbers || !hasSymbols) {
    return res.status(400).json({
      success: false,
      message: 'Invalid password',
      error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol'
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
