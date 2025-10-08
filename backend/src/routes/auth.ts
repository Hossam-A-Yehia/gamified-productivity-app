import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { 
  validateRegister,
  validateLogin,
  validateRefreshToken
} from '../middlewares/simpleValidation';
import { authenticate } from '../middlewares/auth';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validateRegister, AuthController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validateLogin, AuthController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', validateRefreshToken, AuthController.refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (invalidate tokens on client)
 * @access  Private
 */
router.post('/logout', authenticate, AuthController.logout);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, AuthController.getProfile);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email address
 * @access  Public
 */
router.post('/verify-email', AuthController.verifyEmail);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post('/forgot-password', AuthController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', AuthController.resetPassword);

export default router;
