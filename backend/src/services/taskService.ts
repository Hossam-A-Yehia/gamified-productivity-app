import { Task, ITask } from '../models/Task';
import User from '../models/User';
import mongoose from 'mongoose';

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
    const limit = filters.limit || 20;
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
      queryConditions.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } }
      ];
    }

    let query = Task.find(queryConditions);

    // Apply sorting
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
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
        status: { $ne: 'completed' },
      },
      {
        status: 'completed',
        completedAt: new Date(),
      },
      { new: true }
    );

    if (!task) {
      throw new Error('Task not found or already completed');
    }

    let xpAwarded = task.xpValue;
    let coinsAwarded = task.coinsValue;

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const streakBonus = Math.min(user.streak * 5, 50);
    xpAwarded += streakBonus;

    if (task.deadline && task.completedAt! < task.deadline) {
      xpAwarded += 10;
      coinsAwarded += 2;
    }

    const oldLevel = user.level;
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
    if (status === 'completed') {
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
      if (task.status === 'completed') {
        stats.completed++;
        stats.totalXpEarned += task.xpValue;
        stats.totalCoinsEarned += task.coinsValue;
      } else if (task.status === 'pending') {
        stats.pending++;
      } else if (task.status === 'in_progress') {
        stats.inProgress++;
      }

      if (task.deadline && task.status !== 'completed' && now > task.deadline) {
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
      deadline: { $lt: now },
      status: { $ne: 'completed' },
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
}
