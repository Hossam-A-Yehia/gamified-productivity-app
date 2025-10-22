import { apiService } from './api';
import type {
  Challenge,
  CreateChallengeRequest,
  UpdateChallengeRequest,
  ChallengeFilters,
  ChallengesResponse,
  ChallengeStats,
  ChallengeProgressUpdate,
  LeaderboardEntry,
  ChallengeParticipant,
} from '../types/challenge';

class ChallengeService {
  async getChallenges(filters: ChallengeFilters = {}): Promise<ChallengesResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          params.append(key, value.join(','));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const queryString = params.toString();
    const url = queryString ? `/challenges?${queryString}` : '/challenges';
    
    const response = await apiService.get<any>(url);
    
    // Backend returns: { success: true, data: { challenges: [...], pagination: {...} } }
    const responseData = response.data.data || {};
    
    return {
      challenges: responseData.challenges || [],
      pagination: responseData.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
      }
    };
  }

  async getChallengeById(challengeId: string): Promise<Challenge> {
    const response = await apiService.get<Challenge>(`/challenges/${challengeId}`);
    return response.data.data!;
  }

  async createChallenge(challengeData: CreateChallengeRequest): Promise<Challenge> {
    const response = await apiService.post<Challenge>('/challenges', challengeData);
    return response.data.data!;
  }

  async updateChallenge(challengeId: string, updateData: UpdateChallengeRequest): Promise<Challenge> {
    const response = await apiService.patch<Challenge>(`/challenges/${challengeId}`, updateData);
    return response.data.data!;
  }

  async deleteChallenge(challengeId: string): Promise<void> {
    await apiService.delete(`/challenges/${challengeId}`);
  }

  async joinChallenge(challengeId: string): Promise<Challenge> {
    const response = await apiService.post<Challenge>(`/challenges/${challengeId}/join`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to join challenge');
    }
    return response.data.data;
  }

  async leaveChallenge(challengeId: string): Promise<Challenge> {
    const response = await apiService.post<Challenge>(`/challenges/${challengeId}/leave`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to leave challenge');
    }
    return response.data.data;
  }

  async getChallengeStats(): Promise<ChallengeStats> {
    const response = await apiService.get<any>('/challenges/stats');
    return response.data.data || {
      total: 0,
      byType: {},
      byCategory: {},
      byDifficulty: {},
      byStatus: {},
      participating: 0,
      completed: 0
    };
  }

  async getChallengeLeaderboard(challengeId: string): Promise<LeaderboardEntry[]> {
    const response = await apiService.get<LeaderboardEntry[]>(`/challenges/${challengeId}/leaderboard`);
    return response.data.data!;
  }

  async updateChallengeProgress(progressUpdate: ChallengeProgressUpdate): Promise<Challenge> {
    const response = await apiService.post<Challenge>(`/challenges/${progressUpdate.challengeId}/progress`, progressUpdate);
    return response.data.data!;
  }

  async getActiveChallenges(): Promise<Challenge[]> {
    const result = await this.getChallenges({
      status: ['active'],
      limit: 100,
      sortBy: 'startDate',
      sortOrder: 'asc'
    });
    return result.challenges;
  }

  async getParticipatingChallenges(): Promise<Challenge[]> {
    const response = await apiService.get<Challenge[]>('/challenges/participating');
    return response.data.data || [];
  }

  async getUpcomingChallenges(): Promise<Challenge[]> {
    const result = await this.getChallenges({
      status: ['upcoming'],
      limit: 50,
      sortBy: 'startDate',
      sortOrder: 'asc'
    });
    return result.challenges;
  }

  async getCompletedChallenges(): Promise<Challenge[]> {
    const result = await this.getChallenges({
      status: ['completed'],
      isParticipating: true,
      limit: 100,
      sortBy: 'endDate',
      sortOrder: 'desc'
    });
    return result.challenges;
  }

  async getFeaturedChallenges(): Promise<Challenge[]> {
    const response = await apiService.get<Challenge[]>('/challenges/featured');
    return response.data.data || [];
  }

  async searchChallenges(searchTerm: string): Promise<Challenge[]> {
    const result = await this.getChallenges({
      search: searchTerm,
      status: ['active', 'upcoming'],
      limit: 50
    });
    return result.challenges;
  }

  async getChallengesByCategory(category: string): Promise<Challenge[]> {
    const result = await this.getChallenges({
      category: [category as any],
      status: ['active', 'upcoming'],
      limit: 100,
      sortBy: 'startDate',
      sortOrder: 'asc'
    });
    return result.challenges;
  }

  async getChallengesByDifficulty(difficulty: string): Promise<Challenge[]> {
    const result = await this.getChallenges({
      difficulty: [difficulty as any],
      status: ['active', 'upcoming'],
      limit: 100,
      sortBy: 'startDate',
      sortOrder: 'asc'
    });
    return result.challenges;
  }

  async getUserChallenges(userId: string): Promise<Challenge[]> {
    const result = await this.getChallenges({
      createdBy: userId,
      limit: 100,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    return result.challenges;
  }

  calculateChallengeProgress(challenge: Challenge, userId: string): number {
    const participant = challenge.participants.find(p => 
      (typeof p.userId === 'string' ? p.userId : (p.userId as any)?._id) === userId
    );
    if (!participant) return 0;
    
    return participant.progress.overallProgress;
  }

  calculateRequirementProgress(requirement: any, current: number): number {
    return Math.min((current / requirement.target) * 100, 100);
  }

  isChallengeCompleted(challenge: Challenge, userId: string): boolean {
    const participant = challenge.participants.find(p => 
      (typeof p.userId === 'string' ? p.userId : (p.userId as any)?._id) === userId
    );
    return participant?.isCompleted || false;
  }

  canJoinChallenge(challenge: Challenge, userId?: string): boolean {
    if (challenge.status !== 'active' && challenge.status !== 'upcoming') {
      return false;
    }
    
    if (challenge.maxParticipants && challenge.participants.length >= challenge.maxParticipants) {
      return false;
    }
    
    // Check if user is already participating
    if (userId && challenge.participants.some(p => 
      (typeof p.userId === 'string' ? p.userId : (p.userId as any)?._id) === userId
    )) {
      return false;
    }
    
    return true;
  }

  getChallengeTimeRemaining(challenge: Challenge): {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  } {
    const now = new Date();
    const endDate = new Date(challenge.endDate);
    const timeDiff = endDate.getTime() - now.getTime();
    
    if (timeDiff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds, isExpired: false };
  }

  getChallengeRewardValue(challenge: Challenge): {
    totalXP: number;
    totalCoins: number;
    badges: number;
    other: number;
  } {
    // Handle both old array format and new object format for backward compatibility
    if (Array.isArray(challenge.rewards)) {
      // Old format - array of rewards
      return challenge.rewards.reduce(
        (acc, reward) => {
          switch (reward.type) {
            case 'xp':
              acc.totalXP += reward.amount;
              break;
            case 'coins':
              acc.totalCoins += reward.amount;
              break;
            case 'badge':
              acc.badges += 1;
              break;
            default:
              acc.other += 1;
          }
          return acc;
        },
        { totalXP: 0, totalCoins: 0, badges: 0, other: 0 }
      );
    } else {
      // New format - single reward object
      const rewards = challenge.rewards as any;
      return {
        totalXP: rewards.xp || 0,
        totalCoins: rewards.coins || 0,
        badges: (rewards.badges?.length || 0) + (rewards.avatars?.length || 0) + (rewards.themes?.length || 0) + (rewards.titles?.length || 0),
        other: rewards.multiplier > 1 ? 1 : 0,
      };
    }
  }
}

export const challengeService = new ChallengeService();
export default challengeService;
