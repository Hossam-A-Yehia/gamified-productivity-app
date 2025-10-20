import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Medal, Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { useLeaderboardEvents } from '../../hooks/useSocket';

interface LeaderboardEntry {
  userId: string;
  name: string;
  xp: number;
  level: number;
  rank: number;
  previousRank?: number;
}

interface LiveLeaderboardProps {
  initialData?: LeaderboardEntry[];
  currentUserId?: string;
}

export const LiveLeaderboard: React.FC<LiveLeaderboardProps> = ({
  initialData = [],
  currentUserId
}) => {
  const leaderboardEvents = useLeaderboardEvents();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(initialData);
  const [rankChanges, setRankChanges] = useState<Map<string, { oldRank: number; newRank: number }>>(new Map());

  useEffect(() => {
    const cleanupLeaderboard = leaderboardEvents.onLeaderboardUpdated((data) => {
      // Ensure leaderboard is an array before setting it
      if (data.leaderboard && Array.isArray(data.leaderboard)) {
        setLeaderboard(data.leaderboard);
      }
    });

    const cleanupRankChange = leaderboardEvents.onRankChanged((data) => {
      if (currentUserId) {
        setRankChanges(prev => new Map(prev.set(currentUserId, {
          oldRank: data.oldRank,
          newRank: data.newRank
        })));
        
        // Clear rank change indicator after animation
        setTimeout(() => {
          setRankChanges(prev => {
            const newMap = new Map(prev);
            newMap.delete(currentUserId);
            return newMap;
          });
        }, 3000);
      }
    });

    return () => {
      cleanupLeaderboard();
      cleanupRankChange();
    };
  }, [leaderboardEvents, currentUserId]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Trophy className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getRankChangeIndicator = (userId: string) => {
    const change = rankChanges.get(userId);
    if (!change) return null;

    const isImprovement = change.newRank < change.oldRank;
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        className={`flex items-center gap-1 text-xs font-medium ${
          isImprovement ? 'text-green-600' : 'text-red-600'
        }`}
      >
        {isImprovement ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        <span>{Math.abs(change.oldRank - change.newRank)}</span>
      </motion.div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Live Leaderboard
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Real-time rankings • Updates automatically
        </p>
      </div>

      <div className="p-6">
        <AnimatePresence>
          {Array.isArray(leaderboard) && leaderboard.map((entry) => (
            <motion.div
              key={entry.userId}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`
                flex items-center justify-between p-4 rounded-lg mb-3 transition-all duration-300
                ${entry.userId === currentUserId 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-600' 
                  : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                }
              `}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {getRankIcon(entry.rank)}
                  {getRankChangeIndicator(entry.userId)}
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {entry.name}
                    {entry.userId === currentUserId && (
                      <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                        You
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Level {entry.level}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <motion.div
                  key={entry.xp}
                  animate={{ scale: [1, 1.05, 1] }}
                  className="text-lg font-bold text-gray-900 dark:text-white"
                >
                  {entry.xp.toLocaleString()} XP
                </motion.div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Rank #{entry.rank}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {(!Array.isArray(leaderboard) || leaderboard.length === 0) && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No leaderboard data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveLeaderboard;
