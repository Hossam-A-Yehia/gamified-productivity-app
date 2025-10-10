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
      gradient: 'from-amber-400 to-orange-500',
      bgGradient: 'from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10',
      description: 'Current Level',
      badge: level >= 10 ? 'Expert' : level >= 5 ? 'Advanced' : 'Rising'
    },
    { 
      label: 'Experience', 
      value: xp.toLocaleString(), 
      icon: '⭐', 
      gradient: 'from-purple-500 to-indigo-600',
      bgGradient: 'from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10',
      description: 'Total XP',
      badge: 'Legendary'
    },
    { 
      label: 'Coins', 
      value: coins.toLocaleString(), 
      icon: '🪙', 
      gradient: 'from-yellow-400 to-amber-500',
      bgGradient: 'from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10',
      description: 'Reward Coins',
      badge: 'Wealthy'
    },
    { 
      label: 'Streak', 
      value: `${streak}`, 
      icon: '🔥', 
      gradient: 'from-red-500 to-pink-600',
      bgGradient: 'from-red-50 to-pink-50 dark:from-red-900/10 dark:to-pink-900/10',
      description: 'Days Active',
      badge: streak > 7 ? 'On Fire!' : streak > 3 ? 'Hot!' : 'Building'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            delay: index * 0.1, 
            type: "spring", 
            stiffness: 100,
            damping: 15
          }}
          whileHover={{ 
            scale: 1.03, 
            y: -4,
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
          }}
          className={`group relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 dark:border-gray-700/50 p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <motion.span 
                  className="text-2xl"
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    repeatDelay: 2,
                    delay: index * 0.5
                  }}
                >
                  {stat.icon}
                </motion.span>
              </div>
              
              <motion.div 
                className={`px-3 py-1 bg-gradient-to-r ${stat.gradient} text-white text-xs font-bold rounded-full shadow-sm`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                whileHover={{ scale: 1.05 }}
              >
                {stat.badge}
              </motion.div>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                {stat.description}
              </p>
              
              <motion.p 
                className="text-4xl font-black text-gray-900 dark:text-white group-hover:scale-105 transition-transform duration-300"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.5 }}
              >
                {stat.value}
              </motion.p>
              
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
                  {stat.label}
                </p>
                <motion.div
                  className={`w-2 h-2 rounded-full bg-gradient-to-r ${stat.gradient}`}
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    delay: index * 0.3
                  }}
                />
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
        </motion.div>
      ))}
    </div>
  );
};
