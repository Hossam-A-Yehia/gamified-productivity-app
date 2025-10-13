import { useQuery } from '@tanstack/react-query';
import { leaderboardService } from '../services/leaderboardService';
import type { LeaderboardCategory } from '../types/leaderboard';

export const useGlobalLeaderboard = (limit = 50, page = 1) => {
  return useQuery({
    queryKey: ['leaderboard', 'global', limit, page],
    queryFn: () => leaderboardService.getGlobalLeaderboard(limit, page),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useFriendsLeaderboard = (limit = 50) => {
  return useQuery({
    queryKey: ['leaderboard', 'friends', limit],
    queryFn: () => leaderboardService.getFriendsLeaderboard(limit),
    staleTime: 2 * 60 * 1000,
  });
};

export const useWeeklyLeaderboard = (limit = 50, page = 1) => {
  return useQuery({
    queryKey: ['leaderboard', 'weekly', limit, page],
    queryFn: () => leaderboardService.getWeeklyLeaderboard(limit, page),
    staleTime: 2 * 60 * 1000,
  });
};

export const useMonthlyLeaderboard = (limit = 50, page = 1) => {
  return useQuery({
    queryKey: ['leaderboard', 'monthly', limit, page],
    queryFn: () => leaderboardService.getMonthlyLeaderboard(limit, page),
    staleTime: 2 * 60 * 1000,
  });
};

export const useStreakLeaderboard = (limit = 50, page = 1) => {
  return useQuery({
    queryKey: ['leaderboard', 'streak', limit, page],
    queryFn: () => leaderboardService.getStreakLeaderboard(limit, page),
    staleTime: 2 * 60 * 1000,
  });
};

export const useCategoryLeaderboard = (category: LeaderboardCategory, limit = 50, page = 1) => {
  return useQuery({
    queryKey: ['leaderboard', 'category', category, limit, page],
    queryFn: () => leaderboardService.getCategoryLeaderboard(category, limit, page),
    enabled: !!category,
    staleTime: 2 * 60 * 1000,
  });
};

export const useUserRank = () => {
  return useQuery({
    queryKey: ['leaderboard', 'rank'],
    queryFn: leaderboardService.getUserRank,
    staleTime: 2 * 60 * 1000,
  });
};
