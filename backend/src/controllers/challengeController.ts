import { Request, Response } from 'express';
import { ChallengeService } from '../services/challengeService';
import { 
  CreateChallengeRequest, 
  UpdateChallengeRequest, 
  ChallengeFilters,
  ProgressUpdateRequest,
  JoinChallengeRequest
} from '../types/challenge';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export class ChallengeController {
  // Create a new challenge
  static async createChallenge(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const challengeData: CreateChallengeRequest = req.body;
      
      // Validation
      if (!challengeData.title || !challengeData.description) {
        return res.status(400).json({
          success: false,
          message: 'Title and description are required'
        });
      }

      if (!challengeData.requirements || challengeData.requirements.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one requirement is needed'
        });
      }

      if (new Date(challengeData.startDate) <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Start date must be in the future'
        });
      }

      if (new Date(challengeData.endDate) <= new Date(challengeData.startDate)) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
      }

      const challenge = await ChallengeService.createChallenge(userId, challengeData);

      res.status(201).json({
        success: true,
        message: 'Challenge created successfully',
        data: challenge
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get challenges with filtering and pagination
  static async getChallenges(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        page = 1,
        limit = 12,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        type,
        category,
        difficulty,
        status,
        tags,
        search,
        featured,
        participating
      } = req.query;

      const filters: ChallengeFilters = {};
      if (type) filters.type = type as any;
      if (category) filters.category = category as any;
      if (difficulty) filters.difficulty = difficulty as any;
      if (status) filters.status = status as any;
      if (featured !== undefined) filters.featured = featured === 'true';
      if (search) filters.search = search as string;
      if (tags) {
        filters.tags = Array.isArray(tags) ? tags as string[] : [tags as string];
      }
      if (participating === 'true' && req.user?.id) {
        filters.participating = true;
        filters.userId = req.user.id;
      }

      const result = await ChallengeService.getChallenges(
        filters,
        parseInt(page as string),
        parseInt(limit as string),
        sortBy as string,
        sortOrder as 'asc' | 'desc'
      );

      res.json({
        success: true,
        message: 'Challenges retrieved successfully',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get a single challenge by ID
  static async getChallengeById(req: AuthenticatedRequest, res: Response) {
    try {
      const { challengeId } = req.params;
      const userId = req.user?.id;

      const challenge = await ChallengeService.getChallengeById(challengeId, userId);

      if (!challenge) {
        return res.status(404).json({
          success: false,
          message: 'Challenge not found'
        });
      }

      res.json({
        success: true,
        message: 'Challenge retrieved successfully',
        data: challenge
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update a challenge
  static async updateChallenge(req: AuthenticatedRequest, res: Response) {
    try {
      const { challengeId } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const updateData: UpdateChallengeRequest = req.body;

      // Validation for date updates
      if (updateData.startDate && new Date(updateData.startDate) <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Start date must be in the future'
        });
      }

      if (updateData.endDate && updateData.startDate && 
          new Date(updateData.endDate) <= new Date(updateData.startDate)) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
      }

      const challenge = await ChallengeService.updateChallenge(challengeId, userId, updateData);

      if (!challenge) {
        return res.status(404).json({
          success: false,
          message: 'Challenge not found'
        });
      }

      res.json({
        success: true,
        message: 'Challenge updated successfully',
        data: challenge
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete a challenge
  static async deleteChallenge(req: AuthenticatedRequest, res: Response) {
    try {
      const { challengeId } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const success = await ChallengeService.deleteChallenge(challengeId, userId);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Challenge not found'
        });
      }

      res.json({
        success: true,
        message: 'Challenge deleted successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Join a challenge
  static async joinChallenge(req: AuthenticatedRequest, res: Response) {
    try {
      const { challengeId } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!challengeId) {
        return res.status(400).json({
          success: false,
          message: 'Challenge ID is required'
        });
      }

      const joinData: JoinChallengeRequest = {
        challengeId,
        message: req.body?.message || ''
      };

      const challenge = await ChallengeService.joinChallenge(challengeId, userId, joinData);

      res.json({
        success: true,
        message: 'Successfully joined challenge',
        data: challenge
      });
    } catch (error: any) {
      console.error('Join challenge error:', error);
      res.status(400).json({
        success: false,
        message: error?.message || 'Failed to join challenge'
      });
    }
  }

  // Leave a challenge
  static async leaveChallenge(req: AuthenticatedRequest, res: Response) {
    try {
      const { challengeId } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const challenge = await ChallengeService.leaveChallenge(challengeId, userId);

      res.json({
        success: true,
        message: 'Successfully left challenge',
        data: challenge
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update progress for a challenge
  static async updateProgress(req: AuthenticatedRequest, res: Response) {
    try {
      const { challengeId } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const progressData: ProgressUpdateRequest = req.body;

      if (!progressData.requirementId || progressData.progress === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Requirement ID and progress value are required'
        });
      }

      if (progressData.progress < 0) {
        return res.status(400).json({
          success: false,
          message: 'Progress cannot be negative'
        });
      }

      const challenge = await ChallengeService.updateProgress(challengeId, userId, progressData);

      res.json({
        success: true,
        message: 'Progress updated successfully',
        data: challenge
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get challenge leaderboard
  static async getChallengeLeaderboard(req: AuthenticatedRequest, res: Response) {
    try {
      const { challengeId } = req.params;
      const userId = req.user?.id;

      const leaderboard = await ChallengeService.getChallengeLeaderboard(challengeId, userId);

      res.json({
        success: true,
        message: 'Leaderboard retrieved successfully',
        data: leaderboard
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get featured challenges
  static async getFeaturedChallenges(req: AuthenticatedRequest, res: Response) {
    try {
      const { limit = 6 } = req.query;

      const challenges = await ChallengeService.getFeaturedChallenges(parseInt(limit as string));

      res.json({
        success: true,
        message: 'Featured challenges retrieved successfully',
        data: challenges
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get challenges user is participating in
  static async getParticipatingChallenges(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const challenges = await ChallengeService.getParticipatingChallenges(userId);

      res.json({
        success: true,
        message: 'Participating challenges retrieved successfully',
        data: challenges
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get challenge statistics
  static async getChallengeStats(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;

      const stats = await ChallengeService.getChallengeStats(userId);

      res.json({
        success: true,
        message: 'Challenge statistics retrieved successfully',
        data: stats
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Bulk update challenge statuses (admin endpoint)
  static async updateChallengeStatuses(req: AuthenticatedRequest, res: Response) {
    try {
      await ChallengeService.updateChallengeStatuses();

      res.json({
        success: true,
        message: 'Challenge statuses updated successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get user's challenge summary
  static async getUserChallengeSummary(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const [participating, stats] = await Promise.all([
        ChallengeService.getParticipatingChallenges(userId),
        ChallengeService.getChallengeStats(userId)
      ]);

      // Calculate additional metrics
      const activeChallenges = participating.filter(c => c.status === 'active');
      const completedChallenges = participating.filter(c => 
        c.participants.some(p => p.userId.toString() === userId && p.completedAt)
      );

      const summary = {
        totalParticipating: participating.length,
        activeChallenges: activeChallenges.length,
        completedChallenges: completedChallenges.length,
        stats,
        recentChallenges: participating.slice(0, 5)
      };

      res.json({
        success: true,
        message: 'User challenge summary retrieved successfully',
        data: summary
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}
