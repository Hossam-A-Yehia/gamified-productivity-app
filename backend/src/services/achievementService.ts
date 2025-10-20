import Achievement, { IAchievement } from '../models/Achievement';
import User, { IUser } from '../models/User';
import { Task, ITask } from '../models/Task';
import UserAchievement, { IUserAchievement } from '../models/UserAchievement';
import { socketService } from './socketService';

interface AchievementRule {
  check: (user: IUser, task?: ITask) => boolean | Promise<boolean>;
  reward: {
    xp: number;
    coins: number;
    avatarItem?: string;
  };
}

const achievementRules: Record<string, AchievementRule> = {
  'rookie_achiever': {
    check: (user: IUser) => user.stats.totalTasksCompleted >= 10,
    reward: { xp: 100, coins: 50 }
  },
  'task_master': {
    check: (user: IUser) => user.stats.totalTasksCompleted >= 50,
    reward: { xp: 300, coins: 150 }
  },
  'century_club': {
    check: (user: IUser) => user.stats.totalTasksCompleted >= 100,
    reward: { xp: 500, coins: 250 }
  },
  'consistency_hero': {
    check: (user: IUser) => user.streak >= 7,
    reward: { xp: 200, coins: 100 }
  },
  'streak_legend': {
    check: (user: IUser) => user.streak >= 30,
    reward: { xp: 1000, coins: 500 }
  },
  'early_bird': {
    check: (user: IUser, task?: ITask) => {
      if (!task?.completedAt) return false;
      const completionHour = new Date(task.completedAt).getHours();
      return completionHour < 8;
    },
    reward: { xp: 50, coins: 25 }
  },
  'night_owl': {
    check: (user: IUser, task?: ITask) => {
      if (!task?.completedAt) return false;
      const completionHour = new Date(task.completedAt).getHours();
      return completionHour >= 22;
    },
    reward: { xp: 50, coins: 25 }
  },
  'work_warrior': {
    check: async (user: IUser) => {
      const workTasks = await Task.countDocuments({ 
        userId: user._id, 
        category: 'work', 
        status: 'completed' 
      });
      return workTasks >= 25;
    },
    reward: { xp: 250, coins: 125 }
  },
  'health_hero': {
    check: async (user: IUser) => {
      const healthTasks = await Task.countDocuments({ 
        userId: user._id, 
        category: 'health', 
        status: 'completed' 
      });
      return healthTasks >= 25;
    },
    reward: { xp: 250, coins: 125 }
  },
  'learning_legend': {
    check: async (user: IUser) => {
      const learningTasks = await Task.countDocuments({ 
        userId: user._id, 
        category: 'learning', 
        status: 'completed' 
      });
      return learningTasks >= 25;
    },
    reward: { xp: 300, coins: 150 }
  }
};

