import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Crown, Star } from 'lucide-react';
import type { LeaderboardEntry } from '../../types/challenge';

interface ChallengeLeaderboardProps {
  leaderboard: LeaderboardEntry[];
  isLoading?: boolean;
  currentUserId?: string;
}

export const ChallengeLeaderboard: React.FC<ChallengeLeaderboardProps> = ({
  leaderboard,
  isLoading = false,
  currentUserId,
}) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="text-yellow-500" size={24} />;
      case 2:
        return <Medal className="text-gray-400" size={20} />;
      case 3:
        return <Award className="text-amber-600" size={20} />;
      default:
        return <span className="text-lg font-bold text-gray-600 dark:text-gray-400">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              </div>
              <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 text-center">
        <Trophy className="mx-auto text-gray-400 mb-4" size={48} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No participants yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Be the first to join this challenge and claim the top spot!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-4">
        <div className="flex items-center gap-3">
          <Trophy className="text-white" size={24} />
          <h3 className="text-lg font-semibold text-white">Leaderboard</h3>
        </div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {leaderboard.map((entry, index) => (
          <motion.div
            key={entry.userId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
              entry.userId === currentUserId ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''
            }`}
          >
            <div className="flex-shrink-0 w-12 flex justify-center">
              {entry.rank <= 3 ? (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getRankBadgeColor(entry.rank)}`}>
                  {getRankIcon(entry.rank)}
                </div>
              ) : (
                getRankIcon(entry.rank)
              )}
            </div>
            <div className="flex-shrink-0">
              {entry.avatar ? (
                <img
                  src={entry.avatar}
                  alt={entry.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {entry.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                  {entry.username}
                  {entry.userId === currentUserId && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-full">
                      You
                    </span>
                  )}
                </h4>
                {entry.isCompleted && (
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <Star size={16} fill="currentColor" />
                    <span className="text-xs font-medium">Completed</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 mt-1">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Progress: {Math.round(entry.progress)}%
                </div>
                {entry.completedAt && (
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    Completed: {new Date(entry.completedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {entry.score.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                points
              </div>
            </div>
            <div className="flex-shrink-0 w-20">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${entry.progress}%` }}
                  transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                  className={`h-2 rounded-full ${
                    entry.isCompleted
                      ? 'bg-green-500'
                      : entry.progress > 75
                      ? 'bg-blue-500'
                      : entry.progress > 50
                      ? 'bg-yellow-500'
                      : 'bg-gray-400'
                  }`}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {leaderboard.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing top {leaderboard.length} participant{leaderboard.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};
