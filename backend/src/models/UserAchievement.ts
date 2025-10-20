import mongoose, { Schema, Document } from 'mongoose';

export interface IUserAchievement extends Document {
  userId: mongoose.Types.ObjectId;
  achievementId: mongoose.Types.ObjectId;
  progress: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  currentStreak?: number;
  lastProgressUpdate: Date;
  progressHistory: {
    date: Date;
    value: number;
    action: string;
  }[];
}

const UserAchievementSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  achievementId: {
    type: Schema.Types.ObjectId,
    ref: 'Achievement',
    required: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0
  },
  isUnlocked: {
    type: Boolean,
    default: false
  },
  unlockedAt: {
    type: Date,
    required: false
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  lastProgressUpdate: {
    type: Date,
    default: Date.now
  },
  progressHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    value: {
      type: Number,
      required: true
    },
    action: {
      type: String,
      required: true
    }
  }]
}, {
  timestamps: true
});

// Compound index for efficient queries
UserAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });
UserAchievementSchema.index({ userId: 1, isUnlocked: 1 });
UserAchievementSchema.index({ userId: 1, 'achievementId': 1 });

export default mongoose.model<IUserAchievement>('UserAchievement', UserAchievementSchema);
