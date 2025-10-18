export interface Challenge {
  _id: string;
  title: string;
  description: string;
  type: ChallengeType;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  requirements: ChallengeRequirement[];
  rewards: ChallengeReward[];
  startDate: string;
  endDate: string;
  participants: ChallengeParticipant[];
  leaderboard: LeaderboardEntry[];
  status: ChallengeStatus;
  createdBy?: string; // For user-created challenges
  maxParticipants?: number;
  isPublic: boolean;
  tags: string[];
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type ChallengeType = 'personal' | 'community' | 'friend' | 'seasonal' | 'daily' | 'weekly';

export type ChallengeCategory = 
  | 'productivity' 
  | 'streak' 
  | 'social' 
  | 'completion' 
  | 'focus' 
  | 'consistency' 
  | 'achievement';

export type ChallengeDifficulty = 'easy' | 'medium' | 'hard' | 'extreme';

export type ChallengeStatus = 'upcoming' | 'active' | 'completed' | 'cancelled' | 'draft';

export interface ChallengeRequirement {
  type: RequirementType;
  target: number;
  current?: number;
  description: string;
  unit: string; // 'tasks', 'days', 'hours', 'points', etc.
}

export type RequirementType = 
  | 'complete_tasks'
  | 'maintain_streak'
  | 'earn_xp'
  | 'focus_time'
  | 'daily_login'
  | 'task_category'
  | 'task_difficulty'
  | 'consecutive_days';

export interface ChallengeReward {
  type: RewardType;
  amount: number;
  description: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export type RewardType = 
  | 'xp' 
  | 'coins' 
  | 'badge' 
  | 'avatar' 
  | 'theme' 
  | 'title' 
  | 'multiplier';

export interface ChallengeParticipant {
  userId: string;
  username: string;
  avatar?: string;
  joinedAt: string;
  progress: ChallengeProgress;
  rank?: number;
  isCompleted: boolean;
  completedAt?: string;
}

export interface ChallengeProgress {
  requirements: RequirementProgress[];
  overallProgress: number; // 0-100 percentage
  lastUpdated: string;
}

export interface RequirementProgress {
  requirementId: string;
  current: number;
  target: number;
  isCompleted: boolean;
  completedAt?: string;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  rank: number;
  progress: number;
  isCompleted: boolean;
  completedAt?: string;
}

export interface CreateChallengeRequest {
  title: string;
  description: string;
  type: ChallengeType;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  requirements: Omit<ChallengeRequirement, 'current'>[];
  rewards: ChallengeReward[];
  startDate: string;
  endDate: string;
  maxParticipants?: number;
  isPublic: boolean;
  tags: string[];
  imageUrl?: string;
}

export interface UpdateChallengeRequest {
  title?: string;
  description?: string;
  requirements?: ChallengeRequirement[];
  rewards?: ChallengeReward[];
  startDate?: string;
  endDate?: string;
  maxParticipants?: number;
  isPublic?: boolean;
  tags?: string[];
  imageUrl?: string;
  status?: ChallengeStatus;
}

export interface ChallengeFilters {
  type?: ChallengeType[];
  category?: ChallengeCategory[];
  difficulty?: ChallengeDifficulty[];
  status?: ChallengeStatus[];
  search?: string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
  isParticipating?: boolean;
  createdBy?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'startDate' | 'endDate' | 'participants' | 'difficulty' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface ChallengesResponse {
  challenges: Challenge[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ChallengeStats {
  totalChallenges: number;
  activeChallenges: number;
  completedChallenges: number;
  participatingChallenges: number;
  wonChallenges: number;
  totalRewardsEarned: {
    xp: number;
    coins: number;
    badges: number;
  };
  categoryBreakdown: Record<ChallengeCategory, number>;
  difficultyBreakdown: Record<ChallengeDifficulty, number>;
}

export interface JoinChallengeRequest {
  challengeId: string;
}

export interface LeaveChallengeRequest {
  challengeId: string;
}

export interface ChallengeProgressUpdate {
  challengeId: string;
  requirementUpdates: {
    requirementId: string;
    increment: number;
  }[];
}

export interface ChallengeFormData {
  title: string;
  description: string;
  type: ChallengeType;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  isPublic: boolean;
  tags: string;
  imageUrl: string;
  requirements: {
    type: RequirementType;
    target: number;
    description: string;
    unit: string;
  }[];
  rewards: {
    type: RewardType;
    amount: number;
    description: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  }[];
}

export const CHALLENGE_TYPES = [
  { value: 'personal', label: 'Personal', description: 'Individual goals and achievements' },
  { value: 'community', label: 'Community', description: 'Global competitions with all users' },
  { value: 'friend', label: 'Friend', description: 'Compete with your friends' },
  { value: 'seasonal', label: 'Seasonal', description: 'Limited-time special events' },
  { value: 'daily', label: 'Daily', description: 'Daily recurring challenges' },
  { value: 'weekly', label: 'Weekly', description: 'Weekly recurring challenges' },
] as const;

export const CHALLENGE_CATEGORIES = [
  { value: 'productivity', label: 'Productivity', color: 'bg-blue-500', icon: '⚡' },
  { value: 'streak', label: 'Streak', color: 'bg-orange-500', icon: '🔥' },
  { value: 'social', label: 'Social', color: 'bg-green-500', icon: '👥' },
  { value: 'completion', label: 'Completion', color: 'bg-purple-500', icon: '✅' },
  { value: 'focus', label: 'Focus', color: 'bg-indigo-500', icon: '🎯' },
  { value: 'consistency', label: 'Consistency', color: 'bg-teal-500', icon: '📈' },
  { value: 'achievement', label: 'Achievement', color: 'bg-yellow-500', icon: '🏆' },
] as const;

export const CHALLENGE_DIFFICULTIES = [
  { value: 'easy', label: 'Easy', multiplier: 1.0, color: 'text-green-600', bgColor: 'bg-green-100' },
  { value: 'medium', label: 'Medium', multiplier: 1.5, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  { value: 'hard', label: 'Hard', multiplier: 2.0, color: 'text-red-600', bgColor: 'bg-red-100' },
  { value: 'extreme', label: 'Extreme', multiplier: 3.0, color: 'text-purple-600', bgColor: 'bg-purple-100' },
] as const;

export const CHALLENGE_STATUSES = [
  { value: 'upcoming', label: 'Upcoming', color: 'bg-gray-100 text-gray-800' },
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
  { value: 'completed', label: 'Completed', color: 'bg-blue-100 text-blue-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  { value: 'draft', label: 'Draft', color: 'bg-yellow-100 text-yellow-800' },
] as const;

export const REQUIREMENT_TYPES = [
  { value: 'complete_tasks', label: 'Complete Tasks', unit: 'tasks', description: 'Complete a specific number of tasks' },
  { value: 'maintain_streak', label: 'Maintain Streak', unit: 'days', description: 'Maintain a daily streak' },
  { value: 'earn_xp', label: 'Earn XP', unit: 'XP', description: 'Earn a specific amount of experience points' },
  { value: 'focus_time', label: 'Focus Time', unit: 'minutes', description: 'Spend time in focus mode' },
  { value: 'daily_login', label: 'Daily Login', unit: 'days', description: 'Log in for consecutive days' },
  { value: 'task_category', label: 'Task Category', unit: 'tasks', description: 'Complete tasks in specific categories' },
  { value: 'task_difficulty', label: 'Task Difficulty', unit: 'tasks', description: 'Complete tasks of specific difficulty' },
  { value: 'consecutive_days', label: 'Consecutive Days', unit: 'days', description: 'Be active for consecutive days' },
] as const;

export const REWARD_TYPES = [
  { value: 'xp', label: 'Experience Points', icon: '⭐' },
  { value: 'coins', label: 'Coins', icon: '🪙' },
  { value: 'badge', label: 'Badge', icon: '🏅' },
  { value: 'avatar', label: 'Avatar', icon: '👤' },
  { value: 'theme', label: 'Theme', icon: '🎨' },
  { value: 'title', label: 'Title', icon: '👑' },
  { value: 'multiplier', label: 'XP Multiplier', icon: '⚡' },
] as const;
