import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { challengeService } from '../services/challengeService';
import { showToast } from '../utils/toast';
import type {
  CreateChallengeRequest,
  UpdateChallengeRequest,
  ChallengeFilters,
  ChallengeProgressUpdate,
} from '../types/challenge';

export const CHALLENGE_QUERY_KEYS = {
  all: ['challenges'] as const,
  lists: () => [...CHALLENGE_QUERY_KEYS.all, 'list'] as const,
  list: (filters: ChallengeFilters) => [...CHALLENGE_QUERY_KEYS.lists(), filters] as const,
  details: () => [...CHALLENGE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...CHALLENGE_QUERY_KEYS.details(), id] as const,
  stats: () => [...CHALLENGE_QUERY_KEYS.all, 'stats'] as const,
  leaderboard: (id: string) => [...CHALLENGE_QUERY_KEYS.all, 'leaderboard', id] as const,
  active: () => [...CHALLENGE_QUERY_KEYS.all, 'active'] as const,
  participating: () => [...CHALLENGE_QUERY_KEYS.all, 'participating'] as const,
  upcoming: () => [...CHALLENGE_QUERY_KEYS.all, 'upcoming'] as const,
  completed: () => [...CHALLENGE_QUERY_KEYS.all, 'completed'] as const,
  featured: () => [...CHALLENGE_QUERY_KEYS.all, 'featured'] as const,
};

export const useChallenges = (filters: ChallengeFilters = {}) => {
  return useQuery({
    queryKey: CHALLENGE_QUERY_KEYS.list(filters),
    queryFn: () => challengeService.getChallenges(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useChallenge = (challengeId: string) => {
  return useQuery({
    queryKey: CHALLENGE_QUERY_KEYS.detail(challengeId),
    queryFn: () => challengeService.getChallengeById(challengeId),
    enabled: !!challengeId,
  });
};

export const useChallengeStats = () => {
  return useQuery({
    queryKey: CHALLENGE_QUERY_KEYS.stats(),
    queryFn: () => challengeService.getChallengeStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useChallengeLeaderboard = (challengeId: string) => {
  return useQuery({
    queryKey: CHALLENGE_QUERY_KEYS.leaderboard(challengeId),
    queryFn: () => challengeService.getChallengeLeaderboard(challengeId),
    enabled: !!challengeId,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
};

export const useActiveChallenges = () => {
  return useQuery({
    queryKey: CHALLENGE_QUERY_KEYS.active(),
    queryFn: () => challengeService.getActiveChallenges(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useParticipatingChallenges = () => {
  return useQuery({
    queryKey: CHALLENGE_QUERY_KEYS.participating(),
    queryFn: () => challengeService.getParticipatingChallenges(),
    staleTime: 2 * 60 * 1000,
  });
};

export const useUpcomingChallenges = () => {
  return useQuery({
    queryKey: CHALLENGE_QUERY_KEYS.upcoming(),
    queryFn: () => challengeService.getUpcomingChallenges(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCompletedChallenges = () => {
  return useQuery({
    queryKey: CHALLENGE_QUERY_KEYS.completed(),
    queryFn: () => challengeService.getCompletedChallenges(),
    staleTime: 10 * 60 * 1000,
  });
};

export const useFeaturedChallenges = () => {
  return useQuery({
    queryKey: CHALLENGE_QUERY_KEYS.featured(),
    queryFn: () => challengeService.getFeaturedChallenges(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateChallenge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (challengeData: CreateChallengeRequest) => challengeService.createChallenge(challengeData),
    onSuccess: (newChallenge) => {
      queryClient.invalidateQueries({ queryKey: CHALLENGE_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: CHALLENGE_QUERY_KEYS.stats() });
      showToast.success('Challenge created successfully!', `"${newChallenge.title}" is now live`);
    },
    onError: (error: any) => {
      showToast.error('Failed to create challenge', error.message);
    },
  });
};

export const useUpdateChallenge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ challengeId, updateData }: { challengeId: string; updateData: UpdateChallengeRequest }) =>
      challengeService.updateChallenge(challengeId, updateData),
    onSuccess: (updatedChallenge) => {
      queryClient.setQueryData(CHALLENGE_QUERY_KEYS.detail(updatedChallenge._id), updatedChallenge);
      queryClient.invalidateQueries({ queryKey: CHALLENGE_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: CHALLENGE_QUERY_KEYS.stats() });
      showToast.success('Challenge updated successfully!', `"${updatedChallenge.title}" has been updated`);
    },
    onError: (error: any) => {
      showToast.error('Failed to update challenge', error.message);
    },
  });
};

export const useDeleteChallenge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ challengeId, challengeTitle }: { challengeId: string; challengeTitle: string }) => {
      return challengeService.deleteChallenge(challengeId).then(() => challengeTitle);
    },
    onSuccess: (challengeTitle, { challengeId }) => {
      queryClient.removeQueries({ queryKey: CHALLENGE_QUERY_KEYS.detail(challengeId) });
      queryClient.invalidateQueries({ queryKey: CHALLENGE_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: CHALLENGE_QUERY_KEYS.stats() });
      showToast.success('Challenge deleted', `"${challengeTitle}" has been removed`);
    },
    onError: (error: any) => {
      showToast.error('Failed to delete challenge', error.message);
    },
  });
};

export const useJoinChallenge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (challengeId: string) => challengeService.joinChallenge(challengeId),
    onSuccess: (updatedChallenge, challengeId) => {
      
      // Update the specific challenge in cache if we have the updated data
      if (updatedChallenge) {
        queryClient.setQueryData(CHALLENGE_QUERY_KEYS.detail(challengeId), updatedChallenge);
        
        // Update challenges in lists cache
        queryClient.setQueriesData(
          { queryKey: CHALLENGE_QUERY_KEYS.lists() },
          (oldData: any) => {
            if (!oldData?.challenges) return oldData;
            
            return {
              ...oldData,
              challenges: oldData.challenges.map((challenge: any) =>
                challenge._id === challengeId ? updatedChallenge : challenge
              ),
            };
          }
        );
      }
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: CHALLENGE_QUERY_KEYS.participating() });
      queryClient.invalidateQueries({ queryKey: CHALLENGE_QUERY_KEYS.stats() });
      queryClient.invalidateQueries({ queryKey: CHALLENGE_QUERY_KEYS.leaderboard(challengeId) });
      showToast.success('🎯 Challenge joined!', 'Good luck and have fun!');
    },
    onError: (error: any) => {
      showToast.error('Failed to join challenge', error.message);
    },
  });
};

export const useLeaveChallenge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (challengeId: string) => challengeService.leaveChallenge(challengeId),
    onSuccess: (updatedChallenge, challengeId) => {
      // Update the specific challenge in cache if we have the updated data
      if (updatedChallenge) {
        queryClient.setQueryData(CHALLENGE_QUERY_KEYS.detail(challengeId), updatedChallenge);
        
        // Update challenges in lists cache
        queryClient.setQueriesData(
          { queryKey: CHALLENGE_QUERY_KEYS.lists() },
          (oldData: any) => {
            if (!oldData?.challenges) return oldData;
            
            return {
              ...oldData,
              challenges: oldData.challenges.map((challenge: any) =>
                challenge._id === challengeId ? updatedChallenge : challenge
              ),
            };
          }
        );
      }
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: CHALLENGE_QUERY_KEYS.participating() });
      queryClient.invalidateQueries({ queryKey: CHALLENGE_QUERY_KEYS.stats() });
      queryClient.invalidateQueries({ queryKey: CHALLENGE_QUERY_KEYS.leaderboard(challengeId) });
      showToast.success('Challenge left', 'You have left the challenge');
    },
    onError: (error: any) => {
      showToast.error('Failed to leave challenge', error.message);
    },
  });
};

