export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  TIMEOUT: 10000,
} as const;

// Animation Durations
export const ANIMATION_DURATION = {
  FAST: 0.2,
  NORMAL: 0.3,
  SLOW: 0.5,
  EXTRA_SLOW: 0.8,
} as const;

// Form Validation
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
} as const;

// Gamification Constants
export const GAMIFICATION = {
  STARTING_XP: 0,
  STARTING_LEVEL: 1,
  STARTING_COINS: 100,
  XP_PER_LEVEL: 500,
} as const;

export const COLORS = {
  PRIMARY: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
  },
  SUCCESS: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
  },
  ERROR: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
  },
  WARNING: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
  },
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  TASKS: '/tasks',
  ACHIEVEMENTS: '/achievements',
  LEADERBOARD: '/leaderboard',
  CHALLENGES: '/challenges',
  CHALLENGE_DETAIL: '/challenges/:id',
  FOCUS: '/focus',
  SETTINGS: '/settings',
  FRIENDS: '/friends',
  NOTIFICATIONS: '/notifications',
  PWA_DEMO: '/pwa-demo',
} as const;

export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
} as const;

export const TASK_DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
} as const;

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
} as const;

export const TASK_CATEGORY = {
  WORK: 'work',
  PERSONAL: 'personal',
  HEALTH: 'health',
  LEARNING: 'learning',
  OTHER: 'other'
} as const;

export const RECURRENCE_TYPE = {
  NONE: 'none',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly'
} as const;

export const DASHBOARD_TABS = {
  OVERVIEW: 'overview',
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
} as const;

export const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc'
} as const;

export const COMPONENT_SIZES = {
  SMALL: 'sm',
  MEDIUM: 'md',
  LARGE: 'lg'
} as const;

export const PROGRESS_BAR_COLORS = {
  PRIMARY: 'primary',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
} as const;

export const LAYOUT_SIDES = {
  LEFT: 'left',
  RIGHT: 'right',
  MOBILE: 'mobile'
} as const;

export const PROTOCOLS = {
  HTTPS: 'https:',
  HTTP: 'http:'
} as const;

export const COOKIE_SAME_SITE = {
  LAX: 'lax',
  STRICT: 'strict',
  NONE: 'none'
} as const;

export const LOADING_STATES = {
  LOADING: 'Loading...',
  SIGNING_OUT: 'Signing out...',
  SIGN_OUT: 'Sign Out'
} as const;

export const VALIDATION_MESSAGES = {
  PASSWORD_LOWERCASE: 'Password must contain at least one lowercase letter',
  PASSWORD_UPPERCASE: 'Password must contain at least one uppercase letter',
  PASSWORD_NUMBER: 'Password must contain at least one number',
  PASSWORD_SYMBOL: 'Password must contain at least one symbol',
  PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters long',
  INTERVAL_MIN: 'Interval must be at least 1',
  INTERVAL_REQUIRED: 'Interval is required for recurring tasks',
  END_DATE_REQUIRED: 'End date is required for recurring tasks'
} as const;

export const EMPTY_MESSAGES = {
  NO_TASKS: "No tasks yet. Create your first task to get started!",
  NO_PENDING_TASKS: "No pending tasks",
  NO_IN_PROGRESS_TASKS: "No in progress tasks", 
  NO_COMPLETED_TASKS: "No completed tasks"
} as const;

export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];
export type TaskDifficulty = typeof TASK_DIFFICULTY[keyof typeof TASK_DIFFICULTY];
export type TaskPriority = typeof TASK_PRIORITY[keyof typeof TASK_PRIORITY];
export type TaskCategory = typeof TASK_CATEGORY[keyof typeof TASK_CATEGORY];
export type DashboardTab = typeof DASHBOARD_TABS[keyof typeof DASHBOARD_TABS];
export type SortOrder = typeof SORT_ORDER[keyof typeof SORT_ORDER];
export type ComponentSize = typeof COMPONENT_SIZES[keyof typeof COMPONENT_SIZES];
export type ProgressBarColor = typeof PROGRESS_BAR_COLORS[keyof typeof PROGRESS_BAR_COLORS];
export type LayoutSide = typeof LAYOUT_SIDES[keyof typeof LAYOUT_SIDES];
