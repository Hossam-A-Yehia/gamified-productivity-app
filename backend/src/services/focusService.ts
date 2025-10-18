import { FocusSession, IFocusSession } from '../models/FocusSession';
import User from '../models/User';
import { Task } from '../models/Task';
import mongoose from 'mongoose';
import { 
  CreateFocusSessionRequest, 
  UpdateFocusSessionRequest, 
  FocusSessionFilters, 
  FocusStats,
  FocusSettings,
  UpdateFocusSettingsRequest
} from '../types/focus';

export class FocusService {
  // Create a new focus session
  static async createFocusSession(userId: string, sessionData: CreateFocusSessionRequest): Promise<IFocusSession> {
    const session = new FocusSession({
      userId: new mongoose.Types.ObjectId(userId),
      type: sessionData.type,
      duration: sessionData.duration,
      breakDuration: sessionData.breakDuration || 5,
      taskId: sessionData.taskId ? new mongoose.Types.ObjectId(sessionData.taskId) : undefined,
      notes: sessionData.notes,
      startTime: new Date(),
      xpEarned: 0,
      productivity: 0
    });

    await session.save();
    return session;
  }

  // Get focus sessions with filters and pagination
  static async getFocusSessions(userId: string, filters: FocusSessionFilters = {}): Promise<{
    sessions: IFocusSession[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const skip = (page - 1) * limit;

    // Build query
    const query: any = { userId: new mongoose.Types.ObjectId(userId) };

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.completed !== undefined) {
      query.completed = filters.completed;
    }

    if (filters.taskId) {
      query.taskId = new mongoose.Types.ObjectId(filters.taskId);
    }

    if (filters.startDate || filters.endDate) {
      query.startTime = {};
      if (filters.startDate) {
        query.startTime.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.startTime.$lte = new Date(filters.endDate);
      }
    }

    // Build sort
    const sortBy = filters.sortBy || 'startTime';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    const [sessions, total] = await Promise.all([
      FocusSession.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('taskId', 'title category')
        .lean(),
      FocusSession.countDocuments(query)
    ]);

    return {
      sessions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get focus session by ID
  static async getFocusSessionById(userId: string, sessionId: string): Promise<IFocusSession | null> {
    return FocusSession.findOne({
      _id: new mongoose.Types.ObjectId(sessionId),
      userId: new mongoose.Types.ObjectId(userId)
    }).populate('taskId', 'title category');
  }

  // Update focus session
  static async updateFocusSession(
    userId: string, 
    sessionId: string, 
    updateData: UpdateFocusSessionRequest
  ): Promise<IFocusSession | null> {
    const session = await FocusSession.findOne({
      _id: new mongoose.Types.ObjectId(sessionId),
      userId: new mongoose.Types.ObjectId(userId)
    });

    if (!session) {
      return null;
    }

    // Update fields
    if (updateData.actualDuration !== undefined) {
      session.actualDuration = updateData.actualDuration;
    }
    if (updateData.interruptions !== undefined) {
      session.interruptions = updateData.interruptions;
    }
    if (updateData.pausedTime !== undefined) {
      session.pausedTime = updateData.pausedTime;
    }
    if (updateData.notes !== undefined) {
      session.notes = updateData.notes;
    }
    if (updateData.completed !== undefined) {
      session.completed = updateData.completed;
      if (updateData.completed && !session.endTime) {
        session.endTime = new Date();
      }
    }

    await session.save();
    return session;
  }

  // Complete focus session and calculate XP
  static async completeFocusSession(userId: string, sessionId: string): Promise<{
    session: IFocusSession;
    xpEarned: number;
  }> {
    const session = await FocusSession.findOne({
      _id: new mongoose.Types.ObjectId(sessionId),
      userId: new mongoose.Types.ObjectId(userId)
    });

    if (!session) {
      throw new Error('Focus session not found');
    }

    if (session.completed) {
      throw new Error('Session already completed');
    }

    // Mark as completed
    session.completed = true;
    session.endTime = new Date();
    
    // Calculate actual duration if not set
    if (session.actualDuration === 0) {
      const duration = Math.floor((session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60));
      session.actualDuration = Math.max(0, duration - session.pausedTime);
    }

    // Calculate XP earned
    const xpEarned = this.calculateFocusXP(session);
    session.xpEarned = xpEarned;

    await session.save();

    // Update user XP
    await User.findByIdAndUpdate(
      userId,
      { 
        $inc: { 
          xp: xpEarned,
          'stats.totalFocusTime': session.actualDuration
        }
      }
    );

    return { session, xpEarned };
  }

  // Calculate XP for focus session
  static calculateFocusXP(session: IFocusSession): number {
    const baseXP = 5; // Base XP per minute
    const completionBonus = session.completed ? 20 : 0;
    const productivityMultiplier = session.productivity / 100;
    
    // Type multipliers
    const typeMultipliers = {
      pomodoro: 1.2,
      custom: 1.0
    };

    // Duration bonus (longer sessions get slightly more XP per minute)
    const durationMultiplier = session.duration >= 25 ? 1.1 : 1.0;

    const totalXP = Math.floor(
      (baseXP * session.actualDuration * typeMultipliers[session.type] * durationMultiplier * productivityMultiplier) + 
      completionBonus
    );

    return Math.max(0, totalXP);
  }

  // Delete focus session
  static async deleteFocusSession(userId: string, sessionId: string): Promise<boolean> {
    const result = await FocusSession.deleteOne({
      _id: new mongoose.Types.ObjectId(sessionId),
      userId: new mongoose.Types.ObjectId(userId)
    });

    return result.deletedCount > 0;
  }

  // Get focus statistics
  static async getFocusStats(userId: string): Promise<FocusStats> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // Get all sessions for the user
    const sessions = await FocusSession.find({ userId: userObjectId }).lean();
    
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        completedSessions: 0,
        totalFocusTime: 0,
        averageSessionLength: 0,
        averageProductivity: 0,
        completionRate: 0,
        totalXpEarned: 0,
        longestSession: 0,
        currentStreak: 0,
        todaysSessions: 0,
        thisWeekSessions: 0,
        thisMonthSessions: 0,
        categoryBreakdown: {
          pomodoro: 0,
          custom: 0
        },
        productivityTrend: []
      };
    }

