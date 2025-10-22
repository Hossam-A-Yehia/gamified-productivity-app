import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Trophy, Clock, Target, Star, Coins } from 'lucide-react';
import type { Challenge } from '../../types/challenge';
import { CHALLENGE_CATEGORIES, CHALLENGE_DIFFICULTIES } from '../../types/challenge';
import { challengeService } from '../../services/challengeService';
import { useAuth } from '../../hooks/useAuth';

interface ChallengeCardProps {
  challenge: Challenge;
  onJoin?: (challengeId: string) => void;
  onLeave?: (challengeId: string) => void;
  onView?: (challengeId: string) => void;
  showActions?: boolean;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  onJoin,
  onLeave,
  onView,
  showActions = true,
}) => {
  const { user } = useAuth();
  
  const category = CHALLENGE_CATEGORIES.find(c => c.value === challenge.category);
  const difficulty = CHALLENGE_DIFFICULTIES.find(d => d.value === challenge.difficulty);
  
  const isParticipating = challenge.participants.some(p => 
    (typeof p.userId === 'string' ? p.userId : (p.userId as any)?._id) === user?.id
  );
  const userProgress = challenge.participants.find(p => 
    (typeof p.userId === 'string' ? p.userId : (p.userId as any)?._id) === user?.id
  )?.progress.overallProgress || 0;
  const canJoin = challengeService.canJoinChallenge(challenge, user?.id);
  
  const timeRemaining = challengeService.getChallengeTimeRemaining(challenge);
  const rewardValue = challengeService.getChallengeRewardValue(challenge);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const formatTimeRemaining = () => {
    if (timeRemaining.isExpired) return 'Expired';
    if (timeRemaining.days > 0) return `${timeRemaining.days}d ${timeRemaining.hours}h`;
    if (timeRemaining.hours > 0) return `${timeRemaining.hours}h ${timeRemaining.minutes}m`;
    return `${timeRemaining.minutes}m ${timeRemaining.seconds}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div className={`h-32 ${category?.color || 'bg-gray-500'} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40" />
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(challenge.status)}`}>
            {challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}
          </span>
          {challenge.type === 'seasonal' && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
              🎉 Special
            </span>
          )}
          {isParticipating && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              ✓ Joined
            </span>
          )}
        </div>
        <div className="absolute top-4 right-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficulty?.bgColor} ${difficulty?.color}`}>
            {difficulty?.label}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 text-white">
          <div className="text-2xl mb-1">{category?.icon}</div>
          <div className="text-sm opacity-90">{category?.label}</div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {challenge.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {challenge.description}
          </p>
        </div>
        {isParticipating && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Your Progress
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {Math.round(userProgress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${userProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Users size={16} />
            <span>{challenge.participants.length} participants</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock size={16} />
            <span>{challenge.status === 'active' ? formatTimeRemaining() : formatDate(challenge.startDate)}</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Target size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Requirements
            </span>
          </div>
          <div className="space-y-1">
            {challenge.requirements.slice(0, 2).map((req, index) => (
              <div key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                <span>{req.description}</span>
              </div>
            ))}
            {challenge.requirements.length > 2 && (
              <div className="text-xs text-gray-500 dark:text-gray-500">
                +{challenge.requirements.length - 2} more requirements
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={16} className="text-yellow-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Rewards
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            {rewardValue.totalXP > 0 && (
              <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                <Star size={14} />
                <span>{rewardValue.totalXP} XP</span>
              </div>
            )}
            {rewardValue.totalCoins > 0 && (
              <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                <Coins size={14} />
                <span>{rewardValue.totalCoins}</span>
              </div>
            )}
            {rewardValue.badges > 0 && (
              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                <Trophy size={14} />
                <span>{rewardValue.badges} badge{rewardValue.badges !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>

        {showActions && (
          <div className="flex gap-2">
            {isParticipating ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onView?.(challenge._id)}
                  className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  View Details
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onLeave?.(challenge._id)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm font-medium"
                >
                  Leave
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onView?.(challenge._id)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm font-medium"
                >
                  View Details
                </motion.button>
                {canJoin && !isParticipating && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onJoin?.(challenge._id)}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Join
                  </motion.button>
                )}
                {isParticipating && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onLeave?.(challenge._id)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Leave
                  </motion.button>
                )}
              </>
            )}
          </div>
        )}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>Starts: {formatDate(challenge.startDate)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>Ends: {formatDate(challenge.endDate)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
