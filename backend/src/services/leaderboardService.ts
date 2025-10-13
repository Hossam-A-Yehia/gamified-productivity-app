import User from '../models/User';
import { startOfWeek, startOfMonth, endOfWeek, endOfMonth } from 'date-fns';

interface LeaderboardEntry {
  _id: string;
  name: string;
  level: number;
  xp: number;
  streak: number;
  totalTasksCompleted: number;
  avatarUrl?: string;
  rank: number;
}

interface LeaderboardOptions {
  limit?: number;
  page?: number;
  userId?: string;
}

export class LeaderboardService {
  static async getGlobalLeaderboard(options: LeaderboardOptions = {}): Promise<{
    leaderboard: LeaderboardEntry[];
    currentUser?: LeaderboardEntry;
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    const { limit = 50, page = 1, userId } = options;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .sort({ xp: -1, level: -1 })
      .skip(skip)
      .limit(limit)
      .select('name level xp streak stats.totalTasksCompleted avatarUrl')
      .lean();

    const total = await User.countDocuments();

    const leaderboard: LeaderboardEntry[] = users.map((user: any, index) => ({
      _id: user._id.toString(),
      name: user.name,
      level: user.level,
      xp: user.xp,
      streak: user.streak,
      totalTasksCompleted: user.stats?.totalTasksCompleted || 0,
      avatarUrl: user.avatarUrl,
      rank: skip + index + 1,
    }));

    let currentUser: LeaderboardEntry | undefined;
    if (userId) {
      const userRank = await this.getUserRank(userId);
      const user: any = await User.findById(userId).select('name level xp streak stats.totalTasksCompleted avatarUrl');
      if (user) {
        currentUser = {
          _id: user._id.toString(),
          name: user.name,
          level: user.level,
          xp: user.xp,
          streak: user.streak,
          totalTasksCompleted: user.stats?.totalTasksCompleted || 0,
          avatarUrl: user.avatarUrl,
          rank: userRank,
        };
      }
    }

    return {
      leaderboard,
      currentUser,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async getFriendsLeaderboard(userId: string, options: LeaderboardOptions = {}): Promise<{
    leaderboard: LeaderboardEntry[];
    currentUser?: LeaderboardEntry;
  }> {
    const { limit = 50 } = options;

    const currentUser = await User.findById(userId).select('friends');
    if (!currentUser) {
      throw new Error('User not found');
    }

    const friendIds = currentUser.friends || [];
    const allUserIds = [userId, ...friendIds.map(id => id.toString())];

    const users = await User.find({ _id: { $in: allUserIds } })
      .sort({ xp: -1, level: -1 })
      .limit(limit)
      .select('name level xp streak stats.totalTasksCompleted avatarUrl')
      .lean();

    const leaderboard: LeaderboardEntry[] = users.map((user: any, index) => ({
      _id: user._id.toString(),
      name: user.name,
      level: user.level,
      xp: user.xp,
      streak: user.streak,
      totalTasksCompleted: user.stats?.totalTasksCompleted || 0,
      avatarUrl: user.avatarUrl,
      rank: index + 1,
    }));

    const currentUserEntry = leaderboard.find(entry => entry._id === userId);

    return {
      leaderboard,
      currentUser: currentUserEntry,
    };
  }

  static async getWeeklyLeaderboard(options: LeaderboardOptions = {}): Promise<{
    leaderboard: LeaderboardEntry[];
    currentUser?: LeaderboardEntry;
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    const { limit = 50, page = 1, userId } = options;
    const skip = (page - 1) * limit;

    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

    const users = await User.find({ updatedAt: { $gte: weekStart, $lte: weekEnd } })
      .sort({ xp: -1, level: -1 })
      .skip(skip)
      .limit(limit)
      .select('name level xp streak stats.totalTasksCompleted avatarUrl')
      .lean();

    const total = await User.countDocuments({ updatedAt: { $gte: weekStart, $lte: weekEnd } });

    const leaderboard: LeaderboardEntry[] = users.map((user: any, index) => ({
      _id: user._id.toString(),
      name: user.name,
      level: user.level,
      xp: user.xp,
      streak: user.streak,
      totalTasksCompleted: user.stats?.totalTasksCompleted || 0,
      avatarUrl: user.avatarUrl,
      rank: skip + index + 1,
    }));

    let currentUser: LeaderboardEntry | undefined;
    if (userId) {
      const user: any = await User.findById(userId).select('name level xp streak stats.totalTasksCompleted avatarUrl');
      if (user) {
        const userRankInWeek = leaderboard.findIndex(entry => entry._id === userId);
        currentUser = {
          _id: user._id.toString(),
          name: user.name,
          level: user.level,
          xp: user.xp,
          streak: user.streak,
          totalTasksCompleted: user.stats?.totalTasksCompleted || 0,
          avatarUrl: user.avatarUrl,
          rank: userRankInWeek >= 0 ? userRankInWeek + 1 : -1,
        };
      }
    }

    return {
      leaderboard,
      currentUser,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async getMonthlyLeaderboard(options: LeaderboardOptions = {}): Promise<{
    leaderboard: LeaderboardEntry[];
    currentUser?: LeaderboardEntry;
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    const { limit = 50, page = 1, userId } = options;
    const skip = (page - 1) * limit;

    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());

    const users = await User.find({ updatedAt: { $gte: monthStart, $lte: monthEnd } })
      .sort({ xp: -1, level: -1 })
      .skip(skip)
      .limit(limit)
      .select('name level xp streak stats.totalTasksCompleted avatarUrl')
      .lean();

    const total = await User.countDocuments({ updatedAt: { $gte: monthStart, $lte: monthEnd } });

    const leaderboard: LeaderboardEntry[] = users.map((user: any, index) => ({
      _id: user._id.toString(),
      name: user.name,
      level: user.level,
      xp: user.xp,
      streak: user.streak,
      totalTasksCompleted: user.stats?.totalTasksCompleted || 0,
      avatarUrl: user.avatarUrl,
      rank: skip + index + 1,
    }));

    let currentUser: LeaderboardEntry | undefined;
    if (userId) {
      const user: any = await User.findById(userId).select('name level xp streak stats.totalTasksCompleted avatarUrl');
      if (user) {
        const userRankInMonth = leaderboard.findIndex(entry => entry._id === userId);
        currentUser = {
          _id: user._id.toString(),
          name: user.name,
          level: user.level,
          xp: user.xp,
          streak: user.streak,
          totalTasksCompleted: user.stats?.totalTasksCompleted || 0,
          avatarUrl: user.avatarUrl,
          rank: userRankInMonth >= 0 ? userRankInMonth + 1 : -1,
        };
      }
    }

    return {
      leaderboard,
      currentUser,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async getCategoryLeaderboard(
    category: string,
    options: LeaderboardOptions = {}
  ): Promise<{
    leaderboard: LeaderboardEntry[];
    currentUser?: LeaderboardEntry;
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    const { limit = 50, page = 1, userId } = options;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .sort({ 'stats.totalTasksCompleted': -1, xp: -1 })
      .skip(skip)
      .limit(limit)
      .select('name level xp streak stats.totalTasksCompleted avatarUrl')
      .lean();

    const total = await User.countDocuments();

    const leaderboard: LeaderboardEntry[] = users.map((user, index) => ({
      _id: user._id.toString(),
      name: user.name,
      level: user.level,
      xp: user.xp,
      streak: user.streak,
      totalTasksCompleted: user.stats?.totalTasksCompleted || 0,
      avatarUrl: user.avatarUrl,
      rank: skip + index + 1,
    }));

    let currentUser: LeaderboardEntry | undefined;
    if (userId) {
      const user: any = await User.findById(userId).select('name level xp streak stats.totalTasksCompleted avatarUrl');
      if (user) {
        const userRank = await this.getUserRankByCategory(userId, category);
        currentUser = {
          _id: user._id.toString(),
          name: user.name,
          level: user.level,
          xp: user.xp,
          streak: user.streak,
          totalTasksCompleted: user.stats?.totalTasksCompleted || 0,
          avatarUrl: user.avatarUrl,
          rank: userRank,
        };
      }
    }

    return {
      leaderboard,
      currentUser,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async getUserRank(userId: string): Promise<number> {
    const user = await User.findById(userId).select('xp level');
    if (!user) {
      throw new Error('User not found');
    }

    const rank = await User.countDocuments({
      $or: [
        { xp: { $gt: user.xp } },
        { xp: user.xp, level: { $gt: user.level } },
      ],
    });

    return rank + 1;
  }

  static async getUserRankByCategory(userId: string, category: string): Promise<number> {
    const user = await User.findById(userId).select('stats.totalTasksCompleted xp');
    if (!user) {
      throw new Error('User not found');
    }

    const userTaskCount = user.stats?.totalTasksCompleted || 0;
    const rank = await User.countDocuments({
      $or: [
        { 'stats.totalTasksCompleted': { $gt: userTaskCount } },
        { 'stats.totalTasksCompleted': userTaskCount, xp: { $gt: user.xp } },
      ],
    });

    return rank + 1;
  }

  static async getStreakLeaderboard(options: LeaderboardOptions = {}): Promise<{
    leaderboard: LeaderboardEntry[];
    currentUser?: LeaderboardEntry;
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    const { limit = 50, page = 1, userId } = options;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .sort({ streak: -1, xp: -1 })
      .skip(skip)
      .limit(limit)
      .select('name level xp streak stats.totalTasksCompleted avatarUrl')
      .lean();

    const total = await User.countDocuments();

    const leaderboard: LeaderboardEntry[] = users.map((user: any, index) => ({
      _id: user._id.toString(),
      name: user.name,
      level: user.level,
      xp: user.xp,
      streak: user.streak,
      totalTasksCompleted: user.stats?.totalTasksCompleted || 0,
      avatarUrl: user.avatarUrl,
      rank: skip + index + 1,
    }));

    let currentUser: LeaderboardEntry | undefined;
    if (userId) {
      const user: any = await User.findById(userId).select('name level xp streak stats.totalTasksCompleted avatarUrl');
      if (user) {
        const userRank = await User.countDocuments({
          $or: [
            { streak: { $gt: user.streak } },
            { streak: user.streak, xp: { $gt: user.xp } },
          ],
        });

        currentUser = {
          _id: user._id.toString(),
          name: user.name,
          level: user.level,
          xp: user.xp,
          streak: user.streak,
          totalTasksCompleted: user.stats?.totalTasksCompleted || 0,
          avatarUrl: user.avatarUrl,
          rank: userRank + 1,
        };
      }
    }

    return {
      leaderboard,
      currentUser,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
