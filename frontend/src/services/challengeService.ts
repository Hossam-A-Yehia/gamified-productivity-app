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
    
    const response = await apiService.get<Challenge[]>(url);
    
    return {
      challenges: response.data.data || [],
      pagination: (response.data as any).pagination || {
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

  async joinChallenge(challengeId: string): Promise<ChallengeParticipant> {
    const response = await apiService.post<ChallengeParticipant>(`/challenges/${challengeId}/join`);
    return response.data.data!;
  }

  async leaveChallenge(challengeId: string): Promise<void> {
    await apiService.post(`/challenges/${challengeId}/leave`);
  }

  async getChallengeStats(): Promise<ChallengeStats> {
    const response = await apiService.get<ChallengeStats>('/challenges/stats');
    return response.data.data!;
  }

  async getChallengeLeaderboard(challengeId: string): Promise<LeaderboardEntry[]> {
    const response = await apiService.get<LeaderboardEntry[]>(`/challenges/${challengeId}/leaderboard`);
    return response.data.data!;
  }

  async updateChallengeProgress(progressUpdate: ChallengeProgressUpdate): Promise<Challenge> {
    const response = await apiService.post<Challenge>('/challenges/progress', progressUpdate);
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
    const result = await this.getChallenges({
      isParticipating: true,
      limit: 100,
      sortBy: 'endDate',
      sortOrder: 'asc'
    });
    return result.challenges;
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
    const result = await this.getChallenges({
      status: ['active', 'upcoming'],
      type: ['community', 'seasonal'],
      limit: 10,
      sortBy: 'participants',
      sortOrder: 'desc'
    });
    return result.challenges;
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
    const participant = challenge.participants.find(p => p.userId === userId);
    if (!participant) return 0;
    
    return participant.progress.overallProgress;
  }

  calculateRequirementProgress(requirement: any, current: number): number {
    return Math.min((current / requirement.target) * 100, 100);
  }

  isChallengeCompleted(challenge: Challenge, userId: string): boolean {
    const participant = challenge.participants.find(p => p.userId === userId);
    return participant?.isCompleted || false;
  }

  canJoinChallenge(challenge: Challenge): boolean {
    if (challenge.status !== 'active' && challenge.status !== 'upcoming') {
      return false;
    }
    
    if (challenge.maxParticipants && challenge.participants.length >= challenge.maxParticipants) {
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
  }
}

export const challengeService = new ChallengeService();
export default challengeService;
