import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { connectMongoDB } from './database';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

export class SocketManager {
  private io: SocketIOServer;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket: any, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        
        if (!token) {
          console.log('Socket connection attempt without token');
          return next(new Error('Authentication error: No token provided'));
        }

        console.log('Verifying socket token...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        console.log('Decoded token:', { id: decoded.id, userId: decoded.userId });
        
        // Try both 'id' and 'userId' fields as different auth systems might use different field names
        const userId = decoded.id || decoded.userId;
        if (!userId) {
          console.error('No user ID found in token payload:', decoded);
          return next(new Error('Authentication error: Invalid token payload'));
        }

        const user = await User.findById(userId).select('-password');
        
        if (!user) {
          console.error('User not found for ID:', userId);
          return next(new Error('Authentication error: User not found'));
        }

        console.log('Socket authenticated for user:', user.name, user._id);
        socket.userId = (user as any)._id.toString();
        socket.user = user;
        next();
      } catch (error) {
        console.error('Socket authentication error:', error);
        if (error instanceof jwt.JsonWebTokenError) {
          next(new Error('Authentication error: Invalid token'));
        } else {
          next(new Error('Authentication error: ' + (error as Error).message));
        }
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: any) => {
      console.log(`User ${socket.user.name} connected with socket ID: ${socket.id}`);
      
      // Store user connection
      this.connectedUsers.set(socket.userId, socket.id);
      
      // Join user to their personal room
      socket.join(`user:${socket.userId}`);
      
      // Notify friends that user is online
      this.notifyFriendsOnlineStatus(socket.userId, true);

      // Handle challenge-related events
      this.setupChallengeEvents(socket);
      
      // Handle leaderboard events
      this.setupLeaderboardEvents(socket);
      
      // Handle notification events
      this.setupNotificationEvents(socket);
      
      // Handle achievement events
      this.setupAchievementEvents(socket);

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${socket.user.name} disconnected`);
        this.connectedUsers.delete(socket.userId);
        this.notifyFriendsOnlineStatus(socket.userId, false);
      });
    });
  }

  private setupChallengeEvents(socket: any) {
    // Join challenge rooms
    socket.on('join-challenge', (challengeId: string) => {
      socket.join(`challenge:${challengeId}`);
      console.log(`User ${socket.userId} joined challenge room: ${challengeId}`);
    });

    // Leave challenge rooms
    socket.on('leave-challenge', (challengeId: string) => {
      socket.leave(`challenge:${challengeId}`);
      console.log(`User ${socket.userId} left challenge room: ${challengeId}`);
    });

    // Handle challenge progress updates
    socket.on('update-challenge-progress', (data: { challengeId: string; progress: number }) => {
      this.broadcastChallengeProgress(data.challengeId, socket.userId, data.progress);
    });
  }

  private setupLeaderboardEvents(socket: any) {
    // Join leaderboard room
    socket.on('join-leaderboard', () => {
      socket.join('leaderboard');
      console.log(`User ${socket.userId} joined leaderboard room`);
    });

    // Leave leaderboard room
    socket.on('leave-leaderboard', () => {
      socket.leave('leaderboard');
      console.log(`User ${socket.userId} left leaderboard room`);
    });
  }

  private setupNotificationEvents(socket: any) {
    // Mark notification as read
    socket.on('mark-notification-read', (notificationId: string) => {
      // This will be handled by the notification service
      console.log(`Notification ${notificationId} marked as read by user ${socket.userId}`);
    });
  }

  private setupAchievementEvents(socket: any) {
    // Achievement unlocked acknowledgment
    socket.on('achievement-acknowledged', (achievementId: string) => {
      console.log(`Achievement ${achievementId} acknowledged by user ${socket.userId}`);
    });
  }

  // Public methods for broadcasting events

  public broadcastChallengeProgress(challengeId: string, userId: string, progress: number) {
    this.io.to(`challenge:${challengeId}`).emit('challenge-progress-updated', {
      challengeId,
      userId,
      progress,
      timestamp: new Date()
    });
  }

  public broadcastChallengeCompletion(challengeId: string, userId: string, completionData: any) {
    this.io.to(`challenge:${challengeId}`).emit('challenge-completed', {
      challengeId,
      userId,
      completionData,
      timestamp: new Date()
    });
  }

  public broadcastLeaderboardUpdate(leaderboardData: any) {
    this.io.to('leaderboard').emit('leaderboard-updated', {
      leaderboard: leaderboardData,
      timestamp: new Date()
    });
  }

  public sendNotificationToUser(userId: string, notification: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(`user:${userId}`).emit('new-notification', {
        notification,
        timestamp: new Date()
      });
    }
  }

  public broadcastAchievementUnlocked(userId: string, achievement: any) {
    // Send to user
    this.io.to(`user:${userId}`).emit('achievement-unlocked', {
      achievement,
      timestamp: new Date()
    });

    // Optionally broadcast to friends or leaderboard
    this.io.to('leaderboard').emit('user-achievement-unlocked', {
      userId,
      achievement,
      timestamp: new Date()
    });
  }

  public broadcastLevelUp(userId: string, levelData: any) {
    this.io.to(`user:${userId}`).emit('level-up', {
      levelData,
      timestamp: new Date()
    });

    // Broadcast to leaderboard for rank updates
    this.io.to('leaderboard').emit('user-level-up', {
      userId,
      levelData,
      timestamp: new Date()
    });
  }

  public broadcastTaskCompletion(userId: string, taskData: any, rewards: any) {
    this.io.to(`user:${userId}`).emit('task-completed', {
      task: taskData,
      rewards,
      timestamp: new Date()
    });
  }

  public broadcastFocusSessionComplete(userId: string, sessionData: any, rewards: any) {
    this.io.to(`user:${userId}`).emit('focus-session-completed', {
      session: sessionData,
      rewards,
      timestamp: new Date()
    });
  }

  private async notifyFriendsOnlineStatus(userId: string, isOnline: boolean) {
    try {
      const user = await User.findById(userId).populate('friends', '_id');
      if (user && user.friends) {
        user.friends.forEach((friend: any) => {
          this.io.to(`user:${friend._id}`).emit('friend-status-changed', {
            userId,
            isOnline,
            timestamp: new Date()
          });
        });
      }
    } catch (error) {
      console.error('Error notifying friends of status change:', error);
    }
  }

  public getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  public isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  public getSocketInstance(): SocketIOServer {
    return this.io;
  }
}

// Global socket manager instance
let socketManager: SocketManager;

export const initializeSocket = (server: HTTPServer): SocketManager => {
  socketManager = new SocketManager(server);
  return socketManager;
};

export const getSocketManager = (): SocketManager => {
  if (!socketManager) {
    throw new Error('Socket manager not initialized. Call initializeSocket first.');
  }
  return socketManager;
};
