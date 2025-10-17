import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, SortAsc, SortDesc, Grid, List, CheckSquare } from 'lucide-react';
import { useTaskOperations } from '../hooks/useTasks';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskForm } from '../components/tasks/TaskForm';
import { DeleteTaskModal } from '../components/tasks/DeleteTaskModal';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { TaskCompletionAnimation } from '../components/tasks/TaskCompletionAnimation';
import { BulkTaskOperations } from '../components/tasks/BulkTaskOperations';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../types/task';
import { TASK_STATUS } from '../utils/constants';
import { toast } from 'sonner';

type ViewMode = 'grid' | 'list' | 'calendar';
type SortField = 'createdAt' | 'deadline' | 'priority' | 'difficulty' | 'title';
type SortOrder = 'asc' | 'desc';

interface TaskFiltersState {
  search: string;
  status: string[];
  category: string[];
  difficulty: string[];
  priority: string[];
  dateRange: {
    start: string;
    end: string;
  };
  tags: string[];
}

const Tasks: React.FC = () => {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [completionAnimation, setCompletionAnimation] = useState<{
    isVisible: boolean;
    task: Task | null;
  }>({ isVisible: false, task: null });
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [showBulkOperations, setShowBulkOperations] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  
  const [filters, setFilters] = useState<TaskFiltersState>({
    search: '',
    status: [],
    category: [],
    difficulty: [],
    priority: [],
    dateRange: { start: '', end: '' },
    tags: [],
  });

  const {
    tasks,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    updateTaskStatus,
    bulkUpdateTasks,
    bulkDeleteTasks,
  } = useTaskOperations();
  
  // Apply additional client-side filtering for complex filters not supported by server
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks || [];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(task => filters.status.includes(task.status));
    }

    // Apply category filter
    if (filters.category.length > 0) {
      filtered = filtered.filter(task => filters.category.includes(task.category));
    }

    // Apply difficulty filter
    if (filters.difficulty.length > 0) {
      filtered = filtered.filter(task => filters.difficulty.includes(task.difficulty));
    }

    // Apply priority filter
    if (filters.priority.length > 0) {
      filtered = filtered.filter(task => filters.priority.includes(task.priority));
    }

    // Apply date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter(task => {
        if (!task.deadline) return false;
        const taskDate = new Date(task.deadline);
        const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
        const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;
        
        if (startDate && taskDate < startDate) return false;
        if (endDate && taskDate > endDate) return false;
        return true;
      });
    }

    // Apply tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(task => 
        filters.tags.some(filterTag => 
          task.tags.some(taskTag => taskTag.toLowerCase().includes(filterTag.toLowerCase()))
        )
      );
    }

    // Sort tasks
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'deadline':
          aValue = a.deadline ? new Date(a.deadline) : new Date('9999-12-31');
          bValue = b.deadline ? new Date(b.deadline) : new Date('9999-12-31');
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'difficulty':
          const difficultyOrder = { hard: 3, medium: 2, easy: 1 };
          aValue = difficultyOrder[a.difficulty];
          bValue = difficultyOrder[b.difficulty];
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [tasks, filters, sortField, sortOrder]);

  // Pagination logic
  const totalTasks = filteredAndSortedTasks.length;
  const totalPages = Math.ceil(totalTasks / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTasks = filteredAndSortedTasks.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleCreateTask = async (taskData: CreateTaskRequest | UpdateTaskRequest) => {
    try {
      await createTask.mutateAsync(taskData as CreateTaskRequest);
      setShowTaskForm(false);
      toast.success('Task created successfully!');
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleUpdateTask = async (taskData: CreateTaskRequest | UpdateTaskRequest) => {
    if (!editingTask) return;
    
    try {
      await updateTask.mutateAsync({ taskId: editingTask._id, updateData: taskData as UpdateTaskRequest });
      setEditingTask(null);
      toast.success('Task updated successfully!');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const task = tasks?.find((t: Task) => t._id === taskId);
    if (!task) return;
    
    try {
      await deleteTask.mutateAsync({ taskId, taskTitle: task.title });
      setDeletingTask(null);
      toast.success('Task deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    const task = tasks?.find((t: Task) => t._id === taskId);
    if (!task) return;

    try {
      await completeTask.mutateAsync(taskId);
      setCompletionAnimation({ isVisible: true, task });
    } catch (error) {
      toast.error('Failed to complete task');
    }
  };

  const handleStatusChange = async (taskId: string, status: Task['status']) => {
    try {
      await updateTaskStatus.mutateAsync({ taskId, status });
      toast.success('Task status updated!');
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: [],
      category: [],
      difficulty: [],
      priority: [],
      dateRange: { start: '', end: '' },
      tags: [],
    });
  };

  const handleAnimationComplete = () => {
    setCompletionAnimation({ isVisible: false, task: null });
    toast.success('🎉 Task completed! XP and coins earned!');
  };

  const handleBulkUpdate = async (taskIds: string[], updateData: any) => {
    try {
      await bulkUpdateTasks.mutateAsync({ taskIds, updateData });
      setSelectedTasks([]);
      toast.success(`Updated ${taskIds.length} task${taskIds.length !== 1 ? 's' : ''} successfully!`);
    } catch (error) {
      toast.error('Failed to update tasks');
    }
  };

  const handleBulkDelete = async (taskIds: string[]) => {
    try {
      await bulkDeleteTasks.mutateAsync(taskIds);
      setSelectedTasks([]);
      toast.success(`Deleted ${taskIds.length} task${taskIds.length !== 1 ? 's' : ''} successfully!`);
    } catch (error) {
      toast.error('Failed to delete tasks');
    }
  };

  const activeFiltersCount = Object.values(filters).reduce((count, value) => {
    if (Array.isArray(value)) return count + value.length;
    if (typeof value === 'object' && value !== null) {
      return count + Object.values(value).filter(v => v !== '').length;
    }
    return count + (value ? 1 : 0);
  }, 0);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tasks</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your tasks and boost your productivity
            </p>
          </div>
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowBulkOperations(!showBulkOperations)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showBulkOperations
                  ? 'bg-purple-500 hover:bg-purple-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'
              }`}
            >
              <CheckSquare size={20} />
              Bulk Edit
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowTaskForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <Plus size={20} />
              New Task
            </motion.button>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              <Filter size={20} />
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </motion.button>
            <div className="flex items-center gap-2">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="createdAt">Created Date</option>
                <option value="deadline">Deadline</option>
                <option value="priority">Priority</option>
                <option value="difficulty">Difficulty</option>
                <option value="title">Title</option>
              </select>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {sortOrder === 'asc' ? <SortAsc size={20} /> : <SortDesc size={20} />}
              </motion.button>
            </div>
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Grid size={18} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <List size={18} />
              </motion.button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <TaskFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  onClearFilters={clearFilters}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showBulkOperations && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <BulkTaskOperations
                tasks={filteredAndSortedTasks}
                selectedTasks={selectedTasks}
                onSelectionChange={setSelectedTasks}
                onBulkUpdate={handleBulkUpdate}
                onBulkDelete={handleBulkDelete}
                loading={bulkUpdateTasks.isPending || bulkDeleteTasks.isPending}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-6">
          {filteredAndSortedTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {filters.search || activeFiltersCount > 0 ? 'No tasks match your filters' : 'No tasks yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {filters.search || activeFiltersCount > 0 
                  ? 'Try adjusting your search or filters to find tasks.'
                  : 'Create your first task to get started on your productivity journey!'
                }
              </p>
              {(filters.search || activeFiltersCount > 0) ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Clear Filters
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowTaskForm(true)}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Create Your First Task
                </motion.button>
              )}
            </div>
          ) : (
            <motion.div
              layout
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              <AnimatePresence>
                {paginatedTasks.map((task) => (
                  <motion.div
                    key={task._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TaskCard
                      task={task}
                      onComplete={handleCompleteTask}
                      onEdit={setEditingTask}
                      onDelete={(taskId) => {
                        const taskToDelete = tasks?.find(t => t._id === taskId);
                        if (taskToDelete) {
                          setDeletingTask(taskToDelete);
                        }
                      }}
                      onStatusChange={handleStatusChange}
                      showActions={true}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {filteredAndSortedTasks.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Task Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {filteredAndSortedTasks.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {filteredAndSortedTasks.filter(t => t.status === TASK_STATUS.PENDING).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {filteredAndSortedTasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {filteredAndSortedTasks.filter(t => t.status === TASK_STATUS.COMPLETED).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
              </div>
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 rounded-lg border ${
                  currentPage === page
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
        {totalTasks > 0 && (
          <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
            Showing {startIndex + 1} to {Math.min(endIndex, totalTasks)} of {totalTasks} tasks
          </div>
        )}
      </div>

      <AnimatePresence>
        {showTaskForm && (
          <TaskForm
            onSubmit={handleCreateTask}
            onCancel={() => setShowTaskForm(false)}
            loading={createTask.isPending}
          />
        )}
        {editingTask && (
          <TaskForm
            task={editingTask}
            onSubmit={handleUpdateTask}
            onCancel={() => setEditingTask(null)}
            loading={updateTask.isPending}
          />
        )}
        {deletingTask && (
          <DeleteTaskModal
            isOpen={true}
            task={deletingTask}
            onConfirm={() => handleDeleteTask(deletingTask._id)}
            onCancel={() => setDeletingTask(null)}
            isDeleting={deleteTask.isPending}
          />
        )}
      </AnimatePresence>

      <TaskCompletionAnimation
        isVisible={completionAnimation.isVisible}
        xpEarned={completionAnimation.task?.xpValue || 0}
        coinsEarned={completionAnimation.task?.coinsValue || 0}
        taskTitle={completionAnimation.task?.title || ''}
        onAnimationComplete={handleAnimationComplete}
      />
    </div>
  );
};

export default Tasks;
