import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  useGlobalLeaderboard,
  useFriendsLeaderboard,
  useWeeklyLeaderboard,
  useMonthlyLeaderboard,
  useStreakLeaderboard,
  useUserRank,
} from '../hooks/useLeaderboard';
import { LeaderboardTable } from '../components/leaderboard/LeaderboardTable';
import { ROUTES } from '../utils/constants';
import type { LeaderboardType, LeaderboardCategory } from '../types/leaderboard';

export default function Leaderboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<LeaderboardType>('global');
  const [selectedCategory, setSelectedCategory] = useState<LeaderboardCategory>('work');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const { data: globalData, isLoading: globalLoading } = useGlobalLeaderboard(limit, page);
  const { data: friendsData, isLoading: friendsLoading } = useFriendsLeaderboard(limit);
  const { data: weeklyData, isLoading: weeklyLoading } = useWeeklyLeaderboard(limit, page);
  const { data: monthlyData, isLoading: monthlyLoading } = useMonthlyLeaderboard(limit, page);
  const { data: streakData, isLoading: streakLoading } = useStreakLeaderboard(limit, page);
  const { data: userRank } = useUserRank();

  const getCurrentData = () => {
    switch (activeTab) {
      case 'global':
        return globalData;
      case 'friends':
        return friendsData;
      case 'weekly':
        return weeklyData;
      case 'monthly':
        return monthlyData;
      case 'streak':
        return streakData;
      default:
        return globalData;
    }
  };

  const isLoading = () => {
    switch (activeTab) {
      case 'global':
        return globalLoading;
      case 'friends':
        return friendsLoading;
      case 'weekly':
        return weeklyLoading;
      case 'monthly':
        return monthlyLoading;
      case 'streak':
        return streakLoading;
      default:
        return false;
    }
  };

  const currentData = getCurrentData();
  const loading = isLoading();

  const tabs = useMemo(() => [
    { id: 'global' as LeaderboardType, label: 'Global', icon: '🌍', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'friends' as LeaderboardType, label: 'Friends', icon: '👥', gradient: 'from-purple-500 to-pink-500' },
    { id: 'weekly' as LeaderboardType, label: 'Weekly', icon: '📅', gradient: 'from-green-500 to-emerald-500' },
    { id: 'monthly' as LeaderboardType, label: 'Monthly', icon: '📆', gradient: 'from-orange-500 to-amber-500' },
    { id: 'streak' as LeaderboardType, label: 'Streak', icon: '🔥', gradient: 'from-red-500 to-orange-500' },
  ], []);

  const categories = useMemo(() => [
    { id: 'work' as LeaderboardCategory, label: 'Work', icon: '💼', color: 'bg-blue-500' },
    { id: 'personal' as LeaderboardCategory, label: 'Personal', icon: '🏠', color: 'bg-purple-500' },
    { id: 'health' as LeaderboardCategory, label: 'Health', icon: '💪', color: 'bg-green-500' },
    { id: 'learning' as LeaderboardCategory, label: 'Learning', icon: '📚', color: 'bg-orange-500' },
    { id: 'other' as LeaderboardCategory, label: 'Other', icon: '📝', color: 'bg-gray-500' },
  ], []);

  const activeTabData = useMemo(() => tabs.find(t => t.id === activeTab), [tabs, activeTab]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-slate-900 dark:to-indigo-950 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-gradient-to-br from-indigo-400/10 to-cyan-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(ROUTES.DASHBOARD)}
            className="mb-6 group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg transition-all duration-300"
          >
            <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
            <span className="font-medium">Back to Dashboard</span>
          </button>
          
          <div className="relative">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-block"
            >
              <h1 className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 mb-3 flex items-center gap-4">
                <span className="text-6xl sm:text-7xl">🏆</span>
                Leaderboard
              </h1>
            </motion.div>
            <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
              Compete with others and climb to the top of the ranks!
            </p>
          </div>
        </motion.div>

        {userRank && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="relative group mb-8"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl blur opacity-60 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-2xl p-1">
              <div className="bg-gradient-to-br from-white/95 to-white/80 dark:from-gray-900/95 dark:to-gray-900/80 backdrop-blur-xl rounded-xl p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                      <span className="text-3xl">👤</span>
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">Your Global Rank</h3>
                      <p className="text-gray-600 dark:text-gray-400 font-medium">Keep climbing to reach the top!</p>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl blur opacity-50"></div>
                    <div className="relative bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl px-8 py-6 text-center shadow-xl">
                      <div className="text-5xl sm:text-6xl font-black text-white mb-1">#{userRank}</div>
                      <div className="text-sm font-bold text-yellow-100 uppercase tracking-wider">Worldwide</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6 mb-6"
        >
          <div className="flex flex-wrap gap-3">
            {tabs.map((tab, index) => (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  setActiveTab(tab.id);
                  setPage(1);
                }}
                className="relative group"
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} rounded-xl shadow-lg`}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={`
                  relative px-5 sm:px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2.5
                  ${activeTab === tab.id
                    ? 'text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }
                `}>
                  <span className="text-xl sm:text-2xl">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
              <span className="text-xl">🎯</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Filter by Category
            </h3>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.03 }}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setPage(1);
                }}
                className={`
                  relative px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 group
                  ${selectedCategory === category.id
                    ? `${category.color} text-white shadow-lg scale-105`
                    : 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:scale-105 hover:shadow-md'
                  }
                `}
              >
                <span className="text-lg">{category.icon}</span>
                <span>{category.label}</span>
                {selectedCategory === category.id && (
                  <span className="ml-1">✓</span>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
        >
          <div className={`bg-gradient-to-r ${activeTabData?.gradient || 'from-purple-500 to-pink-500'} p-6 sm:p-8`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <span className="text-4xl">{activeTabData?.icon}</span>
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white mb-1">
                    {activeTabData?.label} Leaders
                  </h2>
                  {currentData && 'pagination' in currentData && (currentData as any).pagination && (
                    <div className="text-sm font-semibold text-white/80">
                      {(currentData as any).pagination.total.toLocaleString()} competing users
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-700 border-t-transparent"></div>
                    <div className={`absolute inset-0 animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-4 border-t-${activeTabData?.gradient || 'purple-500'}`}></div>
                  </div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading rankings...</p>
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <LeaderboardTable
                    entries={currentData?.leaderboard || []}
                    currentUserId={user?.id}
                    showRank={true}
                  />

                  {currentData?.currentUser && !currentData.leaderboard.find(e => e._id === user?.id) && (
                    <div className="mt-6 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                          <span className="text-xl">📍</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Position</h3>
                      </div>
                      <LeaderboardTable
                        entries={[currentData.currentUser]}
                        currentUserId={user?.id}
                        showRank={true}
                      />
                    </div>
                  )}

                  {currentData && 'pagination' in currentData && (currentData as any).pagination && (currentData as any).pagination.pages > 1 && (
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                      <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-600"
                      >
                        ← Previous
                      </button>
                      <div className="flex items-center gap-2">
                        {Array.from({ length: Math.min(5, (currentData as any).pagination.pages) }, (_, i) => {
                          const pageNum = page <= 3 ? i + 1 : page - 2 + i;
                          if (pageNum > (currentData as any).pagination.pages) return null;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`
                                w-11 h-11 rounded-xl font-bold transition-all duration-300
                                ${page === pageNum
                                  ? `bg-gradient-to-r ${activeTabData?.gradient || 'from-purple-500 to-pink-500'} text-white shadow-lg scale-110`
                                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 hover:scale-105 border border-gray-200 dark:border-gray-600'
                                }
                              `}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === (currentData as any).pagination.pages}
                        className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-600"
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
