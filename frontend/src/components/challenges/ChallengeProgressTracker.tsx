import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Target, TrendingUp, Clock } from 'lucide-react';
import type { Challenge, RequirementProgress } from '../../types/challenge';
import { challengeService } from '../../services/challengeService';

interface ChallengeProgressTrackerProps {
  challenge: Challenge;
  userId: string;
  onProgressUpdate?: (challengeId: string, requirementId: string, increment: number) => void;
}

export const ChallengeProgressTracker: React.FC<ChallengeProgressTrackerProps> = ({
  challenge,
  userId,
  onProgressUpdate,
}) => {
  const participant = challenge.participants.find(p => p.userId === userId);
  const progress = participant?.progress;
  const timeRemaining = challengeService.getChallengeTimeRemaining(challenge);

  if (!participant || !progress) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
        <Target className="mx-auto text-gray-400 mb-4" size={48} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Not Participating
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Join this challenge to track your progress and compete with others!
        </p>
      </div>
    );
  }

  const getRequirementProgress = (reqProgress: RequirementProgress) => {
    const percentage = Math.min((reqProgress.current / reqProgress.target) * 100, 100);
    return {
      percentage,
      isCompleted: reqProgress.isCompleted,
      remaining: Math.max(reqProgress.target - reqProgress.current, 0),
    };
  };

  const formatTimeRemaining = () => {
    if (timeRemaining.isExpired) return 'Challenge Expired';
    if (timeRemaining.days > 0) return `${timeRemaining.days}d ${timeRemaining.hours}h remaining`;
    if (timeRemaining.hours > 0) return `${timeRemaining.hours}h ${timeRemaining.minutes}m remaining`;
    return `${timeRemaining.minutes}m ${timeRemaining.seconds}s remaining`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="text-blue-500" size={20} />
            Your Progress
          </h3>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.round(progress.overallProgress)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Complete
            </div>
          </div>
        </div>
        <div className="mb-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.overallProgress}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className={`h-4 rounded-full ${
                progress.overallProgress === 100
                  ? 'bg-gradient-to-r from-green-400 to-green-600'
                  : progress.overallProgress >= 75
                  ? 'bg-gradient-to-r from-blue-400 to-blue-600'
                  : progress.overallProgress >= 50
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                  : 'bg-gradient-to-r from-gray-400 to-gray-600'
              }`}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Clock size={16} />
          <span>{formatTimeRemaining()}</span>
        </div>
        {participant.isCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
          >
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle size={20} />
              <span className="font-medium">Challenge Completed!</span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-500 mt-1">
              Completed on {new Date(participant.completedAt!).toLocaleDateString()}
            </p>
          </motion.div>
        )}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Target className="text-purple-500" size={20} />
          Requirements
        </h3>

        <div className="space-y-4">
          {progress.requirements.map((reqProgress, index) => {
            const requirement = challenge.requirements[index];
            const progressData = getRequirementProgress(reqProgress);

            return (
              <motion.div
                key={reqProgress.requirementId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  progressData.isCompleted
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                    : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {progressData.isCompleted ? (
                        <CheckCircle className="text-green-500" size={20} />
                      ) : (
                        <Circle className="text-gray-400" size={20} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {requirement.description}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {reqProgress.current} / {reqProgress.target} {requirement.unit}
                        {!progressData.isCompleted && progressData.remaining > 0 && (
                          <span className="ml-2 text-orange-600 dark:text-orange-400">
                            ({progressData.remaining} remaining)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      progressData.isCompleted 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {Math.round(progressData.percentage)}%
                    </div>
                    {progressData.isCompleted && reqProgress.completedAt && (
                      <div className="text-xs text-green-600 dark:text-green-500">
                        {new Date(reqProgress.completedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressData.percentage}%` }}
                    transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                    className={`h-2 rounded-full ${
                      progressData.isCompleted
                        ? 'bg-green-500'
                        : progressData.percentage >= 75
                        ? 'bg-blue-500'
                        : progressData.percentage >= 50
                        ? 'bg-yellow-500'
                        : 'bg-gray-400'
                    }`}
                  />
                </div>
                {onProgressUpdate && !progressData.isCompleted && (
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => onProgressUpdate(challenge._id, reqProgress.requirementId, 1)}
                      className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                    >
                      +1 {requirement.unit}
                    </button>
                    <button
                      onClick={() => onProgressUpdate(challenge._id, reqProgress.requirementId, 5)}
                      className="px-3 py-1 text-xs bg-purple-500 hover:bg-purple-600 text-white rounded transition-colors"
                    >
                      +5 {requirement.unit}
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Progress Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {progress.requirements.filter(r => r.isCompleted).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Completed
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {progress.requirements.length - progress.requirements.filter(r => r.isCompleted).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Remaining
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {participant.rank || 'N/A'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Your Rank
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {challenge.participants.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Participants
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
