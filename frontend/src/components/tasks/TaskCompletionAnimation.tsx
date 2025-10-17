import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Star, Coins } from 'lucide-react';

interface TaskCompletionAnimationProps {
  isVisible: boolean;
  xpEarned: number;
  coinsEarned: number;
  taskTitle: string;
  onAnimationComplete: () => void;
}

export const TaskCompletionAnimation: React.FC<TaskCompletionAnimationProps> = ({
  isVisible,
  xpEarned,
  coinsEarned,
  taskTitle,
  onAnimationComplete,
}) => {
  const [showRewards, setShowRewards] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setShowRewards(true);
      }, 800);

      const completeTimer = setTimeout(() => {
        onAnimationComplete();
      }, 3000);

      return () => {
        clearTimeout(timer);
        clearTimeout(completeTimer);
      };
    }
  }, [isVisible, onAnimationComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    opacity: 0, 
                    scale: 0,
                    x: Math.random() * 400 - 200,
                    y: Math.random() * 400 - 200,
                  }}
                  animate={{ 
                    opacity: [0, 1, 0], 
                    scale: [0, 1, 0],
                    y: [0, -100],
                  }}
                  transition={{ 
                    duration: 2,
                    delay: Math.random() * 1,
                    repeat: Infinity,
                    repeatDelay: Math.random() * 2,
                  }}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                />
              ))}
            </div>
            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.8, delay: 0.2 }}
                className="flex justify-center mb-4"
              >
                <div className="relative">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="absolute inset-0 rounded-full border-4 border-green-500 opacity-30"
                  />
                </div>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
              >
                Task Completed! 🎉
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-2"
              >
                "{taskTitle}"
              </motion.p>
              <AnimatePresence>
                {showRewards && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", duration: 0.6 }}
                    className="space-y-4"
                  >
                    <div className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Rewards Earned:
                    </div>
                    
                    <div className="flex justify-center gap-8">
                      <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col items-center"
                      >
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full mb-2"
                        >
                          <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </motion.div>
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          +{xpEarned}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          XP
                        </div>
                      </motion.div>
                      <motion.div
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col items-center"
                      >
                        <motion.div
                          animate={{ 
                            scale: [1, 1.1, 1],
                            rotate: [0, 10, -10, 0],
                          }}
                          transition={{ 
                            duration: 1.5, 
                            repeat: Infinity,
                            repeatType: "reverse",
                          }}
                          className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full mb-2"
                        >
                          <Coins className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                        </motion.div>
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                          +{coinsEarned}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Coins
                        </div>
                      </motion.div>
                    </div>
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onAnimationComplete}
                      className="mt-6 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                    >
                      Awesome!
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
