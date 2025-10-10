import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import { useTasks, useTaskStats, useOverdueTasks, useCreateTask, useCompleteTask, useUpdateTaskStatus, useDeleteTask, useUpdateTask } from '../hooks/useTasks';
import { TaskList } from '../components/tasks/TaskList';
import { TaskForm } from '../components/tasks/TaskForm';
import { XPBar } from '../components/gamification/XPBar';
import { RewardNotification } from '../components/gamification/RewardNotification';
import { Pagination } from '../components/common/Pagination';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../types/task';

const Dashboard: React.FC = () => {
  const { user, logout, isLoggingOut } = useAuth();
  const navigate = useNavigate();
  
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'pending' | 'in_progress' | 'completed'>('overview');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3); 
  const [rewardNotification, setRewardNotification] = useState<{
    isVisible: boolean;
    rewards: { xp: number; coins: number; levelUp?: boolean; newLevel?: number };
    taskTitle?: string;
  }>({ isVisible: false, rewards: { xp: 0, coins: 0 } });

  const { data: tasksData, isLoading: tasksLoading, error: tasksError } = useTasks({ 
    limit: itemsPerPage,
    page: currentPage,
    sortBy: 'createdAt', 
    sortOrder: 'desc' 
  });
  const { data: pendingTasks } = useTasks({ status: 'pending', limit: itemsPerPage, page: activeTab === 'pending' ? currentPage : 1 });
  const { data: inProgressTasks } = useTasks({ status: 'in_progress', limit: itemsPerPage, page: activeTab === 'in_progress' ? currentPage : 1 });
  const { data: completedTasks } = useTasks({ status: 'completed', limit: itemsPerPage, page: activeTab === 'completed' ? currentPage : 1 });
  const { data: taskStats } = useTaskStats();
  const { data: overdueTasks } = useOverdueTasks();

  const createTaskMutation = useCreateTask();
  const completeTaskMutation = useCompleteTask();
  const updateTaskStatusMutation = useUpdateTaskStatus();
  const deleteTaskMutation = useDeleteTask();
  const updateTaskMutation = useUpdateTask();

  const handleLogout = async () => {
    try {
      await logout();
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleCreateTask = async (taskData: CreateTaskRequest) => {
    try {
      await createTaskMutation.mutateAsync(taskData);
      setShowTaskForm(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleUpdateTask = async (taskData: UpdateTaskRequest) => {
    if (!editingTask) return;
    try {
      await updateTaskMutation.mutateAsync({ taskId: editingTask._id, updateData: taskData });
      setEditingTask(null);
      setShowTaskForm(false);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const result = await completeTaskMutation.mutateAsync(taskId);
      const task = tasksData?.tasks?.find((t: Task) => t._id === taskId);
      setRewardNotification({
        isVisible: true,
        rewards: result.rewards,
        taskTitle: task?.title,
      });
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const handleStatusChange = async (taskId: string, status: Task['status']) => {
    try {
      await updateTaskStatusMutation.mutateAsync({ taskId, status });
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTaskMutation.mutateAsync(taskId);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleCloseTaskForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handleTaskFormSubmit = async (taskData: CreateTaskRequest | UpdateTaskRequest) => {
    if (editingTask) {
      await handleUpdateTask(taskData as UpdateTaskRequest);
    } else {
      await handleCreateTask(taskData as CreateTaskRequest);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const getCurrentTasksData = () => {
    switch (activeTab) {
      case 'pending':
        return pendingTasks;
      case 'in_progress':
        return inProgressTasks;
      case 'completed':
        return completedTasks;
      default:
        return tasksData;
    }
  };

  const getCurrentTasks = () => {
    const data = getCurrentTasksData();
    return data?.tasks || [];
  };

  const getCurrentPagination = () => {
    const data = getCurrentTasksData();
    return data?.pagination || { page: 1, limit: itemsPerPage, total: 0, pages: 1 };
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleTabChange = (tab: 'overview' | 'pending' | 'in_progress' | 'completed') => {
    setActiveTab(tab);
    setCurrentPage(1);
  };
  console.log(getCurrentTasks());

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">🎮</span>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Productivity Dashboard
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Welcome back, <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>!
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Level', value: user.level, icon: '🏆', color: 'bg-blue-500' },
            { label: 'XP', value: user.xp.toLocaleString(), icon: '⭐', color: 'bg-purple-500' },
            { label: 'Coins', value: user.coins.toLocaleString(), icon: '🪙', color: 'bg-yellow-500' },
            { label: 'Streak', value: `${user.streak} days`, icon: '🔥', color: 'bg-red-500' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center">
                <div className={`${stat.color} rounded-lg p-3 mr-4`}>
                  <span className="text-xl">{stat.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8"
        >
          <XPBar currentXP={user.xp} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-6 md:mb-0">
              <h2 className="text-3xl font-bold mb-2">
                🎉 Ready to be productive?
              </h2>
              <p className="text-lg opacity-90">
                Level {user.level} • {user.xp.toLocaleString()} XP • {taskStats?.completed || 0} tasks completed
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowTaskForm(true)}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Create New Task
              </motion.button>
            </div>
          </div>
        </motion.div>

        {taskStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{taskStats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{taskStats.pending}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{taskStats.overdue}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Overdue</div>
            </div>
          </motion.div>
        )}

        {overdueTasks && overdueTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-400">
                You have {overdueTasks.length} overdue task{overdueTasks.length !== 1 ? 's' : ''}
              </h3>
            </div>
            <div className="space-y-2">
              {overdueTasks.slice(0, 3).map((task) => (
                <div key={task._id} className="text-sm text-red-700 dark:text-red-400">
                  • {task.title}
                </div>
              ))}
              {overdueTasks.length > 3 && (
                <div className="text-sm text-red-600 dark:text-red-400">
                  ... and {overdueTasks.length - 3} more
                </div>
              )}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8"
        >
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'overview', label: 'Recent Tasks', count: tasksData?.pagination?.total || 0 },
                { key: 'pending', label: 'Pending', count: taskStats?.pending || 0 },
                { key: 'in_progress', label: 'In Progress', count: taskStats?.inProgress || 0 },
                { key: 'completed', label: 'Completed', count: taskStats?.completed || 0 },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            <TaskList
              tasks={getCurrentTasks()}
              loading={tasksLoading}
              error={tasksError?.message || null}
              onComplete={handleCompleteTask}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
              emptyMessage={
                activeTab === 'overview' 
                  ? "No tasks yet. Create your first task to get started!"
                  : `No ${activeTab.replace('_', ' ')} tasks`
              }
            />
            
            <Pagination
              currentPage={getCurrentPagination().page}
              totalPages={getCurrentPagination().pages}
              totalItems={getCurrentPagination().total}
              itemsPerPage={getCurrentPagination().limit}
              onPageChange={handlePageChange}
              loading={tasksLoading}
            />
          </div>
        </motion.div>
      </main>

      <AnimatePresence>
        {showTaskForm && (
          <TaskForm
            task={editingTask || undefined}
            onSubmit={handleTaskFormSubmit}
            onCancel={handleCloseTaskForm}
            loading={createTaskMutation.isPending || updateTaskMutation.isPending}
          />
        )}
      </AnimatePresence>

      <RewardNotification
        isVisible={rewardNotification.isVisible}
        onClose={() => setRewardNotification(prev => ({ ...prev, isVisible: false }))}
        rewards={rewardNotification.rewards}
        taskTitle={rewardNotification.taskTitle}
      />
    </div>
  );
};

export default Dashboard;