    const completedSessions = sessions.filter(s => s.completed);
    const totalFocusTime = completedSessions.reduce((sum, s) => sum + s.actualDuration, 0);
    const totalXpEarned = sessions.reduce((sum, s) => sum + s.xpEarned, 0);
    
    // Date calculations
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todaysSessions = sessions.filter(s => s.startTime >= today).length;
    const thisWeekSessions = sessions.filter(s => s.startTime >= weekStart).length;
    const thisMonthSessions = sessions.filter(s => s.startTime >= monthStart).length;

    // Category breakdown
    const categoryBreakdown = {
      pomodoro: sessions.filter(s => s.type === 'pomodoro').length,
      custom: sessions.filter(s => s.type === 'custom').length
    };

    // Productivity trend (last 7 days)
    const productivityTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
      const dayStart = new Date(date);
      const dayEnd = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      
      const daySessions = sessions.filter(s => 
        s.startTime >= dayStart && s.startTime < dayEnd && s.completed
      );
      
      const avgProductivity = daySessions.length > 0 
        ? daySessions.reduce((sum, s) => sum + s.productivity, 0) / daySessions.length 
        : 0;

      productivityTrend.push({
        date: date.toISOString().split('T')[0],
        productivity: Math.round(avgProductivity),
        sessions: daySessions.length
      });
    }

    // Calculate current streak
    const currentStreak = await this.calculateFocusStreak(userId);

    return {
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      totalFocusTime,
      averageSessionLength: completedSessions.length > 0 
        ? Math.round(totalFocusTime / completedSessions.length) 
        : 0,
      averageProductivity: completedSessions.length > 0 
        ? Math.round(completedSessions.reduce((sum, s) => sum + s.productivity, 0) / completedSessions.length)
        : 0,
      completionRate: sessions.length > 0 
        ? Math.round((completedSessions.length / sessions.length) * 100)
        : 0,
      totalXpEarned,
      longestSession: completedSessions.length > 0 
        ? Math.max(...completedSessions.map(s => s.actualDuration))
        : 0,
      currentStreak,
      todaysSessions,
      thisWeekSessions,
      thisMonthSessions,
      categoryBreakdown,
      productivityTrend
    };
  }

  // Calculate focus streak (consecutive days with completed sessions)
  static async calculateFocusStreak(userId: string): Promise<number> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // Get completed sessions ordered by date (most recent first)
    const sessions = await FocusSession.find({
      userId: userObjectId,
      completed: true
    }).sort({ startTime: -1 }).lean();

    if (sessions.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Group sessions by date
    const sessionsByDate = new Map<string, boolean>();
    sessions.forEach(session => {
      const date = new Date(session.startTime);
      date.setHours(0, 0, 0, 0);
      const dateStr = date.toISOString().split('T')[0];
      sessionsByDate.set(dateStr, true);
    });

    // Check consecutive days starting from today or yesterday
    let checkDate = new Date(today);
    
    // If no sessions today, start from yesterday
    const todayStr = today.toISOString().split('T')[0];
    if (!sessionsByDate.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Count consecutive days
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (sessionsByDate.has(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  // Get user focus settings
  static async getFocusSettings(userId: string): Promise<FocusSettings> {
    const user = await User.findById(userId);
    
    // Default settings
    const defaultSettings: FocusSettings = {
      defaultPomodoroLength: 25,
      defaultBreakLength: 5,
      defaultLongBreakLength: 15,
      pomodorosUntilLongBreak: 4,
      autoStartBreaks: false,
      autoStartPomodoros: false,
      soundEnabled: true,
      notificationsEnabled: true,
      xpMultiplier: 1.0
    };

    return user?.settings?.focus || defaultSettings;
  }

  // Update user focus settings
  static async updateFocusSettings(
    userId: string, 
    settings: UpdateFocusSettingsRequest
  ): Promise<FocusSettings> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Initialize settings if they don't exist
    if (!user.settings) {
      user.settings = {};
    }
    if (!user.settings.focus) {
      user.settings.focus = {
        defaultPomodoroLength: 25,
        defaultBreakLength: 5,
        defaultLongBreakLength: 15,
        pomodorosUntilLongBreak: 4,
        autoStartBreaks: false,
        autoStartPomodoros: false,
        soundEnabled: true,
        notificationsEnabled: true,
        xpMultiplier: 1.0
      };
    }

    // Update settings
    Object.assign(user.settings.focus, settings);
    
    await user.save();
    return user.settings.focus;
  }
}
