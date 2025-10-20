import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../services/profileService';
import type {
  UserProfile,
  UpdateProfileRequest,
  UpdateSettingsRequest,
  ProfileStats,
  PublicProfile,
  SearchUsersRequest,
  SendFriendRequestRequest,
  RespondToFriendRequestRequest,
  PurchaseCustomizationRequest,
} from '../types/profile';
import { toast } from 'sonner';

// Query keys
export const profileKeys = {
  all: ['profile'] as const,
  profile: () => [...profileKeys.all, 'profile'] as const,
  myProfile: () => [...profileKeys.profile(), 'me'] as const,
  userProfile: (userId: string) => [...profileKeys.profile(), 'user', userId] as const,
  stats: () => [...profileKeys.all, 'stats'] as const,
  search: (filters: SearchUsersRequest) => [...profileKeys.all, 'search', filters] as const,
  friends: () => [...profileKeys.all, 'friends'] as const,
  friendRequests: () => [...profileKeys.friends(), 'requests'] as const,
  friendSuggestions: () => [...profileKeys.friends(), 'suggestions'] as const,
  customizations: () => [...profileKeys.all, 'customizations'] as const,
};

// Get current user's profile
export const useMyProfile = () => {
  return useQuery({
    queryKey: profileKeys.myProfile(),
    queryFn: () => profileService.getMyProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get user profile by ID
export const useUserProfile = (userId: string) => {
  return useQuery({
    queryKey: profileKeys.userProfile(userId),
    queryFn: () => profileService.getUserProfile(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get profile statistics
export const useProfileStats = () => {
  return useQuery({
    queryKey: profileKeys.stats(),
    queryFn: () => profileService.getProfileStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Search users
export const useSearchUsers = (filters: SearchUsersRequest) => {
  return useQuery({
    queryKey: profileKeys.search(filters),
    queryFn: () => profileService.searchUsers(filters),
    enabled: !!filters.query || Object.keys(filters).length > 0,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Get friends list
export const useFriends = () => {
  return useQuery({
    queryKey: profileKeys.friends(),
    queryFn: () => profileService.getFriends(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get pending friend requests
export const usePendingFriendRequests = () => {
  return useQuery({
    queryKey: [...profileKeys.friendRequests(), 'pending'],
    queryFn: () => profileService.getPendingFriendRequests(),
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Get sent friend requests
export const useSentFriendRequests = () => {
  return useQuery({
    queryKey: [...profileKeys.friendRequests(), 'sent'],
    queryFn: () => profileService.getSentFriendRequests(),
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Get friend suggestions
export const useFriendSuggestions = (limit: number = 10) => {
  return useQuery({
    queryKey: [...profileKeys.friendSuggestions(), limit],
    queryFn: () => profileService.getFriendSuggestions(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get available customizations
export const useAvailableCustomizations = () => {
  return useQuery({
    queryKey: profileKeys.customizations(),
    queryFn: () => profileService.getAvailableCustomizations(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Profile operations hook
export const useProfileOperations = () => {
  const queryClient = useQueryClient();

  const updateProfile = useMutation({
    mutationFn: (updateData: UpdateProfileRequest) => 
      profileService.updateProfile(updateData),
    onSuccess: (data) => {
      // Update profile in cache
      queryClient.setQueryData(profileKeys.myProfile(), data);
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });

  const updateSettings = useMutation({
    mutationFn: (updateData: UpdateSettingsRequest) => 
      profileService.updateSettings(updateData),
    onSuccess: (data) => {
      // Update profile in cache
      queryClient.setQueryData(profileKeys.myProfile(), data);
      toast.success('Settings updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    },
  });

  const purchaseCustomization = useMutation({
    mutationFn: (purchaseData: PurchaseCustomizationRequest) => 
      profileService.purchaseCustomization(purchaseData),
    onSuccess: (data, variables) => {
      // Invalidate customizations and profile
      queryClient.invalidateQueries({ queryKey: profileKeys.customizations() });
      queryClient.invalidateQueries({ queryKey: profileKeys.myProfile() });
      
      toast.success(
        `${variables.type.charAt(0).toUpperCase() + variables.type.slice(1)} purchased!`,
        {
          description: `New balance: ${data.newBalance} coins`
        }
      );
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to purchase customization');
    },
  });

  return {
    updateProfile,
    updateSettings,
    purchaseCustomization,
  };
};

// Friends operations hook
export const useFriendsOperations = () => {
  const queryClient = useQueryClient();

  const sendFriendRequest = useMutation({
    mutationFn: (requestData: SendFriendRequestRequest) => 
      profileService.sendFriendRequest(requestData),
    onSuccess: () => {
      // Invalidate sent requests
      queryClient.invalidateQueries({ queryKey: [...profileKeys.friendRequests(), 'sent'] });
      toast.success('Friend request sent');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send friend request');
    },
  });

  const respondToFriendRequest = useMutation({
    mutationFn: (requestData: RespondToFriendRequestRequest) => 
      profileService.respondToFriendRequest(requestData),
    onSuccess: (_, variables) => {
      // Invalidate friend requests and friends list
      queryClient.invalidateQueries({ queryKey: profileKeys.friendRequests() });
      queryClient.invalidateQueries({ queryKey: profileKeys.friends() });
      
      toast.success(
        variables.action === 'accept' 
          ? 'Friend request accepted' 
          : 'Friend request declined'
      );
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to respond to friend request');
    },
  });

  const removeFriend = useMutation({
    mutationFn: (friendId: string) => profileService.removeFriend(friendId),
    onSuccess: () => {
      // Invalidate friends list
      queryClient.invalidateQueries({ queryKey: profileKeys.friends() });
      toast.success('Friend removed');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove friend');
    },
  });

  const cancelFriendRequest = useMutation({
    mutationFn: (targetUserId: string) => profileService.cancelFriendRequest(targetUserId),
    onSuccess: () => {
      // Invalidate sent requests
      queryClient.invalidateQueries({ queryKey: [...profileKeys.friendRequests(), 'sent'] });
      toast.success('Friend request cancelled');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel friend request');
    },
  });

  return {
    sendFriendRequest,
    respondToFriendRequest,
    removeFriend,
    cancelFriendRequest,
  };
};

// Custom hook for mutual friends
export const useMutualFriends = (otherUserId: string) => {
  return useQuery({
    queryKey: [...profileKeys.friends(), 'mutual', otherUserId],
    queryFn: () => profileService.getMutualFriends(otherUserId),
    enabled: !!otherUserId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
