import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RewardNotificationProps {
  isVisible: boolean;
  onClose: () => void;
  rewards: {
    xp: number;
    coins: number;
    levelUp?: boolean;
    newLevel?: number;
  };
  taskTitle?: string;
}

export const RewardNotification: React.FC<RewardNotificationProps> = ({
  isVisible,
  onClose,
  rewards,
  taskTitle,
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); 

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <motion.div
            animate={{ 
              boxShadow: [
                '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-purple-50 dark:from-yellow-900/20 dark:to-purple-900/20" />
            
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 0, rotate: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  y: [-20, -60, -100],
                  rotate: [0, 180, 360],
                  x: [0, Math.random() * 40 - 20, Math.random() * 80 - 40]
                }}
                transition={{ 
                  duration: 2,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
                className={`absolute w-2 h-2 rounded-full ${
                  ['bg-yellow-400', 'bg-blue-400', 'bg-green-400', 'bg-red-400', 'bg-purple-400'][i % 5]
                }`}
                style={{
                  left: `${20 + (i * 10)}%`,
                  top: '80%'
                }}
              />
            ))}

            <div className="relative z-10">
              <button
                onClick={onClose}
                className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>

              <div className="text-center mb-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: 3 }}
                  className="text-4xl mb-2"
                >
                  🎉
                </motion.div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {rewards.levelUp ? 'Level Up!' : 'Task Completed!'}
                </h3>
                {taskTitle && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    "{taskTitle}"
                  </p>
                )}
              </div>

              {rewards.levelUp && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                  className="text-center mb-4 p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white"
                >
                  <div className="text-2xl mb-1">🏆</div>
                  <div className="font-bold">Level {rewards.newLevel}!</div>
                  <div className="text-sm opacity-90">You've reached a new level!</div>
                </motion.div>
              )}

              <div className="space-y-3">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⭐</span>
                    <span className="font-medium text-gray-900 dark:text-white">XP Earned</span>
                  </div>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    className="text-lg font-bold text-purple-600 dark:text-purple-400"
                  >
                    +{rewards.xp}
                  </motion.span>
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🪙</span>
                    <span className="font-medium text-gray-900 dark:text-white">Coins Earned</span>
                  </div>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: 'spring' }}
                    className="text-lg font-bold text-yellow-600 dark:text-yellow-400"
                  >
                    +{rewards.coins}
                  </motion.span>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center mt-4 p-2 text-sm text-gray-600 dark:text-gray-400"
              >
                {rewards.levelUp 
                  ? "Amazing work! You're getting stronger! 💪"
                  : "Great job! Keep up the momentum! 🚀"
                }
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
