import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { 
  validateRegister,
  validateLogin,
  validateRefreshToken,
  validateForgotPassword,
  validateResetPassword
} from '../middlewares/simpleValidation';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/register', validateRegister, AuthController.register);

router.post('/login', validateLogin, AuthController.login);

router.post('/refresh', validateRefreshToken, AuthController.refreshToken);

router.post('/logout', authenticate, AuthController.logout);

router.get('/profile', authenticate, AuthController.getProfile);

router.post('/verify-email', AuthController.verifyEmail);

router.post('/forgot-password', validateForgotPassword, AuthController.forgotPassword);

router.post('/reset-password', validateResetPassword, AuthController.resetPassword);

router.get('/verify-reset-token/:token', AuthController.verifyResetToken);

export default router;
