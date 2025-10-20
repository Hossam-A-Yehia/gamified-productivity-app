import { Task, ITask } from '../models/Task';
import User from '../models/User';
import mongoose from 'mongoose';
import { TASK_STATUS, SORT_ORDER, DEFAULTS, MONGO_OPERATORS, REGEX_OPTIONS, ERROR_MESSAGES } from '../constants';
import { socketService } from './socketService';
import { LeaderboardService } from './leaderboardService';

export interface TaskFilters {
  status?: string;
  category?: string;
  difficulty?: string;
  priority?: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
  tags?: string[];
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  overdue: number;
  completionRate: number;
  totalXpEarned: number;
  totalCoinsEarned: number;
  categoryBreakdown: Record<string, number>;
  difficultyBreakdown: Record<string, number>;
}

export class TaskService {
  // Create a new task
  static async createTask(userId: string, taskData: Partial<ITask>): Promise<ITask> {
    const task = new Task({
      ...taskData,
      userId: new mongoose.Types.ObjectId(userId),
    });

    await task.save();
    
    // Emit real-time event for task creation
    socketService.emitTaskCreated(userId, task);
    
    return task;
  }

  // Get tasks with filters and pagination
  static async getTasks(userId: string, filters: TaskFilters = {}): Promise<{
    tasks: ITask[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const page = filters.page || 1;
    const limit = filters.limit || DEFAULTS.PAGE_LIMIT;
    const skip = (page - 1) * limit;

    // Build query manually since we need more control
    const queryConditions: any = { userId: new mongoose.Types.ObjectId(userId) };
    
    if (filters.status) {
      queryConditions.status = filters.status;
    }
    
    if (filters.category) {
      queryConditions.category = filters.category;
    }
    
    if (filters.difficulty) {
      queryConditions.difficulty = filters.difficulty;
    }
    
    if (filters.priority) {
      queryConditions.priority = filters.priority;
    }
    
    if (filters.dateRange) {
      if (filters.dateRange.start) {
        queryConditions.createdAt = { $gte: new Date(filters.dateRange.start) };
      }
      if (filters.dateRange.end) {
        queryConditions.createdAt = { ...queryConditions.createdAt, $lte: new Date(filters.dateRange.end) };
      }
    }
    
    if (filters.tags && filters.tags.length > 0) {
      queryConditions.tags = { $in: filters.tags };
    }
    
    if (filters.search) {
      queryConditions[MONGO_OPERATORS.OR] = [
        { title: { [MONGO_OPERATORS.REGEX]: filters.search, [MONGO_OPERATORS.OPTIONS]: REGEX_OPTIONS.CASE_INSENSITIVE } },
        { description: { [MONGO_OPERATORS.REGEX]: filters.search, [MONGO_OPERATORS.OPTIONS]: REGEX_OPTIONS.CASE_INSENSITIVE } }
      ];
    }

    let query = Task.find(queryConditions);

    // Apply sorting
    const sortBy = filters.sortBy || DEFAULTS.SORT_BY;
    const sortOrder = filters.sortOrder === SORT_ORDER.ASC ? 1 : -1;
    query = query.sort({ [sortBy]: sortOrder });

    // Execute query with pagination
    const [tasks, total] = await Promise.all([
      query.skip(skip).limit(limit).exec(),
      Task.countDocuments(queryConditions),
    ]);

    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get a single task by ID
  static async getTaskById(userId: string, taskId: string): Promise<ITask | null> {
    return await Task.findOne({
      _id: taskId,
      userId: new mongoose.Types.ObjectId(userId),
    });
  }

  // Update a task
  static async updateTask(
    userId: string,
    taskId: string,
    updateData: Partial<ITask>
  ): Promise<ITask | null> {
    // Remove fields that shouldn't be updated directly
    const { userId: _, createdAt, updatedAt, ...allowedUpdates } = updateData as any;

    const task = await Task.findOneAndUpdate(
      {
        _id: taskId,
        userId: new mongoose.Types.ObjectId(userId),
      },
      allowedUpdates,
      { new: true, runValidators: true }
    );

    return task;
  }

  // Delete a task
  static async deleteTask(userId: string, taskId: string): Promise<boolean> {
    const result = await Task.deleteOne({
      _id: taskId,
      userId: new mongoose.Types.ObjectId(userId),
    });

    return result.deletedCount > 0;
  }

  // Mark task as complete and award XP/coins
  static async completeTask(userId: string, taskId: string): Promise<{
    task: ITask;
    xpAwarded: number;
    coinsAwarded: number;
    levelUp?: boolean;
    newLevel?: number;
  }> {
    const task = await Task.findOneAndUpdate(
      {
        _id: taskId,
        userId: new mongoose.Types.ObjectId(userId),
        status: { [MONGO_OPERATORS.NOT_EQUAL]: TASK_STATUS.COMPLETED },
      },
      {
        status: TASK_STATUS.COMPLETED,
        completedAt: new Date(),
      },
      { new: true }
    );

    if (!task) {
      throw new Error(ERROR_MESSAGES.TASK_NOT_FOUND_OR_COMPLETED);
    }

    let xpAwarded = task.xpValue;
    let coinsAwarded = task.coinsValue;

    const user = await User.findById(userId);
    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    const streakBonus = Math.min(user.streak * 5, 50);
    xpAwarded += streakBonus;

    if (task.deadline && task.completedAt! < task.deadline) {
      xpAwarded += 10;
      coinsAwarded += 2;
    }

    const oldLevel = user.level;
    const oldXP = user.xp;
    user.xp += xpAwarded;
    user.coins += coinsAwarded;
    user.stats.totalTasksCompleted += 1;

    const newLevel = this.calculateLevel(user.xp);
    const levelUp = newLevel > oldLevel;
    
    if (levelUp) {
      user.level = newLevel;
    }
    await this.updateUserStreak(user);

    await user.save();

    // Emit real-time events for task completion
    const rewards = { xp: xpAwarded, coins: coinsAwarded };
    socketService.emitTaskCompleted(userId, task, rewards);
    
    // Emit XP and coins gained events
    socketService.emitXPGained(userId, {
      amount: xpAwarded,
      source: 'task_completion',
      total: user.xp
    });
    
    socketService.emitCoinsEarned(userId, {
      amount: coinsAwarded,
      source: 'task_completion',
      total: user.coins
    });
    
    // Emit level up event if applicable
    if (levelUp) {
      socketService.emitLevelUp(userId, {
        oldLevel,
        newLevel,
        xp: user.xp,
        coinsBonus: newLevel * 10 // Bonus coins for leveling up
      });
    }

    // Check for rank changes and broadcast leaderboard updates
    LeaderboardService.checkRankChanges(userId, oldXP, user.xp);

    return {
      task,
      xpAwarded,
      coinsAwarded,
      levelUp,
      newLevel: levelUp ? newLevel : undefined,
    };
  }

  static async updateTaskStatus(
    userId: string,
    taskId: string,
    status: 'pending' | 'in_progress' | 'completed'
  ): Promise<ITask | null> {
    if (status === TASK_STATUS.COMPLETED) {
      const result = await this.completeTask(userId, taskId);
      return result.task;
    }

    return await Task.findOneAndUpdate(
      {
        _id: taskId,
        userId: new mongoose.Types.ObjectId(userId),
      },
      { status },
      { new: true, runValidators: true }
    );
  }

  static async bulkUpdateTasks(
    userId: string,
    taskIds: string[],
    updateData: Partial<ITask>
  ): Promise<{ modifiedCount: number }> {
    const result = await Task.updateMany(
      {
        _id: { $in: taskIds },
        userId: new mongoose.Types.ObjectId(userId),
      },
      updateData
    );

    return { modifiedCount: result.modifiedCount };
  }

  static async getTaskStats(userId: string): Promise<TaskStats> {
    const tasks = await Task.find({ userId: new mongoose.Types.ObjectId(userId) });

    const stats: TaskStats = {
      total: tasks.length,
      completed: 0,
      pending: 0,
      inProgress: 0,
      overdue: 0,
      completionRate: 0,
      totalXpEarned: 0,
      totalCoinsEarned: 0,
      categoryBreakdown: {},
      difficultyBreakdown: {},
    };

    const now = new Date();

    tasks.forEach((task) => {
      if (task.status === TASK_STATUS.COMPLETED) {
        stats.completed++;
        stats.totalXpEarned += task.xpValue;
        stats.totalCoinsEarned += task.coinsValue;
      } else if (task.status === TASK_STATUS.PENDING) {
        stats.pending++;
      } else if (task.status === TASK_STATUS.IN_PROGRESS) {
        stats.inProgress++;
      }

      if (task.deadline && task.status !== TASK_STATUS.COMPLETED && now > task.deadline) {
        stats.overdue++;
      }
      stats.categoryBreakdown[task.category] = (stats.categoryBreakdown[task.category] || 0) + 1;

      stats.difficultyBreakdown[task.difficulty] = (stats.difficultyBreakdown[task.difficulty] || 0) + 1;
    });

    stats.completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

    return stats;
  }

  // Get overdue tasks
  static async getOverdueTasks(userId: string): Promise<ITask[]> {
    const now = new Date();
    return await Task.find({
      userId: new mongoose.Types.ObjectId(userId),
      deadline: { [MONGO_OPERATORS.LESS_THAN]: now },
      status: { [MONGO_OPERATORS.NOT_EQUAL]: TASK_STATUS.COMPLETED },
    }).sort({ deadline: 1 });
  }

  private static calculateLevel(xp: number): number {
    let level = 1;
    let requiredXP = 0;

    while (xp >= requiredXP) {
      level++;
      requiredXP = 500 * (level - 1) + 1000 * ((level - 1) * (level - 2) / 2);
    }

    return level - 1;
  }

  private static async updateUserStreak(user: any): Promise<void> {
    const today = new Date().toDateString();
    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate).toDateString() : null;
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (lastActive === today) {
      return;
    } else if (lastActive === yesterday) {
      user.streak += 1;
      user.lastActiveDate = new Date();
    } else {
      user.streak = 1;
      user.lastActiveDate = new Date();
    }

    if (user.streak > user.stats.longestStreak) {
      user.stats.longestStreak = user.streak;
    }
  }

  // Bulk delete tasks
  static async bulkDeleteTasks(userId: string, taskIds: string[]): Promise<{ deletedCount: number }> {
    const result = await Task.deleteMany({
      _id: { $in: taskIds.map(id => new mongoose.Types.ObjectId(id)) },
      userId: new mongoose.Types.ObjectId(userId)
    });

    return { deletedCount: result.deletedCount };
  }
}
