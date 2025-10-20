import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { StatsCard } from '../ui/EnhancedCard';

interface UserStatsCardsProps {
  level: number;
  xp: number;
  coins: number;
  streak: number;
}

export const UserStatsCards: React.FC<UserStatsCardsProps> = ({ level, xp, coins, streak }) => {
  const stats = useMemo(() => [
    {
      label: 'Level',
      value: level,
      icon: '🏆',
      bgColor: 'bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20',
      borderColor: 'border-amber-200 dark:border-amber-700',
      iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
      description: 'Your current rank',
      badge: level >= 10 ? 'Master' : level >= 5 ? 'Pro' : 'Rookie',
    },
    {
      label: 'Experience',
      value: xp.toLocaleString(),
      icon: '⭐',
      bgColor: 'bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20',
      borderColor: 'border-purple-200 dark:border-purple-700',
      iconBg: 'bg-gradient-to-br from-purple-500 to-indigo-600',
      description: 'Total XP earned',
      badge: 'Legendary',
    },
    {
      label: 'Coins',
      value: coins.toLocaleString(),
      icon: '🪙',
      bgColor: 'bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20',
      borderColor: 'border-emerald-200 dark:border-emerald-700',
      iconBg: 'bg-gradient-to-br from-emerald-400 to-green-500',
      description: 'Your treasure chest',
      badge: 'Wealthy',
    },
    {
      label: 'Streak',
      value: `${streak}`,
      icon: '🔥',
      bgColor: 'bg-gradient-to-br from-rose-50 to-pink-100 dark:from-rose-900/20 dark:to-pink-900/20',
      borderColor: 'border-rose-200 dark:border-rose-700',
      iconBg: 'bg-gradient-to-br from-rose-500 to-pink-500',
      description: 'Consecutive active days',
      badge: streak > 7 ? 'Inferno' : streak > 3 ? 'On Fire!' : 'Warming Up',
    },
  ], [level, xp, coins, streak]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <StatsCard
            title={stat.label}
            value={stat.value}
            icon={<span className="text-2xl">{stat.icon}</span>}
            className={`${stat.bgColor} ${stat.borderColor} border-2`}
          />
        </motion.div>
      ))}
    </div>
  );
};
