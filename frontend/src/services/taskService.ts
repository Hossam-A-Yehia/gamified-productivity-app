import { apiService } from './api';
import type { Task, CreateTaskRequest, UpdateTaskRequest, TaskFilters, TaskStats, BulkUpdateRequest, TasksResponse, TaskCompletionResponse } from '../types/task';
import { TASK_STATUS, TASK_DIFFICULTY, SORT_ORDER } from '../utils/constants';

class TaskService {
  async getTasks(filters: TaskFilters = {}): Promise<TasksResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          params.append(key, value.join(','));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const queryString = params.toString();
    const url = queryString ? `/tasks?${queryString}` : '/tasks';
    
    const response = await apiService.get<Task[]>(url);
    
    return {
      tasks: response.data.data || [],
      pagination: (response.data as any).pagination || {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
      }
    };
  }

  async createTask(taskData: CreateTaskRequest): Promise<Task> {
    const response = await apiService.post<Task>('/tasks', taskData);
    return response.data.data!;
  }

  async getTaskById(taskId: string): Promise<Task> {
    const response = await apiService.get<Task>(`/tasks/${taskId}`);
    return response.data.data!;
  }

  async updateTask(taskId: string, updateData: UpdateTaskRequest): Promise<Task> {
    const response = await apiService.put<Task>(`/tasks/${taskId}`, updateData);
    return response.data.data!;
  }

  async deleteTask(taskId: string): Promise<void> {
    await apiService.delete(`/tasks/${taskId}`);
  }

  async completeTask(taskId: string): Promise<TaskCompletionResponse> {
    const response = await apiService.patch<TaskCompletionResponse>(
      `/tasks/${taskId}/complete`
    );
    return response.data.data!;
  }

  async updateTaskStatus(
    taskId: string, 
    status: typeof TASK_STATUS[keyof typeof TASK_STATUS]
  ): Promise<Task> {
    const response = await apiService.patch<Task>(
      `/tasks/${taskId}/status`,
      { status }
    );
    return response.data.data!;
  }

  async bulkUpdateTasks(bulkData: BulkUpdateRequest): Promise<{ modifiedCount: number }> {
    const response = await apiService.post<{ modifiedCount: number }>('/tasks/bulk', bulkData);
    return response.data.data!;
  }

  async getTaskStats(): Promise<TaskStats> {
    const response = await apiService.get<TaskStats>('/tasks/stats');
    return response.data.data!;
  }

  async getOverdueTasks(): Promise<Task[]> {
    const response = await apiService.get<Task[]>('/tasks/overdue');
    return response.data.data!;
  }

  async getTasksByStatus(status: typeof TASK_STATUS[keyof typeof TASK_STATUS]): Promise<Task[]> {
    const result = await this.getTasks({ status, limit: 100 });
    return result.tasks;
  }

  async getTasksByCategory(category: 'work' | 'personal' | 'health' | 'learning' | 'other'): Promise<Task[]> {
    const result = await this.getTasks({ category, limit: 100 });
    return result.tasks;
  }

  async searchTasks(searchTerm: string): Promise<Task[]> {
    const result = await this.getTasks({ search: searchTerm, limit: 50 });
    return result.tasks;
  }

  async getTodaysTasks(): Promise<Task[]> {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
    
    const result = await this.getTasks({
      startDate: startOfDay,
      endDate: endOfDay,
      limit: 100,
      sortBy: 'deadline',
      sortOrder: SORT_ORDER.ASC
    });
    return result.tasks;
  }

  async getUpcomingTasks(): Promise<Task[]> {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const result = await this.getTasks({
      startDate: today.toISOString(),
      endDate: nextWeek.toISOString(),
      status: TASK_STATUS.PENDING,
      limit: 100,
      sortBy: 'deadline',
      sortOrder: SORT_ORDER.ASC
    });
    return result.tasks;
  }

  calculateTaskXP(task: Partial<Task>, userStreak: number = 0): number {
    const baseXP = 10;
    
    const difficultyMultipliers = {
      [TASK_DIFFICULTY.EASY]: 1.0,
      [TASK_DIFFICULTY.MEDIUM]: 1.5,
      [TASK_DIFFICULTY.HARD]: 2.0
    };
    
    const categoryBonuses = {
      work: 2,
      health: 3,
      learning: 5,
      personal: 1,
      other: 0
    };
    
    const streakBonus = Math.min(userStreak * 5, 50);
    
    const difficulty = task.difficulty || TASK_DIFFICULTY.MEDIUM;
    const category = task.category || 'other';
    
    return Math.floor(
      baseXP * difficultyMultipliers[difficulty] + 
      categoryBonuses[category] + 
      streakBonus
    );
  }

  async bulkDeleteTasks(taskIds: string[]): Promise<void> {
    await apiService.post('/tasks/bulk-delete', { taskIds });
  }
}

export const taskService = new TaskService();
export default taskService;
