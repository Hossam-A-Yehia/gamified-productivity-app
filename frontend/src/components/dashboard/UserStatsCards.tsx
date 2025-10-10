import React from 'react';
import { motion } from 'framer-motion';

interface UserStatsCardsProps {
  level: number;
  xp: number;
  coins: number;
  streak: number;
}

export const UserStatsCards: React.FC<UserStatsCardsProps> = ({
  level,
  xp,
  coins,
  streak
}) => {
  const stats = [
    { 
      label: 'Level', 
      value: level, 
      icon: '🏆', 
      gradient: 'from-amber-400 via-yellow-500 to-orange-600',
      description: 'Current Level',
      badge: level >= 10 ? 'Expert' : level >= 5 ? 'Advanced' : 'Beginner'
    },
    { 
      label: 'Experience', 
      value: xp.toLocaleString(), 
      icon: '⭐', 
      gradient: 'from-purple-500 via-violet-600 to-indigo-700',
      description: 'Total XP Earned',
      badge: `+${Math.floor(xp * 0.1)} this week`
    },
    { 
      label: 'Coins', 
      value: coins.toLocaleString(), 
      icon: '🪙', 
      gradient: 'from-yellow-400 via-amber-500 to-orange-600',
      description: 'Reward Coins',
      badge: 'Spendable'
    },
    { 
      label: 'Streak', 
      value: `${streak}`, 
      icon: '🔥', 
      gradient: 'from-red-500 via-pink-600 to-rose-700',
      description: 'Days Active',
      badge: streak > 7 ? 'On Fire!' : 'Keep Going!'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
          whileHover={{ scale: 1.05, rotateY: 5 }}
          className="group relative overflow-hidden backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6 hover:shadow-2xl transition-all duration-300"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <motion.span 
                  className="text-2xl"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                >
                  {stat.icon}
                </motion.span>
              </div>
              <div className={`px-3 py-1 bg-gradient-to-r ${stat.gradient} text-white text-xs font-bold rounded-full shadow-sm`}>
                {stat.badge}
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.description}
              </p>
              <p className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white group-hover:scale-105 transition-transform duration-300">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 font-medium">
                {stat.label.toUpperCase()}
              </p>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
        </motion.div>
      ))}
    </div>
  );
};
