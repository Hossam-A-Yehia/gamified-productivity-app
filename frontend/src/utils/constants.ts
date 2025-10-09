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
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  TASKS: '/tasks',
  ACHIEVEMENTS: '/achievements',
  LEADERBOARD: '/leaderboard',
  CHALLENGES: '/challenges',
  FOCUS: '/focus',
  SETTINGS: '/settings',
} as const;
