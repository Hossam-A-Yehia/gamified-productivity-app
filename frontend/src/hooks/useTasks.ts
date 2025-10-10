import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services/taskService';
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskFilters,
  BulkUpdateRequest,
} from '../types/task';
export const TASK_QUERY_KEYS = {
  all: ['tasks'] as const,
  lists: () => [...TASK_QUERY_KEYS.all, 'list'] as const,
  list: (filters: TaskFilters) => [...TASK_QUERY_KEYS.lists(), filters] as const,
  details: () => [...TASK_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...TASK_QUERY_KEYS.details(), id] as const,
  stats: () => [...TASK_QUERY_KEYS.all, 'stats'] as const,
  overdue: () => [...TASK_QUERY_KEYS.all, 'overdue'] as const,
};

export const useTasks = (filters: TaskFilters = {}) => {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.list(filters),
    queryFn: () => taskService.getTasks(filters),
    staleTime: 5 * 60 * 1000, 
  });
};

export const useTask = (taskId: string) => {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.detail(taskId),
    queryFn: () => taskService.getTaskById(taskId),
    enabled: !!taskId,
  });
};

export const useTaskStats = () => {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.stats(),
    queryFn: () => taskService.getTaskStats(),
    staleTime: 10 * 60 * 1000,
  });
};

export const useOverdueTasks = () => {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.overdue(),
    queryFn: () => taskService.getOverdueTasks(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskData: CreateTaskRequest) => taskService.createTask(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, updateData }: { taskId: string; updateData: UpdateTaskRequest }) =>
      taskService.updateTask(taskId, updateData),
    onSuccess: (updatedTask) => {
      queryClient.setQueryData(TASK_QUERY_KEYS.detail(updatedTask._id), updatedTask);
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.stats() });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => taskService.deleteTask(taskId),
    onSuccess: (_, taskId) => {
      queryClient.removeQueries({ queryKey: TASK_QUERY_KEYS.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.stats() });
    },
  });
};

export const useCompleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => taskService.completeTask(taskId),
    onSuccess: (result) => {
      queryClient.setQueryData(TASK_QUERY_KEYS.detail(result.task._id), result.task);
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.stats() });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.overdue() });
      queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: Task['status'] }) =>
      taskService.updateTaskStatus(taskId, status),
    onSuccess: (updatedTask) => {
      queryClient.setQueryData(TASK_QUERY_KEYS.detail(updatedTask._id), updatedTask);
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.stats() });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.overdue() });
    },
  });
};

export const useBulkUpdateTasks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bulkData: BulkUpdateRequest) => taskService.bulkUpdateTasks(bulkData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all });
    },
  });
};

export const usePendingTasks = () => {
  return useTasks({ status: 'pending', limit: 100 });
};

export const useInProgressTasks = () => {
  return useTasks({ status: 'in_progress', limit: 100 });
};

export const useCompletedTasks = () => {
  return useTasks({ status: 'completed', limit: 100 });
};

export const useTodaysTasks = () => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
  
  return useTasks({
    startDate: startOfDay,
    endDate: endOfDay,
    limit: 100,
    sortBy: 'deadline',
    sortOrder: 'asc',
  });
};

export const useUpcomingTasks = () => {
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  return useTasks({
    startDate: today.toISOString(),
    endDate: nextWeek.toISOString(),
    status: 'pending',
    limit: 100,
    sortBy: 'deadline',
    sortOrder: 'asc',
  });
};

export const useTaskSearch = (searchTerm: string) => {
  return useTasks({
    search: searchTerm,
    limit: 50,
  });
};
