import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface UserStatsCardsProps {
  level: number;
  xp: number;
  coins: number;
  streak: number;
}

const StatCard = ({ stat, index }: { stat: any; index: number }) => {
  return (
    <motion.div
      key={stat.label}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`relative bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-6 flex flex-col justify-between h-full transition-transform duration-200`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl"></div>

      <div className="flex items-start justify-between">
        <div className={`px-3 py-1 bg-gradient-to-r ${stat.gradient} text-white text-xs font-bold rounded-full shadow-lg`}>
          {stat.badge}
        </div>
        <div className={`w-16 h-16 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
          <span className="text-3xl">{stat.icon}</span>
        </div>
      </div>

      <div className="text-left">
        <p className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">
          {stat.label}
        </p>
        <p className={`text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r ${stat.gradient}`}>
          {stat.value}
        </p>
      </div>

      <div className="text-xs text-slate-400">
        {stat.description}
      </div>
    </motion.div>
  );
};


export const UserStatsCards: React.FC<UserStatsCardsProps> = ({ level, xp, coins, streak }) => {
  const stats = useMemo(() => [
    {
      label: 'Level',
      value: level,
      icon: '🏆',
      gradient: 'from-amber-400 via-yellow-400 to-orange-500',
      description: 'Your current rank',
      badge: level >= 10 ? 'Master' : level >= 5 ? 'Pro' : 'Rookie',
    },
    {
      label: 'Experience',
      value: xp.toLocaleString(),
      icon: '⭐',
      gradient: 'from-purple-500 via-violet-500 to-indigo-600',
      description: 'Total XP earned',
      badge: 'Legendary',
    },
    {
      label: 'Coins',
      value: coins.toLocaleString(),
      icon: '🪙',
      gradient: 'from-lime-400 via-green-400 to-emerald-500',
      description: 'Your treasure chest',
      badge: 'Wealthy',
    },
    {
      label: 'Streak',
      value: `${streak}`,
      icon: '🔥',
      gradient: 'from-rose-500 via-red-500 to-pink-500',
      description: 'Consecutive active days',
      badge: streak > 7 ? 'Inferno' : streak > 3 ? 'On Fire!' : 'Warming Up',
    },
  ], [level, xp, coins, streak]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {stats.map((stat, index) => (
        <StatCard key={stat.label} stat={stat} index={index} />
      ))}
    </div>
  );
};
