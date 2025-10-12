import mongoose, { Schema, Document } from 'mongoose';

export interface IAchievement extends Document {
  name: string;
  description: string;
  iconUrl: string;
  category: 'consistency' | 'productivity' | 'social' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  criteria: {
    type: 'task_count' | 'streak' | 'category_tasks' | 'focus_time' | 'early_completion' | 'late_completion' | 'perfect_week';
    target: number;
    category?: string;
    timeframe: 'all_time' | 'daily' | 'weekly' | 'monthly';
  };
  rewards: {
    xp: number;
    coins: number;
    avatarItem?: string;
  };
  isActive: boolean;
  createdAt: Date;
}

const AchievementSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  iconUrl: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['consistency', 'productivity', 'social', 'special'],
    required: true
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    required: true
  },
  criteria: {
    type: {
      type: String,
      enum: ['task_count', 'streak', 'category_tasks', 'focus_time', 'early_completion', 'late_completion', 'perfect_week'],
      required: true
    },
    target: {
      type: Number,
      required: true
    },
    category: {
      type: String,
      required: false
    },
    timeframe: {
      type: String,
      enum: ['all_time', 'daily', 'weekly', 'monthly'],
      required: true
    }
  },
  rewards: {
    xp: {
      type: Number,
      required: true
    },
    coins: {
      type: Number,
      required: true
    },
    avatarItem: {
      type: String,
      required: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IAchievement>('Achievement', AchievementSchema);
