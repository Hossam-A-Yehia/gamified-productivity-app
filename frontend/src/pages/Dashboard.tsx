import React, { useState, Suspense, lazy } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { TASK_STATUS, DASHBOARD_TABS, SORT_ORDER, type DashboardTab } from '../utils/constants';
import { useTasks, useTaskStats, useOverdueTasks, useCreateTask, useCompleteTask, useUpdateTaskStatus, useDeleteTask, useUpdateTask } from '../hooks/useTasks';
import { DeleteTaskModal } from '../components/tasks/DeleteTaskModal';
import { RewardNotification } from '../components/gamification/RewardNotification';
import { OverdueTasksAlert } from '../components/dashboard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import LiveStatsCounter from '../components/gamification/LiveStatsCounter';
import LiveLeaderboard from '../components/leaderboard/LiveLeaderboard';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../types/task';

const WelcomeBanner = lazy(() => import('../components/dashboard/WelcomeBanner').then(module => ({ default: module.WelcomeBanner })));
const UserStatsCards = lazy(() => import('../components/dashboard/UserStatsCards').then(module => ({ default: module.UserStatsCards })));
const XPSection = lazy(() => import('../components/dashboard/XPSection').then(module => ({ default: module.XPSection })));
const TaskStatsGrid = lazy(() => import('../components/dashboard/TaskStatsGrid').then(module => ({ default: module.TaskStatsGrid })));
const TaskManagementSection = lazy(() => import('../components/dashboard/TaskManagementSection').then(module => ({ default: module.TaskManagementSection })));

const TaskForm = lazy(() => import('../components/tasks/TaskForm').then(module => ({ default: module.TaskForm })));

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>(DASHBOARD_TABS.OVERVIEW);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(2); 
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Suspense fallback={<LoadingSpinner size="sm" message="Loading welcome section..." />}>
        <WelcomeBanner
          userName={user.name}
          completedTasks={taskStats?.completed || 0}
          streak={user.streak}
          onCreateTask={() => setShowTaskForm(true)}
        />
      </Suspense>

      {/* Live Stats Counter with Real-time Updates */}
      <LiveStatsCounter />

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

      {/* Live Leaderboard Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
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
        </div>
        
        {/* Live Leaderboard Sidebar */}
        <div className="lg:col-span-1">
          <LiveLeaderboard 
            initialData={[]}
            currentUserId={user.id}
          />
        </div>
      </div>

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
