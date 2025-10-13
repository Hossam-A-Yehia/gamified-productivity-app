import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { achievementService } from '../services/achievementService';
import { toast } from 'sonner';

export const useAchievements = () => {
  return useQuery({
    queryKey: ['achievements'],
    queryFn: achievementService.getAllAchievements,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUserAchievements = () => {
  return useQuery({
    queryKey: ['achievements', 'user'],
    queryFn: achievementService.getUserAchievements,
    staleTime: 2 * 60 * 1000,
  });
};

export const useAchievementDetails = (id: string) => {
  return useQuery({
    queryKey: ['achievements', id],
    queryFn: () => achievementService.getAchievementDetails(id),
    enabled: !!id,
  });
};

export const useAchievementProgress = (id: string) => {
  return useQuery({
    queryKey: ['achievements', id, 'progress'],
    queryFn: () => achievementService.getAchievementProgress(id),
    enabled: !!id,
  });
};

export const useCheckAchievements = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: achievementService.checkAchievements,
    onSuccess: (data) => {
      if (data.count > 0) {
        toast.success(`🏆 ${data.count} new achievement${data.count > 1 ? 's' : ''} unlocked!`);
      }
      queryClient.invalidateQueries({ queryKey: ['achievements', 'user'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] });
    },
    onError: () => {
      toast.error('Failed to check achievements');
    },
  });
};

export const useInitializeAchievements = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: achievementService.initializeAchievements,
    onSuccess: () => {
      toast.success('Achievements initialized successfully');
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
    },
    onError: () => {
      toast.error('Failed to initialize achievements');
    },
  });
};
