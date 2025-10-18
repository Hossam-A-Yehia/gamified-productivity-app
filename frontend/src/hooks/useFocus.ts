import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { focusService } from '../services/focusService';
import type {
  FocusSession,
  CreateFocusSessionRequest,
  UpdateFocusSessionRequest,
  FocusSessionFilters,
  FocusStats,
  FocusSettings,
  UpdateFocusSettingsRequest,
} from '../types/focus';
import { toast } from 'sonner';

// Query keys
export const focusKeys = {
  all: ['focus'] as const,
  sessions: () => [...focusKeys.all, 'sessions'] as const,
  session: (id: string) => [...focusKeys.sessions(), id] as const,
  active: () => [...focusKeys.sessions(), 'active'] as const,
  stats: () => [...focusKeys.all, 'stats'] as const,
  settings: () => [...focusKeys.all, 'settings'] as const,
  filtered: (filters: FocusSessionFilters) => [...focusKeys.sessions(), 'filtered', filters] as const,
};

// Get focus sessions with filters
export const useFocusSessions = (filters: FocusSessionFilters = {}) => {
  return useQuery({
    queryKey: focusKeys.filtered(filters),
    queryFn: () => focusService.getFocusSessions(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Get active focus session
export const useActiveFocusSession = () => {
  return useQuery({
    queryKey: focusKeys.active(),
    queryFn: () => focusService.getActiveFocusSession(),
    refetchInterval: 5 * 1000, // Refetch every 5 seconds when active
    staleTime: 0, // Always consider stale for real-time updates
  });
};

// Get focus session by ID
export const useFocusSession = (sessionId: string) => {
  return useQuery({
    queryKey: focusKeys.session(sessionId),
    queryFn: () => focusService.getFocusSessionById(sessionId),
    enabled: !!sessionId,
  });
};

// Get focus statistics
export const useFocusStats = () => {
  return useQuery({
    queryKey: focusKeys.stats(),
    queryFn: () => focusService.getFocusStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get focus settings
export const useFocusSettings = () => {
  return useQuery({
    queryKey: focusKeys.settings(),
    queryFn: () => focusService.getFocusSettings(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Focus operations hook
export const useFocusOperations = () => {
  const queryClient = useQueryClient();

  const startSession = useMutation({
    mutationFn: (sessionData: CreateFocusSessionRequest) => 
      focusService.startFocusSession(sessionData),
    onSuccess: (data) => {
      // Invalidate and refetch active session
      queryClient.invalidateQueries({ queryKey: focusKeys.active() });
      queryClient.invalidateQueries({ queryKey: focusKeys.sessions() });
      queryClient.invalidateQueries({ queryKey: focusKeys.stats() });
      
      toast.success(data.message || 'Focus session started!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to start focus session');
    },
  });

  const updateSession = useMutation({
    mutationFn: ({ sessionId, updateData }: { sessionId: string; updateData: UpdateFocusSessionRequest }) =>
      focusService.updateFocusSession(sessionId, updateData),
    onSuccess: (data, variables) => {
      // Update the specific session in cache
      queryClient.setQueryData(focusKeys.session(variables.sessionId), data);
      queryClient.invalidateQueries({ queryKey: focusKeys.active() });
      queryClient.invalidateQueries({ queryKey: focusKeys.sessions() });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update focus session');
    },
  });

  const completeSession = useMutation({
    mutationFn: (sessionId: string) => focusService.completeFocusSession(sessionId),
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: focusKeys.active() });
      queryClient.invalidateQueries({ queryKey: focusKeys.sessions() });
      queryClient.invalidateQueries({ queryKey: focusKeys.stats() });
      
      // Show success message with XP earned
      toast.success(
        `Session completed! +${data.xpEarned} XP earned`,
        {
          description: data.newAchievements?.length 
            ? `New achievements unlocked: ${data.newAchievements.join(', ')}`
            : undefined
        }
      );
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to complete focus session');
    },
  });

  const deleteSession = useMutation({
    mutationFn: (sessionId: string) => focusService.deleteFocusSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: focusKeys.sessions() });
      queryClient.invalidateQueries({ queryKey: focusKeys.stats() });
      toast.success('Focus session deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete focus session');
    },
  });

  const updateSettings = useMutation({
    mutationFn: (settings: UpdateFocusSettingsRequest) => 
      focusService.updateFocusSettings(settings),
    onSuccess: (data) => {
      // Update settings in cache
      queryClient.setQueryData(focusKeys.settings(), data);
      toast.success('Focus settings updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update focus settings');
    },
  });

  return {
    startSession,
    updateSession,
    completeSession,
    deleteSession,
    updateSettings,
  };
};

// Custom hook for today's sessions
export const useTodaysFocusSessions = () => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
  
  return useFocusSessions({
    startDate: startOfDay,
    endDate: endOfDay,
    limit: 100,
    sortBy: 'startTime',
    sortOrder: 'asc'
  });
};

// Custom hook for recent sessions
export const useRecentFocusSessions = (limit: number = 10) => {
  return useFocusSessions({
    limit,
    sortBy: 'startTime',
    sortOrder: 'desc'
  });
};
