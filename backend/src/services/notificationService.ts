import Notification, { INotification } from '../models/Notification';
import User from '../models/User';
import mongoose from 'mongoose';
import {
  CreateNotificationRequest,
  NotificationFilters,
  NotificationResponse,
  NotificationStats,
  BulkNotificationRequest
} from '../types/notification';
import { SocketService } from './socketService';

export class NotificationService {
  // Create a single notification
  static async createNotification(notificationData: CreateNotificationRequest): Promise<NotificationResponse> {
    const notification = new Notification({
      userId: new mongoose.Types.ObjectId(notificationData.userId),
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      data: notificationData.data || {},
      priority: notificationData.priority || 'medium',
      category: notificationData.category,
      actionUrl: notificationData.actionUrl,
      expiresAt: notificationData.expiresAt
    });

    await notification.save();

    // Emit real-time notification
    SocketService.getInstance().emitToUser(notificationData.userId, 'notification-received', {
      notification: this.formatNotification(notification)
    });

    return this.formatNotification(notification);
  }

  // Create bulk notifications for multiple users
  static async createBulkNotifications(bulkData: BulkNotificationRequest): Promise<void> {
    const notifications = bulkData.userIds.map(userId => ({
      userId: new mongoose.Types.ObjectId(userId),
      type: bulkData.type,
      title: bulkData.title,
      message: bulkData.message,
      data: bulkData.data || {},
      priority: bulkData.priority || 'medium',
      category: bulkData.category,
      actionUrl: bulkData.actionUrl,
      expiresAt: bulkData.expiresAt
    }));

    await Notification.insertMany(notifications);

    // Emit real-time notifications to all users
    bulkData.userIds.forEach(userId => {
      SocketService.getInstance().emitToUser(userId, 'notification-received', {
        notification: {
          type: bulkData.type,
          title: bulkData.title,
          message: bulkData.message,
          category: bulkData.category,
          priority: bulkData.priority || 'medium'
        }
      });
    });
  }

  // Get user notifications with filtering and pagination
  static async getUserNotifications(
    userId: string,
    filters: NotificationFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{ notifications: NotificationResponse[]; pagination: any }> {
    const query: any = { userId: new mongoose.Types.ObjectId(userId) };

    // Apply filters
    if (filters.category) {
      query.category = filters.category;
    }
    if (filters.isRead !== undefined) {
      query.isRead = filters.isRead;
    }
    if (filters.priority) {
      query.priority = filters.priority;
    }
    if (filters.type) {
      query.type = filters.type;
    }
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.createdAt.$lte = new Date(filters.endDate);
      }
    }

