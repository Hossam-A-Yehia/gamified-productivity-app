import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Square, Trash2, Edit3, X, Check } from 'lucide-react';
import type { Task } from '../../types/task';
import { TASK_CATEGORIES, TASK_DIFFICULTIES, TASK_PRIORITIES, TASK_STATUSES } from '../../types/task';

interface BulkTaskOperationsProps {
  tasks: Task[];
  selectedTasks: string[];
  onSelectionChange: (taskIds: string[]) => void;
  onBulkUpdate: (taskIds: string[], updateData: any) => Promise<void>;
  onBulkDelete: (taskIds: string[]) => Promise<void>;
  loading?: boolean;
}

export const BulkTaskOperations: React.FC<BulkTaskOperationsProps> = ({
  tasks,
  selectedTasks,
  onSelectionChange,
  onBulkUpdate,
  onBulkDelete,
  loading = false,
}) => {
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkUpdateData, setBulkUpdateData] = useState<{
    category?: string;
    difficulty?: string;
    priority?: string;
    status?: string;
  }>({});

  const isAllSelected = tasks.length > 0 && selectedTasks.length === tasks.length;
  const isIndeterminate = selectedTasks.length > 0 && selectedTasks.length < tasks.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(tasks.map(task => task._id));
    }
  };

  const handleTaskSelection = (taskId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedTasks, taskId]);
    } else {
      onSelectionChange(selectedTasks.filter(id => id !== taskId));
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedTasks.length === 0) return;
    
    const updateData = Object.fromEntries(
      Object.entries(bulkUpdateData).filter(([_, value]) => value !== undefined && value !== '')
    );
    
    if (Object.keys(updateData).length === 0) return;

    await onBulkUpdate(selectedTasks, updateData);
    setBulkUpdateData({});
    setShowBulkActions(false);
    onSelectionChange([]);
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedTasks.length} task${selectedTasks.length !== 1 ? 's' : ''}?`)) {
      await onBulkDelete(selectedTasks);
      onSelectionChange([]);
    }
  };

  const clearSelection = () => {
    onSelectionChange([]);
    setShowBulkActions(false);
    setBulkUpdateData({});
  };

  return (
    <div className="space-y-4">
      {/* Selection Header */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSelectAll}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {isAllSelected ? (
              <CheckSquare className="w-5 h-5 text-blue-600" />
            ) : isIndeterminate ? (
              <div className="w-5 h-5 bg-blue-600 rounded border-2 border-blue-600 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-sm" />
              </div>
            ) : (
              <Square className="w-5 h-5 text-gray-400" />
            )}
            Select All ({tasks.length})
          </motion.button>
          
          {selectedTasks.length > 0 && (
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
            </div>
          )}
        </div>

        <AnimatePresence>
          {selectedTasks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-2"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm transition-colors"
              >
                <Edit3 className="w-4 h-4 inline mr-1" />
                Edit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBulkDelete}
                disabled={loading}
                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4 inline mr-1" />
                Delete
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearSelection}
                className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded-md text-sm transition-colors"
              >
                <X className="w-4 h-4 inline mr-1" />
                Clear
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showBulkActions && selectedTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Bulk Update {selectedTasks.length} Task{selectedTasks.length !== 1 ? 's' : ''}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={bulkUpdateData.category || ''}
                  onChange={(e) => setBulkUpdateData(prev => ({ ...prev, category: e.target.value || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">No change</option>
                  {TASK_CATEGORIES.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Difficulty
                </label>
                <select
                  value={bulkUpdateData.difficulty || ''}
                  onChange={(e) => setBulkUpdateData(prev => ({ ...prev, difficulty: e.target.value || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">No change</option>
                  {TASK_DIFFICULTIES.map(difficulty => (
                    <option key={difficulty.value} value={difficulty.value}>
                      {difficulty.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  value={bulkUpdateData.priority || ''}
                  onChange={(e) => setBulkUpdateData(prev => ({ ...prev, priority: e.target.value || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">No change</option>
                  {TASK_PRIORITIES.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={bulkUpdateData.status || ''}
                  onChange={(e) => setBulkUpdateData(prev => ({ ...prev, status: e.target.value || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">No change</option>
                  {TASK_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowBulkActions(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBulkUpdate}
                disabled={loading || Object.values(bulkUpdateData).every(v => !v)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </div>
                ) : (
                  <>
                    <Check className="w-4 h-4 inline mr-1" />
                    Update Tasks
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="space-y-2">
        {tasks.map(task => (
          <div key={task._id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTaskSelection(task._id, !selectedTasks.includes(task._id))}
              className="flex-shrink-0"
            >
              {selectedTasks.includes(task._id) ? (
                <CheckSquare className="w-5 h-5 text-blue-600" />
              ) : (
                <Square className="w-5 h-5 text-gray-400" />
              )}
            </motion.button>
            <div className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
              {task.title}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="capitalize">{task.category}</span>
              <span>•</span>
              <span className="capitalize">{task.priority}</span>
              <span>•</span>
              <span className="capitalize">{task.status.replace('_', ' ')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
