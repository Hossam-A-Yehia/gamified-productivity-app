import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUserAchievements, useAchievementProgress } from '../hooks/useAchievements';
import { BadgeCard } from '../components/achievements/BadgeCard';
import { ROUTES } from '../utils/constants';
import type { AchievementCategory, AchievementRarity } from '../types/achievement';

type FilterTab = 'all' | AchievementCategory;
type RarityFilter = 'all' | AchievementRarity;

export default function Achievements() {
  const navigate = useNavigate();
  const { data: userAchievements, isLoading, error } = useUserAchievements();
  const [categoryFilter, setCategoryFilter] = useState<FilterTab>('all');
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);

  const allAchievements = useMemo(() => {
    if (!userAchievements) return [];
    return [...userAchievements.unlocked, ...userAchievements.locked];
  }, [userAchievements]);

  const filteredAchievements = useMemo(() => {
    let filtered = allAchievements;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(a => a.category === categoryFilter);
    }

    if (rarityFilter !== 'all') {
      filtered = filtered.filter(a => a.rarity === rarityFilter);
    }

    if (showUnlockedOnly) {
      filtered = filtered.filter(a => 
        userAchievements?.unlocked.some(unlocked => unlocked._id === a._id)
      );
    }

    return filtered;
  }, [allAchievements, categoryFilter, rarityFilter, showUnlockedOnly, userAchievements]);

  const stats = useMemo(() => {
    if (!userAchievements) return { total: 0, unlocked: 0, percentage: 0 };
    const total = userAchievements.unlocked.length + userAchievements.locked.length;
    const unlocked = userAchievements.unlocked.length;
    return {
      total,
      unlocked,
      percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0,
    };
  }, [userAchievements]);

  const rarityBreakdown = useMemo(() => {
    if (!userAchievements) return { common: 0, rare: 0, epic: 0, legendary: 0 };
    return userAchievements.unlocked.reduce((acc, achievement) => {
      acc[achievement.rarity] = (acc[achievement.rarity] || 0) + 1;
      return acc;
    }, {} as Record<AchievementRarity, number>);
  }, [userAchievements]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded">
            Failed to load achievements
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
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
            🏆 Achievements
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your progress and unlock amazing rewards
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <div className="text-3xl mb-2">📊</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.unlocked}/{stats.total}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Unlocked</div>
            <div className="mt-3 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${stats.percentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">{stats.percentage}% Complete</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 shadow-lg"
          >
            <div className="text-2xl mb-2">🥉</div>
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-1">
              {rarityBreakdown.common || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Common</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-6 shadow-lg"
          >
            <div className="text-2xl mb-2">🥈</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {rarityBreakdown.rare || 0}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Rare</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-100 to-pink-200 dark:from-purple-900/30 dark:to-pink-800/30 rounded-xl p-6 shadow-lg"
          >
            <div className="text-2xl mb-2">🥇</div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              {(rarityBreakdown.epic || 0) + (rarityBreakdown.legendary || 0)}
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-400">Epic & Legendary</div>
          </motion.div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  categoryFilter === 'all'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setCategoryFilter('consistency')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  categoryFilter === 'consistency'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                🔥 Consistency
              </button>
              <button
                onClick={() => setCategoryFilter('productivity')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  categoryFilter === 'productivity'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                ⚡ Productivity
              </button>
              <button
                onClick={() => setCategoryFilter('social')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  categoryFilter === 'social'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                👥 Social
              </button>
              <button
                onClick={() => setCategoryFilter('special')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  categoryFilter === 'special'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                ⭐ Special
              </button>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={rarityFilter}
                onChange={(e) => setRarityFilter(e.target.value as RarityFilter)}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium border-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Rarities</option>
                <option value="common">Common</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="legendary">Legendary</option>
              </select>

              <button
                onClick={() => setShowUnlockedOnly(!showUnlockedOnly)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  showUnlockedOnly
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {showUnlockedOnly ? '✓ Unlocked Only' : 'Show All'}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {filteredAchievements.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No achievements found
              </h3>
              <p className="text-gray-500 dark:text-gray-500">
                Try adjusting your filters
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredAchievements.map((achievement) => {
                const isUnlocked = userAchievements?.unlocked.some(
                  (unlocked) => unlocked._id === achievement._id
                );
                return (
                  <AchievementCardWithProgress
                    key={achievement._id}
                    achievement={achievement}
                    isUnlocked={!!isUnlocked}
                  />
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function AchievementCardWithProgress({ achievement, isUnlocked }: { achievement: any; isUnlocked: boolean }) {
  const { data: progress } = useAchievementProgress(achievement._id);

  return (
    <BadgeCard
      achievement={achievement}
      isUnlocked={isUnlocked}
      progress={progress}
    />
  );
}
