export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  level: number;
  xp: number;
  coins: number;
  streak: number;
  lastActiveDate: string;
  avatarUrl?: string;
  avatarCustomization: {
    skin?: string;
    accessories: string[];
    background?: string;
  };
  achievements: string[];
  friends: string[];
  friendRequests: {
    sent: string[];
    received: string[];
  };
  settings: UserSettings;
  stats: UserStats;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalTasksCompleted: number;
  totalFocusTime: number;
  longestStreak: number;
  averageTasksPerDay: number;
  totalChallengesCompleted: number;
  totalXpEarned: number;
  totalCoinsEarned: number;
  totalCoinsSpent: number;
  averageProductivity: number;
  totalFocusSessions: number;
  completedFocusSessions: number;
  currentLevel: number;
  xpToNextLevel: number;
  joinDate: string;
  lastLoginDate: string;
  totalLoginDays: number;
}

export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
    taskReminders: boolean;
    challengeUpdates: boolean;
    achievementAlerts: boolean;
    focusSessionAlerts: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  privacy: {
    profilePublic: boolean;
    showInLeaderboard: boolean;
    allowFriendRequests: boolean;
    showOnlineStatus: boolean;
    showStats: boolean;
  };
  focus?: {
    defaultPomodoroLength: number;
    defaultBreakLength: number;
    defaultLongBreakLength: number;
    pomodorosUntilLongBreak: number;
    autoStartBreaks: boolean;
    autoStartPomodoros: boolean;
    soundEnabled: boolean;
    notificationsEnabled: boolean;
    xpMultiplier: number;
  };
  productivity: {
    workingHoursStart: string; // HH:MM format
    workingHoursEnd: string; // HH:MM format
    workingDays: number[]; // 0-6, Sunday = 0
    dailyGoal: {
      tasks: number;
      focusTime: number; // in minutes
      xp: number;
    };
    weeklyGoal: {
      tasks: number;
      focusTime: number; // in minutes
      xp: number;
    };
  };
}

export interface UpdateProfileRequest {
  name?: string;
  avatarUrl?: string;
  avatarCustomization?: {
    skin?: string;
    accessories?: string[];
    background?: string;
  };
}

export interface UpdateSettingsRequest {
  notifications?: Partial<UserSettings['notifications']>;
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  timezone?: string;
  privacy?: Partial<UserSettings['privacy']>;
  focus?: Partial<UserSettings['focus']>;
  productivity?: Partial<UserSettings['productivity']>;
}

export interface ProfileStatsResponse {
  overview: {
    level: number;
    xp: number;
    xpToNextLevel: number;
    coins: number;
    streak: number;
    totalAchievements: number;
  };
  productivity: {
    totalTasksCompleted: number;
    totalFocusTime: number;
    averageProductivity: number;
    totalFocusSessions: number;
    completedFocusSessions: number;
    longestStreak: number;
  };
  social: {
    totalFriends: number;
    totalChallengesCompleted: number;
    leaderboardRank?: number;
  };
  activity: {
    joinDate: string;
    lastLoginDate: string;
    totalLoginDays: number;
    averageTasksPerDay: number;
  };
  goals: {
    daily: {
      tasks: { completed: number; target: number };
      focusTime: { completed: number; target: number };
      xp: { completed: number; target: number };
    };
    weekly: {
      tasks: { completed: number; target: number };
      focusTime: { completed: number; target: number };
      xp: { completed: number; target: number };
    };
  };
}

export interface PublicProfile {
  _id: string;
  name: string;
  level: number;
  xp: number;
  avatarUrl?: string;
  avatarCustomization: {
    skin?: string;
    accessories: string[];
    background?: string;
  };
  achievements: string[];
  stats?: {
    totalTasksCompleted: number;
    totalFocusTime: number;
    longestStreak: number;
    totalChallengesCompleted: number;
  };
  createdAt: string;
  isOnline?: boolean;
  lastActiveDate?: string;
}

export interface SearchUsersRequest {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'level' | 'xp' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchUsersResponse {
  users: PublicProfile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface FriendRequest {
  _id: string;
  from: PublicProfile;
  to: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  updatedAt: string;
}

export interface SendFriendRequestRequest {
  userId: string;
  message?: string;
}

export interface RespondToFriendRequestRequest {
  requestId: string;
  action: 'accept' | 'decline';
}

export interface AvatarCustomization {
  skin: string;
  accessories: string[];
  background: string;
}

export interface AvailableCustomizations {
  skins: Array<{
    id: string;
    name: string;
    cost: number;
    unlocked: boolean;
  }>;
  accessories: Array<{
    id: string;
    name: string;
    category: string;
    cost: number;
    unlocked: boolean;
  }>;
  backgrounds: Array<{
    id: string;
    name: string;
    cost: number;
    unlocked: boolean;
  }>;
}

export interface PurchaseCustomizationRequest {
  type: 'skin' | 'accessory' | 'background';
  itemId: string;
}

export interface ActivityLog {
  _id: string;
  userId: string;
  type: 'task_completed' | 'challenge_joined' | 'achievement_unlocked' | 'focus_session_completed' | 'level_up' | 'friend_added';
  description: string;
  metadata?: any;
  xpEarned?: number;
  coinsEarned?: number;
  createdAt: string;
}

export interface GetActivityLogRequest {
  page?: number;
  limit?: number;
  type?: string;
  startDate?: string;
  endDate?: string;
}
