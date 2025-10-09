import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

const Dashboard: React.FC = () => {
  const { user, logout, isLoggingOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">🎮</span>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Productivity Dashboard
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Welcome back, <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>!
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Level', value: user.level, icon: '🏆', color: 'bg-blue-500' },
            { label: 'XP', value: user.xp.toLocaleString(), icon: '⭐', color: 'bg-purple-500' },
            { label: 'Coins', value: user.coins.toLocaleString(), icon: '🪙', color: 'bg-yellow-500' },
            { label: 'Streak', value: `${user.streak} days`, icon: '🔥', color: 'bg-red-500' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center">
                <div className={`${stat.color} rounded-lg p-3 mr-4`}>
                  <span className="text-xl">{stat.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white mb-8"
        >
          <h2 className="text-3xl font-bold mb-4">
            🎉 Welcome to Your Productivity Journey!
          </h2>
          <p className="text-lg opacity-90 mb-6">
            You're at Level {user.level} with {user.xp.toLocaleString()} XP. 
            Keep completing tasks to level up and earn more rewards!
          </p>
          <div className="flex flex-wrap gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Create New Task
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors"
            >
              View Achievements
            </motion.button>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Profile Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
              <p className="font-medium text-gray-900 dark:text-white">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Member Since</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks Completed</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {user.stats.totalTasksCompleted}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Longest Streak</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {user.stats.longestStreak} days
              </p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { title: 'Task Management', desc: 'Create and organize your tasks', icon: '📝' },
            { title: 'Achievements', desc: 'Unlock badges and rewards', icon: '🏆' },
            { title: 'Leaderboard', desc: 'Compete with friends', icon: '📊' },
          ].map((feature) => (
            <motion.div
              key={feature.title}
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {feature.desc}
              </p>
              <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full text-sm">
                Coming Soon
              </span>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
