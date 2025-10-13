import { motion } from 'framer-motion';
import type { LeaderboardEntry } from '../../types/leaderboard';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  showRank?: boolean;
}

const getMedalEmoji = (rank: number) => {
  switch (rank) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return null;
  }
};

const getRankColor = (rank: number) => {
  switch (rank) {
    case 1:
      return 'from-yellow-400 to-yellow-600';
    case 2:
      return 'from-gray-300 to-gray-500';
    case 3:
      return 'from-orange-400 to-orange-600';
    default:
      return 'from-gray-600 to-gray-800';
  }
};

export const LeaderboardTable = ({ entries, currentUserId, showRank = true }: LeaderboardTableProps) => {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          No leaderboard data yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Complete tasks to appear on the leaderboard!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, index) => {
        const isCurrentUser = entry._id === currentUserId;
        const medal = getMedalEmoji(entry.rank);
        const rankColor = getRankColor(entry.rank);

        return (
          <motion.div
            key={entry._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`
              relative p-4 rounded-xl transition-all duration-300
              ${isCurrentUser
                ? 'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-500 dark:border-purple-400 shadow-lg'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md'
              }
            `}
          >
            <div className="flex items-center gap-4">
              {showRank && (
                <div className="flex items-center justify-center w-12 h-12 flex-shrink-0">
                  {medal ? (
                    <span className="text-3xl">{medal}</span>
                  ) : (
                    <div className={`
                      w-10 h-10 rounded-full bg-gradient-to-br ${rankColor}
                      flex items-center justify-center text-white font-bold shadow-lg
                    `}>
                      {entry.rank}
                    </div>
                  )}
                </div>
              )}

              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
                {entry.avatarUrl ? (
                  <img src={entry.avatarUrl} alt={entry.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  entry.name.charAt(0).toUpperCase()
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={`font-semibold truncate ${isCurrentUser ? 'text-purple-900 dark:text-purple-200' : 'text-gray-900 dark:text-white'}`}>
                    {entry.name}
                  </h3>
                  {isCurrentUser && (
                    <span className="px-2 py-0.5 bg-purple-500 text-white text-xs font-semibold rounded-full">
                      You
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-sm">
                  <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <span className="text-base">📈</span>
                    <span className="font-medium">Level {entry.level}</span>
                  </span>
                  <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <span className="text-base">⚡</span>
                    <span className="font-medium">{entry.xp.toLocaleString()} XP</span>
                  </span>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-6 text-sm">
                <div className="text-center">
                  <div className="flex items-center gap-1 text-orange-500 dark:text-orange-400 font-bold">
                    <span className="text-lg">🔥</span>
                    <span>{entry.streak}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Streak</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-bold">
                    <span className="text-lg">✓</span>
                    <span>{entry.totalTasksCompleted}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tasks</div>
                </div>
              </div>

              <div className="flex md:hidden flex-col gap-1 text-xs">
                <div className="flex items-center gap-1 text-orange-500 dark:text-orange-400">
                  <span>🔥</span>
                  <span className="font-semibold">{entry.streak}</span>
                </div>
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <span>✓</span>
                  <span className="font-semibold">{entry.totalTasksCompleted}</span>
                </div>
              </div>
            </div>

            {isCurrentUser && (
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">👤</span>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};
