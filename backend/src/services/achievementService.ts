import Achievement, { IAchievement } from '../models/Achievement';
import User, { IUser } from '../models/User';
import { Task, ITask } from '../models/Task';

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
        iconUrl: '/icons/achievements/rookie.png',
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
        iconUrl: '/icons/achievements/task-master.png',
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
        iconUrl: '/icons/achievements/century.png',
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
        iconUrl: '/icons/achievements/consistency.png',
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
        iconUrl: '/icons/achievements/legend.png',
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
        iconUrl: '/icons/achievements/early-bird.png',
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
        iconUrl: '/icons/achievements/night-owl.png',
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
        iconUrl: '/icons/achievements/work-warrior.png',
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
        iconUrl: '/icons/achievements/health-hero.png',
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
        iconUrl: '/icons/achievements/learning-legend.png',
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
}
