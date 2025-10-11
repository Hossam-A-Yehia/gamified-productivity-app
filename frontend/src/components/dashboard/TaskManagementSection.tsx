import React from 'react';
import { motion } from 'framer-motion';
import { TaskList } from '../tasks/TaskList';
import { Pagination } from '../common/Pagination';
import type { Task } from '../../types/task';

interface TaskStats {
  pending: number;
  inProgress: number;
  completed: number;
}

interface TaskManagementSectionProps {
  activeTab: 'overview' | 'pending' | 'in_progress' | 'completed';
  tasks: Task[];
  tasksLoading: boolean;
  tasksError: string | null;
  taskStats: TaskStats | undefined;
  tasksCount: number;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onTabChange: (tab: 'overview' | 'pending' | 'in_progress' | 'completed') => void;
  onPageChange: (page: number) => void;
  onCreateTask: () => void;
  onCompleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
}

export const TaskManagementSection: React.FC<TaskManagementSectionProps> = ({
  activeTab,
  tasks,
  tasksLoading,
  tasksError,
  taskStats,
  tasksCount,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onTabChange,
  onPageChange,
  onCreateTask,
  onCompleteTask,
  onEditTask,
  onDeleteTask,
  onStatusChange
}) => {
  const tabs = [
    { key: 'overview', label: 'Recent', count: tasksCount, icon: '🕰️' },
    { key: 'pending', label: 'Pending', count: taskStats?.pending || 0, icon: '⏳' },
    { key: 'in_progress', label: 'Active', count: taskStats?.inProgress || 0, icon: '⚡' },
    { key: 'completed', label: 'Done', count: taskStats?.completed || 0, icon: '✅' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0 }}
      className="relative overflow-hidden backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-t-3xl"></div>
        <div className="relative z-10 border-b border-white/20 dark:border-gray-700/50">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  <span className="mr-3">📋</span>
                  Task Management
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Organize and track your productivity journey
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCreateTask}
                className="cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transition-all duration-200 flex items-center space-x-2"
              >
                <span>✨</span>
                <span>New Task</span>
              </motion.button>
            </div>
            
            <nav className="flex space-x-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-2xl p-1 backdrop-blur-sm">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.key}
                  onClick={() => onTabChange(tab.key as any)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`cursor-pointer flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
                    activeTab === tab.key
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    activeTab === tab.key
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                  }`}>
                    {tab.count}
                  </span>
                </motion.button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="relative p-8">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-500/5 rounded-b-3xl"></div>
        <div className="relative z-10">
          <TaskList
            tasks={tasks}
            loading={tasksLoading}
            error={tasksError}
            onComplete={onCompleteTask}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onStatusChange={onStatusChange}
            emptyMessage={
              activeTab === 'overview' 
                ? "No tasks yet. Create your first task to get started!"
                : `No ${activeTab.replace('_', ' ')} tasks`
            }
          />
          
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={onPageChange}
              loading={tasksLoading}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
