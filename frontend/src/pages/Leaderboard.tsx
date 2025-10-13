import { useState } from 'react';
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

  const tabs: { id: LeaderboardType; label: string; icon: string }[] = [
    { id: 'global', label: 'Global', icon: '🌍' },
    { id: 'friends', label: 'Friends', icon: '👥' },
    { id: 'weekly', label: 'Weekly', icon: '📅' },
    { id: 'monthly', label: 'Monthly', icon: '📆' },
    { id: 'streak', label: 'Streak', icon: '🔥' },
  ];

  const categories: { id: LeaderboardCategory; label: string; icon: string }[] = [
    { id: 'work', label: 'Work', icon: '💼' },
    { id: 'personal', label: 'Personal', icon: '🏠' },
    { id: 'health', label: 'Health', icon: '💪' },
    { id: 'learning', label: 'Learning', icon: '📚' },
    { id: 'other', label: 'Other', icon: '📝' },
  ];

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(ROUTES.DASHBOARD)}
            className="mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <span>←</span>
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            🏆 Leaderboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Compete with others and climb to the top!
          </p>
        </motion.div>

        {userRank && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 mb-8 shadow-xl"
          >
            <div className="flex items-center justify-between text-white">
              <div>
                <h3 className="text-lg font-semibold mb-1">Your Global Rank</h3>
                <p className="text-purple-100">Keep climbing to reach the top!</p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold mb-1">#{userRank}</div>
                <div className="text-sm text-purple-100">Worldwide</div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setPage(1);
                }}
                className={`
                  px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2
                  ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }
                `}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🎯 Filter by Category
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setPage(1);
                }}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2
                  ${selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }
                `}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>
          {selectedCategory && (
            <div className="mt-4">
              <button
                onClick={() => setActiveTab('global')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
              >
                View {categories.find(c => c.id === selectedCategory)?.label} Leaderboard
              </button>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {tabs.find(t => t.id === activeTab)?.icon}
              <span>{tabs.find(t => t.id === activeTab)?.label} Leaders</span>
            </h2>
            {currentData && 'pagination' in currentData && (currentData as any).pagination && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {(currentData as any).pagination.total} users
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-16"
              >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Position</h3>
                    <LeaderboardTable
                      entries={[currentData.currentUser]}
                      currentUserId={user?.id}
                      showRank={true}
                    />
                  </div>
                )}

                {currentData && 'pagination' in currentData && (currentData as any).pagination && (currentData as any).pagination.pages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                    >
                      Previous
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
                              w-10 h-10 rounded-lg font-medium transition-all
                              ${page === pageNum
                                ? 'bg-purple-600 text-white shadow-lg'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
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
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                    >
                      Next
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
