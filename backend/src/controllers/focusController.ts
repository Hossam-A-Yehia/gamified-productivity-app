import { Response } from 'express';
import { FocusService } from '../services/focusService';
import { AchievementService } from '../services/achievementService';
import { AuthenticatedRequest } from '../types/express';
import { 
  CreateFocusSessionRequest, 
  UpdateFocusSessionRequest, 
  FocusSessionFilters,
  UpdateFocusSettingsRequest
} from '../types/focus';

export class FocusController {
  // Create a new focus session (start session)
  static async startFocusSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const sessionData: CreateFocusSessionRequest = req.body;

      // Validation
      if (!sessionData.duration || sessionData.duration < 1 || sessionData.duration > 480) {
        res.status(400).json({
          success: false,
          message: 'Duration must be between 1 and 480 minutes'
        });
        return;
      }

      if (sessionData.breakDuration && (sessionData.breakDuration < 0 || sessionData.breakDuration > 60)) {
        res.status(400).json({
          success: false,
          message: 'Break duration must be between 0 and 60 minutes'
        });
        return;
      }

      const session = await FocusService.createFocusSession(userId, sessionData);

      res.status(201).json({
        success: true,
        data: {
          session,
          message: 'Focus session started successfully'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to start focus session',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get focus sessions with filters
  static async getFocusSessions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const filters: FocusSessionFilters = {
        type: req.query.type as 'pomodoro' | 'custom',
        completed: req.query.completed ? req.query.completed === 'true' : undefined,
        taskId: req.query.taskId as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as 'asc' | 'desc'
      };

      const result = await FocusService.getFocusSessions(userId, filters);

      res.status(200).json({
        success: true,
        data: {
          sessions: result.sessions,
          pagination: result.pagination
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch focus sessions',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get focus session by ID
  static async getFocusSessionById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const sessionId = req.params.id;

      if (!sessionId) {
        res.status(400).json({
          success: false,
          message: 'Session ID is required'
        });
        return;
      }

      const session = await FocusService.getFocusSessionById(userId, sessionId);

      if (!session) {
        res.status(404).json({
          success: false,
          message: 'Focus session not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: session
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch focus session',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update focus session (for pausing, adding interruptions, etc.)
  static async updateFocusSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const sessionId = req.params.id;
      const updateData: UpdateFocusSessionRequest = req.body;

      if (!sessionId) {
        res.status(400).json({
          success: false,
          message: 'Session ID is required'
        });
        return;
      }

      const session = await FocusService.updateFocusSession(userId, sessionId, updateData);

      if (!session) {
        res.status(404).json({
          success: false,
          message: 'Focus session not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: session,
        message: 'Focus session updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update focus session',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Complete focus session
  static async completeFocusSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const sessionId = req.params.id;

      if (!sessionId) {
        res.status(400).json({
          success: false,
          message: 'Session ID is required'
        });
        return;
      }

      const result = await FocusService.completeFocusSession(userId, sessionId);
      
      // Check for new achievements
      const newAchievements = await AchievementService.checkAchievements(userId);

      res.status(200).json({
        success: true,
        data: {
          session: result.session,
          xpEarned: result.xpEarned,
          newAchievements: newAchievements.length > 0 ? newAchievements : undefined,
          message: 'Focus session completed successfully'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to complete focus session',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Delete focus session
  static async deleteFocusSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const sessionId = req.params.id;

      if (!sessionId) {
        res.status(400).json({
          success: false,
          message: 'Session ID is required'
        });
        return;
      }

      const deleted = await FocusService.deleteFocusSession(userId, sessionId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Focus session not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Focus session deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete focus session',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get focus statistics
  static async getFocusStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const stats = await FocusService.getFocusStats(userId);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch focus statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get focus settings
  static async getFocusSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const settings = await FocusService.getFocusSettings(userId);

      res.status(200).json({
        success: true,
        data: settings
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch focus settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update focus settings
  static async updateFocusSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const settingsUpdate: UpdateFocusSettingsRequest = req.body;

      // Validation
      if (settingsUpdate.defaultPomodoroLength && 
          (settingsUpdate.defaultPomodoroLength < 1 || settingsUpdate.defaultPomodoroLength > 120)) {
        res.status(400).json({
          success: false,
          message: 'Default pomodoro length must be between 1 and 120 minutes'
        });
        return;
      }

      if (settingsUpdate.defaultBreakLength && 
          (settingsUpdate.defaultBreakLength < 1 || settingsUpdate.defaultBreakLength > 60)) {
        res.status(400).json({
          success: false,
          message: 'Default break length must be between 1 and 60 minutes'
        });
        return;
      }

      if (settingsUpdate.xpMultiplier && 
          (settingsUpdate.xpMultiplier < 0.1 || settingsUpdate.xpMultiplier > 5.0)) {
        res.status(400).json({
          success: false,
          message: 'XP multiplier must be between 0.1 and 5.0'
        });
        return;
      }

      const settings = await FocusService.updateFocusSettings(userId, settingsUpdate);

      res.status(200).json({
        success: true,
        data: settings,
        message: 'Focus settings updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update focus settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get active focus session (if any)
  static async getActiveFocusSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      
      // Find the most recent uncompleted session
      const result = await FocusService.getFocusSessions(userId, {
        completed: false,
        limit: 1,
        sortBy: 'startTime',
        sortOrder: 'desc'
      });

      const activeSession = result.sessions.length > 0 ? result.sessions[0] : null;

      res.status(200).json({
        success: true,
        data: activeSession
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch active focus session',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
