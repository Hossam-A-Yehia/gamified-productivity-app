import { apiService } from './api';
import type { 
  Achievement, 
  UserAchievements, 
  AchievementProgress, 
  CheckAchievementsResponse,
  DetailedAchievementProgress,
  AchievementStats,
  AchievementCategory
} from '../types/achievement';

export const achievementService = {
  async getAllAchievements(): Promise<Achievement[]> {
    const response = await apiService.get<Achievement[]>('/achievements');
    return response.data.data!;
  },

  async getUserAchievements(): Promise<UserAchievements> {
    const response = await apiService.get<UserAchievements>('/achievements/user');
    return response.data.data!;
  },

  async checkAchievements(): Promise<CheckAchievementsResponse> {
    const response = await apiService.post<CheckAchievementsResponse>('/achievements/check');
    return response.data.data!;
  },

  async getAchievementDetails(id: string): Promise<Achievement> {
    const response = await apiService.get<Achievement>(`/achievements/${id}`);
    return response.data.data!;
  },

  async getAchievementProgress(id: string): Promise<AchievementProgress> {
    const response = await apiService.get<AchievementProgress>(`/achievements/${id}/progress`);
    return response.data.data!;
  },

  async initializeAchievements(): Promise<void> {
    await apiService.post('/achievements/initialize');
  },

  async getUserAchievementProgress(): Promise<DetailedAchievementProgress[]> {
    const response = await apiService.get<DetailedAchievementProgress[]>('/achievements/user/progress');
    return response.data.data!;
  },

  async getAchievementStats(): Promise<AchievementStats> {
    const response = await apiService.get<AchievementStats>('/achievements/user/stats');
    return response.data.data!;
  },

  async getAchievementsByCategory(category: AchievementCategory): Promise<{
    achievements: Achievement[];
    progress: DetailedAchievementProgress[];
  }> {
    const response = await apiService.get<{
      achievements: Achievement[];
      progress: DetailedAchievementProgress[];
    }>(`/achievements/category/${category}`);
    return response.data.data!;
  }
};
