import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { LeaderboardService } from '../services/leaderboardService';

export class LeaderboardController {
  static async getGlobalLeaderboard(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const limit = parseInt(req.query.limit as string) || 50;
      const page = parseInt(req.query.page as string) || 1;

      const result = await LeaderboardService.getGlobalLeaderboard({
        limit,
        page,
        userId,
      });

      res.status(200).json({
        success: true,
        data: result,
        message: 'Global leaderboard retrieved successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch global leaderboard',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async getFriendsLeaderboard(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await LeaderboardService.getFriendsLeaderboard(userId, { limit });

      res.status(200).json({
        success: true,
        data: result,
        message: 'Friends leaderboard retrieved successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch friends leaderboard',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async getWeeklyLeaderboard(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const limit = parseInt(req.query.limit as string) || 50;
      const page = parseInt(req.query.page as string) || 1;

      const result = await LeaderboardService.getWeeklyLeaderboard({
        limit,
        page,
        userId,
      });

      res.status(200).json({
        success: true,
        data: result,
        message: 'Weekly leaderboard retrieved successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch weekly leaderboard',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async getMonthlyLeaderboard(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const limit = parseInt(req.query.limit as string) || 50;
      const page = parseInt(req.query.page as string) || 1;

      const result = await LeaderboardService.getMonthlyLeaderboard({
        limit,
        page,
        userId,
      });

      res.status(200).json({
        success: true,
        data: result,
        message: 'Monthly leaderboard retrieved successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch monthly leaderboard',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async getCategoryLeaderboard(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const category = req.params.category;
      const limit = parseInt(req.query.limit as string) || 50;
      const page = parseInt(req.query.page as string) || 1;

      if (!category) {
        res.status(400).json({
          success: false,
          message: 'Category is required',
        });
        return;
      }

      const validCategories = ['work', 'personal', 'health', 'learning', 'other'];
      if (!validCategories.includes(category.toLowerCase())) {
        res.status(400).json({
          success: false,
          message: 'Invalid category',
        });
        return;
      }

      const result = await LeaderboardService.getCategoryLeaderboard(category, {
        limit,
        page,
        userId,
      });

      res.status(200).json({
        success: true,
        data: result,
        message: `${category.charAt(0).toUpperCase() + category.slice(1)} leaderboard retrieved successfully`,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch category leaderboard',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async getStreakLeaderboard(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const limit = parseInt(req.query.limit as string) || 50;
      const page = parseInt(req.query.page as string) || 1;

      const result = await LeaderboardService.getStreakLeaderboard({
        limit,
        page,
        userId,
      });

      res.status(200).json({
        success: true,
        data: result,
        message: 'Streak leaderboard retrieved successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch streak leaderboard',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async getUserRank(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const rank = await LeaderboardService.getUserRank(userId);

      res.status(200).json({
        success: true,
        data: { rank },
        message: 'User rank retrieved successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user rank',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
