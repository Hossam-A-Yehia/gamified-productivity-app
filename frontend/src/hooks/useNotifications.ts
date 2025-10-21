import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';
import type {
  Notification,
  NotificationFilters,
  NotificationResponse,
  NotificationStats,
  CreateNotificationRequest
} from '../types/notification';
import { toast } from 'sonner';

// Query keys
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters: NotificationFilters, page: number, limit: number) => 
    [...notificationKeys.lists(), { filters, page, limit }] as const,
  recent: (limit: number) => [...notificationKeys.all, 'recent', limit] as const,
  stats: () => [...notificationKeys.all, 'stats'] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
};

// Get notifications with filtering and pagination
export const useNotifications = (
  filters: NotificationFilters = {},
  page: number = 1,
  limit: number = 20
) => {
  return useQuery({
    queryKey: notificationKeys.list(filters, page, limit),
    queryFn: () => notificationService.getNotifications(filters, page, limit),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get recent notifications (for dropdown)
export const useRecentNotifications = (limit: number = 10) => {
  return useQuery({
    queryKey: notificationKeys.recent(limit),
    queryFn: () => notificationService.getRecentNotifications(limit),
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time updates
  });
};

// Get notification statistics
export const useNotificationStats = () => {
  return useQuery({
    queryKey: notificationKeys.stats(),
    queryFn: () => notificationService.getNotificationStats(),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get unread count
export const useUnreadCount = () => {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationService.getUnreadCount(),
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 15 * 1000, // Refetch every 15 seconds for real-time badge
  });
};

// Notification operations hook
export const useNotificationOperations = () => {
  const queryClient = useQueryClient();

  const markAsRead = useMutation({
    mutationFn: (notificationIds: string[]) => 
      notificationService.markAsRead(notificationIds),
    onSuccess: () => {
      // Invalidate and refetch notification queries
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success('Notifications marked as read');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to mark notifications as read');
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      // Invalidate and refetch notification queries
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success('All notifications marked as read');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to mark all notifications as read');
    },
  });

  const deleteNotification = useMutation({
    mutationFn: (notificationId: string) => 
      notificationService.deleteNotification(notificationId),
    onSuccess: () => {
      // Invalidate and refetch notification queries
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success('Notification deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete notification');
    },
  });

  const deleteNotifications = useMutation({
    mutationFn: (notificationIds: string[]) => 
      notificationService.deleteNotifications(notificationIds),
    onSuccess: (_, variables) => {
      // Invalidate and refetch notification queries
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success(`${variables.length} notifications deleted`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete notifications');
    },
  });

  const createNotification = useMutation({
    mutationFn: (notificationData: CreateNotificationRequest) => 
      notificationService.createNotification(notificationData),
    onSuccess: () => {
      // Invalidate and refetch notification queries
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success('Notification created');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create notification');
    },
  });

  return {
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteNotifications,
    createNotification,
  };
};

// Helper hook for notification management
export const useNotificationManager = () => {
  const queryClient = useQueryClient();

  // Manually update unread count (for real-time updates)
  const updateUnreadCount = (newCount: number) => {
    queryClient.setQueryData(notificationKeys.unreadCount(), newCount);
  };

  // Add new notification to recent list (for real-time updates)
  const addNotification = (notification: Notification) => {
    queryClient.setQueryData(
      notificationKeys.recent(10),
      (oldData: Notification[] | undefined) => {
        if (!oldData) return [notification];
        return [notification, ...oldData.slice(0, 9)];
      }
    );
    
    // Update unread count
    queryClient.setQueryData(
      notificationKeys.unreadCount(),
      (oldCount: number | undefined) => (oldCount || 0) + 1
    );
  };

  // Mark notification as read in cache
  const markNotificationAsRead = (notificationId: string) => {
    // Update recent notifications
    queryClient.setQueryData(
      notificationKeys.recent(10),
      (oldData: Notification[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(notification =>
          notification._id === notificationId
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification
        );
      }
    );

    // Update unread count
    queryClient.setQueryData(
      notificationKeys.unreadCount(),
      (oldCount: number | undefined) => Math.max((oldCount || 1) - 1, 0)
    );
  };

  // Remove notification from cache
  const removeNotification = (notificationId: string) => {
    queryClient.setQueryData(
      notificationKeys.recent(10),
      (oldData: Notification[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.filter(notification => notification._id !== notificationId);
      }
    );
  };

  return {
    updateUnreadCount,
    addNotification,
    markNotificationAsRead,
    removeNotification,
  };
};