export class AchievementService {
  static async initializeAchievements() {
    const achievements = [
      {
        name: 'Rookie Achiever',
        description: 'Complete your first 10 tasks',
        iconUrl: 'target',
        category: 'productivity',
        rarity: 'common',
        criteria: {
          type: 'task_count',
          target: 10,
          timeframe: 'all_time'
        },
        rewards: { xp: 100, coins: 50 }
      },
      {
        name: 'Task Master',
        description: 'Complete 50 tasks',
        iconUrl: 'check-circle-2',
        category: 'productivity',
        rarity: 'rare',
        criteria: {
          type: 'task_count',
          target: 50,
          timeframe: 'all_time'
        },
        rewards: { xp: 300, coins: 150 }
      },
      {
        name: 'Century Club',
        description: 'Complete 100 tasks',
        iconUrl: 'trophy',
        category: 'productivity',
        rarity: 'epic',
        criteria: {
          type: 'task_count',
          target: 100,
          timeframe: 'all_time'
        },
        rewards: { xp: 500, coins: 250 }
      },
      {
        name: 'Consistency Hero',
        description: 'Maintain a 7-day streak',
        iconUrl: 'flame',
        category: 'consistency',
        rarity: 'rare',
        criteria: {
          type: 'streak',
          target: 7,
          timeframe: 'all_time'
        },
        rewards: { xp: 200, coins: 100 }
      },
      {
        name: 'Streak Legend',
        description: 'Maintain a 30-day streak',
        iconUrl: 'crown',
        category: 'consistency',
        rarity: 'legendary',
        criteria: {
          type: 'streak',
          target: 30,
          timeframe: 'all_time'
        },
        rewards: { xp: 1000, coins: 500 }
      },
      {
        name: 'Early Bird',
        description: 'Complete a task before 8 AM',
        iconUrl: 'sunrise',
        category: 'special',
        rarity: 'epic',
        criteria: {
          type: 'early_completion',
          target: 1,
          timeframe: 'all_time'
        },
        rewards: { xp: 50, coins: 25 }
      },
      {
        name: 'Night Owl',
        description: 'Complete a task after 10 PM',
        iconUrl: 'moon',
        category: 'special',
        rarity: 'epic',
        criteria: {
          type: 'late_completion',
          target: 1,
          timeframe: 'all_time'
        },
        rewards: { xp: 50, coins: 25 }
      },
      {
        name: 'Work Warrior',
        description: 'Complete 25 work tasks',
        iconUrl: 'briefcase',
        category: 'productivity',
        rarity: 'rare',
        criteria: {
          type: 'category_tasks',
          target: 25,
          category: 'work',
          timeframe: 'all_time'
        },
        rewards: { xp: 250, coins: 125 }
      },
      {
        name: 'Health Hero',
        description: 'Complete 25 health tasks',
        iconUrl: 'heart',
        category: 'productivity',
        rarity: 'rare',
        criteria: {
          type: 'category_tasks',
          target: 25,
          category: 'health',
          timeframe: 'all_time'
        },
        rewards: { xp: 250, coins: 125 }
      },
      {
        name: 'Learning Legend',
        description: 'Complete 25 learning tasks',
        iconUrl: 'graduation-cap',
        category: 'productivity',
        rarity: 'epic',
        criteria: {
          type: 'category_tasks',
          target: 25,
          category: 'learning',
          timeframe: 'all_time'
        },
        rewards: { xp: 300, coins: 150 }
      }
    ];

    for (const achievement of achievements) {
      await Achievement.findOneAndUpdate(
        { name: achievement.name },
        achievement,
        { upsert: true, new: true }
      );
    }
  }

  static async checkAchievements(userId: string, task?: ITask): Promise<string[]> {
    const user = await User.findById(userId);
    if (!user) return [];

    const newAchievements: string[] = [];
    const achievements = await Achievement.find({ isActive: true });

    for (const achievement of achievements) {
      if (user.achievements.includes(achievement.name)) continue;

      const ruleKey = achievement.name.toLowerCase().replace(/\s+/g, '_');
      const rule = achievementRules[ruleKey];
      
      if (rule) {
        let isUnlocked = false;
        
        if (typeof rule.check === 'function') {
          try {
            isUnlocked = await rule.check(user, task);
          } catch (error) {
            console.error(`Error checking achievement ${achievement.name}:`, error);
            continue;
          }
        }

        if (isUnlocked) {
          user.achievements.push(achievement.name);
          user.xp += achievement.rewards.xp;
          user.coins += achievement.rewards.coins;
          
          if (user.streak > user.stats.longestStreak) {
            user.stats.longestStreak = user.streak;
          }
          
          await user.save();
          newAchievements.push(achievement.name);
        }
      }
    }

    return newAchievements;
  }

  static async getUserAchievements(userId: string) {
    const user = await User.findById(userId);
    if (!user) return { unlocked: [], locked: [] };

    const allAchievements = await Achievement.find({ isActive: true });
    const unlocked = allAchievements.filter(achievement => 
      user.achievements.includes(achievement.name)
    );
    const locked = allAchievements.filter(achievement => 
      !user.achievements.includes(achievement.name)
    );

    return { unlocked, locked };
  }

