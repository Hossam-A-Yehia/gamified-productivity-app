import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { AchievementService } from '../services/achievementService';
import Achievement from '../models/Achievement';

export const getAllAchievements = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const achievements = await AchievementService.getAllAchievements();
    res.json({
      success: true,
      data: achievements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievements',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getUserAchievements = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const achievements = await AchievementService.getUserAchievements(userId);
    res.json({
      success: true,
      data: achievements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user achievements',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const checkAchievements = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const newAchievements = await AchievementService.checkAchievements(userId);
    res.json({
      success: true,
      data: {
        newAchievements,
        count: newAchievements.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check achievements',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getAchievementDetails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const achievement = await Achievement.findById(id);
    
    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    res.json({
      success: true,
      data: achievement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievement details',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getAchievementProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const progress = await AchievementService.getAchievementProgress(userId, id);
    
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found or user not found'
      });
    }

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievement progress',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const initializeAchievements = async (req: AuthenticatedRequest, res: Response) => {
  try {
    await AchievementService.initializeAchievements();
    res.json({
      success: true,
      message: 'Achievements initialized successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to initialize achievements',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
