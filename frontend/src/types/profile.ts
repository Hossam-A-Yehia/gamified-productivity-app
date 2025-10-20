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
    workingHoursStart: string;
    workingHoursEnd: string;
    workingDays: number[];
    dailyGoal: {
      tasks: number;
      focusTime: number;
      xp: number;
    };
    weeklyGoal: {
      tasks: number;
      focusTime: number;
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

export interface ProfileStats {
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

export interface SendFriendRequestRequest {
  userId: string;
  message?: string;
}

export interface RespondToFriendRequestRequest {
  requestId: string;
  action: 'accept' | 'decline';
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

export interface ProfileFormData {
  name: string;
  avatarUrl?: string;
  avatarCustomization: {
    skin?: string;
    accessories: string[];
    background?: string;
  };
}

export interface SettingsFormData {
  notifications: UserSettings['notifications'];
  theme: UserSettings['theme'];
  language: string;
  timezone: string;
  privacy: UserSettings['privacy'];
  productivity: UserSettings['productivity'];
}
