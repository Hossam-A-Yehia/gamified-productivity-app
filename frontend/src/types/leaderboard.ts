export interface LeaderboardEntry {
  _id: string;
  name: string;
  level: number;
  xp: number;
  streak: number;
  totalTasksCompleted: number;
  avatarUrl?: string;
  rank: number;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  currentUser?: LeaderboardEntry;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface FriendsLeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  currentUser?: LeaderboardEntry;
}

export interface UserRankResponse {
  rank: number;
}

export type LeaderboardType = 'global' | 'friends' | 'weekly' | 'monthly' | 'streak';
export type LeaderboardCategory = 'work' | 'personal' | 'health' | 'learning' | 'other';
