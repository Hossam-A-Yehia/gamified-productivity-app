import { Response } from 'express';
import { ProfileService } from '../services/profileService';
import { AuthenticatedRequest } from '../types/express';
import {
  UpdateProfileRequest,
  UpdateSettingsRequest,
  SearchUsersRequest,
  PurchaseCustomizationRequest
} from '../types/profile';

export class ProfileController {
  // Get current user's profile
  static async getMyProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const profile = await ProfileService.getUserProfile(userId);

      if (!profile) {
        res.status(404).json({
          success: false,
          message: 'Profile not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get user profile by ID (public view)
  static async getUserProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const requesterId = req.user!.id;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
        return;
      }

      const profile = await ProfileService.getPublicProfile(userId, requesterId);

      if (!profile) {
        res.status(404).json({
          success: false,
          message: 'Profile not found or private'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update user profile
  static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const updateData: UpdateProfileRequest = req.body;

      // Validation
      if (updateData.name && (updateData.name.length < 2 || updateData.name.length > 100)) {
        res.status(400).json({
          success: false,
          message: 'Name must be between 2 and 100 characters'
        });
        return;
      }

      const profile = await ProfileService.updateProfile(userId, updateData);

      if (!profile) {
        res.status(404).json({
          success: false,
          message: 'Profile not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: profile,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update user settings
  static async updateSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const updateData: UpdateSettingsRequest = req.body;

      // Validation
      if (updateData.theme && !['light', 'dark', 'auto'].includes(updateData.theme)) {
        res.status(400).json({
          success: false,
          message: 'Invalid theme value'
        });
        return;
      }

      if (updateData.productivity?.workingHoursStart && 
          !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(updateData.productivity.workingHoursStart)) {
        res.status(400).json({
          success: false,
          message: 'Invalid working hours start format (use HH:MM)'
        });
        return;
      }

      if (updateData.productivity?.workingHoursEnd && 
          !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(updateData.productivity.workingHoursEnd)) {
        res.status(400).json({
          success: false,
          message: 'Invalid working hours end format (use HH:MM)'
        });
        return;
      }

      if (updateData.productivity?.workingDays && 
          !updateData.productivity.workingDays.every(day => day >= 0 && day <= 6)) {
        res.status(400).json({
          success: false,
          message: 'Working days must be between 0 (Sunday) and 6 (Saturday)'
        });
        return;
      }

      const profile = await ProfileService.updateSettings(userId, updateData);

      if (!profile) {
        res.status(404).json({
          success: false,
          message: 'Profile not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: profile,
        message: 'Settings updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get profile statistics
  static async getProfileStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const stats = await ProfileService.getProfileStats(userId);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch profile statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Search users
  static async searchUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const filters: SearchUsersRequest = {
        query: req.query.query as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as 'asc' | 'desc'
      };

      const result = await ProfileService.searchUsers(filters);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to search users',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get available customizations
  static async getAvailableCustomizations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const customizations = await ProfileService.getAvailableCustomizations(userId);

      res.status(200).json({
        success: true,
        data: customizations
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch available customizations',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Purchase customization item
  static async purchaseCustomization(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const purchaseData: PurchaseCustomizationRequest = req.body;

      // Validation
      if (!purchaseData.type || !['skin', 'accessory', 'background'].includes(purchaseData.type)) {
        res.status(400).json({
          success: false,
          message: 'Invalid customization type'
        });
        return;
      }

      if (!purchaseData.itemId) {
        res.status(400).json({
          success: false,
          message: 'Item ID is required'
        });
        return;
      }

      const result = await ProfileService.purchaseCustomization(userId, purchaseData);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Customization purchased successfully'
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Item already unlocked') {
          res.status(400).json({
            success: false,
            message: error.message
          });
          return;
        }
        if (error.message === 'Insufficient coins') {
          res.status(400).json({
            success: false,
            message: error.message
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        message: 'Failed to purchase customization',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Upload avatar image
  static async uploadAvatar(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      
      // In a real implementation, you would handle file upload here
      // For now, we'll just return a placeholder response
      res.status(501).json({
        success: false,
        message: 'Avatar upload not implemented yet'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to upload avatar',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Delete user account
  static async deleteAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { password } = req.body;

      if (!password) {
        res.status(400).json({
          success: false,
          message: 'Password confirmation is required'
        });
        return;
      }

      // In a real implementation, you would:
      // 1. Verify the password
      // 2. Delete all user data
      // 3. Handle cleanup of related data
      
      res.status(501).json({
        success: false,
        message: 'Account deletion not implemented yet'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete account',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Export user data (GDPR compliance)
  static async exportUserData(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      
      // In a real implementation, you would:
      // 1. Gather all user data from all collections
      // 2. Format it appropriately
      // 3. Return as downloadable file
      
      res.status(501).json({
        success: false,
        message: 'Data export not implemented yet'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to export user data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
