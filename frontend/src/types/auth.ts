export interface User {
  id: string;
  name: string;
  email: string;
  level: number;
  xp: number;
  coins: number;
  streak: number;
  avatarUrl?: string;
  avatarCustomization: {
    skin?: string;
    accessories: string[];
    background?: string;
  };
  achievements: string[];
  settings: {
    notifications: {
      email: boolean;
      push: boolean;
      inApp: boolean;
    };
    theme: 'light' | 'dark' | 'auto';
    language: string;
    privacy: {
      profilePublic: boolean;
      showInLeaderboard: boolean;
    };
  };
  stats: {
    totalTasksCompleted: number;
    totalFocusTime: number;
    longestStreak: number;
    averageTasksPerDay: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    tokens: AuthTokens;
  };
  error?: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