  static async getAchievementProgress(userId: string, achievementId: string) {
    const user = await User.findById(userId);
    const achievement = await Achievement.findById(achievementId);
    
    if (!user || !achievement) return null;

    if (user.achievements.includes(achievement.name)) {
      return { progress: achievement.criteria.target, target: achievement.criteria.target, completed: true };
    }

    let progress = 0;

    switch (achievement.criteria.type) {
      case 'task_count':
        progress = user.stats.totalTasksCompleted;
        break;
      case 'streak':
        progress = user.streak;
        break;
      case 'category_tasks':
        const categoryTasks = await Task.countDocuments({
          userId: user._id,
          category: achievement.criteria.category,
          status: 'completed'
        });
        progress = categoryTasks;
        break;
      default:
        progress = 0;
    }

    return {
      progress: Math.min(progress, achievement.criteria.target),
      target: achievement.criteria.target,
      completed: false
    };
  }

  static async getAllAchievements() {
    return await Achievement.find({ isActive: true }).sort({ category: 1, rarity: 1 });
  }

  // Enhanced progress tracking with UserAchievement model
  static async updateAchievementProgress(userId: string, achievementId: string, progressValue: number, action: string) {
    try {
      const userAchievement = await UserAchievement.findOneAndUpdate(
        { userId, achievementId },
        {
          $set: {
            progress: progressValue,
            lastProgressUpdate: new Date()
          },
          $push: {
            progressHistory: {
              date: new Date(),
              value: progressValue,
              action
            }
          }
        },
        { upsert: true, new: true }
      ).populate('achievementId');

      if (!userAchievement || !userAchievement.achievementId) return null;

      const achievement = userAchievement.achievementId as unknown as IAchievement;
      
      // Check if achievement should be unlocked
      if (!userAchievement.isUnlocked && progressValue >= achievement.criteria.target) {
        await this.unlockAchievement(userId, achievementId);
      }

      return userAchievement;
    } catch (error) {
      console.error('Error updating achievement progress:', error);
      return null;
    }
  }

  // Unlock achievement and award rewards
  static async unlockAchievement(userId: string, achievementId: string) {
    try {
      const user = await User.findById(userId);
      const achievement = await Achievement.findById(achievementId);
      
      if (!user || !achievement) return null;

      // Update UserAchievement
      const userAchievement = await UserAchievement.findOneAndUpdate(
        { userId, achievementId },
        {
          $set: {
            isUnlocked: true,
            unlockedAt: new Date(),
            progress: achievement.criteria.target
          }
        },
        { upsert: true, new: true }
      );

      // Award rewards to user
      user.xp += achievement.rewards.xp;
      user.coins += achievement.rewards.coins;
      
      // Add achievement to user's collection if not already there
      if (!user.achievements.includes(achievement.name)) {
        user.achievements.push(achievement.name);
      }

      await user.save();

      // Send real-time notification
      socketService.emitToUser(userId, 'achievement-unlocked', {
        achievement: {
          id: achievement._id,
          name: achievement.name,
          description: achievement.description,
          iconUrl: achievement.iconUrl,
          category: achievement.category,
          rarity: achievement.rarity,
          rewards: achievement.rewards
        },
        user: {
          level: user.level,
          xp: user.xp,
          coins: user.coins
        }
      });

      return {
        achievement,
        userAchievement,
        rewards: achievement.rewards
      };
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      return null;
    }
  }

  // Get detailed progress for all achievements for a user
  static async getUserAchievementProgress(userId: string) {
    try {
      const user = await User.findById(userId);
      if (!user) return null;

      const achievements = await Achievement.find({ isActive: true });
      const userAchievements = await UserAchievement.find({ userId }).populate('achievementId');

      const progressData = await Promise.all(achievements.map(async (achievement) => {
        const userAchievement = userAchievements.find(ua => 
          ua.achievementId && (ua.achievementId as any)._id.toString() === (achievement._id as any).toString()
        );

        let currentProgress = 0;

        // Calculate current progress based on achievement type
        switch (achievement.criteria.type) {
          case 'task_count':
            currentProgress = user.stats.totalTasksCompleted;
            break;
          case 'streak':
            currentProgress = user.streak;
            break;
          case 'category_tasks':
            const categoryTasks = await Task.countDocuments({
              userId: user._id,
              category: achievement.criteria.category,
              status: 'completed'
            });
            currentProgress = categoryTasks;
            break;
          case 'focus_time':
            currentProgress = user.stats.totalFocusTime || 0;
            break;
          default:
            currentProgress = userAchievement?.progress || 0;
        }

        return {
          achievement,
          progress: Math.min(currentProgress, achievement.criteria.target),
          target: achievement.criteria.target,
          isUnlocked: userAchievement?.isUnlocked || false,
          unlockedAt: userAchievement?.unlockedAt,
          progressPercentage: Math.min((currentProgress / achievement.criteria.target) * 100, 100),
          progressHistory: userAchievement?.progressHistory || []
        };
      }));

      return progressData;
    } catch (error) {
      console.error('Error getting user achievement progress:', error);
      return null;
    }
  }

