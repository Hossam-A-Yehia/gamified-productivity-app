import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  BarChart3, 
  Users, 
  Edit3,
  Camera,
  Save,
  X
} from 'lucide-react';
import { useMyProfile, useProfileStats, useProfileOperations } from '../hooks/useProfile';
import { ProfileCard } from '../components/profile/ProfileCard';
import { profileService } from '../services/profileService';
import type { UpdateProfileRequest } from '../types/profile';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { toast } from 'sonner';

type ViewMode = 'overview' | 'stats' | 'friends' | 'edit';

const Profile: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    avatarUrl: '',
  });

  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: stats, isLoading: statsLoading } = useProfileStats();
  const { updateProfile } = useProfileOperations();

  // Initialize edit form when profile loads
  React.useEffect(() => {
    if (profile && !isEditing) {
      setEditForm({
        name: profile.name,
        avatarUrl: profile.avatarUrl || '',
      });
    }
  }, [profile, isEditing]);

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!editForm.name.trim()) {
      toast.error('Name is required');
      return;
    }

    const updateData: UpdateProfileRequest = {
      name: editForm.name.trim(),
      avatarUrl: editForm.avatarUrl.trim() || undefined,
    };

    try {
      await updateProfile.mutateAsync(updateData);
      setIsEditing(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setEditForm({
        name: profile.name,
        avatarUrl: profile.avatarUrl || '',
      });
    }
    setIsEditing(false);
  };

  const viewModes = [
    { key: 'overview', label: 'Overview', icon: User },
    { key: 'stats', label: 'Statistics', icon: BarChart3 },
    { key: 'friends', label: 'Friends', icon: Users },
    { key: 'edit', label: 'Edit Profile', icon: Edit3 },
  ];

  if (profileLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Profile Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Unable to load your profile. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <User className="text-blue-500" size={32} />
            My Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your profile and view your progress
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {viewModes.map(({ key, label, icon: Icon }) => (
          <motion.button
            key={key}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setViewMode(key as ViewMode)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === key
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <Icon size={18} />
            {label}
          </motion.button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <ProfileCard
                profile={profile}
                isOwnProfile={true}
                showActions={true}
                onViewProfile={handleEditProfile}
              />
            </div>

            {/* Quick Stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Level Progress */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Level Progress
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Current Level</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Level {profile.level}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total XP</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {profile.xp.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">XP to Next Level</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {profileService.getLevelProgress(profile.xp).xpToNext}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <motion.div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${profileService.getLevelProgress(profile.xp).progress}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Stats
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {profile.stats.totalTasksCompleted}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Tasks</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {profileService.formatTime(profile.stats.totalFocusTime)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Focus Time</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {profile.streak}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Current Streak</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {profile.coins}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Coins</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {viewMode === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {statsLoading ? (
              <LoadingSpinner />
            ) : stats ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Overview Stats */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Overview
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Level</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {stats.overview.level}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total XP</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {stats.overview.xp.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Coins</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {stats.overview.coins}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Current Streak</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {stats.overview.streak} days
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Achievements</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {stats.overview.totalAchievements}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Productivity Stats */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Productivity
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Tasks Completed</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {stats.productivity.totalTasksCompleted}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Focus Time</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {profileService.formatTime(stats.productivity.totalFocusTime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Focus Sessions</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {stats.productivity.completedFocusSessions}/{stats.productivity.totalFocusSessions}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Avg Productivity</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {stats.productivity.averageProductivity}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Longest Streak</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {stats.productivity.longestStreak} days
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-600 dark:text-gray-400">
                Failed to load statistics
              </div>
            )}
          </motion.div>
        )}

        {viewMode === 'friends' && (
          <motion.div
            key="friends"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Friends Management
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Friends management coming soon...
              </p>
            </div>
          </motion.div>
        )}

        {viewMode === 'edit' && (
          <motion.div
            key="edit"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Edit Profile
                </h3>
                
                {isEditing && (
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCancelEdit}
                      className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                      <X size={16} />
                      Cancel
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSaveProfile}
                      disabled={updateProfile.isPending}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Save size={16} />
                      {updateProfile.isPending ? 'Saving...' : 'Save'}
                    </motion.button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter your name"
                    />
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900 dark:text-white">{profile.name}</span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <Edit3 size={16} />
                        Edit
                      </motion.button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Avatar URL
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={editForm.avatarUrl}
                      onChange={(e) => setEditForm(prev => ({ ...prev, avatarUrl: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter avatar image URL"
                    />
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900 dark:text-white">
                        {profile.avatarUrl || 'No avatar set'}
                      </span>
                      {!isEditing && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsEditing(true)}
                          className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <Camera size={16} />
                          Change
                        </motion.button>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <span className="text-gray-600 dark:text-gray-400">{profile.email}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Email cannot be changed from here
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
