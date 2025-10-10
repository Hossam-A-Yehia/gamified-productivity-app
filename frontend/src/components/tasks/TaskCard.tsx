import React from 'react';
import { motion } from 'framer-motion';
import type { Task } from '../../types/task';
import { TASK_CATEGORIES, TASK_DIFFICULTIES, TASK_PRIORITIES, TASK_STATUSES } from '../../types/task';
import { TASK_STATUS } from '../../utils/constants';

interface TaskCardProps {
  task: Task;
  onComplete?: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: Task['status']) => void;
  showActions?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onComplete,
  onEdit,
  onDelete,
  onStatusChange,
  showActions = true,
}) => {
  const category = TASK_CATEGORIES.find(c => c.value === task.category);
  const difficulty = TASK_DIFFICULTIES.find(d => d.value === task.difficulty);
  const priority = TASK_PRIORITIES.find(p => p.value === task.priority);
  const status = TASK_STATUSES.find(s => s.value === task.status);

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== TASK_STATUS.COMPLETED;
  const daysUntilDeadline = task.deadline 
    ? Math.ceil((new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const handleStatusChange = (newStatus: Task['status']) => {
    if (newStatus === TASK_STATUS.COMPLETED && onComplete) {
      onComplete(task._id);
    } else if (onStatusChange) {
      onStatusChange(task._id, newStatus);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${
        isOverdue ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-block w-3 h-3 rounded-full ${category?.color || 'bg-gray-500'}`} />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {category?.label || task.category}
            </span>
            {isOverdue && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                Overdue
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-3">
              {task.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status?.color}`}>
          {status?.label || task.status}
        </span>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${difficulty?.color} bg-gray-100 dark:bg-gray-700`}>
          {difficulty?.label || task.difficulty}
        </span>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priority?.color} bg-gray-100 dark:bg-gray-700`}>
          {priority?.label || task.priority}
        </span>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1">
          <span className="text-purple-500">⭐</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {task.xpValue} XP
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-yellow-500">🪙</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {task.coinsValue} coins
          </span>
        </div>
      </div>

      {task.deadline && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-gray-400">📅</span>
          <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
            {isOverdue 
              ? `Overdue by ${Math.abs(daysUntilDeadline!)} day${Math.abs(daysUntilDeadline!) !== 1 ? 's' : ''}`
              : daysUntilDeadline === 0 
                ? 'Due today'
                : daysUntilDeadline === 1
                  ? 'Due tomorrow'
                  : `Due in ${daysUntilDeadline} days`
            }
          </span>
        </div>
      )}

      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {task.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {showActions && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {task.status !== TASK_STATUS.COMPLETED && (
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value as Task['status'])}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Complete</option>
              </select>
            )}
            {task.status === TASK_STATUS.COMPLETED && (
              <span className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-1">
                ✅ Completed
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {onEdit && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onEdit(task)}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                title="Edit task"
              >
                ✏️
              </motion.button>
            )}
            {onDelete && task.status !== TASK_STATUS.COMPLETED && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDelete(task._id)}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                title="Delete task"
              >
                🗑️
              </motion.button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};
