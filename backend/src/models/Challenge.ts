import  { Schema, model } from 'mongoose';
import { Challenge, ChallengeRequirement, ChallengeReward, ChallengeParticipant } from '../types/challenge';

const ChallengeRequirementSchema = new Schema<ChallengeRequirement>({
  id: { type: String, required: true },
  description: { type: String, required: true },
  target: { type: Number, required: true, min: 0 },
  current: { type: Number, default: 0, min: 0 },
  unit: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['tasks_completed', 'streak_days', 'focus_time', 'custom']
  }
}, { _id: false });

const ChallengeRewardSchema = new Schema<ChallengeReward>({
  xp: { type: Number, required: true, min: 0 },
  coins: { type: Number, required: true, min: 0 },
  badges: [{ type: String }],
  avatars: [{ type: String }],
  themes: [{ type: String }],
  titles: [{ type: String }],
  multiplier: { type: Number, min: 1, default: 1 }
}, { _id: false });

const ProgressSchema = new Schema({
  requirementId: { type: String, required: true },
  current: { type: Number, default: 0, min: 0 },
  completedAt: { type: Date }
}, { _id: false });

const ChallengeParticipantSchema = new Schema<ChallengeParticipant>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  joinedAt: { type: Date, default: Date.now },
  progress: [ProgressSchema],
  overallProgress: { type: Number, default: 0, min: 0, max: 100 },
  rank: { type: Number, min: 1 },
  score: { type: Number, default: 0, min: 0 },
  completedAt: { type: Date }
}, { _id: false });

const ChallengeSchema = new Schema<Challenge>({
  title: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 100
  },
  description: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 500
  },
  type: { 
    type: String, 
    required: true,
    enum: ['personal', 'community', 'friend', 'seasonal', 'daily', 'weekly']
  },
  category: { 
    type: String, 
    required: true,
    enum: ['productivity', 'streak', 'social', 'completion', 'focus', 'consistency', 'achievement']
  },
  difficulty: { 
    type: String, 
    required: true,
    enum: ['easy', 'medium', 'hard', 'extreme']
  },
  status: { 
    type: String, 
    required: true,
    enum: ['upcoming', 'active', 'completed', 'cancelled', 'draft'],
    default: 'upcoming'
  },
  startDate: { 
    type: Date, 
    required: true,
    validate: {
      validator: function(this: Challenge, value: Date) {
        return value >= new Date();
      },
      message: 'Start date must be in the future'
    }
  },
  endDate: { 
    type: Date, 
    required: true,
    validate: {
      validator: function(this: Challenge, value: Date) {
        return value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  maxParticipants: { 
    type: Number, 
    min: 1,
    max: 10000
  },
  requirements: {
    type: [ChallengeRequirementSchema],
    required: true,
    validate: {
      validator: function(requirements: ChallengeRequirement[]) {
        return requirements.length > 0 && requirements.length <= 10;
      },
      message: 'Challenge must have 1-10 requirements'
    }
  },
  rewards: {
    type: ChallengeRewardSchema,
    required: true
  },
  participants: [ChallengeParticipantSchema],
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  featured: { 
    type: Boolean, 
    default: false 
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 30
  }],
  imageUrl: { 
    type: String,
    validate: {
      validator: function(url: string) {
        if (!url) return true;
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(url);
      },
      message: 'Invalid image URL format'
    }
  },
  rules: [{
    type: String,
    trim: true,
    maxlength: 200
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
ChallengeSchema.index({ status: 1, startDate: 1 });
ChallengeSchema.index({ type: 1, category: 1 });
ChallengeSchema.index({ featured: 1, status: 1 });
ChallengeSchema.index({ 'participants.userId': 1 });
ChallengeSchema.index({ createdBy: 1 });
ChallengeSchema.index({ tags: 1 });
ChallengeSchema.index({ title: 'text', description: 'text' });

// Virtual for participant count
ChallengeSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

// Virtual for checking if challenge is full
ChallengeSchema.virtual('isFull').get(function() {
  return this.maxParticipants ? this.participants.length >= this.maxParticipants : false;
});

// Virtual for checking if challenge is active
ChallengeSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'active' && this.startDate <= now && this.endDate > now;
});

// Pre-save middleware to update challenge status based on dates
ChallengeSchema.pre('save', function(next) {
  const now = new Date();
  
  if (this.status === 'upcoming' && this.startDate <= now && this.endDate > now) {
    this.status = 'active';
  } else if (this.status === 'active' && this.endDate <= now) {
    this.status = 'completed';
  }
  
  next();
});

// Method to calculate participant progress
ChallengeSchema.methods.calculateParticipantProgress = function(userId: string) {
  const participant = this.participants.find((p: ChallengeParticipant) => 
    p.userId.toString() === userId
  );
  
  if (!participant) return 0;
  
  const totalRequirements = this.requirements.length;
  const completedRequirements = participant.progress.filter((p: any) => {
    const requirement = this.requirements.find((r: any) => r.id === p.requirementId);
    return requirement && p.current >= requirement.target;
  }).length;
  
  return Math.round((completedRequirements / totalRequirements) * 100);
};

// Method to calculate participant score
ChallengeSchema.methods.calculateParticipantScore = function(userId: string) {
  const participant = this.participants.find((p: ChallengeParticipant) => 
    p.userId.toString() === userId
  );
  
  if (!participant) return 0;
  
  let score = 0;
  
  participant.progress.forEach((p: any) => {
    const requirement = this.requirements.find((r: any) => r.id === p.requirementId);
    if (requirement) {
      const progressRatio = Math.min(p.current / requirement.target, 1);
      score += progressRatio * 100;
    }
  });
  
  // Apply difficulty multiplier
  const difficultyMultipliers: Record<string, number> = { easy: 1, medium: 1.5, hard: 2, extreme: 3 };
  score *= difficultyMultipliers[this.difficulty] || 1;
  
  return Math.round(score);
};

// Method to update leaderboard
ChallengeSchema.methods.updateLeaderboard = function() {
  // Calculate scores and progress for all participants
  this.participants.forEach((participant: ChallengeParticipant) => {
    participant.overallProgress = this.calculateParticipantProgress(participant.userId.toString());
    participant.score = this.calculateParticipantScore(participant.userId.toString());
  });
  
  // Sort by score (descending) and assign ranks
  this.participants.sort((a: ChallengeParticipant, b: ChallengeParticipant) => b.score - a.score);
  
  this.participants.forEach((participant: ChallengeParticipant, index: number) => {
    participant.rank = index + 1;
  });
};

export const ChallengeModel = model<Challenge>('Challenge', ChallengeSchema);
