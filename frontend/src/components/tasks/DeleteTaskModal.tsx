import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Task } from '../../types/task';

interface DeleteTaskModalProps {    
  isOpen: boolean;
  task: Task | null;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export const DeleteTaskModal: React.FC<DeleteTaskModalProps> = ({
  isOpen,
  task,
  onConfirm,
  onCancel,
  isDeleting = false
}) => {
  if (!task) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-red-500 to-pink-500 p-6 text-white relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-2xl">⚠️</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Delete Task</h3>
                      <p className="text-red-100 text-sm">This action cannot be undone</p>
                    </div>
                  </div>
                  <button
                    onClick={onCancel}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <span className="text-xl">✕</span>
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Are you sure you want to delete this task?
                  </p>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border-l-4 border-red-500">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="capitalize bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className="capitalize bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                        {task.difficulty}
                      </span>
                      {task.category && (
                        <span className="capitalize bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                          {task.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <span className="text-amber-600 dark:text-amber-400 text-lg flex-shrink-0">⚠️</span>
                    <div>
                      <h5 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                        Warning
                      </h5>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Deleting this task will permanently remove it from your account. 
                        Any XP or coins earned from this task will remain in your account.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onCancel}
                    disabled={isDeleting}
                    className="cursor-pointer flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onConfirm}
                    disabled={isDeleting}
                    className="cursor-pointer flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {isDeleting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-lg">🗑️</span>
                        <span>Delete Task</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
