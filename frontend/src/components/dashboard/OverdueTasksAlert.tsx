import React from 'react';
import { motion } from 'framer-motion';
import type { Task } from '../../types/task';

interface OverdueTasksAlertProps {
  overdueTasks: Task[];
}

export const OverdueTasksAlert: React.FC<OverdueTasksAlertProps> = ({ overdueTasks }) => {
  if (!overdueTasks || overdueTasks.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.9, type: "spring" }}
      className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-r from-red-500/20 via-orange-500/20 to-pink-500/20 dark:from-red-900/40 dark:via-orange-900/40 dark:to-pink-900/40 rounded-3xl shadow-2xl border border-red-200/50 dark:border-red-800/50 p-8"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-pink-500/10 animate-pulse"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
            className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg"
          >
            <span className="text-3xl">⚠️</span>
          </motion.div>
          <div>
            <h3 className="text-2xl font-bold text-red-800 dark:text-red-300 mb-1">
              {overdueTasks.length} Overdue Task{overdueTasks.length !== 1 ? 's' : ''}
            </h3>
            <p className="text-red-600 dark:text-red-400">
              These tasks need your immediate attention!
            </p>
          </div>
        </div>
        <div className="grid gap-3">
          {overdueTasks.slice(0, 3).map((task, index) => (
            <motion.div
              key={task._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 + index * 0.1 }}
              className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm"
            >
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-800 dark:text-red-300 font-medium">{task.title}</span>
            </motion.div>
          ))}
          {overdueTasks.length > 3 && (
            <div className="text-center text-red-600 dark:text-red-400 font-medium mt-2">
              ... and {overdueTasks.length - 3} more overdue tasks
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
