import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import type { TimerState, FocusSession } from '../types/focus';

interface UsePomodoroTimerProps {
  focusDuration?: number; // in minutes
  breakDuration?: number; // in minutes
  longBreakDuration?: number; // in minutes
  sessionsUntilLongBreak?: number;
  autoStartBreaks?: boolean;
  autoStartPomodoros?: boolean;
  soundEnabled?: boolean;
  onSessionComplete?: (session: Partial<FocusSession>) => void;
  onBreakComplete?: () => void;
}

export const usePomodoroTimer = ({
  focusDuration = 25,
  breakDuration = 5,
  longBreakDuration = 15,
  sessionsUntilLongBreak = 4,
  autoStartBreaks = false,
  autoStartPomodoros = false,
  soundEnabled = true,
  onSessionComplete,
  onBreakComplete,
}: UsePomodoroTimerProps = {}) => {
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    isPaused: false,
    timeLeft: focusDuration * 60, // Convert to seconds
    totalTime: focusDuration * 60,
    currentPhase: 'focus',
    sessionCount: 0,
    interruptions: 0,
  });

  const intervalRef = useRef<any>(null);
  const startTimeRef = useRef<Date | null>(null);
  const pausedTimeRef = useRef<number>(0); // Total paused time in seconds

  // Play notification sound
  const playSound = useCallback(() => {
    if (!soundEnabled) return;
    
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }, [soundEnabled]);

  // Start timer
  const startTimer = useCallback(() => {
    if (timerState.timeLeft <= 0) return;
    
    setTimerState(prev => ({ ...prev, isRunning: true, isPaused: false }));
    startTimeRef.current = new Date();
    
    intervalRef.current = setInterval(() => {
      setTimerState(prev => {
        if (prev.timeLeft <= 1) {
          // Timer finished
          return { ...prev, timeLeft: 0, isRunning: false };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
  }, [timerState.timeLeft]);

  // Pause timer
  const pauseTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Calculate paused time
    if (startTimeRef.current) {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startTimeRef.current.getTime()) / 1000);
      pausedTimeRef.current += elapsed;
    }
    
    setTimerState(prev => ({ ...prev, isRunning: false, isPaused: true }));
  }, []);

  // Resume timer
  const resumeTimer = useCallback(() => {
    startTimer();
  }, [startTimer]);

  // Reset timer
  const resetTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    const newTimeLeft = timerState.currentPhase === 'focus' 
      ? focusDuration * 60 
      : (timerState.sessionCount > 0 && timerState.sessionCount % sessionsUntilLongBreak === 0)
        ? longBreakDuration * 60
        : breakDuration * 60;
    
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      timeLeft: newTimeLeft,
      totalTime: newTimeLeft,
    }));
    
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
  }, [timerState.currentPhase, timerState.sessionCount, focusDuration, breakDuration, longBreakDuration, sessionsUntilLongBreak]);

  // Add interruption
  const addInterruption = useCallback(() => {
    setTimerState(prev => ({ ...prev, interruptions: prev.interruptions + 1 }));
    toast.info('Interruption recorded');
  }, []);

  // Skip to next phase
  const skipPhase = useCallback(() => {
    setTimerState(prev => ({ ...prev, timeLeft: 0 }));
  }, []);

  // Handle timer completion
  useEffect(() => {
    if (timerState.timeLeft === 0 && timerState.isRunning === false && timerState.totalTime > 0) {
      playSound();
      
      if (timerState.currentPhase === 'focus') {
        // Focus session completed
        const actualDuration = Math.floor((timerState.totalTime - pausedTimeRef.current) / 60);
        const sessionData: Partial<FocusSession> = {
          type: 'pomodoro',
          duration: focusDuration,
          actualDuration,
          interruptions: timerState.interruptions,
          pausedTime: Math.floor(pausedTimeRef.current / 60),
          completed: true,
        };
        
        onSessionComplete?.(sessionData);
        
        // Move to break
        const newSessionCount = timerState.sessionCount + 1;
        const isLongBreak = newSessionCount % sessionsUntilLongBreak === 0;
        const breakTime = isLongBreak ? longBreakDuration : breakDuration;
        
        setTimerState(prev => ({
          ...prev,
          currentPhase: isLongBreak ? 'longBreak' : 'break',
          sessionCount: newSessionCount,
          timeLeft: breakTime * 60,
          totalTime: breakTime * 60,
          interruptions: 0,
          isRunning: autoStartBreaks,
        }));
        
        toast.success(`Pomodoro completed! ${isLongBreak ? 'Long break' : 'Break'} time!`);
        
        if (autoStartBreaks) {
          startTimeRef.current = new Date();
          pausedTimeRef.current = 0;
        }
        
      } else {
        // Break completed
        onBreakComplete?.();
        
        setTimerState(prev => ({
          ...prev,
          currentPhase: 'focus',
          timeLeft: focusDuration * 60,
          totalTime: focusDuration * 60,
          isRunning: autoStartPomodoros,
        }));
        
        toast.success('Break finished! Ready for another pomodoro?');
        
        if (autoStartPomodoros) {
          startTimeRef.current = new Date();
          pausedTimeRef.current = 0;
        }
      }
    }
  }, [
    timerState.timeLeft,
    timerState.isRunning,
    timerState.totalTime,
    timerState.currentPhase,
    timerState.sessionCount,
    timerState.interruptions,
    focusDuration,
    breakDuration,
    longBreakDuration,
    sessionsUntilLongBreak,
    autoStartBreaks,
    autoStartPomodoros,
    playSound,
    onSessionComplete,
    onBreakComplete,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Format time for display
  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Calculate progress percentage
  const progress = timerState.totalTime > 0 
    ? ((timerState.totalTime - timerState.timeLeft) / timerState.totalTime) * 100 
    : 0;

  return {
    // State
    ...timerState,
    progress,
    
    // Actions
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    addInterruption,
    skipPhase,
    
    // Helpers
    formatTime,
    formattedTimeLeft: formatTime(timerState.timeLeft),
    
    // Computed values
    isBreak: timerState.currentPhase !== 'focus',
    isLongBreak: timerState.currentPhase === 'longBreak',
    canStart: !timerState.isRunning && timerState.timeLeft > 0,
    canPause: timerState.isRunning,
    canResume: timerState.isPaused,
  };
};
