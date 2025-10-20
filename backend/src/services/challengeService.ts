import { Types } from 'mongoose';
import { ChallengeModel } from '../models/Challenge';
import UserModel from '../models/User';
import { 
  Challenge,
  ChallengeObject, 
  CreateChallengeRequest, 
  UpdateChallengeRequest, 
  ChallengeFilters, 
  ChallengeStats,
  ChallengeLeaderboard,
  ProgressUpdateRequest,
  JoinChallengeRequest,
  LeaderboardEntry,
  ChallengeParticipant
} from '../types/challenge';
import { socketService } from './socketService';

export class ChallengeService {
  // Create a new challenge
  static async createChallenge(
    userId: string, 
    challengeData: CreateChallengeRequest
  ): Promise<Challenge> {
    try {
      // Validate user exists
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Apply difficulty multipliers to rewards
      const difficultyMultipliers = { easy: 1, medium: 1.5, hard: 2, extreme: 3 };
      const multiplier = difficultyMultipliers[challengeData.difficulty];
      
      const adjustedRewards = {
        ...challengeData.rewards,
        xp: Math.round(challengeData.rewards.xp * multiplier),
        coins: Math.round(challengeData.rewards.coins * multiplier),
        multiplier
      };

      // Initialize requirements with current progress
      const requirements = challengeData.requirements.map(req => ({
        ...req,
        current: 0
      }));

      const challenge = new ChallengeModel({
        ...challengeData,
        requirements,
        rewards: adjustedRewards,
        createdBy: new Types.ObjectId(userId),
        participants: [],
        status: 'upcoming'
      });

      await challenge.save();
      await challenge.populate('createdBy', 'name email');
      
      return challenge;
    } catch (error: any) {
      throw new Error(`Failed to create challenge: ${error.message}`);
    }
  }

