import { apiService } from './api';
import type { LeaderboardResponse, FriendsLeaderboardResponse, UserRankResponse, LeaderboardCategory } from '../types/leaderboard';

export const leaderboardService = {
  async getGlobalLeaderboard(limit = 50, page = 1): Promise<LeaderboardResponse> {
    const response = await apiService.get<LeaderboardResponse>(`/leaderboard/global?limit=${limit}&page=${page}`);
    return response.data.data!;
  },

  async getFriendsLeaderboard(limit = 50): Promise<FriendsLeaderboardResponse> {
    const response = await apiService.get<FriendsLeaderboardResponse>(`/leaderboard/friends?limit=${limit}`);
    return response.data.data!;
  },

  async getWeeklyLeaderboard(limit = 50, page = 1): Promise<LeaderboardResponse> {
    const response = await apiService.get<LeaderboardResponse>(`/leaderboard/weekly?limit=${limit}&page=${page}`);
    return response.data.data!;
  },

  async getMonthlyLeaderboard(limit = 50, page = 1): Promise<LeaderboardResponse> {
    const response = await apiService.get<LeaderboardResponse>(`/leaderboard/monthly?limit=${limit}&page=${page}`);
    return response.data.data!;
  },

  async getStreakLeaderboard(limit = 50, page = 1): Promise<LeaderboardResponse> {
    const response = await apiService.get<LeaderboardResponse>(`/leaderboard/streak?limit=${limit}&page=${page}`);
    return response.data.data!;
  },

  async getCategoryLeaderboard(category: LeaderboardCategory, limit = 50, page = 1): Promise<LeaderboardResponse> {
    const response = await apiService.get<LeaderboardResponse>(`/leaderboard/category/${category}?limit=${limit}&page=${page}`);
    return response.data.data!;
  },

  async getUserRank(): Promise<number> {
    const response = await apiService.get<UserRankResponse>('/leaderboard/rank');
    return response.data.data!.rank;
  },
};