    const skip = (page - 1) * limit;
    const total = await Notification.countDocuments(query);

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      notifications: notifications.map(this.formatNotification),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  // Get recent notifications (for dropdown)
  static async getRecentNotifications(userId: string, limit: number = 10): Promise<NotificationResponse[]> {
    const notifications = await Notification.find({
      userId: new mongoose.Types.ObjectId(userId)
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return notifications.map(this.formatNotification);
  }

  // Get notification statistics
  static async getNotificationStats(userId: string): Promise<NotificationStats> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    const [
      total,
      unread,
      categoryStats,
      priorityStats,
      recentCount
    ] = await Promise.all([
      Notification.countDocuments({ userId: userObjectId }),
      Notification.countDocuments({ userId: userObjectId, isRead: false }),
      Notification.aggregate([
        { $match: { userId: userObjectId } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Notification.aggregate([
        { $match: { userId: userObjectId } },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      Notification.countDocuments({
        userId: userObjectId,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      })
    ]);

    const byCategory: { [key: string]: number } = {};
    categoryStats.forEach((stat: any) => {
      byCategory[stat._id] = stat.count;
    });

    const byPriority: { [key: string]: number } = {};
    priorityStats.forEach((stat: any) => {
      byPriority[stat._id] = stat.count;
    });

    return {
      total,
      unread,
      byCategory,
      byPriority,
      recentCount
    };
  }

  // Mark notifications as read
  static async markAsRead(userId: string, notificationIds: string[]): Promise<void> {
    await Notification.updateMany(
      { 
        userId: new mongoose.Types.ObjectId(userId),
        _id: { $in: notificationIds.map(id => new mongoose.Types.ObjectId(id)) }
      },
      { 
        isRead: true,
        readAt: new Date()
      }
    );
    
    // Emit real-time update
    SocketService.getInstance().emitToUser(userId, 'notifications-marked-read', {
      notificationIds
    });
  }

  // Mark all notifications as read
  static async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany(
      { userId: new mongoose.Types.ObjectId(userId), isRead: false },
      { isRead: true, readAt: new Date() }
    );

    // Emit real-time update
    SocketService.getInstance().emitToUser(userId, 'all-notifications-marked-read', {});
  }

  // Delete notification
  static async deleteNotification(userId: string, notificationId: string): Promise<void> {
    await Notification.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(notificationId),
      userId: new mongoose.Types.ObjectId(userId)
    });

    // Emit real-time update
    SocketService.getInstance().emitToUser(userId, 'notification-deleted', {
      notificationId
    });
  }

  // Delete multiple notifications
  static async deleteNotifications(userId: string, notificationIds: string[]): Promise<void> {
    await Notification.deleteMany({
      _id: { $in: notificationIds.map(id => new mongoose.Types.ObjectId(id)) },
      userId: new mongoose.Types.ObjectId(userId)
    });

    // Emit real-time update
    SocketService.getInstance().emitToUser(userId, 'notifications-deleted', {
      notificationIds
    });
  }

  // Get unread count
  static async getUnreadCount(userId: string): Promise<number> {
    return await Notification.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      isRead: false
    });
  }

  // Clean up expired notifications
  static async cleanupExpiredNotifications(): Promise<void> {
    await Notification.deleteMany({
      expiresAt: { $lte: new Date() }
    });
  }

  // Helper method to format notification for response
  private static formatNotification(notification: any): NotificationResponse {
    return {
      _id: notification._id.toString(),
      userId: notification.userId.toString(),
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      isRead: notification.isRead,
      priority: notification.priority,
      category: notification.category,
      actionUrl: notification.actionUrl,
      expiresAt: notification.expiresAt?.toISOString(),
      createdAt: notification.createdAt.toISOString(),
      readAt: notification.readAt?.toISOString(),
      timeAgo: this.getTimeAgo(notification.createdAt)
    };
  }

  // Helper method to calculate time ago
  private static getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }

  // Notification templates for common events
  static async notifyTaskCompleted(userId: string, taskTitle: string, xpGained: number, coinsEarned: number): Promise<void> {
    await this.createNotification({
      userId,
      type: 'task_completed',
      title: 'Task Completed! 🎉',
      message: `You completed "${taskTitle}" and earned ${xpGained} XP and ${coinsEarned} coins!`,
      category: 'task',
      priority: 'medium',
      data: { xpGained, coinsEarned },
      actionUrl: '/tasks'
    });
  }

  static async notifyAchievementUnlocked(userId: string, achievementTitle: string, achievementId: string): Promise<void> {
    await this.createNotification({
      userId,
      type: 'achievement_unlocked',
      title: 'Achievement Unlocked! 🏆',
      message: `Congratulations! You unlocked "${achievementTitle}"`,
      category: 'achievement',
      priority: 'high',
      data: { achievementId },
      actionUrl: '/achievements'
    });
  }

  static async notifyFriendRequest(userId: string, fromUserName: string, fromUserId: string): Promise<void> {
    await this.createNotification({
      userId,
      type: 'friend_request',
      title: 'New Friend Request 👋',
      message: `${fromUserName} sent you a friend request`,
      category: 'social',
      priority: 'medium',
      data: { friendId: fromUserId },
      actionUrl: '/friends'
    });
  }

  static async notifyLevelUp(userId: string, newLevel: number, xpGained: number): Promise<void> {
    await this.createNotification({
      userId,
      type: 'level_up',
      title: 'Level Up! 🚀',
      message: `Congratulations! You reached level ${newLevel}!`,
      category: 'gamification',
      priority: 'high',
      data: { newLevel, xpGained },
      actionUrl: '/profile'
    });
  }

  static async notifyStreakMilestone(userId: string, streakDays: number): Promise<void> {
    await this.createNotification({
      userId,
      type: 'streak_milestone',
      title: 'Streak Milestone! 🔥',
      message: `Amazing! You've maintained a ${streakDays}-day streak!`,
      category: 'gamification',
      priority: 'high',
      data: { streakDays },
      actionUrl: '/dashboard'
    });
  }
}
