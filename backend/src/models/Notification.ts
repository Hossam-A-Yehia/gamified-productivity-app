import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'task_completed' | 'achievement_unlocked' | 'friend_request' | 'friend_accepted' | 
        'challenge_invitation' | 'challenge_completed' | 'level_up' | 'streak_milestone' |
        'focus_session_completed' | 'leaderboard_rank_change' | 'system_announcement';
  title: string;
  message: string;
  data?: {
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
  };
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'achievement' | 'social' | 'task' | 'challenge' | 'focus' | 'system' | 'gamification';
  actionUrl?: string;
  expiresAt?: Date;
  createdAt: Date;
  readAt?: Date;
}

const notificationSchema = new Schema<INotification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'task_completed',
      'achievement_unlocked',
      'friend_request',
      'friend_accepted',
      'challenge_invitation',
      'challenge_completed',
      'level_up',
      'streak_milestone',
      'focus_session_completed',
      'leaderboard_rank_change',
      'system_announcement'
    ],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  data: {
    type: Schema.Types.Mixed,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  category: {
    type: String,
    enum: ['achievement', 'social', 'task', 'challenge', 'focus', 'system', 'gamification'],
    required: true,
    index: true
  },
  actionUrl: {
    type: String,
    maxlength: 200
  },
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 }
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true,
  collection: 'notifications'
});

// Compound indexes for efficient queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, category: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, priority: 1, createdAt: -1 });

// Virtual for time since creation
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now.getTime() - this.createdAt.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
});

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = async function(notificationData: Partial<INotification>) {
  const notification = new this(notificationData);
  await notification.save();
  return notification;
};

// Static method to mark multiple notifications as read
notificationSchema.statics.markMultipleAsRead = async function(userId: string, notificationIds: string[]) {
  const result = await this.updateMany(
    { 
      userId: new mongoose.Types.ObjectId(userId),
      _id: { $in: notificationIds.map(id => new mongoose.Types.ObjectId(id)) }
    },
    { 
      isRead: true,
      readAt: new Date()
    }
  );
  return result;
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId: string) {
  const count = await this.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
    isRead: false
  });
  return count;
};

export default mongoose.model<INotification>('Notification', notificationSchema);
