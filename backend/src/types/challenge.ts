import { Document, Types } from 'mongoose';

export interface ChallengeRequirement {
  id: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  type: 'tasks_completed' | 'streak_days' | 'focus_time' | 'custom';
}

export interface ChallengeReward {
  xp: number;
  coins: number;
  badges?: string[];
  avatars?: string[];
  themes?: string[];
  titles?: string[];
  multiplier?: number;
}

export interface ChallengeParticipant {
  userId: Types.ObjectId;
  joinedAt: Date;
  progress: {
    requirementId: string;
    current: number;
    completedAt?: Date;
  }[];
  overallProgress: number;
  rank?: number;
  score: number;
  completedAt?: Date;
}

// Base interface for Challenge data structure
export interface IChallengeBase {
  title: string;
  description: string;
  type: 'personal' | 'community' | 'friend' | 'seasonal' | 'daily' | 'weekly';
  category: 'productivity' | 'streak' | 'social' | 'completion' | 'focus' | 'consistency' | 'achievement';
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  status: 'upcoming' | 'active' | 'completed' | 'cancelled' | 'draft';
  startDate: Date;
  endDate: Date;
  maxParticipants?: number;
  requirements: ChallengeRequirement[];
  rewards: ChallengeReward;
  participants: ChallengeParticipant[];
  createdBy: Types.ObjectId;
  featured: boolean;
  tags: string[];
  imageUrl?: string;
  rules?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Document interface
export interface Challenge extends IChallengeBase, Document {
  _id: Types.ObjectId;
}

// Plain object interface (for API responses, lean queries, etc.)
export interface ChallengeObject extends IChallengeBase {
  _id: Types.ObjectId;
  __v?: number;
}

export interface CreateChallengeRequest {
  title: string;
  description: string;
  type: Challenge['type'];
  category: Challenge['category'];
  difficulty: Challenge['difficulty'];
  startDate: Date;
  endDate: Date;
  maxParticipants?: number;
  requirements: Omit<ChallengeRequirement, 'current'>[];
  rewards: ChallengeReward;
  tags?: string[];
  imageUrl?: string;
  rules?: string[];
}

export interface UpdateChallengeRequest {
  title?: string;
  description?: string;
  type?: Challenge['type'];
  category?: Challenge['category'];
  difficulty?: Challenge['difficulty'];
  startDate?: Date;
  endDate?: Date;
  maxParticipants?: number;
  requirements?: Omit<ChallengeRequirement, 'current'>[];
  rewards?: ChallengeReward;
  tags?: string[];
  imageUrl?: string;
  rules?: string[];
  status?: Challenge['status'];
  featured?: boolean;
}

export interface ChallengeFilters {
  type?: Challenge['type'];
  category?: Challenge['category'];
  difficulty?: Challenge['difficulty'];
  status?: Challenge['status'];
  tags?: string[];
  search?: string;
  featured?: boolean;
  participating?: boolean;
  userId?: string;
}

export interface ChallengeStats {
  total: number;
  byType: Record<Challenge['type'], number>;
  byCategory: Record<Challenge['category'], number>;
  byDifficulty: Record<Challenge['difficulty'], number>;
  byStatus: Record<Challenge['status'], number>;
  participating: number;
  completed: number;
}

export interface LeaderboardEntry {
  userId: Types.ObjectId;
  username: string;
  score: number;
  rank: number;
  progress: number;
  completedAt?: Date;
  avatar?: string;
}

export interface ChallengeLeaderboard {
  challengeId: Types.ObjectId;
  entries: LeaderboardEntry[];
  totalParticipants: number;
  currentUser?: LeaderboardEntry;
}

export interface ProgressUpdateRequest {
  requirementId: string;
  progress: number;
}

export interface JoinChallengeRequest {
  challengeId: string;
  message?: string;
}

export interface InviteFriendsRequest {
  challengeId: string;
  userIds: string[];
  message?: string;
}
