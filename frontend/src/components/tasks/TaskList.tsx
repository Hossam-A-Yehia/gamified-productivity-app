import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskCard } from './TaskCard';
import type { Task } from '../../types/task';

interface TaskListProps {
  tasks: Task[];
  loading?: boolean;
  error?: string | null;
  onComplete?: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: Task['status']) => void;
  emptyMessage?: string;
  showActions?: boolean;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  loading = false,
  error = null,
  onComplete,
  onEdit,
  onDelete,
  onStatusChange,
  emptyMessage = "No tasks found",
  showActions = true,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div className="w-16 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
            <div className="w-3/4 h-6 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
            <div className="w-full h-4 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
            <div className="flex gap-2 mb-4">
              <div className="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div className="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="w-20 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center"
      >
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">
          Error Loading Tasks
        </h3>
        <p className="text-red-600 dark:text-red-400">
          {error}
        </p>
      </motion.div>
    );
  }

  if (tasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center"
      >
        <div className="text-gray-400 text-6xl mb-4">📝</div>
        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
          {emptyMessage}
        </h3>
        <p className="text-gray-500 dark:text-gray-500">
          Create your first task to get started on your productivity journey!
        </p>
      </motion.div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
      <AnimatePresence mode="popLayout">
        {tasks?.map((task) => (
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
              onComplete={onComplete}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
              showActions={showActions}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
