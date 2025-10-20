import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Filter, Search, BarChart3, Grid, List } from 'lucide-react';
import { AchievementCard } from './AchievementCard';
import { AchievementStats } from './AchievementStats';
import { EnhancedButton } from '../ui/EnhancedButton';
import { useUserAchievementProgress, useAchievementStats } from '../../hooks/useAchievements';
import { achievementService } from '../../services/achievementService';
import type { AchievementCategory, AchievementRarity } from '../../types/achievement';

interface AchievementGalleryProps {
  showStats?: boolean;
  compact?: boolean;
}

const categories: { value: AchievementCategory | 'all'; label: string; emoji: string }[] = [
  { value: 'all', label: 'All', emoji: '🏆' },
  { value: 'productivity', label: 'Productivity', emoji: '⚡' },
  { value: 'consistency', label: 'Consistency', emoji: '🔥' },
  { value: 'social', label: 'Social', emoji: '👥' },
  { value: 'special', label: 'Special', emoji: '✨' }
];

const rarities: { value: AchievementRarity | 'all'; label: string; color: string }[] = [
  { value: 'all', label: 'All Rarities', color: 'text-gray-600' },
  { value: 'common', label: 'Common', color: 'text-gray-500' },
  { value: 'rare', label: 'Rare', color: 'text-blue-500' },
  { value: 'epic', label: 'Epic', color: 'text-purple-500' },
  { value: 'legendary', label: 'Legendary', color: 'text-yellow-500' }
];

const statusFilters = [
  { value: 'all', label: 'All' },
  { value: 'unlocked', label: 'Unlocked' },
  { value: 'locked', label: 'Locked' },
  { value: 'in-progress', label: 'In Progress' }
];

export const AchievementGallery: React.FC<AchievementGalleryProps> = ({
  showStats = true,
  compact = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');
  const [selectedRarity, setSelectedRarity] = useState<AchievementRarity | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [isReinitializing, setIsReinitializing] = useState(false);

  const { data: achievementProgress, isLoading, error, refetch } = useUserAchievementProgress();
  const { data: stats } = useAchievementStats();

  const handleReinitializeAchievements = async () => {
    try {
      setIsReinitializing(true);
      await achievementService.initializeAchievements();
      await refetch();
    } catch (error) {
    } finally {
      setIsReinitializing(false);
    }
  };

  const filteredAchievements = useMemo(() => {
    if (!achievementProgress) return [];

    return achievementProgress.filter(item => {
      // Category filter
      if (selectedCategory !== 'all' && item.achievement.category !== selectedCategory) {
        return false;
      }

      // Rarity filter
      if (selectedRarity !== 'all' && item.achievement.rarity !== selectedRarity) {
        return false;
      }

      // Status filter
      if (selectedStatus === 'unlocked' && !item.isUnlocked) return false;
      if (selectedStatus === 'locked' && item.isUnlocked) return false;
      if (selectedStatus === 'in-progress' && (item.isUnlocked || item.progress === 0)) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          item.achievement.name.toLowerCase().includes(query) ||
          item.achievement.description.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [achievementProgress, selectedCategory, selectedRarity, selectedStatus, searchQuery]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {showStats && <div className="h-32 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Failed to load achievements
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Please try again later
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      {showStats && stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <AchievementStats stats={stats} />
        </motion.div>
      )}

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search achievements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3">
          <EnhancedButton
            variant={showFilters ? 'primary' : 'secondary'}
            size="sm"
            icon={<Filter className="w-4 h-4" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </EnhancedButton>

          <EnhancedButton
            variant="secondary"
            size="sm"
            icon={<BarChart3 className="w-4 h-4" />}
            onClick={() => {/* Toggle stats visibility - controlled by parent */}}
          >
            Stats
          </EnhancedButton>

          {/* Temporary Re-initialization Button */}
          <EnhancedButton
            variant="danger"
            size="sm"
            onClick={handleReinitializeAchievements}
            disabled={isReinitializing}
          >
            {isReinitializing ? 'Updating...' : 'Update Icons'}
          </EnhancedButton>

          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 space-y-4"
          >
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category.value
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    {category.emoji} {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rarity Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rarity
              </label>
              <div className="flex flex-wrap gap-2">
                {rarities.map((rarity) => (
                  <button
                    key={rarity.value}
                    onClick={() => setSelectedRarity(rarity.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedRarity === rarity.value
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    {rarity.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {statusFilters.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => setSelectedStatus(status.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedStatus === status.value
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredAchievements.length} of {achievementProgress?.length || 0} achievements
        </p>
      </div>

      {/* Achievement Grid/List */}
      <AnimatePresence mode="wait">
        {filteredAchievements.length > 0 ? (
          <motion.div
            key={`${viewMode}-${selectedCategory}-${selectedRarity}-${selectedStatus}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={
              viewMode === 'grid'
                ? `grid grid-cols-1 ${compact ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'} gap-6`
                : 'space-y-4'
            }
          >
            {filteredAchievements.map((achievementProgress, index) => (
              <AchievementCard
                key={achievementProgress.achievement._id}
                achievementProgress={achievementProgress}
                index={index}
                onClick={() => {
                  // TODO: Open achievement details modal
                  console.log('Achievement clicked:', achievementProgress.achievement.name);
                }}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No achievements found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your filters or search query
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
