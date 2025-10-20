import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Coins, 
  Zap, 
  Target, 
  Users, 
  Bell,
  TrendingUp,
  Award,
  Timer
} from 'lucide-react';
import { 
  useTaskEvents, 
  useChallengeEvents, 
  useLeaderboardEvents, 
  useFocusEvents, 
  useAchievementEvents,
  useNotificationEvents,
  useFriendEvents
} from '../../hooks/useSocket';
import { toast } from 'sonner';


export const RealtimeNotifications: React.FC = () => {
  const taskEvents = useTaskEvents();
  const challengeEvents = useChallengeEvents();
  const leaderboardEvents = useLeaderboardEvents();
  const focusEvents = useFocusEvents();
  const achievementEvents = useAchievementEvents();
  const notificationEvents = useNotificationEvents();
  const friendEvents = useFriendEvents();

  // Task completion events
  useEffect(() => {
    const cleanup = taskEvents.onTaskCompleted((data) => {
      toast.success(
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-green-500" />
          <span>Task completed! +{data.rewards.xp} XP</span>
        </div>
      );
    });
    return cleanup;
  }, [taskEvents]);

  useEffect(() => {
    const cleanup = taskEvents.onXPGained((data) => {
      if (data.xp.amount > 0) {
        toast.success(
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>+{data.xp.amount} XP from {data.xp.source.replace('_', ' ')}</span>
          </div>
        );
      }
    });
    return cleanup;
  }, [taskEvents]);

  useEffect(() => {
    const cleanup = taskEvents.onCoinsEarned((data) => {
      if (data.coins.amount > 0) {
        toast.success(
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-yellow-600" />
            <span>+{data.coins.amount} coins earned!</span>
          </div>
        );
      }
    });
    return cleanup;
  }, [taskEvents]);

  useEffect(() => {
    const cleanup = taskEvents.onLevelUp((data) => {
      toast.success(
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-500" />
          <span>🎉 Level Up! You're now level {data.levelData.newLevel}!</span>
        </div>,
        {
          duration: 5000,
        }
      );
    });
    return cleanup;
  }, [taskEvents]);

  // Challenge events
  useEffect(() => {
    const cleanup = challengeEvents.onProgressUpdated((data) => {
      // Only show for significant progress updates
      if (data.progress > 0 && data.progress % 25 === 0) {
        toast.info(
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-blue-500" />
            <span>Challenge progress: {data.progress}%</span>
          </div>
        );
      }
    });
    return cleanup;
  }, [challengeEvents]);

  useEffect(() => {
    const cleanup = challengeEvents.onChallengeCompleted((data) => {
      toast.success(
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-gold-500" />
          <span>🏆 Challenge completed! Rank #{data.completionData.rank}</span>
        </div>,
        {
          duration: 5000,
        }
      );
    });
    return cleanup;
  }, [challengeEvents]);

  useEffect(() => {
    const cleanup = challengeEvents.onParticipantJoined(() => {
      toast.info(
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-500" />
          <span>Someone joined your challenge!</span>
        </div>
      );
    });
    return cleanup;
  }, [challengeEvents]);

  // Leaderboard events
  useEffect(() => {
    const cleanup = leaderboardEvents.onRankChanged((data) => {
      if (data.newRank < data.oldRank) {
        toast.success(
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span>📈 Rank improved to #{data.newRank}!</span>
          </div>
        );
      }
    });
    return cleanup;
  }, [leaderboardEvents]);

  useEffect(() => {
    const cleanup = leaderboardEvents.onUserAchievementUnlocked(() => {
      toast.info(
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-purple-500" />
          <span>Someone unlocked an achievement!</span>
        </div>
      );
    });
    return cleanup;
  }, [leaderboardEvents]);

  // Focus session events
  useEffect(() => {
    const cleanup = focusEvents.onFocusSessionCompleted((data) => {
      toast.success(
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-orange-500" />
          <span>🎯 Focus session completed! +{data.rewards.xp} XP</span>
        </div>
      );
    });
    return cleanup;
  }, [focusEvents]);

  // Achievement events
  useEffect(() => {
    const cleanup = achievementEvents.onAchievementUnlocked((data) => {
      toast.success(
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-gold-500" />
          <span>🏅 Achievement unlocked: {data.achievement.name}!</span>
        </div>,
        {
          duration: 6000,
        }
      );
    });
    return cleanup;
  }, [achievementEvents]);

  // Notification events
  useEffect(() => {
    const cleanup = notificationEvents.onNewNotification((data) => {
      toast.info(
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-500" />
          <span>{data.notification.message}</span>
        </div>
      );
    });
    return cleanup;
  }, [notificationEvents]);

  // Friend events
  useEffect(() => {
    const cleanup = friendEvents.onFriendRequestReceived(() => {
      toast.info(
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-500" />
          <span>You have a new friend request!</span>
        </div>
      );
    });
    return cleanup;
  }, [friendEvents]);

  useEffect(() => {
    const cleanup = friendEvents.onFriendRequestAccepted(() => {
      toast.success(
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-green-500" />
          <span>Friend request accepted!</span>
        </div>
      );
    });
    return cleanup;
  }, [friendEvents]);

  // Connection status indicator
  const isConnected = taskEvents.isConnected;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>        
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-lg p-3 mb-2 shadow-lg"
          >
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm font-medium">Real-time updates active</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RealtimeNotifications;
