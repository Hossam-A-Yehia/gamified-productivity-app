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

export const getUserAchievementProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const progressData = await AchievementService.getUserAchievementProgress(userId);
    
    if (!progressData) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: progressData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user achievement progress',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getAchievementsByCategory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const achievements = await Achievement.find({ 
      isActive: true,
      category: category 
    }).sort({ rarity: 1 });

    const progressData = await AchievementService.getUserAchievementProgress(userId);
    
    // Filter progress data for this category
    const categoryProgress = progressData?.filter(item => 
      item.achievement.category === category
    ) || [];

    res.json({
      success: true,
      data: {
        achievements,
        progress: categoryProgress
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievements by category',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getAchievementStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const progressData = await AchievementService.getUserAchievementProgress(userId);
    
    if (!progressData) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const stats = {
      total: progressData.length,
      unlocked: progressData.filter(item => item.isUnlocked).length,
      locked: progressData.filter(item => !item.isUnlocked).length,
      byCategory: {
        consistency: progressData.filter(item => item.achievement.category === 'consistency').length,
        productivity: progressData.filter(item => item.achievement.category === 'productivity').length,
        social: progressData.filter(item => item.achievement.category === 'social').length,
        special: progressData.filter(item => item.achievement.category === 'special').length
      },
      byRarity: {
        common: progressData.filter(item => item.achievement.rarity === 'common').length,
        rare: progressData.filter(item => item.achievement.rarity === 'rare').length,
        epic: progressData.filter(item => item.achievement.rarity === 'epic').length,
        legendary: progressData.filter(item => item.achievement.rarity === 'legendary').length
      },
      unlockedByCategory: {
        consistency: progressData.filter(item => item.achievement.category === 'consistency' && item.isUnlocked).length,
        productivity: progressData.filter(item => item.achievement.category === 'productivity' && item.isUnlocked).length,
        social: progressData.filter(item => item.achievement.category === 'social' && item.isUnlocked).length,
        special: progressData.filter(item => item.achievement.category === 'special' && item.isUnlocked).length
      },
      completionPercentage: Math.round((progressData.filter(item => item.isUnlocked).length / progressData.length) * 100)
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievement stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
