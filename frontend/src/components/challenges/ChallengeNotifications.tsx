import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Trophy, Target, Users, Clock, Star } from 'lucide-react';
import { toast } from 'sonner';

export interface ChallengeNotification {
  id: string;
  type: 'challenge_started' | 'challenge_ending' | 'progress_milestone' | 'challenge_completed' | 'rank_changed' | 'new_participant';
  title: string;
  message: string;
  challengeId: string;
  challengeTitle: string;
  timestamp: string;
  isRead: boolean;
  data?: any;
}

interface ChallengeNotificationsProps {
  notifications: ChallengeNotification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onNavigateToChallenge: (challengeId: string) => void;
}

export const ChallengeNotifications: React.FC<ChallengeNotificationsProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNavigateToChallenge,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const latestNotification = notifications[0];
    if (latestNotification && !latestNotification.isRead) {
      const { type, title, message } = latestNotification;
      
      switch (type) {
        case 'challenge_completed':
          toast.success(title, { description: message, duration: 5000 });
          break;
        case 'progress_milestone':
          toast.success(title, { description: message, duration: 4000 });
          break;
        case 'rank_changed':
          toast.info(title, { description: message, duration: 4000 });
          break;
        case 'challenge_ending':
          toast.warning(title, { description: message, duration: 6000 });
          break;
        default:
          toast.info(title, { description: message, duration: 3000 });
      }
    }
  }, [notifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'challenge_started':
        return <Target className="text-blue-500" size={20} />;
      case 'challenge_ending':
        return <Clock className="text-orange-500" size={20} />;
      case 'progress_milestone':
        return <Star className="text-yellow-500" size={20} />;
      case 'challenge_completed':
        return <Trophy className="text-green-500" size={20} />;
      case 'rank_changed':
        return <Trophy className="text-purple-500" size={20} />;
      case 'new_participant':
        return <Users className="text-blue-500" size={20} />;
      default:
        return <Bell className="text-gray-500" size={20} />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'challenge_completed':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
      case 'progress_milestone':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'rank_changed':
        return 'border-l-purple-500 bg-purple-50 dark:bg-purple-900/20';
      case 'challenge_ending':
        return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20';
      default:
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Challenge Notifications
                  </h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={onMarkAllAsRead}
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="mx-auto text-gray-400 mb-3" size={32} />
                    <p className="text-gray-600 dark:text-gray-400">
                      No notifications yet
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border-l-4 ${
                          notification.isRead ? 'opacity-75' : ''
                        } ${getNotificationColor(notification.type)}`}
                        onClick={() => {
                          onMarkAsRead(notification.id);
                          onNavigateToChallenge(notification.challengeId);
                          setIsOpen(false);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                                {notification.title}
                              </h4>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2 mt-1" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500 dark:text-gray-500">
                                {notification.challengeTitle}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-500">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                  <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                    View All Notifications
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export const useChallengeNotifications = () => {
  const [notifications, setNotifications] = useState<ChallengeNotification[]>([]);

  const addNotification = (notification: Omit<ChallengeNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: ChallengeNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep only latest 50
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const simulateNotifications = () => {
    const sampleNotifications = [
      {
        type: 'challenge_completed' as const,
        title: '🎉 Challenge Completed!',
        message: 'Congratulations! You have successfully completed the "Weekly Productivity Sprint" challenge.',
        challengeId: 'challenge-1',
        challengeTitle: 'Weekly Productivity Sprint',
      },
      {
        type: 'progress_milestone' as const,
        title: '⭐ Milestone Reached!',
        message: 'You have completed 75% of your requirements in the "Focus Master" challenge.',
        challengeId: 'challenge-2',
        challengeTitle: 'Focus Master',
      },
      {
        type: 'rank_changed' as const,
        title: '📈 Rank Updated!',
        message: 'You moved up to 3rd place in the "Team Collaboration" challenge leaderboard!',
        challengeId: 'challenge-3',
        challengeTitle: 'Team Collaboration',
      },
      {
        type: 'challenge_ending' as const,
        title: '⏰ Challenge Ending Soon!',
        message: 'The "Daily Habits" challenge ends in 2 hours. Complete your remaining tasks!',
        challengeId: 'challenge-4',
        challengeTitle: 'Daily Habits',
      },
    ];

    sampleNotifications.forEach((notification, index) => {
      setTimeout(() => addNotification(notification), index * 1000);
    });
  };

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    simulateNotifications,
  };
};
