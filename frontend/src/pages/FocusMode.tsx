import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Timer, 
  BarChart3, 
  History, 
  Settings, 
  Target,
  Plus
} from 'lucide-react';
import { PomodoroTimer } from '../components/focus/PomodoroTimer';
import { FocusStats } from '../components/focus/FocusStats';
import { SessionHistory } from '../components/focus/SessionHistory';
import { useActiveFocusSession, useFocusOperations } from '../hooks/useFocus';
import { useTasks } from '../hooks/useTasks';
import type { FocusSession } from '../types/focus';
import { toast } from 'sonner';

type ViewMode = 'timer' | 'stats' | 'history' | 'settings';

const FocusMode: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('timer');
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>();
  const [showCustomTimer, setShowCustomTimer] = useState(false);
  const [customDuration, setCustomDuration] = useState(45);

  const { data: activeSession } = useActiveFocusSession();
  const { data: tasksData } = useTasks({ status: 'pending', limit: 20 });
  const { startSession } = useFocusOperations();

  const tasks = tasksData?.tasks || [];

  const handleSessionComplete = (session: Partial<FocusSession>) => {
    toast.success(
      `${session.type === 'pomodoro' ? 'Pomodoro' : 'Focus session'} completed!`,
      {
        description: `You focused for ${session.actualDuration} minutes and earned ${session.xpEarned || 0} XP!`
      }
    );
  };

  const handleStartCustomSession = async () => {
    try {
      await startSession.mutateAsync({
        type: 'custom',
        duration: customDuration,
        breakDuration: 5,
        taskId: selectedTaskId,
      });
      setShowCustomTimer(false);
      toast.success('Custom focus session started!');
    } catch (error) {
      console.error('Failed to start custom session:', error);
    }
  };

  const viewModes = [
    { key: 'timer', label: 'Timer', icon: Timer },
    { key: 'stats', label: 'Statistics', icon: BarChart3 },
    { key: 'history', label: 'History', icon: History },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Target className="text-blue-500" size={32} />
            Focus Mode
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Boost your productivity with focused work sessions
          </p>
        </div>

        {viewMode === 'timer' && (
          <div className="mt-4 sm:mt-0 flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCustomTimer(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <Plus size={20} />
              Custom Session
            </motion.button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {viewModes.map(({ key, label, icon: Icon }) => (
          <motion.button
            key={key}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setViewMode(key as ViewMode)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === key
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <Icon size={18} />
            {label}
          </motion.button>
        ))}
      </div>

      {/* Active Session Alert */}
      {activeSession && viewMode !== 'timer' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <Timer className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-blue-800 dark:text-blue-200 font-medium">
                You have an active focus session running
              </p>
              <p className="text-blue-600 dark:text-blue-300 text-sm">
                Started {new Date(activeSession.startTime).toLocaleTimeString()} • 
                {activeSession.type === 'pomodoro' ? 'Pomodoro' : 'Custom'} Session
              </p>
            </div>
            <button
              onClick={() => setViewMode('timer')}
              className="ml-auto px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Timer
            </button>
          </div>
        </motion.div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'timer' && (
          <motion.div
            key="timer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Main Timer */}
            <div className="lg:col-span-2">
              <PomodoroTimer
                taskId={selectedTaskId}
                onSessionComplete={handleSessionComplete}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Task Selection */}
              {tasks.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Link to Task
                  </h3>
                  <select
                    value={selectedTaskId || ''}
                    onChange={(e) => setSelectedTaskId(e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">No task selected</option>
                    {tasks.map((task) => (
                      <option key={task._id} value={task._id}>
                        {task.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quick Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Today's Progress
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Sessions</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      0 / 8
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Focus Time</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      0h 0m
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Streak</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      0 days
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {viewMode === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <FocusStats />
          </motion.div>
        )}

        {viewMode === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <SessionHistory />
          </motion.div>
        )}

        {viewMode === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Focus Settings
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Settings panel coming soon...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Timer Modal */}
      <AnimatePresence>
        {showCustomTimer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowCustomTimer(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Start Custom Session
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="480"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(parseInt(e.target.value) || 45)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {tasks.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Link to Task (Optional)
                    </label>
                    <select
                      value={selectedTaskId || ''}
                      onChange={(e) => setSelectedTaskId(e.target.value || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">No task selected</option>
                      {tasks.map((task) => (
                        <option key={task._id} value={task._id}>
                          {task.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCustomTimer(false)}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartCustomSession}
                  disabled={startSession.isPending}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {startSession.isPending ? 'Starting...' : 'Start Session'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FocusMode;
