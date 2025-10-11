import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ROUTES, TASK_STATUS, DASHBOARD_TABS, SORT_ORDER, LOADING_STATES, type DashboardTab } from '../utils/constants';
import { useTasks, useTaskStats, useOverdueTasks, useCreateTask, useCompleteTask, useUpdateTaskStatus, useDeleteTask, useUpdateTask } from '../hooks/useTasks';
import { TaskForm } from '../components/tasks/TaskForm';
import { DeleteTaskModal } from '../components/tasks/DeleteTaskModal';
import { RewardNotification } from '../components/gamification/RewardNotification';
import { WelcomeBanner, UserStatsCards, XPSection, TaskStatsGrid, OverdueTasksAlert, TaskManagementSection } from '../components/dashboard';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../types/task';

const Dashboard: React.FC = () => {
  const { user, logout, isLoggingOut } = useAuth();
  const navigate = useNavigate();
  
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>(DASHBOARD_TABS.OVERVIEW);
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
    sortOrder: SORT_ORDER.DESC 
  });
  const { data: pendingTasks } = useTasks({ status: TASK_STATUS.PENDING, limit: itemsPerPage, page: activeTab === DASHBOARD_TABS.PENDING ? currentPage : 1 });
  const { data: inProgressTasks } = useTasks({ status: TASK_STATUS.IN_PROGRESS, limit: itemsPerPage, page: activeTab === DASHBOARD_TABS.IN_PROGRESS ? currentPage : 1 });
  const { data: completedTasks } = useTasks({ status: TASK_STATUS.COMPLETED, limit: itemsPerPage, page: activeTab === DASHBOARD_TABS.COMPLETED ? currentPage : 1 });
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
      const task = getCurrentTasks().find((t: Task) => t._id === taskId);
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

  const handleDeleteTask = (taskId: string) => {
    const task = getCurrentTasks().find((t: Task) => t._id === taskId);
    if (task) {
      setTaskToDelete(task);
      setShowDeleteModal(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      await deleteTaskMutation.mutateAsync({ 
        taskId: taskToDelete._id, 
        taskTitle: taskToDelete.title || 'Unknown Task' 
      });
      setShowDeleteModal(false);
      setTaskToDelete(null);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setTaskToDelete(null);
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
      case DASHBOARD_TABS.PENDING:
        return pendingTasks;
      case DASHBOARD_TABS.IN_PROGRESS:
        return inProgressTasks;
      case DASHBOARD_TABS.COMPLETED:
        return completedTasks;
      default:
        return tasksData;
    }
  };

  const getCurrentTasks = () => {
    const data = getCurrentTasksData();
    return Array.isArray(data) ? data : data?.tasks || [];
  };

  const getCurrentPagination = () => {
    const data = getCurrentTasksData();
    if (Array.isArray(data)) {
      return { page: currentPage, limit: itemsPerPage, total: data.length, pages: Math.ceil(data.length / itemsPerPage) };
    }
    return data?.pagination || { page: 1, limit: itemsPerPage, total: 0, pages: 1 };
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleTabChange = (tab: DashboardTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)`
        }}></div>
      </div>
      
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-white/20 dark:border-gray-700/50 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.div 
              className="flex items-center space-x-4"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🎮</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  GameTask Pro
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Level up your productivity</p>
              </div>
            </motion.div>
            
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Level {user.level} Player</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="cursor-pointer bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                {isLoggingOut ? LOADING_STATES.SIGNING_OUT : LOADING_STATES.SIGN_OUT}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <WelcomeBanner
          userName={user.name}
          completedTasks={taskStats?.completed || 0}
          streak={user.streak}
          onCreateTask={() => setShowTaskForm(true)}
        />

        <UserStatsCards
          level={user.level}
          xp={user.xp}
          coins={user.coins}
          streak={user.streak}
        />

        <XPSection currentXP={user.xp} />

        {taskStats && <TaskStatsGrid taskStats={taskStats} />}

        <OverdueTasksAlert overdueTasks={overdueTasks || []} />

        <TaskManagementSection
          activeTab={activeTab}
          tasks={getCurrentTasks()}
          tasksLoading={tasksLoading}
          tasksError={tasksError?.message || null}
          taskStats={taskStats}
          tasksCount={Array.isArray(tasksData) ? tasksData.length : (tasksData?.pagination?.total || 0)}
          currentPage={getCurrentPagination().page}
          totalPages={getCurrentPagination().pages}
          totalItems={getCurrentPagination().total}
          itemsPerPage={getCurrentPagination().limit}
          onTabChange={handleTabChange}
          onPageChange={handlePageChange}
          onCreateTask={() => setShowTaskForm(true)}
          onCompleteTask={handleCompleteTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onStatusChange={handleStatusChange}
        />
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

      <DeleteTaskModal
        isOpen={showDeleteModal}
        task={taskToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={deleteTaskMutation.isPending}
      />
    </div>
  );
};

export default Dashboard;
