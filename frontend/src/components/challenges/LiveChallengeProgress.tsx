import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, TrendingUp } from 'lucide-react';
import { useChallengeEvents } from '../../hooks/useSocket';

interface ProgressUpdate {
  challengeId: string;
  progress: number;
  timestamp: Date;
}

interface LiveChallengeProgressProps {
  challengeId: string;
  initialProgress?: number;
  participants?: number;
}

export const LiveChallengeProgress: React.FC<LiveChallengeProgressProps> = ({
  challengeId,
  initialProgress = 0,
  participants = 0
}) => {
  const challengeEvents = useChallengeEvents(challengeId);
  const [progress, setProgress] = useState(initialProgress);
  const [recentUpdates, setRecentUpdates] = useState<ProgressUpdate[]>([]);
  const [participantCount, setParticipantCount] = useState(participants);

  useEffect(() => {
    const cleanupProgress = challengeEvents.onProgressUpdated((data) => {
      if (data.challengeId === challengeId) {
        setProgress(data.progress);
        
        // Add to recent updates
        const update: ProgressUpdate = {
          challengeId: data.challengeId,
          progress: data.progress,
          timestamp: new Date()
        };
        
        setRecentUpdates(prev => [update, ...prev.slice(0, 4)]);
      }
    });

    const cleanupJoined = challengeEvents.onParticipantJoined((data) => {
      if (data.challengeId === challengeId) {
        setParticipantCount(prev => prev + 1);
      }
    });

    const cleanupLeft = challengeEvents.onParticipantLeft((data) => {
      if (data.challengeId === challengeId) {
        setParticipantCount(prev => Math.max(0, prev - 1));
      }
    });

    const cleanupCompleted = challengeEvents.onChallengeCompleted((data) => {
      if (data.challengeId === challengeId) {
        setProgress(100);
      }
    });

    return () => {
      cleanupProgress();
      cleanupJoined();
      cleanupLeft();
      cleanupCompleted();
    };
  }, [challengeEvents, challengeId]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Challenge Progress
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Users className="w-4 h-4" />
          <span>{participantCount} participants</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Overall Progress
          </span>
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
            {progress.toFixed(1)}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
            initial={{ width: `${initialProgress}%` }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Recent Updates */}
      {recentUpdates.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Recent Updates
          </h4>
          
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {recentUpdates.map((update) => (
              <motion.div
                key={`${update.challengeId}-${update.timestamp.getTime()}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-700 rounded p-2"
              >
                <span className="text-gray-600 dark:text-gray-400">
                  Progress updated to {update.progress.toFixed(1)}%
                </span>
                <span className="text-gray-500 dark:text-gray-500">
                  {update.timestamp.toLocaleTimeString()}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Completion Status */}
      {progress >= 100 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mt-4 p-3 bg-green-100 dark:bg-green-900 rounded-lg border border-green-300 dark:border-green-700"
        >
          <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <Trophy className="w-5 h-5" />
            <span className="font-semibold">Challenge Completed! 🎉</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LiveChallengeProgress;
