import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Coins, Trophy } from 'lucide-react';
import { useTaskEvents } from '../../hooks/useSocket';
import confetti from "canvas-confetti";

interface CompletionData {
  task: any;
  rewards: { xp: number; coins: number };
  levelUp?: { oldLevel: number; newLevel: number };
}

export const TaskCompletionCelebration: React.FC = () => {
  const [celebrations, setCelebrations] = useState<CompletionData[]>([]);
  const taskEvents = useTaskEvents();

  useEffect(() => {
    const cleanup = taskEvents.onTaskCompleted((data) => {
      // Add celebration to queue
      setCelebrations(prev => [...prev, data]);
      
      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      // Remove celebration after animation
      setTimeout(() => {
        setCelebrations(prev => prev.slice(1));
      }, 3000);
    });

    return cleanup;
  }, [taskEvents]);

  useEffect(() => {
    const cleanup = taskEvents.onLevelUp((data) => {
      // Epic level up celebration
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1']
      });
    });

    return cleanup;
  }, [taskEvents]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {celebrations.map((celebration, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: -50 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border-4 border-green-400">
              <div className="text-center space-y-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <Trophy className="w-8 h-8 text-white" />
                </motion.div>
                
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Task Completed! 🎉
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300">
                  "{celebration.task.title}"
                </p>
                
                <div className="flex justify-center gap-6">
                  <div className="flex items-center gap-2 text-yellow-600">
                    <Star className="w-5 h-5" />
                    <span className="font-semibold">+{celebration.rewards.xp} XP</span>
                  </div>
                  <div className="flex items-center gap-2 text-yellow-500">
                    <Coins className="w-5 h-5" />
                    <span className="font-semibold">+{celebration.rewards.coins} Coins</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default TaskCompletionCelebration;
