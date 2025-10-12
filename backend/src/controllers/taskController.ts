import { Request, Response } from 'express';
import { TaskFilters, TaskService } from '../services/taskService';
import { AchievementService } from '../services/achievementService';
import { AuthenticatedRequest } from '../types/express';

export class TaskController {
  static async getTasks(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const filters: TaskFilters = {
        status: req.query.status as string,
        category: req.query.category as string,
        difficulty: req.query.difficulty as string,
        priority: req.query.priority as string,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };

      if (req.query.startDate || req.query.endDate) {
        filters.dateRange = {
          start: req.query.startDate as string,
          end: req.query.endDate as string,
        };
      }

      if (req.query.tags) {
        const tagsParam = req.query.tags as string;
        filters.tags = Array.isArray(tagsParam) ? tagsParam : tagsParam.split(',');
      }

      const result = await TaskService.getTasks(userId, filters);

      res.status(200).json({
        success: true,
        data: result.tasks,
        pagination: result.pagination,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch tasks',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async createTask(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const taskData = req.body;

      const task = await TaskService.createTask(userId, taskData);

      res.status(201).json({
        success: true,
        data: task,
        message: 'Task created successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to create task',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async getTaskById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const taskId = req.params.id;

      const task = await TaskService.getTaskById(userId, taskId);

      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch task',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async updateTask(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const taskId = req.params.id;
      const updateData = req.body;

      const task = await TaskService.updateTask(userId, taskId, updateData);

      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: task,
        message: 'Task updated successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to update task',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async deleteTask(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const taskId = req.params.id;

      const deleted = await TaskService.deleteTask(userId, taskId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Task not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete task',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async completeTask(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const taskId = req.params.id;

      const result = await TaskService.completeTask(userId, taskId);
      
      const newAchievements = await AchievementService.checkAchievements(userId, result.task);

      res.status(200).json({
        success: true,
        data: {
          task: result.task,
          rewards: {
            xp: result.xpAwarded,
            coins: result.coinsAwarded,
            levelUp: result.levelUp,
            newLevel: result.newLevel,
          },
          achievements: newAchievements,
        },
        message: result.levelUp 
          ? `Task completed! Level up to ${result.newLevel}! 🎉` 
          : 'Task completed successfully! 🎉',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to complete task',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async updateTaskStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const taskId = req.params.id;
      const { status } = req.body;

      if (!['pending', 'in_progress', 'completed'].includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Invalid status. Must be pending, in_progress, or completed',
        });
        return;
      }

      const task = await TaskService.updateTaskStatus(userId, taskId, status);

      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: task,
        message: 'Task status updated successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to update task status',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async bulkUpdateTasks(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { taskIds, updateData } = req.body;

      if (!Array.isArray(taskIds) || taskIds.length === 0) {
        res.status(400).json({
          success: false,
          message: 'taskIds must be a non-empty array',
        });
        return;
      }

      const result = await TaskService.bulkUpdateTasks(userId, taskIds, updateData);

      res.status(200).json({
        success: true,
        data: { modifiedCount: result.modifiedCount },
        message: `${result.modifiedCount} tasks updated successfully`,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to update tasks',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async getTaskStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const stats = await TaskService.getTaskStats(userId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch task statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async getOverdueTasks(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const tasks = await TaskService.getOverdueTasks(userId);

      res.status(200).json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch overdue tasks',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
