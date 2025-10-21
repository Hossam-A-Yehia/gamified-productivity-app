import { apiService } from './api';
import type {
  Notification,
  NotificationFilters,
  NotificationResponse,
  NotificationStats,
  MarkAsReadRequest,
  CreateNotificationRequest
} from '../types/notification';

class NotificationService {
  // Get user notifications with filtering and pagination
  async getNotifications(
    filters: NotificationFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<NotificationResponse> {
    const params = new URLSearchParams();
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = queryString ? `/notifications?${queryString}` : '/notifications';
    
    const response = await apiService.get<NotificationResponse>(url);
    return response.data.data!;
  }

  // Get recent notifications (for dropdown)
  async getRecentNotifications(limit: number = 10): Promise<Notification[]> {
    const response = await apiService.get<Notification[]>(`/notifications/recent?limit=${limit}`);
    return response.data.data!;
  }

  // Get notification statistics
  async getNotificationStats(): Promise<NotificationStats> {
    const response = await apiService.get<NotificationStats>('/notifications/stats');
    return response.data.data!;
  }

  // Get unread count
  async getUnreadCount(): Promise<number> {
    const response = await apiService.get<{ count: number }>('/notifications/unread-count');
    return response.data.data!.count;
  }

  // Mark notifications as read
  async markAsRead(notificationIds: string[]): Promise<void> {
    const requestData: MarkAsReadRequest = { notificationIds };
    await apiService.put('/notifications/mark-read', requestData);
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    await apiService.put('/notifications/mark-all-read');
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    await apiService.delete(`/notifications/${notificationId}`);
  }

  // Delete multiple notifications
  async deleteNotifications(notificationIds: string[]): Promise<void> {
    await apiService.delete('/notifications', { notificationIds });
  }

  // Create notification (admin only)
  async createNotification(notificationData: CreateNotificationRequest): Promise<Notification> {
    const response = await apiService.post<Notification>('/notifications/create', notificationData);
    return response.data.data!;
  }

  // Helper methods
  getCategoryIcon(category: string): string {
    const icons = {
      achievement: '🏆',
      social: '👥',
      task: '✅',
      challenge: '🎯',
      focus: '⏰',
      system: '🔔',
      gamification: '🎮'
    };
    return icons[category as keyof typeof icons] || '🔔';
  }

  getPriorityColor(priority: string): string {
    const colors = {
      low: 'text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400',
      medium: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
      high: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400',
      urgent: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  }

  getCategoryColor(category: string): string {
    const colors = {
      achievement: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400',
      social: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
      task: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
      challenge: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400',
      focus: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
      system: 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400',
      gamification: 'text-pink-600 bg-pink-100 dark:bg-pink-900/30 dark:text-pink-400'
    };
    return colors[category as keyof typeof colors] || colors.system;
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  }

  isToday(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  isYesterday(dateString: string): boolean {
    const date = new Date(dateString);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
  }

  groupNotificationsByDate(notifications: Notification[]): { [key: string]: Notification[] } {
    const grouped: { [key: string]: Notification[] } = {};
    
    notifications.forEach(notification => {
      let dateKey: string;
      
      if (this.isToday(notification.createdAt)) {
        dateKey = 'Today';
      } else if (this.isYesterday(notification.createdAt)) {
        dateKey = 'Yesterday';
      } else {
        dateKey = this.formatDate(notification.createdAt);
      }
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(notification);
    });
    
    return grouped;
  }
}

export const notificationService = new NotificationService();
export default notificationService;
