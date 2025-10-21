export interface NotificationData {
  taskId?: string;
  achievementId?: string;
  friendId?: string;
  challengeId?: string;
  focusSessionId?: string;
  xpGained?: number;
  coinsEarned?: number;
  newLevel?: number;
  newRank?: number;
  streakDays?: number;
  [key: string]: any;
}

export interface Notification {
  _id: string;
  userId: string;
  type: 'task_completed' | 'achievement_unlocked' | 'friend_request' | 'friend_accepted' | 
        'challenge_invitation' | 'challenge_completed' | 'level_up' | 'streak_milestone' |
        'focus_session_completed' | 'leaderboard_rank_change' | 'system_announcement';
  title: string;
  message: string;
  data?: NotificationData;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'achievement' | 'social' | 'task' | 'challenge' | 'focus' | 'system' | 'gamification';
  actionUrl?: string;
  expiresAt?: string;
  createdAt: string;
  readAt?: string;
  timeAgo: string;
}

export interface NotificationFilters {
  category?: string;
  isRead?: boolean;
  priority?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byCategory: {
    [category: string]: number;
  };
  byPriority: {
    [priority: string]: number;
  };
  recentCount: number;
}

export interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface MarkAsReadRequest {
  notificationIds: string[];
}

export interface CreateNotificationRequest {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: NotificationData;
  priority?: string;
  category: string;
  actionUrl?: string;
  expiresAt?: Date;
}

export type NotificationCategory = 'achievement' | 'social' | 'task' | 'challenge' | 'focus' | 'system' | 'gamification';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationType = 'task_completed' | 'achievement_unlocked' | 'friend_request' | 'friend_accepted' | 
  'challenge_invitation' | 'challenge_completed' | 'level_up' | 'streak_milestone' |
  'focus_session_completed' | 'leaderboard_rank_change' | 'system_announcement';
