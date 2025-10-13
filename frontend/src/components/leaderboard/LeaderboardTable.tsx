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
      return 'from-yellow-400 via-yellow-500 to-amber-500';
    case 2:
      return 'from-slate-300 via-gray-400 to-slate-500';
    case 3:
      return 'from-orange-400 via-amber-500 to-orange-600';
    default:
      return 'from-gray-500 to-gray-700';
  }
};

const getRankBgGlow = (rank: number) => {
  switch (rank) {
    case 1:
      return 'shadow-yellow-500/50';
    case 2:
      return 'shadow-gray-400/50';
    case 3:
      return 'shadow-orange-500/50';
    default:
      return 'shadow-gray-500/30';
  }
};

export const LeaderboardTable = ({ entries, currentUserId, showRank = true }: LeaderboardTableProps) => {
  if (entries.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16"
      >
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
          <span className="text-5xl">📊</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
          No leaderboard data yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          Complete tasks to appear on the leaderboard!
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, index) => {
        const isCurrentUser = entry._id === currentUserId;
        const medal = getMedalEmoji(entry.rank);
        const rankColor = getRankColor(entry.rank);
        const rankGlow = getRankBgGlow(entry.rank);
        const isTopThree = entry.rank <= 3;

        return (
          <motion.div
            key={entry._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03, type: "spring", stiffness: 100 }}
            className="relative group"
          >
            {isTopThree && (
              <div className={`absolute inset-0 bg-gradient-to-r ${rankColor} rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity`}></div>
            )}
            
            <div className={`
              relative p-4 sm:p-5 rounded-2xl transition-all duration-300 border-2
              ${isCurrentUser
                ? 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-500 dark:border-purple-400 shadow-xl shadow-purple-500/20'
                : isTopThree
                  ? 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-transparent shadow-lg hover:shadow-xl'
                  : 'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:shadow-lg'
              }
            `}>
              <div className="flex items-center gap-3 sm:gap-4">
                {showRank && (
                  <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0">
                    {medal ? (
                      <div className="relative">
                        <div className={`absolute inset-0 ${rankGlow} blur-xl`}></div>
                        <span className="relative text-4xl sm:text-5xl">{medal}</span>
                      </div>
                    ) : (
                      <div className={`
                        w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${rankColor}
                        flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-xl ${rankGlow}
                      `}>
                        {entry.rank}
                      </div>
                    )}
                  </div>
                )}

                <div className="relative">
                  <div className={`
                    w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-xl
                    ${isTopThree
                      ? `bg-gradient-to-br ${rankColor}`
                      : 'bg-gradient-to-br from-blue-500 to-purple-600'
                    }
                  `}>
                    {entry.avatarUrl ? (
                      <img src={entry.avatarUrl} alt={entry.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      entry.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  {isTopThree && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center shadow-lg">
                      <span className="text-xs">⭐</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`
                      font-bold text-base sm:text-lg truncate
                      ${isCurrentUser
                        ? 'text-purple-900 dark:text-purple-200'
                        : isTopThree
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-800 dark:text-gray-200'
                      }
                    `}>
                      {entry.name}
                    </h3>
                    {isCurrentUser && (
                      <span className="px-2.5 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
                        YOU
                      </span>
                    )}
                    {isTopThree && !isCurrentUser && (
                      <span className={`
                        px-2 py-0.5 bg-gradient-to-r ${rankColor} text-white text-xs font-bold rounded-full shadow-md
                      `}>
                        TOP {entry.rank}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 mt-1.5 text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                        <span className="text-sm">📈</span>
                      </div>
                      <span className="font-bold text-gray-700 dark:text-gray-300">Lv {entry.level}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-lg bg-yellow-500/10 dark:bg-yellow-500/20 flex items-center justify-center">
                        <span className="text-sm">⚡</span>
                      </div>
                      <span className="font-bold text-gray-700 dark:text-gray-300">{entry.xp.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:flex items-center gap-4 xl:gap-6">
                  <div className="text-center px-3 py-2 rounded-xl bg-orange-500/10 dark:bg-orange-500/20">
                    <div className="flex items-center justify-center gap-1.5 text-orange-600 dark:text-orange-400 font-black text-lg">
                      <span className="text-2xl">🔥</span>
                      <span>{entry.streak}</span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 font-semibold mt-0.5">Streak</div>
                  </div>
                  <div className="text-center px-3 py-2 rounded-xl bg-green-500/10 dark:bg-green-500/20">
                    <div className="flex items-center justify-center gap-1.5 text-green-600 dark:text-green-400 font-black text-lg">
                      <span className="text-2xl">✓</span>
                      <span>{entry.totalTasksCompleted}</span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 font-semibold mt-0.5">Tasks</div>
                  </div>
                </div>

                <div className="flex lg:hidden flex-col gap-1.5 text-xs">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-orange-500/10 dark:bg-orange-500/20">
                    <span className="text-base">🔥</span>
                    <span className="font-bold text-orange-600 dark:text-orange-400">{entry.streak}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-green-500/10 dark:bg-green-500/20">
                    <span className="text-base">✓</span>
                    <span className="font-bold text-green-600 dark:text-green-400">{entry.totalTasksCompleted}</span>
                  </div>
                </div>
              </div>
            </div>

            {isCurrentUser && (
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl shadow-purple-500/50 animate-pulse">
                <span className="text-white text-xl">👤</span>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};
