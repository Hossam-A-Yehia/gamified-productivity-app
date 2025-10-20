import { apiService } from './api';
import type {
  UserProfile,
  UpdateProfileRequest,
  UpdateSettingsRequest,
  ProfileStats,
  PublicProfile,
  SearchUsersRequest,
  SearchUsersResponse,
  SendFriendRequestRequest,
  RespondToFriendRequestRequest,
  AvailableCustomizations,
  PurchaseCustomizationRequest,
} from '../types/profile';

class ProfileService {
  // Profile Management
  async getMyProfile(): Promise<UserProfile> {
    const response = await apiService.get<UserProfile>('/profile/me');
    return response.data.data!;
  }

  async getUserProfile(userId: string): Promise<PublicProfile> {
    const response = await apiService.get<PublicProfile>(`/profile/users/${userId}`);
    return response.data.data!;
  }

  async updateProfile(updateData: UpdateProfileRequest): Promise<UserProfile> {
    const response = await apiService.put<UserProfile>('/profile/me', updateData);
    return response.data.data!;
  }

  async updateSettings(updateData: UpdateSettingsRequest): Promise<UserProfile> {
    const response = await apiService.put<UserProfile>('/profile/settings', updateData);
    return response.data.data!;
  }

  // Statistics
  async getProfileStats(): Promise<ProfileStats> {
    const response = await apiService.get<ProfileStats>('/profile/stats');
    return response.data.data!;
  }

  // User Search
  async searchUsers(filters: SearchUsersRequest = {}): Promise<SearchUsersResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = queryString ? `/profile/search?${queryString}` : '/profile/search';
    
    const response = await apiService.get<any>(url);
    
    return {
      users: response.data.data?.users || [],
      pagination: response.data.data?.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
      }
    };
  }

  // Avatar Customization
  async getAvailableCustomizations(): Promise<AvailableCustomizations> {
    const response = await apiService.get<AvailableCustomizations>('/profile/customizations');
    return response.data.data!;
  }

  async purchaseCustomization(purchaseData: PurchaseCustomizationRequest): Promise<{ success: boolean; newBalance: number }> {
    const response = await apiService.post<{ success: boolean; newBalance: number }>('/profile/customizations/purchase', purchaseData);
    return response.data.data!;
  }

  // Friends Management
  async getFriends(): Promise<PublicProfile[]> {
    const response = await apiService.get<PublicProfile[]>('/profile/friends');
    return response.data.data!;
  }

  async sendFriendRequest(requestData: SendFriendRequestRequest): Promise<void> {
    await apiService.post('/profile/friends/request', requestData);
  }

  async respondToFriendRequest(requestData: RespondToFriendRequestRequest): Promise<void> {
    await apiService.put('/profile/friends/request', requestData);
  }

  async removeFriend(friendId: string): Promise<void> {
    await apiService.delete(`/profile/friends/${friendId}`);
  }

  async getPendingFriendRequests(): Promise<PublicProfile[]> {
    const response = await apiService.get<PublicProfile[]>('/profile/friends/requests/pending');
    return response.data.data!;
  }

  async getSentFriendRequests(): Promise<PublicProfile[]> {
    const response = await apiService.get<PublicProfile[]>('/profile/friends/requests/sent');
    return response.data.data!;
  }

  async cancelFriendRequest(targetUserId: string): Promise<void> {
    await apiService.delete(`/profile/friends/requests/${targetUserId}`);
  }

  async getMutualFriends(otherUserId: string): Promise<PublicProfile[]> {
    const response = await apiService.get<PublicProfile[]>(`/profile/friends/mutual/${otherUserId}`);
    return response.data.data!;
  }

  async getFriendSuggestions(limit: number = 10): Promise<PublicProfile[]> {
    const response = await apiService.get<PublicProfile[]>(`/profile/friends/suggestions?limit=${limit}`);
    return response.data.data!;
  }

  // Helper methods
  formatTime(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    } else {
      return this.formatDate(dateString);
    }
  }

  getLevelProgress(xp: number): { currentLevel: number; progress: number; xpToNext: number } {
    const currentLevel = Math.floor(xp / 500) + 1;
    const xpInCurrentLevel = xp % 500;
    const progress = (xpInCurrentLevel / 500) * 100;
    const xpToNext = 500 - xpInCurrentLevel;
    
    return {
      currentLevel,
      progress,
      xpToNext
    };
  }

  getOnlineStatus(lastActiveDate?: string): 'online' | 'away' | 'offline' {
    if (!lastActiveDate) return 'offline';
    
    const lastActive = new Date(lastActiveDate);
    const now = new Date();
    const diffInMinutes = (now.getTime() - lastActive.getTime()) / (1000 * 60);
    
    if (diffInMinutes < 5) return 'online';
    if (diffInMinutes < 30) return 'away';
    return 'offline';
  }

  getStatusColor(status: 'online' | 'away' | 'offline'): string {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
    }
  }

  calculateGoalProgress(completed: number, target: number): number {
    if (target === 0) return 0;
    return Math.min((completed / target) * 100, 100);
  }

  getGoalProgressColor(progress: number): string {
    if (progress >= 100) return 'text-green-600';
    if (progress >= 75) return 'text-blue-600';
    if (progress >= 50) return 'text-yellow-600';
    return 'text-red-600';
  }

  getAchievementIcon(achievementId: string): string {
    // Map achievement IDs to icons (you can expand this)
    const iconMap: Record<string, string> = {
      'first_task': '🎯',
      'streak_master': '🔥',
      'focus_master': '⏰',
      'early_bird': '🌅',
      'night_owl': '🦉',
      'productivity_master': '⚡',
      'challenge_champion': '🏆',
      'social_butterfly': '🦋',
      'consistency_hero': '📈',
      'master_achiever': '👑'
    };
    
    return iconMap[achievementId] || '🏅';
  }

  getTimezoneOptions(): Array<{ value: string; label: string }> {
    return [
      { value: 'UTC', label: 'UTC' },
      { value: 'America/New_York', label: 'Eastern Time' },
      { value: 'America/Chicago', label: 'Central Time' },
      { value: 'America/Denver', label: 'Mountain Time' },
      { value: 'America/Los_Angeles', label: 'Pacific Time' },
      { value: 'Europe/London', label: 'London' },
      { value: 'Europe/Paris', label: 'Paris' },
      { value: 'Europe/Berlin', label: 'Berlin' },
      { value: 'Asia/Tokyo', label: 'Tokyo' },
      { value: 'Asia/Shanghai', label: 'Shanghai' },
      { value: 'Australia/Sydney', label: 'Sydney' }
    ];
  }

  getLanguageOptions(): Array<{ value: string; label: string }> {
    return [
      { value: 'en', label: 'English' },
      { value: 'es', label: 'Español' },
      { value: 'fr', label: 'Français' },
      { value: 'de', label: 'Deutsch' },
      { value: 'it', label: 'Italiano' },
      { value: 'pt', label: 'Português' },
      { value: 'ru', label: 'Русский' },
      { value: 'ja', label: '日本語' },
      { value: 'ko', label: '한국어' },
      { value: 'zh', label: '中文' }
    ];
  }

  getWorkingDayOptions(): Array<{ value: number; label: string }> {
    return [
      { value: 0, label: 'Sunday' },
      { value: 1, label: 'Monday' },
      { value: 2, label: 'Tuesday' },
      { value: 3, label: 'Wednesday' },
      { value: 4, label: 'Thursday' },
      { value: 5, label: 'Friday' },
      { value: 6, label: 'Saturday' }
    ];
  }
}

export const profileService = new ProfileService();
export default profileService;
