export interface FocusSession {
  _id: string;
  userId: string;
  type: 'pomodoro' | 'custom';
  duration: number; // in minutes
  actualDuration: number; // in minutes
  breakDuration: number; // in minutes
  completed: boolean;
  interruptions: number;
  taskId?: string;
  xpEarned: number;
  productivity: number; // 0-100
  startTime: string;
  endTime?: string;
  pausedTime: number; // in minutes
  notes?: string;
  efficiency: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFocusSessionRequest {
  type: 'pomodoro' | 'custom';
  duration: number; // in minutes
  breakDuration?: number; // in minutes
  taskId?: string;
  notes?: string;
}

export interface UpdateFocusSessionRequest {
  actualDuration?: number;
  interruptions?: number;
  pausedTime?: number;
  notes?: string;
  completed?: boolean;
}

export interface FocusSessionFilters {
  type?: 'pomodoro' | 'custom';
  completed?: boolean;
  taskId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'startTime' | 'duration' | 'productivity' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface FocusStats {
  totalSessions: number;
  completedSessions: number;
  totalFocusTime: number; // in minutes
  averageSessionLength: number; // in minutes
  averageProductivity: number; // 0-100
  completionRate: number; // percentage
  totalXpEarned: number;
  longestSession: number; // in minutes
  currentStreak: number; // consecutive days with focus sessions
  todaysSessions: number;
  thisWeekSessions: number;
  thisMonthSessions: number;
  categoryBreakdown: {
    pomodoro: number;
    custom: number;
  };
  productivityTrend: Array<{
    date: string;
    productivity: number;
    sessions: number;
  }>;
}

export interface FocusSessionsResponse {
  sessions: FocusSession[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface StartFocusSessionResponse {
  session: FocusSession;
  message: string;
}

export interface CompleteFocusSessionResponse {
  session: FocusSession;
  xpEarned: number;
  newAchievements?: string[];
  message: string;
}

export interface FocusSettings {
  defaultPomodoroLength: number; // in minutes
  defaultBreakLength: number; // in minutes
  defaultLongBreakLength: number; // in minutes
  pomodorosUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  xpMultiplier: number;
}

export interface UpdateFocusSettingsRequest {
  defaultPomodoroLength?: number;
  defaultBreakLength?: number;
  defaultLongBreakLength?: number;
  pomodorosUntilLongBreak?: number;
  autoStartBreaks?: boolean;
  autoStartPomodoros?: boolean;
  soundEnabled?: boolean;
  notificationsEnabled?: boolean;
  xpMultiplier?: number;
}

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  timeLeft: number; // in seconds
  totalTime: number; // in seconds
  currentPhase: 'focus' | 'break' | 'longBreak';
  sessionCount: number;
  interruptions: number;
}

export interface FocusSessionFormData {
  type: 'pomodoro' | 'custom';
  duration: number;
  breakDuration: number;
  taskId?: string;
  notes?: string;
}
