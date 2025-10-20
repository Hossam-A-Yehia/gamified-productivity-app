import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Calendar, 
  Zap,
  Crown,
  Star
} from 'lucide-react';
import type { PublicProfile, UserProfile } from '../../types/profile';
import { profileService } from '../../services/profileService';

interface ProfileCardProps {
  profile: PublicProfile | UserProfile;
  isOwnProfile?: boolean;
  showActions?: boolean;
  onSendFriendRequest?: () => void;
  onViewProfile?: () => void;
  className?: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  isOwnProfile = false,
  showActions = true,
  onSendFriendRequest,
  onViewProfile,
  className = '',
}) => {
  const levelProgress = profileService.getLevelProgress(profile.xp);
  const onlineStatus = profileService.getOnlineStatus('lastActiveDate' in profile ? profile.lastActiveDate : undefined);
  const statusColor = profileService.getStatusColor(onlineStatus);

  const isFullProfile = 'email' in profile;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
    >
      {/* Header with background */}
      <div className="relative h-24 bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="absolute inset-0 bg-black bg-opacity-20" />
        
        {/* Level badge */}
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-1 bg-green-800 bg-opacity-20 backdrop-blur-sm rounded-full px-3 py-1">
            <Crown className="w-4 h-4 text-yellow-300" />
            <span className="text-white font-semibold text-sm">Level {profile.level}</span>
          </div>
        </div>

        {/* Online status */}
        {'isOnline' in profile && profile.isOnline !== undefined && (
          <div className="absolute top-4 left-4">
            <div className={`w-3 h-3 rounded-full ${statusColor}`} />
          </div>
        )}
      </div>

      {/* Profile content */}
      <div className="relative px-6 pb-6">
        {/* Avatar */}
        <div className="relative -mt-12 mb-4">
          <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-gray-400" />
            )}
          </div>
          
          {/* XP Progress ring */}
          <div className="absolute inset-0 w-24 h-24">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="46"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-gray-200 dark:text-gray-600"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="46"
                stroke="url(#xpGradient)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 46}`}
                strokeDashoffset={`${2 * Math.PI * 46 * (1 - levelProgress.progress / 100)}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 46 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 46 * (1 - levelProgress.progress / 100) }}
                transition={{ duration: 1, delay: 0.5 }}
              />
              <defs>
                <linearGradient id="xpGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" className="stop-blue-500" />
                  <stop offset="100%" className="stop-purple-500" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Name and basic info */}
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            {profile.name}
          </h3>
          
          {isFullProfile && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              {(profile as UserProfile).email}
            </p>
          )}

          <div className="flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              <span>{profile.xp.toLocaleString()} XP</span>
            </div>
            
            {isFullProfile && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>{(profile as UserProfile).coins} coins</span>
              </div>
            )}
          </div>

          {/* XP to next level */}
          <div className="mt-2">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {levelProgress.xpToNext} XP to level {levelProgress.currentLevel + 1}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress.progress}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        {profile.stats && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {profile.stats.totalTasksCompleted}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Tasks</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {profileService.formatTime(profile.stats.totalFocusTime)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Focus Time</div>
            </div>
          </div>
        )}

        {/* Achievements preview */}
        {profile.achievements.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Achievements
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {profile.achievements.length}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {profile.achievements.slice(0, 6).map((achievement) => (
                <span
                  key={achievement}
                  className="text-lg"
                  title={achievement.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                >
                  {profileService.getAchievementIcon(achievement)}
                </span>
              ))}
              {profile.achievements.length > 6 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                  +{profile.achievements.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Join date */}
        <div className="flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-4">
          <Calendar className="w-3 h-3" />
          <span>Joined {profileService.formatDate(profile.createdAt)}</span>
        </div>

        {/* Actions */}
        {showActions && !isOwnProfile && (
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onViewProfile}
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              View Profile
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSendFriendRequest}
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Add Friend
            </motion.button>
          </div>
        )}

        {isOwnProfile && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onViewProfile}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Edit Profile
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};
