import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Coins, Zap } from 'lucide-react';
import { useTaskEvents } from '../../hooks/useSocket';
import { useAuth } from '../../hooks/useAuth';

interface StatUpdate {
  id: string;
  type: 'xp' | 'coins' | 'level';
  amount: number;
  newTotal: number;
}

export const LiveStatsCounter: React.FC = () => {
  const { user } = useAuth();
  const taskEvents = useTaskEvents();
  const [updates, setUpdates] = useState<StatUpdate[]>([]);
  const [currentStats, setCurrentStats] = useState({
    xp: user?.xp || 0,
    coins: user?.coins || 0,
    level: user?.level || 1
  });

  useEffect(() => {
    const cleanupXP = taskEvents.onXPGained((data) => {
      const update: StatUpdate = {
        id: Date.now().toString(),
        type: 'xp',
        amount: data.xp.amount,
        newTotal: data.xp.total
      };
      
      setUpdates(prev => [...prev, update]);
      setCurrentStats(prev => ({ ...prev, xp: data.xp.total }));
      
      // Remove update after animation
      setTimeout(() => {
        setUpdates(prev => prev.filter(u => u.id !== update.id));
      }, 2000);
    });

    const cleanupCoins = taskEvents.onCoinsEarned((data) => {
      const update: StatUpdate = {
        id: Date.now().toString() + '_coins',
        type: 'coins',
        amount: data.coins.amount,
        newTotal: data.coins.total
      };
      
      setUpdates(prev => [...prev, update]);
      setCurrentStats(prev => ({ ...prev, coins: data.coins.total }));
      
      setTimeout(() => {
        setUpdates(prev => prev.filter(u => u.id !== update.id));
      }, 2000);
    });

    const cleanupLevel = taskEvents.onLevelUp((data) => {
      const update: StatUpdate = {
        id: Date.now().toString() + '_level',
        type: 'level',
        amount: 1,
        newTotal: data.levelData.newLevel
      };
      
      setUpdates(prev => [...prev, update]);
      setCurrentStats(prev => ({ ...prev, level: data.levelData.newLevel }));
      
      setTimeout(() => {
        setUpdates(prev => prev.filter(u => u.id !== update.id));
      }, 3000);
    });

    return () => {
      cleanupXP();
      cleanupCoins();
      cleanupLevel();
    };
  }, [taskEvents]);

  return (
    <div className="relative">
      {/* Main Stats Display */}
      <div className="flex items-center gap-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
        <motion.div 
          key={currentStats.level}
          animate={{ scale: [1, 1.1, 1] }}
          className="flex items-center gap-2"
        >
          <Zap className="w-5 h-5 text-purple-500" />
          <span className="font-bold text-purple-600 dark:text-purple-400">
            Level {currentStats.level}
          </span>
        </motion.div>
        
        <motion.div 
          key={currentStats.xp}
          animate={{ scale: [1, 1.05, 1] }}
          className="flex items-center gap-2"
        >
          <Star className="w-5 h-5 text-yellow-500" />
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            {currentStats.xp.toLocaleString()} XP
          </span>
        </motion.div>
        
        <motion.div 
          key={currentStats.coins}
          animate={{ scale: [1, 1.05, 1] }}
          className="flex items-center gap-2"
        >
          <Coins className="w-5 h-5 text-yellow-600" />
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            {currentStats.coins.toLocaleString()}
          </span>
        </motion.div>
      </div>

      {/* Floating Updates */}
      <div className="absolute -top-2 left-0 right-0">
        <AnimatePresence>
          {updates.map((update) => (
            <motion.div
              key={update.id}
              initial={{ opacity: 0, y: 0, scale: 0.8 }}
              animate={{ opacity: 1, y: -40, scale: 1 }}
              exit={{ opacity: 0, y: -60, scale: 0.8 }}
              className="absolute left-1/2 transform -translate-x-1/2"
            >
              <div className={`
                px-3 py-1 rounded-full text-sm font-bold shadow-lg
                ${update.type === 'xp' ? 'bg-yellow-500 text-white' : ''}
                ${update.type === 'coins' ? 'bg-yellow-600 text-white' : ''}
                ${update.type === 'level' ? 'bg-purple-500 text-white' : ''}
              `}>
                {update.type === 'level' ? (
                  `🎉 LEVEL UP! Level ${update.newTotal}!`
                ) : (
                  `+${update.amount} ${update.type.toUpperCase()}`
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LiveStatsCounter;
