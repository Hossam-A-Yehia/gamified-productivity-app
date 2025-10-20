import User, { IUser } from '../models/User';
import { Task } from '../models/Task';
import { FocusSession } from '../models/FocusSession';
import { ChallengeModel } from '../models/Challenge';
import mongoose from 'mongoose';
import {
  UserProfile,
  UpdateProfileRequest,
  UpdateSettingsRequest,
  ProfileStatsResponse,
  PublicProfile,
  SearchUsersRequest,
  SearchUsersResponse,
  UserStats,
  ActivityLog,
  GetActivityLogRequest,
  AvailableCustomizations,
  PurchaseCustomizationRequest
} from '../types/profile';

export class ProfileService {
  // Get user profile by ID
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const user = await User.findById(userId).lean();
    if (!user) return null;

    return this.formatUserProfile(user);
  }

  // Get public profile by ID
  static async getPublicProfile(userId: string, requesterId?: string): Promise<PublicProfile | null> {
    const user = await User.findById(userId).lean();
    if (!user) return null;

    // Check privacy settings
    if (!user.settings?.privacy?.profilePublic && userId !== requesterId) {
      return null;
    }

    return this.formatPublicProfile(user);
  }

  // Update user profile
  static async updateProfile(userId: string, updateData: UpdateProfileRequest): Promise<UserProfile | null> {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          ...(updateData.name && { name: updateData.name }),
          ...(updateData.avatarUrl && { avatarUrl: updateData.avatarUrl }),
          ...(updateData.avatarCustomization && { avatarCustomization: updateData.avatarCustomization }),
        }
      },
      { new: true, runValidators: true }
    ).lean();

    if (!user) return null;
    return this.formatUserProfile(user);
  }

  // Update user settings
  static async updateSettings(userId: string, updateData: UpdateSettingsRequest): Promise<UserProfile | null> {
    const updateFields: any = {};

    if (updateData.notifications) {
      Object.keys(updateData.notifications).forEach(key => {
        updateFields[`settings.notifications.${key}`] = updateData.notifications![key as keyof typeof updateData.notifications];
      });
    }

    if (updateData.theme) {
      updateFields['settings.theme'] = updateData.theme;
    }

    if (updateData.language) {
      updateFields['settings.language'] = updateData.language;
    }

    if (updateData.timezone) {
      updateFields['settings.timezone'] = updateData.timezone;
    }

    if (updateData.privacy) {
      Object.keys(updateData.privacy).forEach(key => {
        updateFields[`settings.privacy.${key}`] = updateData.privacy![key as keyof typeof updateData.privacy];
      });
    }

    if (updateData.focus) {
      Object.keys(updateData.focus).forEach(key => {
        updateFields[`settings.focus.${key}`] = updateData.focus![key as keyof typeof updateData.focus];
      });
    }

    if (updateData.productivity) {
      Object.keys(updateData.productivity).forEach(key => {
        updateFields[`settings.productivity.${key}`] = updateData.productivity![key as keyof typeof updateData.productivity];
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).lean();

    if (!user) return null;
    return this.formatUserProfile(user);
  }

  // Get comprehensive profile statistics
  static async getProfileStats(userId: string): Promise<ProfileStatsResponse> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // Get user data
    const user = await User.findById(userId).lean();
    if (!user) {
      throw new Error('User not found');
    }

    // Get additional statistics from other collections
    const [tasks, focusSessions, challenges] = await Promise.all([
      Task.find({ userId: userObjectId }).lean() || [],
      FocusSession.find({ userId: userObjectId }).lean() || [],
      ChallengeModel.find({ 'participants.userId': userObjectId }).lean() || []
    ]);

    const completedTasks = (tasks || []).filter((task: any) => task.status === 'completed');
    const completedFocusSessions = (focusSessions || []).filter((session: any) => session.completed);
    const completedChallenges = (challenges || []).filter((challenge: any) => 
      challenge.participants && challenge.participants.some((p: any) => 
        p.userId.toString() === userId && p.overallProgress >= 100
      )
    );

    // Calculate XP to next level
    const currentLevel = Math.floor(user.xp / 500) + 1;
    const xpToNextLevel = (currentLevel * 500) - user.xp;

    // Calculate daily and weekly progress
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));

    const todayTasks = completedTasks.filter((task: any) => 
      new Date(task.completedAt || task.updatedAt) >= today
    ).length;

    const todayFocusTime = completedFocusSessions
      .filter((session: any) => new Date(session.startTime) >= today)
      .reduce((sum: number, session: any) => sum + (session.actualDuration || 0), 0);

    const todayXP = completedTasks
      .filter((task: any) => new Date(task.completedAt || task.updatedAt) >= today)
      .reduce((sum: number, task: any) => sum + (task.xpReward || task.xp || 0), 0) +
      completedFocusSessions
        .filter((session: any) => new Date(session.startTime) >= today)
        .reduce((sum: number, session: any) => sum + (session.xpEarned || 0), 0);

    const weekTasks = completedTasks.filter((task: any) => 
      new Date(task.completedAt || task.updatedAt) >= weekStart
    ).length;

    const weekFocusTime = completedFocusSessions
      .filter((session: any) => new Date(session.startTime) >= weekStart)
      .reduce((sum: number, session: any) => sum + (session.actualDuration || 0), 0);

    const weekXP = completedTasks
      .filter((task: any) => new Date(task.completedAt || task.updatedAt) >= weekStart)
      .reduce((sum: number, task: any) => sum + (task.xpReward || task.xp || 0), 0) +
      completedFocusSessions
        .filter((session: any) => new Date(session.startTime) >= weekStart)
        .reduce((sum: number, session: any) => sum + (session.xpEarned || 0), 0);

    // Calculate average productivity
    const avgProductivity = completedFocusSessions.length > 0
      ? completedFocusSessions.reduce((sum: number, session: any) => sum + (session.productivity || 0), 0) / completedFocusSessions.length
      : 0;

    return {
      overview: {
        level: currentLevel,
        xp: user.xp,
        xpToNextLevel,
        coins: user.coins,
        streak: user.streak,
        totalAchievements: user.achievements.length
      },
      productivity: {
        totalTasksCompleted: completedTasks.length,
        totalFocusTime: user.stats.totalFocusTime,
        averageProductivity: Math.round(avgProductivity),
        totalFocusSessions: focusSessions.length,
        completedFocusSessions: completedFocusSessions.length,
        longestStreak: user.stats.longestStreak
      },
      social: {
        totalFriends: user.friends.length,
        totalChallengesCompleted: completedChallenges.length,
        leaderboardRank: await this.getUserLeaderboardRank(userId)
      },
      activity: {
        joinDate: user.createdAt.toISOString(),
        lastLoginDate: user.lastActiveDate.toISOString(),
        totalLoginDays: await this.calculateTotalLoginDays(userId),
        averageTasksPerDay: user.stats.averageTasksPerDay
      },
      goals: {
        daily: {
          tasks: { 
            completed: todayTasks, 
            target: user.settings?.productivity?.dailyGoal?.tasks || 5 
          },
          focusTime: { 
            completed: todayFocusTime, 
            target: user.settings?.productivity?.dailyGoal?.focusTime || 120 
          },
          xp: { 
            completed: todayXP, 
            target: user.settings?.productivity?.dailyGoal?.xp || 200 
          }
        },
        weekly: {
          tasks: { 
            completed: weekTasks, 
            target: user.settings?.productivity?.weeklyGoal?.tasks || 25 
          },
          focusTime: { 
            completed: weekFocusTime, 
            target: user.settings?.productivity?.weeklyGoal?.focusTime || 600 
          },
          xp: { 
            completed: weekXP, 
            target: user.settings?.productivity?.weeklyGoal?.xp || 1000 
          }
        }
      }
    };
  }

  // Search users
  static async searchUsers(filters: SearchUsersRequest): Promise<SearchUsersResponse> {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {
      'settings.privacy.profilePublic': true
    };

    if (filters.query) {
      query.name = { $regex: filters.query, $options: 'i' };
    }

    // Build sort
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
    const sort: any = { [sortBy]: sortOrder };

    const [users, total] = await Promise.all([
      User.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    return {
      users: users.map(user => this.formatPublicProfile(user)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get available customizations for user
  static async getAvailableCustomizations(userId: string): Promise<AvailableCustomizations> {
    const user = await User.findById(userId).lean();
    if (!user) {
      throw new Error('User not found');
    }

    // Define available customizations (in a real app, this might come from a database)
    const allSkins = [
      { id: 'default', name: 'Default', cost: 0 },
      { id: 'casual', name: 'Casual', cost: 100 },
      { id: 'professional', name: 'Professional', cost: 150 },
      { id: 'creative', name: 'Creative', cost: 200 },
      { id: 'sporty', name: 'Sporty', cost: 175 }
    ];

    const allAccessories = [
      { id: 'glasses', name: 'Glasses', category: 'eyewear', cost: 50 },
      { id: 'hat', name: 'Hat', category: 'headwear', cost: 75 },
      { id: 'watch', name: 'Watch', category: 'accessories', cost: 100 },
      { id: 'necklace', name: 'Necklace', category: 'jewelry', cost: 80 }
    ];

    const allBackgrounds = [
      { id: 'default', name: 'Default', cost: 0 },
      { id: 'office', name: 'Office', cost: 100 },
      { id: 'nature', name: 'Nature', cost: 120 },
      { id: 'space', name: 'Space', cost: 150 },
      { id: 'abstract', name: 'Abstract', cost: 130 }
    ];

    // Check what user has unlocked (for now, assume they have unlocked items they've purchased)
    const unlockedItems = new Set([
      'default', // Always unlocked
      ...(user.avatarCustomization?.accessories || []),
      user.avatarCustomization?.skin,
      user.avatarCustomization?.background
    ].filter(Boolean));

    return {
      skins: allSkins.map(skin => ({
        ...skin,
        unlocked: unlockedItems.has(skin.id)
      })),
      accessories: allAccessories.map(accessory => ({
        ...accessory,
        unlocked: unlockedItems.has(accessory.id)
      })),
      backgrounds: allBackgrounds.map(background => ({
        ...background,
        unlocked: unlockedItems.has(background.id)
      }))
    };
  }

  // Purchase customization item
  static async purchaseCustomization(
    userId: string, 
    purchaseData: PurchaseCustomizationRequest
  ): Promise<{ success: boolean; newBalance: number }> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const customizations = await this.getAvailableCustomizations(userId);
    let item;
    let itemList;

    switch (purchaseData.type) {
      case 'skin':
        itemList = customizations.skins;
        break;
      case 'accessory':
        itemList = customizations.accessories;
        break;
      case 'background':
        itemList = customizations.backgrounds;
        break;
      default:
        throw new Error('Invalid customization type');
    }

    item = itemList.find(i => i.id === purchaseData.itemId);
    if (!item) {
      throw new Error('Item not found');
    }

    if (item.unlocked) {
      throw new Error('Item already unlocked');
    }

    if (user.coins < item.cost) {
      throw new Error('Insufficient coins');
    }

    // Deduct coins and unlock item
    user.coins -= item.cost;

    // Add item to user's customization
    if (purchaseData.type === 'accessory') {
      if (!user.avatarCustomization.accessories) {
        user.avatarCustomization.accessories = [];
      }
      user.avatarCustomization.accessories.push(purchaseData.itemId);
    } else if (purchaseData.type === 'skin') {
      user.avatarCustomization.skin = purchaseData.itemId;
    } else if (purchaseData.type === 'background') {
      user.avatarCustomization.background = purchaseData.itemId;
    }

    await user.save();

    return {
      success: true,
      newBalance: user.coins
    };
  }

  // Helper methods
  private static formatUserProfile(user: any): UserProfile {
    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      level: Math.floor(user.xp / 500) + 1,
      xp: user.xp,
      coins: user.coins,
      streak: user.streak,
      lastActiveDate: user.lastActiveDate.toISOString(),
      avatarUrl: user.avatarUrl,
      avatarCustomization: user.avatarCustomization,
      achievements: user.achievements,
      friends: user.friends.map((id: any) => id.toString()),
      friendRequests: {
        sent: user.friendRequests.sent.map((id: any) => id.toString()),
        received: user.friendRequests.received.map((id: any) => id.toString())
      },
      settings: user.settings,
      stats: user.stats,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };
  }

  private static formatPublicProfile(user: any): PublicProfile {
    const showStats = user.settings?.privacy?.showStats !== false;
    
    return {
      _id: user._id.toString(),
      name: user.name,
      level: Math.floor(user.xp / 500) + 1,
      xp: user.xp,
      avatarUrl: user.avatarUrl,
      avatarCustomization: user.avatarCustomization,
      achievements: user.achievements,
      stats: showStats ? {
        totalTasksCompleted: user.stats.totalTasksCompleted,
        totalFocusTime: user.stats.totalFocusTime,
        longestStreak: user.stats.longestStreak,
        totalChallengesCompleted: 0 // Would need to calculate this
      } : undefined,
      createdAt: user.createdAt.toISOString(),
      isOnline: user.settings?.privacy?.showOnlineStatus !== false ? 
        (Date.now() - new Date(user.lastActiveDate).getTime() < 5 * 60 * 1000) : undefined,
      lastActiveDate: user.settings?.privacy?.showOnlineStatus !== false ? 
        user.lastActiveDate.toISOString() : undefined
    };
  }

  private static async getUserLeaderboardRank(userId: string): Promise<number | undefined> {
    const rank = await User.countDocuments({
      xp: { $gt: (await User.findById(userId))?.xp || 0 },
      'settings.privacy.showInLeaderboard': { $ne: false }
    });
    
    return rank + 1;
  }

  private static async calculateTotalLoginDays(userId: string): Promise<number> {
    // This would require tracking login history
    // For now, return a placeholder calculation
    const user = await User.findById(userId);
    if (!user) return 0;
    
    const daysSinceJoin = Math.floor(
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Estimate based on activity (this is a simplified calculation)
    return Math.min(daysSinceJoin, Math.floor(daysSinceJoin * 0.7));
  }
}
