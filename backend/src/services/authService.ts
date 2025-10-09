import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { RegisterRequest, LoginRequest, JWTPayload } from '../types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export class AuthService {
  static generateAccessToken(payload: JWTPayload): string {
    return (jwt as any).sign(
      { userId: payload.userId, email: payload.email }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  static generateRefreshToken(payload: JWTPayload): string {
    return (jwt as any).sign(
      { userId: payload.userId, email: payload.email }, 
      JWT_REFRESH_SECRET, 
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );
  }

  static verifyAccessToken(token: string): JWTPayload {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  }

  static verifyRefreshToken(token: string): JWTPayload {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
  }

  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static async register(userData: RegisterRequest): Promise<{ user: IUser; tokens: { accessToken: string; refreshToken: string } }> {
    const { name, email, password } = userData;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error('User already exists with this email');
    }
    const hashedPassword = await this.hashPassword(password);

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      level: 1,
      xp: 0,
      coins: 100,
      streak: 0,
      lastActiveDate: new Date(),
      achievements: [],
      friends: [],
      friendRequests: {
        sent: [],
        received: []
      },
      settings: {
        notifications: {
          email: true,
          push: true,
          inApp: true
        },
        theme: 'auto',
        language: 'en',
        privacy: {
          profilePublic: true,
          showInLeaderboard: true
        }
      },
      stats: {
        totalTasksCompleted: 0,
        totalFocusTime: 0,
        longestStreak: 0,
        averageTasksPerDay: 0
      },
      avatarCustomization: {
        skin: 'default',
        accessories: [],
        background: 'default'
      }
    });

    await user.save();

    // Generate tokens
    const tokenPayload: JWTPayload = {
      userId: (user._id as any).toString(),
      email: user.email
    };

    const accessToken = this.generateAccessToken(tokenPayload);
    const refreshToken = this.generateRefreshToken(tokenPayload);

    return {
      user,
      tokens: {
        accessToken,
        refreshToken
      }
    };
  }

  static async login(loginData: LoginRequest): Promise<{ user: IUser; tokens: { accessToken: string; refreshToken: string } }> {
    const { email, password } = loginData;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update last active date
    user.lastActiveDate = new Date();
    await user.save();

    // Generate tokens
    const tokenPayload: JWTPayload = {
      userId: (user._id as any).toString(),
      email: user.email
    };

    const accessToken = this.generateAccessToken(tokenPayload);
    const refreshToken = this.generateRefreshToken(tokenPayload);

    // Remove password from user object before returning
    user.password = undefined as any;

    return {
      user,
      tokens: {
        accessToken,
        refreshToken
      }
    };
  }

  static async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = this.verifyRefreshToken(refreshToken);
      
      // Verify user still exists
      const user = await User.findById(payload.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new tokens
      const newTokenPayload: JWTPayload = {
        userId: (user._id as any).toString(),
        email: user.email
      };

      const newAccessToken = this.generateAccessToken(newTokenPayload);
      const newRefreshToken = this.generateRefreshToken(newTokenPayload);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<IUser | null> {
    return User.findById(userId);
  }

  static validatePassword(password: string): { isValid: boolean; message?: string } {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    
    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    
    return { isValid: true };
  }

  static async forgotPassword(email: string): Promise<void> {
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
        return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    await user.save();

    const emailService = require('./emailService').default;
    await emailService.sendPasswordResetEmail(user.email, resetToken, user.name);
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      throw new Error('Password reset token is invalid or has expired');
    }

    const passwordValidation = this.validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message || 'Invalid password');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    const emailService = require('./emailService').default;
    await emailService.sendPasswordResetConfirmation(user.email, user.name);
  }

  static async verifyResetToken(token: string): Promise<boolean> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }
    });

    return !!user;
  }
}
