import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Star, Crown, Zap, Award } from 'lucide-react';
import { StatsCard } from '../ui/EnhancedCard';
import type { AchievementStats as AchievementStatsType } from '../../types/achievement';

interface AchievementStatsProps {
  stats: AchievementStatsType;
}

export const AchievementStats: React.FC<AchievementStatsProps> = ({ stats }) => {
  const overallStats = [
    {
      title: 'Total Achievements',
      value: stats.total.toString(),
      icon: <Trophy className="w-6 h-6" />,
      color: 'bg-gradient-to-br from-yellow-400 to-orange-500',
      description: 'Available achievements'
    },
    {
      title: 'Unlocked',
      value: stats.unlocked.toString(),
      icon: <Target className="w-6 h-6" />,
      color: 'bg-gradient-to-br from-green-400 to-emerald-500',
      description: 'Achievements earned'
    },
    {
      title: 'Completion Rate',
      value: `${stats.completionPercentage}%`,
      icon: <Star className="w-6 h-6" />,
      color: 'bg-gradient-to-br from-blue-400 to-indigo-500',
      description: 'Overall progress'
    },
    {
      title: 'Remaining',
      value: stats.locked.toString(),
      icon: <Zap className="w-6 h-6" />,
      color: 'bg-gradient-to-br from-purple-400 to-pink-500',
      description: 'Still to unlock'
    }
  ];

  const categoryStats = [
    {
      category: 'Productivity',
      emoji: '⚡',
      total: stats.byCategory.productivity,
      unlocked: stats.unlockedByCategory.productivity,
      percentage: stats.byCategory.productivity > 0 
        ? Math.round((stats.unlockedByCategory.productivity / stats.byCategory.productivity) * 100)
        : 0,
      color: 'from-blue-400 to-blue-600'
    },
    {
      category: 'Consistency',
      emoji: '🔥',
      total: stats.byCategory.consistency,
      unlocked: stats.unlockedByCategory.consistency,
      percentage: stats.byCategory.consistency > 0 
        ? Math.round((stats.unlockedByCategory.consistency / stats.byCategory.consistency) * 100)
        : 0,
      color: 'from-red-400 to-red-600'
    },
    {
      category: 'Social',
      emoji: '👥',
      total: stats.byCategory.social,
      unlocked: stats.unlockedByCategory.social,
      percentage: stats.byCategory.social > 0 
        ? Math.round((stats.unlockedByCategory.social / stats.byCategory.social) * 100)
        : 0,
      color: 'from-green-400 to-green-600'
    },
    {
      category: 'Special',
      emoji: '✨',
      total: stats.byCategory.special,
      unlocked: stats.unlockedByCategory.special,
      percentage: stats.byCategory.special > 0 
        ? Math.round((stats.unlockedByCategory.special / stats.byCategory.special) * 100)
        : 0,
      color: 'from-purple-400 to-purple-600'
    }
  ];

  const rarityStats = [
    {
      rarity: 'Common',
      icon: <Award className="w-5 h-5" />,
      total: stats.byRarity.common,
      color: 'from-gray-400 to-gray-600',
      textColor: 'text-gray-600 dark:text-gray-400'
    },
    {
      rarity: 'Rare',
      icon: <Star className="w-5 h-5" />,
      total: stats.byRarity.rare,
      color: 'from-blue-400 to-blue-600',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      rarity: 'Epic',
      icon: <Zap className="w-5 h-5" />,
      total: stats.byRarity.epic,
      color: 'from-purple-400 to-purple-600',
      textColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      rarity: 'Legendary',
      icon: <Crown className="w-5 h-5" />,
      total: stats.byRarity.legendary,
      color: 'from-yellow-400 to-orange-500',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Overall Stats */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Achievement Overview
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {overallStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <StatsCard
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                className={`${stat.color} text-white border-0`}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Progress by Category
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categoryStats.map((category, index) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{category.emoji}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {category.category}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {category.unlocked}/{category.total}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {category.percentage}%
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full bg-gradient-to-r ${category.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${category.percentage}%` }}
                  transition={{ duration: 1, delay: index * 0.2 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Rarity Distribution */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Rarity Distribution
        </h3>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {rarityStats.map((rarity, index) => (
              <motion.div
                key={rarity.rarity}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center"
              >
                <div className={`
                  w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center
                  bg-gradient-to-br ${rarity.color} shadow-lg
                `}>
                  <div className="text-white">
                    {rarity.icon}
                  </div>
                </div>
                <h4 className={`font-semibold ${rarity.textColor} mb-1`}>
                  {rarity.rarity}
                </h4>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {rarity.total}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  achievements
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Motivational Section */}
      {stats.completionPercentage < 100 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                Keep Going! 🚀
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                You have {stats.locked} achievements left to unlock. 
                {stats.completionPercentage >= 50 
                  ? " You're more than halfway there!" 
                  : " Every achievement brings you closer to mastery!"}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Perfect Score Celebration */}
      {stats.completionPercentage === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-700"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              🎉 Achievement Master! 🎉
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Congratulations! You've unlocked all available achievements. You're a true productivity champion!
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
