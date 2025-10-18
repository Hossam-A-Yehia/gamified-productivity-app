import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  AlertTriangle, 
  SkipForward,
  Settings,
  Timer,
  Coffee
} from 'lucide-react';
import { usePomodoroTimer } from '../../hooks/usePomodoroTimer';
import { useFocusSettings, useFocusOperations } from '../../hooks/useFocus';
import type { FocusSession } from '../../types/focus';

interface PomodoroTimerProps {
  taskId?: string;
  onSessionComplete?: (session: Partial<FocusSession>) => void;
  className?: string;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  taskId,
  onSessionComplete,
  className = '',
}) => {
  const { data: settings } = useFocusSettings();
  const { startSession, completeSession } = useFocusOperations();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const {
    isRunning,
    isPaused,
    currentPhase,
    sessionCount,
    interruptions,
    progress,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    addInterruption,
    skipPhase,
    formattedTimeLeft,
    canStart,
    canPause,
    isBreak,
    isLongBreak,
  } = usePomodoroTimer({
    focusDuration: settings?.defaultPomodoroLength || 25,
    breakDuration: settings?.defaultBreakLength || 5,
    longBreakDuration: settings?.defaultLongBreakLength || 15,
    sessionsUntilLongBreak: settings?.pomodorosUntilLongBreak || 4,
    autoStartBreaks: settings?.autoStartBreaks || false,
    autoStartPomodoros: settings?.autoStartPomodoros || false,
    soundEnabled: settings?.soundEnabled ?? true,
    onSessionComplete: async (sessionData) => {
      if (currentSessionId) {
        try {
          await completeSession.mutateAsync(currentSessionId);
          setCurrentSessionId(null);
        } catch (error) {
          console.error('Failed to complete session:', error);
        }
      }
      onSessionComplete?.(sessionData);
    },
  });

  const handleStart = async () => {
    if (currentPhase === 'focus' && !currentSessionId) {
      // Start a new focus session
      try {
        const response = await startSession.mutateAsync({
          type: 'pomodoro',
          duration: settings?.defaultPomodoroLength || 25,
          breakDuration: settings?.defaultBreakLength || 5,
          taskId,
        });
        setCurrentSessionId(response.session._id);
      } catch (error) {
        console.error('Failed to start session:', error);
        return;
      }
    }
    startTimer();
  };

  const handlePause = () => {
    pauseTimer();
  };

  const handleResume = () => {
    resumeTimer();
  };

  const handleReset = () => {
    resetTimer();
    if (currentSessionId) {
      setCurrentSessionId(null);
    }
  };

  const getPhaseColor = () => {
    if (isLongBreak) return 'from-blue-500 to-blue-600';
    if (isBreak) return 'from-green-500 to-green-600';
    return 'from-red-500 to-red-600';
  };

  const getPhaseIcon = () => {
    if (isLongBreak) return <Coffee className="w-8 h-8" />;
    if (isBreak) return <Coffee className="w-6 h-6" />;
    return <Timer className="w-8 h-8" />;
  };

  const getPhaseLabel = () => {
    if (isLongBreak) return 'Long Break';
    if (isBreak) return 'Break';
    return 'Focus Time';
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          {getPhaseIcon()}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {getPhaseLabel()}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Session {sessionCount + 1} • {interruptions} interruptions
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Timer Circle */}
      <div className="relative flex items-center justify-center mb-8">
        <div className="relative w-64 h-64">
          {/* Background Circle */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            {/* Progress Circle */}
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              stroke="url(#gradient)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - progress / 100) }}
              transition={{ duration: 0.5 }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" className={`${getPhaseColor().split(' ')[0].replace('from-', 'stop-')}`} />
                <stop offset="100%" className={`${getPhaseColor().split(' ')[1].replace('to-', 'stop-')}`} />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Timer Display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-mono font-bold text-gray-900 dark:text-white mb-2">
                {formattedTimeLeft}
              </div>
              <div className={`text-sm font-medium bg-gradient-to-r ${getPhaseColor()} bg-clip-text text-transparent`}>
                {Math.round(progress)}% Complete
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-6">
        {/* Start/Pause/Resume Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={canStart ? handleStart : canPause ? handlePause : handleResume}
          disabled={startSession.isPending}
          className={`
            flex items-center justify-center w-16 h-16 rounded-full text-white font-semibold
            bg-gradient-to-r ${getPhaseColor()} hover:shadow-lg transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {startSession.isPending ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : canStart ? (
            <Play className="w-8 h-8 ml-1" />
          ) : canPause ? (
            <Pause className="w-8 h-8" />
          ) : (
            <Play className="w-8 h-8 ml-1" />
          )}
        </motion.button>

        {/* Reset Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleReset}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
        </motion.button>

        {/* Add Interruption Button */}
        {(isRunning || isPaused) && currentPhase === 'focus' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={addInterruption}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-200 dark:bg-yellow-800 text-yellow-600 dark:text-yellow-300 hover:bg-yellow-300 dark:hover:bg-yellow-700 transition-colors"
          >
            <AlertTriangle className="w-5 h-5" />
          </motion.button>
        )}

        {/* Skip Phase Button */}
        {(isRunning || isPaused) && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={skipPhase}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <SkipForward className="w-5 h-5" />
          </motion.button>
        )}
      </div>

      {/* Status */}
      <div className="text-center">
        <AnimatePresence mode="wait">
          {isRunning && (
            <motion.p
              key="running"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-green-600 dark:text-green-400 font-medium"
            >
              {currentPhase === 'focus' ? '🎯 Stay focused!' : '☕ Enjoy your break!'}
            </motion.p>
          )}
          {isPaused && (
            <motion.p
              key="paused"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-yellow-600 dark:text-yellow-400 font-medium"
            >
              ⏸️ Timer paused
            </motion.p>
          )}
          {!isRunning && !isPaused && (
            <motion.p
              key="ready"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-gray-600 dark:text-gray-400"
            >
              Ready to start your {currentPhase === 'focus' ? 'focus session' : 'break'}?
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Focus:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {settings?.defaultPomodoroLength || 25}m
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Break:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {settings?.defaultBreakLength || 5}m
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Long Break:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {settings?.defaultLongBreakLength || 15}m
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Until Long:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {settings?.pomodorosUntilLongBreak || 4}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
