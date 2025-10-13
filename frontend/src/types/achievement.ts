export type AchievementCategory = 'consistency' | 'productivity' | 'social' | 'special';
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type AchievementCriteriaType = 'task_count' | 'streak' | 'category_tasks' | 'focus_time' | 'early_completion' | 'late_completion' | 'perfect_week';
export type AchievementTimeframe = 'all_time' | 'daily' | 'weekly' | 'monthly';

export interface AchievementCriteria {
  type: AchievementCriteriaType;
  target: number;
  category?: string;
  timeframe: AchievementTimeframe;
}

export interface AchievementRewards {
  xp: number;
  coins: number;
  avatarItem?: string;
}

export interface Achievement {
  _id: string;
  name: string;
  description: string;
  iconUrl: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  criteria: AchievementCriteria;
  rewards: AchievementRewards;
  isActive: boolean;
  createdAt: string;
}

export interface AchievementProgress {
  progress: number;
  target: number;
  completed: boolean;
}

export interface UserAchievements {
  unlocked: Achievement[];
  locked: Achievement[];
}

export interface CheckAchievementsResponse {
  newAchievements: string[];
  count: number;
}
