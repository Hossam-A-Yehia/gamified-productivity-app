import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Palette, 
  Target,
  Save,
  RotateCcw
} from 'lucide-react';
import { useMyProfile, useProfileOperations } from '../hooks/useProfile';
import { profileService } from '../services/profileService';
import type { UpdateSettingsRequest, SettingsFormData } from '../types/profile';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { toast } from 'sonner';

type SettingsSection = 'notifications' | 'privacy' | 'appearance' | 'productivity';

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('notifications');
  const [formData, setFormData] = useState<SettingsFormData>({
    notifications: {
      email: true,
      push: true,
      inApp: true,
      taskReminders: true,
      challengeUpdates: true,
      achievementAlerts: true,
      focusSessionAlerts: true,
    },
    theme: 'auto',
    language: 'en',
    timezone: 'UTC',
    privacy: {
      profilePublic: true,
      showInLeaderboard: true,
      allowFriendRequests: true,
      showOnlineStatus: true,
      showStats: true,
    },
    productivity: {
      workingHoursStart: '09:00',
      workingHoursEnd: '17:00',
      workingDays: [1, 2, 3, 4, 5],
      dailyGoal: {
        tasks: 5,
        focusTime: 120,
        xp: 200,
      },
      weeklyGoal: {
        tasks: 25,
        focusTime: 600,
        xp: 1000,
      },
    },
  });

  const { data: profile, isLoading } = useMyProfile();
  const { updateSettings } = useProfileOperations();

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile?.settings) {
      setFormData({
        notifications: profile.settings.notifications || {
          email: true,
          push: true,
          inApp: true,
          taskReminders: true,
          challengeUpdates: true,
          achievementAlerts: true,
          focusSessionAlerts: true,
        },
        theme: profile.settings.theme || 'auto',
        language: profile.settings.language || 'en',
        timezone: profile.settings.timezone || 'UTC',
        privacy: profile.settings.privacy || {
          profilePublic: true,
          showInLeaderboard: true,
          allowFriendRequests: true,
          showOnlineStatus: true,
          showStats: true,
        },
        productivity: profile.settings.productivity || {
          workingHoursStart: '09:00',
          workingHoursEnd: '17:00',
          workingDays: [1, 2, 3, 4, 5],
          dailyGoal: {
            tasks: 5,
            focusTime: 120,
            xp: 200,
          },
          weeklyGoal: {
            tasks: 25,
            focusTime: 600,
            xp: 1000,
          },
        },
      });
    }
  }, [profile]);

  const handleSave = async () => {
    const updateData: UpdateSettingsRequest = {
      notifications: formData.notifications,
      theme: formData.theme,
      language: formData.language,
      timezone: formData.timezone,
      privacy: formData.privacy,
      productivity: formData.productivity,
    };

    try {
      await updateSettings.mutateAsync(updateData);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleReset = () => {
    if (profile?.settings) {
      setFormData({
        notifications: profile.settings.notifications,
        theme: profile.settings.theme,
        language: profile.settings.language,
        timezone: profile.settings.timezone,
        privacy: profile.settings.privacy,
        productivity: profile.settings.productivity,
      });
      toast.info('Settings reset to saved values');
    }
  };

  const sections = [
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'privacy', label: 'Privacy', icon: Shield },
    { key: 'appearance', label: 'Appearance', icon: Palette },
    { key: 'productivity', label: 'Productivity', icon: Target },
  ];

  const timezoneOptions = profileService.getTimezoneOptions();
  const languageOptions = profileService.getLanguageOptions();
  const workingDayOptions = profileService.getWorkingDayOptions();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <SettingsIcon className="text-blue-500" size={32} />
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Customize your experience and preferences
          </p>
        </div>

        <div className="flex gap-3 mt-4 sm:mt-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
          >
            <RotateCcw size={16} />
            Reset
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={updateSettings.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {updateSettings.isPending ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <nav className="space-y-2">
              {sections.map(({ key, label, icon: Icon }) => (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveSection(key as SettingsSection)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeSection === key
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </motion.button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeSection === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Notification Preferences
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      General Notifications
                    </h3>
                    <div className="space-y-4">
                      {[
                        { key: 'email', label: 'Email Notifications', description: 'Receive notifications via email' },
                        { key: 'push', label: 'Push Notifications', description: 'Browser push notifications' },
                        { key: 'inApp', label: 'In-App Notifications', description: 'Show notifications within the app' },
                      ].map(({ key, label, description }) => (
                        <div key={key} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{label}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{description}</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.notifications[key as keyof typeof formData.notifications]}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                notifications: {
                                  ...prev.notifications,
                                  [key]: e.target.checked
                                }
                              }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Activity Notifications
                    </h3>
                    <div className="space-y-4">
                      {[
                        { key: 'taskReminders', label: 'Task Reminders', description: 'Reminders for upcoming tasks' },
                        { key: 'challengeUpdates', label: 'Challenge Updates', description: 'Updates on challenge progress' },
                        { key: 'achievementAlerts', label: 'Achievement Alerts', description: 'Notifications for new achievements' },
                        { key: 'focusSessionAlerts', label: 'Focus Session Alerts', description: 'Alerts for focus session completion' },
                      ].map(({ key, label, description }) => (
                        <div key={key} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{label}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{description}</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.notifications[key as keyof typeof formData.notifications]}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                notifications: {
                                  ...prev.notifications,
                                  [key]: e.target.checked
                                }
                              }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'privacy' && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Privacy Settings
                </h2>

                <div className="space-y-6">
                  {[
                    { key: 'profilePublic', label: 'Public Profile', description: 'Allow others to view your profile' },
                    { key: 'showInLeaderboard', label: 'Show in Leaderboard', description: 'Display your ranking in leaderboards' },
                    { key: 'allowFriendRequests', label: 'Allow Friend Requests', description: 'Let others send you friend requests' },
                    { key: 'showOnlineStatus', label: 'Show Online Status', description: 'Display when you\'re online' },
                    { key: 'showStats', label: 'Show Statistics', description: 'Allow others to see your stats' },
                  ].map(({ key, label, description }) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{label}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{description}</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.privacy[key as keyof typeof formData.privacy]}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            privacy: {
                              ...prev.privacy,
                              [key]: e.target.checked
                            }
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeSection === 'appearance' && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Appearance & Language
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Theme
                    </label>
                    <select
                      value={formData.theme}
                      onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto (System)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Language
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {languageOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Timezone
                    </label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {timezoneOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'productivity' && (
              <motion.div
                key="productivity"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Productivity Settings
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Working Hours
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={formData.productivity.workingHoursStart}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            productivity: {
                              ...prev.productivity,
                              workingHoursStart: e.target.value
                            }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={formData.productivity.workingHoursEnd}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            productivity: {
                              ...prev.productivity,
                              workingHoursEnd: e.target.value
                            }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Working Days
                    </h3>
                    <div className="grid grid-cols-7 gap-2">
                      {workingDayOptions.map(({ value, label }) => (
                        <label key={value} className="flex flex-col items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.productivity.workingDays.includes(value)}
                            onChange={(e) => {
                              const newWorkingDays = e.target.checked
                                ? [...formData.productivity.workingDays, value]
                                : formData.productivity.workingDays.filter(day => day !== value);
                              
                              setFormData(prev => ({
                                ...prev,
                                productivity: {
                                  ...prev.productivity,
                                  workingDays: newWorkingDays.sort()
                                }
                              }));
                            }}
                            className="mb-1"
                          />
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {label.slice(0, 3)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Daily Goals
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Tasks
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.productivity.dailyGoal.tasks}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            productivity: {
                              ...prev.productivity,
                              dailyGoal: {
                                ...prev.productivity.dailyGoal,
                                tasks: parseInt(e.target.value) || 0
                              }
                            }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Focus Time (minutes)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.productivity.dailyGoal.focusTime}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            productivity: {
                              ...prev.productivity,
                              dailyGoal: {
                                ...prev.productivity.dailyGoal,
                                focusTime: parseInt(e.target.value) || 0
                              }
                            }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          XP
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.productivity.dailyGoal.xp}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            productivity: {
                              ...prev.productivity,
                              dailyGoal: {
                                ...prev.productivity.dailyGoal,
                                xp: parseInt(e.target.value) || 0
                              }
                            }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Weekly Goals
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Tasks
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.productivity.weeklyGoal.tasks}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            productivity: {
                              ...prev.productivity,
                              weeklyGoal: {
                                ...prev.productivity.weeklyGoal,
                                tasks: parseInt(e.target.value) || 0
                              }
                            }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Focus Time (minutes)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.productivity.weeklyGoal.focusTime}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            productivity: {
                              ...prev.productivity,
                              weeklyGoal: {
                                ...prev.productivity.weeklyGoal,
                                focusTime: parseInt(e.target.value) || 0
                              }
                            }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          XP
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.productivity.weeklyGoal.xp}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            productivity: {
                              ...prev.productivity,
                              weeklyGoal: {
                                ...prev.productivity.weeklyGoal,
                                xp: parseInt(e.target.value) || 0
                              }
                            }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Settings;
