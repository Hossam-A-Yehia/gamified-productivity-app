export interface Task {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  category: 'work' | 'personal' | 'health' | 'learning' | 'other';
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  deadline?: string;
  recurrence: {
    type: 'none' | 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: string;
  };
  xpValue: number;
  coinsValue: number;
  tags: string[];
  completedAt?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  createdAt: string;
  updatedAt: string;
  isOverdue?: boolean;
  completionRate?: number;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  category: 'work' | 'personal' | 'health' | 'learning' | 'other';
  difficulty: 'easy' | 'medium' | 'hard';
  priority: 'low' | 'medium' | 'high';
  deadline?: string;
  recurrence?: {
    type: 'none' | 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: string;
  };
  tags?: string[];
  estimatedDuration?: number;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  category?: 'work' | 'personal' | 'health' | 'learning' | 'other';
  difficulty?: 'easy' | 'medium' | 'hard';
  priority?: 'low' | 'medium' | 'high';
  deadline?: string;
  recurrence?: {
    type: 'none' | 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: string;
  };
  tags?: string[];
  estimatedDuration?: number;
  actualDuration?: number;
}

export interface TaskFilters {
  status?: 'pending' | 'in_progress' | 'completed';
  category?: 'work' | 'personal' | 'health' | 'learning' | 'other';
  difficulty?: 'easy' | 'medium' | 'hard';
  priority?: 'low' | 'medium' | 'high';
  search?: string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'deadline' | 'priority' | 'difficulty' | 'status';
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

export interface TaskCompletionResponse {
  task: Task;
  rewards: {
    xp: number;
    coins: number;
    levelUp?: boolean;
    newLevel?: number;
  };
  achievements?: string[];
}

export interface BulkUpdateRequest {
  taskIds: string[];
  updateData: {
    category?: 'work' | 'personal' | 'health' | 'learning' | 'other';
    difficulty?: 'easy' | 'medium' | 'hard';
    priority?: 'low' | 'medium' | 'high';
    status?: 'pending' | 'in_progress' | 'completed';
    tags?: string[];
  };
}

export interface TasksResponse {
  tasks: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// UI-specific types
export interface TaskFormData {
  title: string;
  description: string;
  category: 'work' | 'personal' | 'health' | 'learning' | 'other';
  difficulty: 'easy' | 'medium' | 'hard';
  priority: 'low' | 'medium' | 'high';
  deadline: string;
  tags: string;
  estimatedDuration: number;
  recurrenceType: 'none' | 'daily' | 'weekly' | 'monthly';
  recurrenceInterval: number;
  recurrenceEndDate: string;
}

export const TASK_CATEGORIES = [
  { value: 'work', label: 'Work', color: 'bg-blue-500' },
  { value: 'personal', label: 'Personal', color: 'bg-green-500' },
  { value: 'health', label: 'Health', color: 'bg-red-500' },
  { value: 'learning', label: 'Learning', color: 'bg-purple-500' },
  { value: 'other', label: 'Other', color: 'bg-gray-500' },
] as const;

export const TASK_DIFFICULTIES = [
  { value: 'easy', label: 'Easy', multiplier: 1.0, color: 'text-green-600' },
  { value: 'medium', label: 'Medium', multiplier: 1.5, color: 'text-yellow-600' },
  { value: 'hard', label: 'Hard', multiplier: 2.0, color: 'text-red-600' },
] as const;

export const TASK_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'text-gray-600' },
  { value: 'medium', label: 'Medium', color: 'text-blue-600' },
  { value: 'high', label: 'High', color: 'text-red-600' },
] as const;

export const TASK_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-gray-100 text-gray-800' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
] as const;