  // Check and update progress for specific achievement types after task completion
  static async checkTaskCompletionAchievements(userId: string, task: ITask) {
    try {
      const user = await User.findById(userId);
      if (!user) return [];

      const achievements = await Achievement.find({ isActive: true });
      const newUnlocks: any[] = [];

      for (const achievement of achievements) {
        const userAchievement = await UserAchievement.findOne({ userId, achievementId: achievement._id });
        
        if (userAchievement?.isUnlocked) continue;

        let shouldUpdate = false;
        let newProgress = 0;
        let action = '';

        switch (achievement.criteria.type) {
          case 'task_count':
            newProgress = user.stats.totalTasksCompleted;
            action = 'task_completed';
            shouldUpdate = true;
            break;

          case 'category_tasks':
            if (task.category === achievement.criteria.category) {
              const categoryTasks = await Task.countDocuments({
                userId: user._id,
                category: achievement.criteria.category,
                status: 'completed'
              });
              newProgress = categoryTasks;
              action = `${task.category}_task_completed`;
              shouldUpdate = true;
            }
            break;

          case 'early_completion':
            if (task.completedAt) {
              const completionHour = new Date(task.completedAt).getHours();
              if (completionHour < 8) {
                newProgress = (userAchievement?.progress || 0) + 1;
                action = 'early_completion';
                shouldUpdate = true;
              }
            }
            break;

          case 'late_completion':
            if (task.completedAt) {
              const completionHour = new Date(task.completedAt).getHours();
              if (completionHour >= 22) {
                newProgress = (userAchievement?.progress || 0) + 1;
                action = 'late_completion';
                shouldUpdate = true;
              }
            }
            break;
        }

        if (shouldUpdate) {
          const updatedAchievement = await this.updateAchievementProgress(
            userId, 
            (achievement._id as any).toString(), 
            newProgress, 
            action
          );

          if (updatedAchievement && newProgress >= achievement.criteria.target && !userAchievement?.isUnlocked) {
            const unlockResult = await this.unlockAchievement(userId, (achievement._id as any).toString());
            if (unlockResult) {
              newUnlocks.push(unlockResult);
            }
          }
        }
      }

      return newUnlocks;
    } catch (error) {
      console.error('Error checking task completion achievements:', error);
      return [];
    }
  }

  // Check streak-based achievements
  static async checkStreakAchievements(userId: string) {
    try {
      const user = await User.findById(userId);
      if (!user) return [];

      const streakAchievements = await Achievement.find({ 
        isActive: true,
        'criteria.type': 'streak'
      });

      const newUnlocks: any[] = [];

      for (const achievement of streakAchievements) {
        const userAchievement = await UserAchievement.findOne({ userId, achievementId: achievement._id });
        
        if (userAchievement?.isUnlocked) continue;

        if (user.streak >= achievement.criteria.target) {
          await this.updateAchievementProgress(
            userId,
            (achievement._id as any).toString(),
            user.streak,
            'streak_updated'
          );

          const unlockResult = await this.unlockAchievement(userId, (achievement._id as any).toString());
          if (unlockResult) {
            newUnlocks.push(unlockResult);
          }
        }
      }

      return newUnlocks;
    } catch (error) {
      console.error('Error checking streak achievements:', error);
      return [];
    }
  }
}
