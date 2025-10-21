import { Response } from 'express';
import { NotificationService } from '../services/notificationService';
import { AuthenticatedRequest } from '../types/express';
import {
  CreateNotificationRequest,
  NotificationFilters,
  MarkAsReadRequest,
  BulkNotificationRequest
} from '../types/notification';

export class NotificationController {
  // Get user notifications with filtering and pagination
  static async getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
      
      const filters: NotificationFilters = {
        category: req.query.category as string,
        isRead: req.query.isRead ? req.query.isRead === 'true' : undefined,
        priority: req.query.priority as string,
        type: req.query.type as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key as keyof NotificationFilters] === undefined) {
          delete filters[key as keyof NotificationFilters];
        }
      });

      const result = await NotificationService.getUserNotifications(userId, filters, page, limit);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get recent notifications (for dropdown)
  static async getRecentNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 20);

      const notifications = await NotificationService.getRecentNotifications(userId, limit);

      res.status(200).json({
        success: true,
        data: notifications
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recent notifications',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get notification statistics
  static async getNotificationStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const stats = await NotificationService.getNotificationStats(userId);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notification statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get unread count
  static async getUnreadCount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const count = await NotificationService.getUnreadCount(userId);

      res.status(200).json({
        success: true,
        data: { count }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch unread count',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Mark notifications as read
  static async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { notificationIds }: MarkAsReadRequest = req.body;

      if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Notification IDs are required and must be a non-empty array'
        });
        return;
      }

      await NotificationService.markAsRead(userId, notificationIds);

      res.status(200).json({
        success: true,
        message: 'Notifications marked as read'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to mark notifications as read',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      await NotificationService.markAllAsRead(userId);

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to mark all notifications as read',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Delete notification
  static async deleteNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { notificationId } = req.params;

      if (!notificationId) {
        res.status(400).json({
          success: false,
          message: 'Notification ID is required'
        });
        return;
      }

      await NotificationService.deleteNotification(userId, notificationId);

      res.status(200).json({
        success: true,
        message: 'Notification deleted'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete notification',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Delete multiple notifications
  static async deleteNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { notificationIds } = req.body;

      if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Notification IDs are required and must be a non-empty array'
        });
        return;
      }

      await NotificationService.deleteNotifications(userId, notificationIds);

      res.status(200).json({
        success: true,
        message: 'Notifications deleted'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete notifications',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Create notification (admin only)
  static async createNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const notificationData: CreateNotificationRequest = req.body;

      // Validation
      if (!notificationData.userId || !notificationData.title || !notificationData.message || !notificationData.category) {
        res.status(400).json({
          success: false,
          message: 'User ID, title, message, and category are required'
        });
        return;
      }

      if (notificationData.title.length > 100) {
        res.status(400).json({
          success: false,
          message: 'Title must be 100 characters or less'
        });
        return;
      }

      if (notificationData.message.length > 500) {
        res.status(400).json({
          success: false,
          message: 'Message must be 500 characters or less'
        });
        return;
      }

      const notification = await NotificationService.createNotification(notificationData);

      res.status(201).json({
        success: true,
        data: notification,
        message: 'Notification created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create notification',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Create bulk notifications (admin only)
  static async createBulkNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const bulkData: BulkNotificationRequest = req.body;

      // Validation
      if (!bulkData.userIds || !Array.isArray(bulkData.userIds) || bulkData.userIds.length === 0) {
        res.status(400).json({
          success: false,
          message: 'User IDs are required and must be a non-empty array'
        });
        return;
      }

      if (!bulkData.title || !bulkData.message || !bulkData.category) {
        res.status(400).json({
          success: false,
          message: 'Title, message, and category are required'
        });
        return;
      }

      if (bulkData.userIds.length > 1000) {
        res.status(400).json({
          success: false,
          message: 'Cannot send to more than 1000 users at once'
        });
        return;
      }

      await NotificationService.createBulkNotifications(bulkData);

      res.status(201).json({
        success: true,
        message: `Bulk notifications sent to ${bulkData.userIds.length} users`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create bulk notifications',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