  // Get challenges with filtering and pagination
  static async getChallenges(
    filters: ChallengeFilters = {},
    page: number = 1,
    limit: number = 12,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ) {
    try {
      const query: any = {};

      // Apply filters
      if (filters.type) query.type = filters.type;
      if (filters.category) query.category = filters.category;
      if (filters.difficulty) query.difficulty = filters.difficulty;
      if (filters.status) query.status = filters.status;
      if (filters.featured !== undefined) query.featured = filters.featured;
      if (filters.tags && filters.tags.length > 0) {
        query.tags = { $in: filters.tags };
      }

      // Search functionality
      if (filters.search) {
        query.$text = { $search: filters.search };
      }

      // Participating filter
      if (filters.participating && filters.userId) {
        query['participants.userId'] = new Types.ObjectId(filters.userId);
      }

      const skip = (page - 1) * limit;
      const sortOptions: any = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const [challenges, total] = await Promise.all([
        ChallengeModel
          .find(query)
          .populate('createdBy', 'name email')
          .populate('participants.userId', 'name email')
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean(),
        ChallengeModel.countDocuments(query)
      ]);

      return {
        challenges: challenges as ChallengeObject[],
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error: any) {
      throw new Error(`Failed to get challenges: ${error.message}`);
    }
  }

  // Get a single challenge by ID
  static async getChallengeById(challengeId: string, userId?: string): Promise<Challenge | null> {
    try {
      if (!Types.ObjectId.isValid(challengeId)) {
        throw new Error('Invalid challenge ID');
      }

      const challenge = await ChallengeModel
        .findById(challengeId)
        .populate('createdBy', 'name email')
        .populate('participants.userId', 'name email');

      if (!challenge) {
        return null;
      }

      // Update leaderboard if challenge is active
      if (challenge.status === 'active') {
        (challenge as any).updateLeaderboard();
        await challenge.save();
      }

      return challenge;
    } catch (error: any) {
      throw new Error(`Failed to get challenge: ${error.message}`);
    }
  }

  // Update a challenge
  static async updateChallenge(
    challengeId: string,
    userId: string,
    updateData: UpdateChallengeRequest
  ): Promise<Challenge | null> {
    try {
      if (!Types.ObjectId.isValid(challengeId)) {
        throw new Error('Invalid challenge ID');
      }

      const challenge = await ChallengeModel.findById(challengeId);
      if (!challenge) {
        throw new Error('Challenge not found');
      }

      // Check if user is the creator or admin
      if (challenge.createdBy.toString() !== userId) {
        throw new Error('Unauthorized to update this challenge');
      }

      // Prevent updates to active challenges (except status and featured)
      if (challenge.status === 'active') {
        const allowedFields = ['status', 'featured', 'endDate'];
        const updateFields = Object.keys(updateData);
        const hasRestrictedFields = updateFields.some(field => !allowedFields.includes(field));
        
        if (hasRestrictedFields) {
          throw new Error('Cannot update active challenge details');
        }
      }

      // Apply difficulty multipliers if difficulty or rewards changed
      if (updateData.difficulty || updateData.rewards) {
        const difficulty = updateData.difficulty || challenge.difficulty;
        const rewards = updateData.rewards || challenge.rewards;
        const difficultyMultipliers = { easy: 1, medium: 1.5, hard: 2, extreme: 3 };
        const multiplier = difficultyMultipliers[difficulty];
        
        updateData.rewards = {
          ...rewards,
          xp: Math.round(rewards.xp * multiplier),
          coins: Math.round(rewards.coins * multiplier),
          multiplier
        };
      }

      Object.assign(challenge, updateData);
      await challenge.save();
      await challenge.populate('createdBy', 'name email');
      
      return challenge;
    } catch (error: any) {
      throw new Error(`Failed to update challenge: ${error.message}`);
    }
  }

  // Delete a challenge
  static async deleteChallenge(challengeId: string, userId: string): Promise<boolean> {
    try {
      if (!Types.ObjectId.isValid(challengeId)) {
        throw new Error('Invalid challenge ID');
      }

      const challenge = await ChallengeModel.findById(challengeId);
      if (!challenge) {
        throw new Error('Challenge not found');
      }

      // Check if user is the creator
      if (challenge.createdBy.toString() !== userId) {
        throw new Error('Unauthorized to delete this challenge');
      }

      // Prevent deletion of active challenges with participants
      if (challenge.status === 'active' && challenge.participants.length > 0) {
        throw new Error('Cannot delete active challenge with participants');
      }

      await ChallengeModel.findByIdAndDelete(challengeId);
      return true;
    } catch (error: any) {
      throw new Error(`Failed to delete challenge: ${error.message}`);
    }
  }

  // Join a challenge
  static async joinChallenge(
    challengeId: string, 
    userId: string, 
    joinData: JoinChallengeRequest
  ): Promise<Challenge> {
    try {
      if (!Types.ObjectId.isValid(challengeId)) {
        throw new Error('Invalid challenge ID');
      }

      if (!Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID');
      }

      // Validate user exists
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const challenge = await ChallengeModel.findById(challengeId);
      if (!challenge) {
        throw new Error('Challenge not found');
      }

      // Check if challenge is joinable
      if (challenge.status !== 'upcoming' && challenge.status !== 'active') {
        throw new Error('Challenge is not available for joining');
      }

      // Check if user is already participating
      const existingParticipant = challenge.participants.find(
        p => p.userId.toString() === userId
      );
      if (existingParticipant) {
        throw new Error('Already participating in this challenge');
      }

      // Check if challenge is full
      if (challenge.maxParticipants && challenge.participants.length >= challenge.maxParticipants) {
        throw new Error('Challenge is full');
      }

      // Initialize participant progress
      const initialProgress = challenge.requirements.map(req => ({
        requirementId: req.id,
        current: 0
      }));

      const participant: ChallengeParticipant = {
        userId: new Types.ObjectId(userId),
        joinedAt: new Date(),
        progress: initialProgress,
        overallProgress: 0,
        score: 0
      };

      challenge.participants.push(participant);
      (challenge as any).updateLeaderboard();
      
      await challenge.save();
      await challenge.populate('participants.userId', 'name email');
      
      // Emit real-time event for challenge joined
      socketService.emitChallengeJoined(challengeId, userId, {
        participant,
        totalParticipants: challenge.participants.length
      });
      
      return challenge;
    } catch (error: any) {
      console.error('ChallengeService.joinChallenge error:', error);
      throw new Error(`Failed to join challenge: ${error?.message || 'Unknown error'}`);
    }
  }

  // Leave a challenge
  static async leaveChallenge(challengeId: string, userId: string): Promise<Challenge> {
    try {
      if (!Types.ObjectId.isValid(challengeId)) {
        throw new Error('Invalid challenge ID');
      }

      const challenge = await ChallengeModel.findById(challengeId);
      if (!challenge) {
        throw new Error('Challenge not found');
      }

      // Check if user is participating
      const participantIndex = challenge.participants.findIndex(
        p => p.userId.toString() === userId
      );
      if (participantIndex === -1) {
        throw new Error('Not participating in this challenge');
      }

      // Remove participant
      challenge.participants.splice(participantIndex, 1);
      (challenge as any).updateLeaderboard();
      
      await challenge.save();
      return challenge;
    } catch (error: any) {
      throw new Error(`Failed to leave challenge: ${error.message}`);
    }
  }

  // Update progress for a challenge participant
  static async updateProgress(
    challengeId: string,
    userId: string,
    progressData: ProgressUpdateRequest
  ): Promise<Challenge> {
    try {
      if (!Types.ObjectId.isValid(challengeId)) {
        throw new Error('Invalid challenge ID');
      }

      const challenge = await ChallengeModel.findById(challengeId);
      if (!challenge) {
        throw new Error('Challenge not found');
      }

      // Check if challenge is active
      if (challenge.status !== 'active') {
        throw new Error('Cannot update progress for inactive challenge');
      }

      // Find participant
      const participant = challenge.participants.find(
        p => p.userId.toString() === userId
      );
      if (!participant) {
        throw new Error('Not participating in this challenge');
      }

      // Find and update progress
      const progressIndex = participant.progress.findIndex(
        p => p.requirementId === progressData.requirementId
      );
      if (progressIndex === -1) {
        throw new Error('Invalid requirement ID');
      }

      const requirement = challenge.requirements.find(r => r.id === progressData.requirementId);
      if (!requirement) {
        throw new Error('Requirement not found');
      }

      // Update progress
      participant.progress[progressIndex].current = Math.max(
        participant.progress[progressIndex].current,
        progressData.progress
      );

      // Check if requirement is completed
      if (participant.progress[progressIndex].current >= requirement.target && 
          !participant.progress[progressIndex].completedAt) {
        participant.progress[progressIndex].completedAt = new Date();
      }

      // Check if all requirements are completed
      const allCompleted = participant.progress.every(p => {
        const req = challenge.requirements.find(r => r.id === p.requirementId);
        return req && p.current >= req.target;
      });

      if (allCompleted && !participant.completedAt) {
        participant.completedAt = new Date();
        
        // Emit challenge completion event
        socketService.emitChallengeCompletion(challengeId, userId, {
          completedAt: participant.completedAt,
          finalScore: participant.score,
          rank: (challenge as any).leaderboard?.findIndex((entry: any) => entry.userId.toString() === userId) + 1 || 0
        });
      }

      (challenge as any).updateLeaderboard();
      await challenge.save();
      
      // Emit progress update event
      socketService.emitChallengeProgress(challengeId, userId, participant.overallProgress);
      
      return challenge;
    } catch (error: any) {
      throw new Error(`Failed to update progress: ${error.message}`);
    }
  }

  // Get challenge leaderboard
  static async getChallengeLeaderboard(challengeId: string, userId?: string): Promise<ChallengeLeaderboard> {
    try {
      if (!Types.ObjectId.isValid(challengeId)) {
        throw new Error('Invalid challenge ID');
      }

      const challenge = await ChallengeModel
        .findById(challengeId)
        .populate('participants.userId', 'name email');

      if (!challenge) {
        throw new Error('Challenge not found');
      }

      // Update leaderboard
      (challenge as any).updateLeaderboard();
      await challenge.save();

      // Create leaderboard entries
      const entries: LeaderboardEntry[] = challenge.participants.map((participant, index) => ({
        userId: participant.userId._id,
        username: (participant.userId as any).name,
        score: participant.score,
        rank: participant.rank || index + 1,
        progress: participant.overallProgress,
        completedAt: participant.completedAt,
        avatar: (participant.userId as any).avatarUrl
      }));

      // Find current user entry
      let currentUser: LeaderboardEntry | undefined;
      if (userId) {
        currentUser = entries.find(entry => entry.userId.toString() === userId);
      }

      return {
        challengeId: challenge._id,
        entries,
        totalParticipants: challenge.participants.length,
        currentUser
      };
    } catch (error: any) {
      throw new Error(`Failed to get leaderboard: ${error.message}`);
    }
  }

  // Get featured challenges
  static async getFeaturedChallenges(limit: number = 6): Promise<ChallengeObject[]> {
    try {
      const challenges = await ChallengeModel
        .find({ 
          featured: true, 
          status: { $in: ['upcoming', 'active'] } 
        })
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      return challenges as ChallengeObject[];
    } catch (error: any) {
      throw new Error(`Failed to get featured challenges: ${error.message}`);
    }
  }

  // Get challenges user is participating in
  static async getParticipatingChallenges(userId: string): Promise<Challenge[]> {
    try {
      const challenges = await ChallengeModel
        .find({ 'participants.userId': new Types.ObjectId(userId) })
        .populate('createdBy', 'name email')
        .populate('participants.userId', 'name email')
        .sort({ createdAt: -1 });

      return challenges;
    } catch (error: any) {
      throw new Error(`Failed to get participating challenges: ${error.message}`);
    }
  }

  // Get challenge statistics
  static async getChallengeStats(userId?: string): Promise<ChallengeStats> {
    try {
      const pipeline: any[] = [
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            byType: {
              $push: {
                type: '$type',
                count: 1
              }
            },
            byCategory: {
              $push: {
                category: '$category',
                count: 1
              }
            },
            byDifficulty: {
              $push: {
                difficulty: '$difficulty',
                count: 1
              }
            },
            byStatus: {
              $push: {
                status: '$status',
                count: 1
              }
            }
          }
        }
      ];

      const [stats] = await ChallengeModel.aggregate(pipeline);
      
      if (!stats) {
        return {
          total: 0,
          byType: {} as any,
          byCategory: {} as any,
          byDifficulty: {} as any,
          byStatus: {} as any,
          participating: 0,
          completed: 0
        };
      }

      // Process grouped data
      const processGroupedData = (data: any[], field: string) => {
        const result: any = {};
        data.forEach(item => {
          const key = item[field];
          result[key] = (result[key] || 0) + 1;
        });
        return result;
      };

      let participating = 0;
      let completed = 0;

      if (userId) {
        participating = await ChallengeModel.countDocuments({
          'participants.userId': new Types.ObjectId(userId)
        });

        completed = await ChallengeModel.countDocuments({
          'participants.userId': new Types.ObjectId(userId),
          'participants.completedAt': { $exists: true }
        });
      }

      return {
        total: stats.total,
        byType: processGroupedData(stats.byType, 'type'),
        byCategory: processGroupedData(stats.byCategory, 'category'),
        byDifficulty: processGroupedData(stats.byDifficulty, 'difficulty'),
        byStatus: processGroupedData(stats.byStatus, 'status'),
        participating,
        completed
      };
    } catch (error: any) {
      throw new Error(`Failed to get challenge stats: ${error.message}`);
    }
  }

  // Auto-update challenge statuses based on dates
  static async updateChallengeStatuses(): Promise<void> {
    try {
      const now = new Date();

      // Update upcoming challenges to active
      await ChallengeModel.updateMany(
        { 
          status: 'upcoming', 
          startDate: { $lte: now },
          endDate: { $gt: now }
        },
        { status: 'active' }
      );

      // Update active challenges to completed
      await ChallengeModel.updateMany(
        { 
          status: 'active', 
          endDate: { $lte: now }
        },
        { status: 'completed' }
      );
    } catch (error: any) {
      console.error('Failed to update challenge statuses:', error.message);
    }
  }
}
