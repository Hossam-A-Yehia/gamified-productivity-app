import React from 'react';
import { motion } from 'framer-motion';
import { 
  Timer, 
  Target, 
  TrendingUp, 
  Award, 
  Zap, 
  Calendar,
  Clock,
  BarChart3
} from 'lucide-react';
import { useFocusStats } from '../../hooks/useFocus';
import { focusService } from '../../services/focusService';
import LoadingSpinner from '../ui/LoadingSpinner';

interface FocusStatsProps {
  className?: string;
}

export const FocusStats: React.FC<FocusStatsProps> = ({ className = '' }) => {
  const { data: stats, isLoading, error } = useFocusStats();

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 ${className}`}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 ${className}`}>
        <p className="text-red-500 text-center">Failed to load focus statistics</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Sessions',
      value: stats.totalSessions,
      icon: Timer,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      title: 'Focus Time',
      value: focusService.formatDuration(stats.totalFocusTime),
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      title: 'Completion Rate',
      value: `${stats.completionRate}%`,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      title: 'Current Streak',
      value: `${stats.currentStreak} days`,
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    },
    {
      title: 'Avg Productivity',
      value: `${stats.averageProductivity}%`,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
    },
    {
      title: 'XP Earned',
      value: stats.totalXpEarned,
      icon: Award,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Session Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Session Breakdown
            </h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Pomodoro Sessions</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats.categoryBreakdown.pomodoro}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Custom Sessions</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats.categoryBreakdown.custom}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Completed Sessions</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats.completedSessions}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Average Length</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats.averageSessionLength}m
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Longest Session</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats.longestSession}m
              </span>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Today</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats.todaysSessions} sessions
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">This Week</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats.thisWeekSessions} sessions
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">This Month</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats.thisMonthSessions} sessions
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Productivity Trend */}
      {stats.productivityTrend.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              7-Day Productivity Trend
            </h3>
          </div>
          
          <div className="space-y-3">
            {stats.productivityTrend.map((day, index) => (
              <div key={day.date} className="flex items-center gap-4">
                <div className="w-16 text-sm text-gray-600 dark:text-gray-400">
                  {new Date(day.date).toLocaleDateString('en-US', { 
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {day.sessions} sessions
                    </span>
                    <span className={`text-sm font-medium ${focusService.calculateProductivityColor(day.productivity)}`}>
                      {day.productivity}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${day.productivity}%` }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                      className={`h-2 rounded-full ${
                        day.productivity >= 80 
                          ? 'bg-green-500' 
                          : day.productivity >= 60 
                          ? 'bg-yellow-500' 
                          : day.productivity >= 40 
                          ? 'bg-orange-500' 
                          : 'bg-red-500'
                      }`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