export const useUpdateChallengeProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (progressUpdate: ChallengeProgressUpdate) => 
      challengeService.updateChallengeProgress(progressUpdate),
    onSuccess: (updatedChallenge) => {
      queryClient.setQueryData(CHALLENGE_QUERY_KEYS.detail(updatedChallenge._id), updatedChallenge);
      queryClient.invalidateQueries({ queryKey: CHALLENGE_QUERY_KEYS.participating() });
      queryClient.invalidateQueries({ queryKey: CHALLENGE_QUERY_KEYS.leaderboard(updatedChallenge._id) });
      queryClient.invalidateQueries({ queryKey: CHALLENGE_QUERY_KEYS.stats() });
    },
    onError: (error: any) => {
      console.error('Failed to update challenge progress:', error);
    },
  });
};

export const useChallengeSearch = (searchTerm: string) => {
  return useQuery({
    queryKey: [...CHALLENGE_QUERY_KEYS.all, 'search', searchTerm],
    queryFn: () => challengeService.searchChallenges(searchTerm),
    enabled: searchTerm.length > 2,
    staleTime: 2 * 60 * 1000,
  });
};

export const useChallengeOperations = (filters: ChallengeFilters = {}) => {
  const challengesQuery = useChallenges(filters);
  const createChallengeMutation = useCreateChallenge();
  const updateChallengeMutation = useUpdateChallenge();
  const deleteChallengeMutation = useDeleteChallenge();
  const joinChallengeMutation = useJoinChallenge();
  const leaveChallengeMutation = useLeaveChallenge();
  const updateProgressMutation = useUpdateChallengeProgress();

  return {
    challenges: challengesQuery.data?.challenges,
    pagination: challengesQuery.data?.pagination,
    isLoading: challengesQuery.isLoading,
    error: challengesQuery.error,
    createChallenge: createChallengeMutation,
    updateChallenge: updateChallengeMutation,
    deleteChallenge: deleteChallengeMutation,
    joinChallenge: joinChallengeMutation,
    leaveChallenge: leaveChallengeMutation,
    updateProgress: updateProgressMutation,
  };
};
