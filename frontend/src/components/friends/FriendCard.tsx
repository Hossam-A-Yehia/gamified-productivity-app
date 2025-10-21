import React from 'react';
import { motion } from 'framer-motion';
import { 
  UserCheck, 
  UserX, 
  UserPlus, 
  MessageCircle, 
  Clock
} from 'lucide-react';
import type { PublicProfile } from '../../types/profile';
import { profileService } from '../../services/profileService';

interface FriendCardProps {
  user: PublicProfile;
  type: 'friend' | 'request' | 'sent' | 'suggestion';
  onSendRequest?: (userId: string) => void;
  onAcceptRequest?: (userId: string) => void;
  onDeclineRequest?: (userId: string) => void;
  onRemoveFriend?: (userId: string) => void;
  onCancelRequest?: (userId: string) => void;
  isLoading?: boolean;
}

const FriendCard: React.FC<FriendCardProps> = ({
  user,
  type,
  onSendRequest,
  onAcceptRequest,
  onDeclineRequest,
  onRemoveFriend,
  onCancelRequest,
  isLoading = false
}) => {
  const isOnline = user.isOnline;

  const renderActions = () => {
    switch (type) {
      case 'friend':
        return (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="Send message"
            >
              <MessageCircle className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onRemoveFriend?.(user._id)}
              disabled={isLoading}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
              title="Remove friend"
            >
              <UserX className="w-5 h-5" />
            </motion.button>
          </>
        );

      case 'request':
        return (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAcceptRequest?.(user._id)}
              disabled={isLoading}
              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
              title="Accept request"
            >
              <UserCheck className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDeclineRequest?.(user._id)}
              disabled={isLoading}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
              title="Decline request"
            >
              <UserX className="w-5 h-5" />
            </motion.button>
          </>
        );

      case 'sent':
        return (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCancelRequest?.(user._id)}
            disabled={isLoading}
            className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            title="Cancel request"
          >
            <Clock className="w-5 h-5" />
          </motion.button>
        );

      case 'suggestion':
        return (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSendRequest?.(user._id)}
            disabled={isLoading}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
            title="Send friend request"
          >
            <UserPlus className="w-5 h-5" />
          </motion.button>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xl">
              {user.name.charAt(0).toUpperCase()}
            </div>
            {isOnline !== undefined && (
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 ${
                isOnline ? 'bg-green-500' : 'bg-gray-400'
              }`} />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {user.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Level {user.level} • {user.xp} XP
            </p>
            {user.stats && (
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{user.stats.totalTasksCompleted} tasks</span>
                <span>{Math.floor(user.stats.totalFocusTime / 60)}h focus</span>
                <span>{user.stats.longestStreak} day streak</span>
              </div>
            )}
            {isOnline !== undefined && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {isOnline ? 'Online now' : `Last seen ${profileService.formatRelativeTime(user.lastActiveDate!)}`}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {renderActions()}
        </div>
      </div>
    </motion.div>
  );
};

export default FriendCard;
