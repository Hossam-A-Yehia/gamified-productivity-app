import React, { useState, Suspense, lazy } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ROUTES, TASK_STATUS, DASHBOARD_TABS, SORT_ORDER, LOADING_STATES, type DashboardTab } from '../utils/constants';
import { useTasks, useTaskStats, useOverdueTasks, useCreateTask, useCompleteTask, useUpdateTaskStatus, useDeleteTask, useUpdateTask } from '../hooks/useTasks';
import { DeleteTaskModal } from '../components/tasks/DeleteTaskModal';
import { RewardNotification } from '../components/gamification/RewardNotification';
import { OverdueTasksAlert } from '../components/dashboard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../types/task';

const WelcomeBanner = lazy(() => import('../components/dashboard/WelcomeBanner').then(module => ({ default: module.WelcomeBanner })));
const UserStatsCards = lazy(() => import('../components/dashboard/UserStatsCards').then(module => ({ default: module.UserStatsCards })));
const XPSection = lazy(() => import('../components/dashboard/XPSection').then(module => ({ default: module.XPSection })));
const TaskStatsGrid = lazy(() => import('../components/dashboard/TaskStatsGrid').then(module => ({ default: module.TaskStatsGrid })));
const TaskManagementSection = lazy(() => import('../components/dashboard/TaskManagementSection').then(module => ({ default: module.TaskManagementSection })));

const TaskForm = lazy(() => import('../components/tasks/TaskForm').then(module => ({ default: module.TaskForm })));

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
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4 animate-spin" />
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
      
      <header className="relative backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-white/20 dark:border-gray-700/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4 hover:scale-[1.01] transition-transform duration-200">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🎮</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  GameTask Pro
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Level up your productivity</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <button
                onClick={() => navigate(ROUTES.ACHIEVEMENTS)}
                className="cursor-pointer bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
              >
                <span>🏆</span>
                <span className="hidden sm:inline">Achievements</span>
              </button>
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Level {user.level} Player</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="cursor-pointer bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg transition-all duration-200 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoggingOut ? LOADING_STATES.SIGNING_OUT : LOADING_STATES.SIGN_OUT}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Suspense fallback={<LoadingSpinner size="sm" message="Loading welcome section..." />}>
          <WelcomeBanner
            userName={user.name}
            completedTasks={taskStats?.completed || 0}
            streak={user.streak}
            onCreateTask={() => setShowTaskForm(true)}
          />
        </Suspense>

        <Suspense fallback={<LoadingSpinner size="sm" message="Loading stats..." />}>
          <UserStatsCards
            level={user.level}
            xp={user.xp}
            coins={user.coins}
            streak={user.streak}
          />
        </Suspense>

        <Suspense fallback={<LoadingSpinner size="sm" message="Loading XP section..." />}>
          <XPSection currentXP={user.xp} />
        </Suspense>

        {taskStats && (
          <Suspense fallback={<LoadingSpinner size="sm" message="Loading task stats..." />}>
            <TaskStatsGrid taskStats={taskStats} />
          </Suspense>
        )}

        <OverdueTasksAlert overdueTasks={overdueTasks || []} />

        <Suspense fallback={<LoadingSpinner size="sm" message="Loading task management..." />}>
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
        </Suspense>
      </main>

      <AnimatePresence>
        {showTaskForm && (
          <Suspense fallback={<LoadingSpinner message="Loading task form..." />}>
            <TaskForm
              task={editingTask || undefined}
              onSubmit={handleTaskFormSubmit}
              onCancel={handleCloseTaskForm}
              loading={createTaskMutation.isPending || updateTaskMutation.isPending}
            />
          </Suspense>
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
