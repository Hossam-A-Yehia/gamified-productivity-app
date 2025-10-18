import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Trophy, Users, Target, Zap } from 'lucide-react';
import {
  useChallengeOperations,
  useFeaturedChallenges,
  useParticipatingChallenges,
  useChallengeStats
} from '../hooks/useChallenges';
import { ChallengeCard } from '../components/challenges/ChallengeCard';
import { ChallengeFilters } from '../components/challenges/ChallengeFilters';
import { ChallengeForm } from '../components/challenges/ChallengeForm';
import { ChallengeStats } from '../components/challenges/ChallengeStats';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import type {
  ChallengeFilters as ChallengeFiltersType,
  CreateChallengeRequest
} from '../types/challenge';
import { toast } from 'sonner';

type ViewMode = 'all' | 'participating' | 'featured' | 'completed';
type SortField = 'createdAt' | 'startDate' | 'endDate' | 'participants' | 'difficulty' | 'title';
type SortOrder = 'asc' | 'desc';

interface ChallengeFiltersState {
  search: string;
  type: string[];
  category: string[];
  difficulty: string[];
  status: string[];
  tags: string[];
}

const Challenges: React.FC = () => {
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [sortField, setSortField] = useState<SortField>('startDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  const [filters, setFilters] = useState<ChallengeFiltersState>({
    search: '',
    type: [],
    category: [],
    difficulty: [],
    status: [],
    tags: [],
  });

  // Convert local filters to API filters
  const apiFilters: ChallengeFiltersType = useMemo(() => ({
    search: filters.search || undefined,
    type: filters.type.length > 0 ? filters.type : undefined,
    category: filters.category.length > 0 ? filters.category : undefined,
    difficulty: filters.difficulty.length > 0 ? filters.difficulty : undefined,
    status: filters.status.length > 0 ? filters.status : undefined,
    tags: filters.tags.length > 0 ? filters.tags : undefined,
    page: currentPage,
    limit: itemsPerPage,
    sortBy: sortField,
    sortOrder,
  }), [filters, currentPage, itemsPerPage, sortField, sortOrder]);

  const {
    challenges,
    isLoading,
    createChallenge,
    joinChallenge,
    leaveChallenge,
  } = useChallengeOperations(viewMode === 'all' ? apiFilters : {});

  const { data: featuredChallenges, isLoading: featuredLoading } = useFeaturedChallenges();
  const { data: participatingChallenges, isLoading: participatingLoading } = useParticipatingChallenges();
  const { data: challengeStats } = useChallengeStats();

  const displayChallenges = useMemo(() => {
    switch (viewMode) {
      case 'featured':
        return featuredChallenges || [];
      case 'participating':
        return participatingChallenges || [];
      case 'completed':
        return participatingChallenges?.filter(c => c.status === 'completed') || [];
      default:
        return challenges || [];
    }
  }, [viewMode, challenges, featuredChallenges, participatingChallenges]);

  const isViewLoading = useMemo(() => {
    switch (viewMode) {
      case 'featured':
        return featuredLoading;
      case 'participating':
      case 'completed':
        return participatingLoading;
      default:
        return isLoading;
    }
  }, [viewMode, isLoading, featuredLoading, participatingLoading]);

  const handleCreateChallenge = async (challengeData: CreateChallengeRequest) => {
    try {
      await createChallenge.mutateAsync(challengeData);
      setShowChallengeForm(false);
      toast.success('Challenge created successfully!');
    } catch {
      toast.error('Failed to create challenge');
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      await joinChallenge.mutateAsync(challengeId);
    } catch {
      toast.error('Failed to join challenge');
    }
  };

  const handleLeaveChallenge = async (challengeId: string) => {
    try {
      await leaveChallenge.mutateAsync(challengeId);
    } catch {
      toast.error('Failed to leave challenge');
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: [],
      category: [],
      difficulty: [],
      status: [],
      tags: [],
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters, viewMode]);

  const activeFiltersCount = Object.values(filters).reduce((count, value) => {
    if (Array.isArray(value)) return count + value.length;
    return count + (value ? 1 : 0);
  }, 0);

  if (isViewLoading && !displayChallenges.length) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Trophy className="text-yellow-500" size={32} />
              Challenges
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Compete, achieve, and level up your productivity
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowChallengeForm(true)}
            className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
          >
            <Plus size={20} />
            Create Challenge
          </motion.button>
        </div>
        {challengeStats && (
          <div className="mb-8">
            <ChallengeStats stats={challengeStats} />
          </div>
        )}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'all', label: 'All Challenges', icon: Target },
            { key: 'featured', label: 'Featured', icon: Zap },
            { key: 'participating', label: 'My Challenges', icon: Users },
            { key: 'completed', label: 'Completed', icon: Trophy },
          ].map(({ key, label, icon: Icon }) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setViewMode(key as ViewMode)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                viewMode === key
                  ? 'bg-purple-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Icon size={18} />
              {label}
            </motion.button>
          ))}
        </div>

        {viewMode === 'all' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search challenges..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showFilters || activeFiltersCount > 0
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                <Filter size={20} />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="bg-purple-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </motion.button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <ChallengeFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    onClearFilters={clearFilters}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        <div className="mb-6">
          {displayChallenges.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No challenges found
              </h3>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {displayChallenges.map((challenge) => (
                  <motion.div
                    key={challenge._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChallengeCard
                      challenge={challenge}
                      onJoin={handleJoinChallenge}
                      onLeave={handleLeaveChallenge}
                      showActions
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
      <AnimatePresence>
        {showChallengeForm && (
          <ChallengeForm
            onSubmit={handleCreateChallenge}
            onCancel={() => setShowChallengeForm(false)}
            loading={createChallenge.isPending}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Challenges;
