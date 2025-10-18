import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Users, Award } from 'lucide-react';
import type { ChallengeStats as ChallengeStatsType } from '../../types/challenge';

interface ChallengeStatsProps {
  stats: ChallengeStatsType;
}

export const ChallengeStats: React.FC<ChallengeStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Challenges',
      value: stats.total || 0,
      icon: Target,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      title: 'Active Challenges',
      value: stats.byStatus?.active || 0,
      icon: Users,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      title: 'Participating',
      value: stats.participating || 0,
      icon: Trophy,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      title: 'Completed',
      value: stats.completed || 0,
      icon: Award,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    },
    {
      title: 'Upcoming',
      value: stats.byStatus?.upcoming || 0,
      icon: Trophy,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    },
  ];

  // Note: Reward stats not available in current backend implementation

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Challenges by Category
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.byCategory || {}).map(([category, count]) => {
              const total = Object.values(stats.byCategory || {}).reduce((sum: number, val: number) => sum + val, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              
              return (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="bg-purple-500 h-2 rounded-full"
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Challenges by Difficulty
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.byDifficulty || {}).map(([difficulty, count]) => {
              const total = Object.values(stats.byDifficulty || {}).reduce((sum: number, val: number) => sum + val, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              
              const difficultyColors = {
                easy: 'bg-green-500',
                medium: 'bg-yellow-500',
                hard: 'bg-red-500',
                extreme: 'bg-purple-500',
              };
              
              return (
                <div key={difficulty} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${difficultyColors[difficulty as keyof typeof difficultyColors] || 'bg-gray-500'}`} />
                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: 1 }}
                        className={`h-2 rounded-full ${difficultyColors[difficulty as keyof typeof difficultyColors] || 'bg-gray-500'}`}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
