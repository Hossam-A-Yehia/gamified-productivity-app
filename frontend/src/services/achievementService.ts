import { apiService } from './api';
import type { Achievement, UserAchievements, AchievementProgress, CheckAchievementsResponse } from '../types/achievement';

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
  }
};
