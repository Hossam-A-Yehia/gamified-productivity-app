import { getSocketManager } from '../config/socket';

export class SocketService {
  private static instance: SocketService;
  
  private constructor() {}
  
  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  // Challenge-related events
  public emitChallengeProgress(challengeId: string, userId: string, progress: number) {
    try {
      const socketManager = getSocketManager();
      socketManager.broadcastChallengeProgress(challengeId, userId, progress);
    } catch (error) {
      console.error('Error emitting challenge progress:', error);
    }
  }

  public emitChallengeCompletion(challengeId: string, userId: string, completionData: any) {
    try {
      const socketManager = getSocketManager();
      socketManager.broadcastChallengeCompletion(challengeId, userId, completionData);
    } catch (error) {
      console.error('Error emitting challenge completion:', error);
    }
  }

  public emitChallengeJoined(challengeId: string, userId: string, participantData: any) {
    try {
      const socketManager = getSocketManager();
      socketManager.getSocketInstance().to(`challenge:${challengeId}`).emit('participant-joined', {
        challengeId,
        userId,
        participantData,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error emitting challenge joined:', error);
    }
  }

  public emitChallengeLeft(challengeId: string, userId: string) {
    try {
      const socketManager = getSocketManager();
      socketManager.getSocketInstance().to(`challenge:${challengeId}`).emit('participant-left', {
        challengeId,
        userId,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error emitting challenge left:', error);
    }
  }

  // Leaderboard events
  public emitLeaderboardUpdate(leaderboardData: any) {
    try {
      const socketManager = getSocketManager();
      socketManager.broadcastLeaderboardUpdate(leaderboardData);
    } catch (error) {
      console.error('Error emitting leaderboard update:', error);
    }
  }

  public emitUserRankChange(userId: string, oldRank: number, newRank: number) {
    try {
      const socketManager = getSocketManager();
      socketManager.getSocketInstance().to(`user:${userId}`).emit('rank-changed', {
        oldRank,
        newRank,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error emitting rank change:', error);
    }
  }

  // Task-related events
  public emitTaskCompleted(userId: string, taskData: any, rewards: any) {
    try {
      const socketManager = getSocketManager();
      socketManager.broadcastTaskCompletion(userId, taskData, rewards);
    } catch (error) {
      console.error('Error emitting task completion:', error);
    }
  }

  public emitTaskCreated(userId: string, taskData: any) {
    try {
      const socketManager = getSocketManager();
      socketManager.getSocketInstance().to(`user:${userId}`).emit('task-created', {
        task: taskData,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error emitting task created:', error);
    }
  }

  // Achievement events
  public emitAchievementUnlocked(userId: string, achievement: any) {
    try {
      const socketManager = getSocketManager();
      socketManager.broadcastAchievementUnlocked(userId, achievement);
    } catch (error) {
      console.error('Error emitting achievement unlocked:', error);
    }
  }

  public emitLevelUp(userId: string, levelData: any) {
    try {
      const socketManager = getSocketManager();
      socketManager.broadcastLevelUp(userId, levelData);
    } catch (error) {
      console.error('Error emitting level up:', error);
    }
  }

  // Focus session events
  public emitFocusSessionStarted(userId: string, sessionData: any) {
    try {
      const socketManager = getSocketManager();
      socketManager.getSocketInstance().to(`user:${userId}`).emit('focus-session-started', {
        session: sessionData,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error emitting focus session started:', error);
    }
  }

  public emitFocusSessionCompleted(userId: string, sessionData: any, rewards: any) {
    try {
      const socketManager = getSocketManager();
      socketManager.broadcastFocusSessionComplete(userId, sessionData, rewards);
    } catch (error) {
      console.error('Error emitting focus session completed:', error);
    }
  }

  // Notification events
  public emitNotification(userId: string, notification: any) {
    try {
      const socketManager = getSocketManager();
      socketManager.sendNotificationToUser(userId, notification);
    } catch (error) {
      console.error('Error emitting notification:', error);
    }
  }

  // Friend events
  public emitFriendRequestSent(userId: string, friendRequestData: any) {
    try {
      const socketManager = getSocketManager();
      socketManager.getSocketInstance().to(`user:${userId}`).emit('friend-request-received', {
        friendRequest: friendRequestData,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error emitting friend request sent:', error);
    }
  }

  public emitFriendRequestAccepted(userId: string, friendData: any) {
    try {
      const socketManager = getSocketManager();
      socketManager.getSocketInstance().to(`user:${userId}`).emit('friend-request-accepted', {
        friend: friendData,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error emitting friend request accepted:', error);
    }
  }

  // XP and coins events
  public emitXPGained(userId: string, xpData: { amount: number; source: string; total: number }) {
    try {
      const socketManager = getSocketManager();
      socketManager.getSocketInstance().to(`user:${userId}`).emit('xp-gained', {
        xp: xpData,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error emitting XP gained:', error);
    }
  }

  public emitCoinsEarned(userId: string, coinsData: { amount: number; source: string; total: number }) {
    try {
      const socketManager = getSocketManager();
      socketManager.getSocketInstance().to(`user:${userId}`).emit('coins-earned', {
        coins: coinsData,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error emitting coins earned:', error);
    }
  }

  // Streak events
  public emitStreakUpdated(userId: string, streakData: { current: number; previous: number; isNewRecord: boolean }) {
    try {
      const socketManager = getSocketManager();
      socketManager.getSocketInstance().to(`user:${userId}`).emit('streak-updated', {
        streak: streakData,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error emitting streak updated:', error);
    }
  }

  // Utility methods
  public emitToUser(userId: string, event: string, data: any) {
    try {
      const socketManager = getSocketManager();
      socketManager.getSocketInstance().to(`user:${userId}`).emit(event, data);
    } catch (error) {
      console.error(`Error emitting ${event} to user ${userId}:`, error);
    }
  }

  public emitToRoom(room: string, event: string, data: any) {
    try {
      const socketManager = getSocketManager();
      socketManager.getSocketInstance().to(room).emit(event, data);
    } catch (error) {
      console.error(`Error emitting ${event} to room ${room}:`, error);
    }
  }

  // Chat-specific events
  public emitNewMessage(chatId: string, message: any, senderId: string) {
    try {
      const socketManager = getSocketManager();
      // Emit to all chat participants except sender
      socketManager.getSocketInstance().to(`chat:${chatId}`).except(`user:${senderId}`).emit('new-message', {
        chatId,
        message,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error emitting new message:', error);
    }
  }

  public emitMessageEdited(chatId: string, messageId: string, newContent: string, editorId: string) {
    try {
      const socketManager = getSocketManager();
      socketManager.getSocketInstance().to(`chat:${chatId}`).emit('message-edited', {
        chatId,
        messageId,
        newContent,
        editorId,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error emitting message edited:', error);
    }
  }

  public emitMessageDeleted(chatId: string, messageId: string, deleterId: string) {
    try {
      const socketManager = getSocketManager();
      socketManager.getSocketInstance().to(`chat:${chatId}`).emit('message-deleted', {
        chatId,
        messageId,
        deleterId,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error emitting message deleted:', error);
    }
  }

  public emitTypingStart(chatId: string, userId: string, userName: string) {
    try {
      const socketManager = getSocketManager();
      socketManager.getSocketInstance().to(`chat:${chatId}`).except(`user:${userId}`).emit('typing-start', {
        chatId,
        userId,
        userName,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error emitting typing start:', error);
    }
  }

  public emitTypingStop(chatId: string, userId: string) {
    try {
      const socketManager = getSocketManager();
      socketManager.getSocketInstance().to(`chat:${chatId}`).except(`user:${userId}`).emit('typing-stop', {
        chatId,
        userId,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error emitting typing stop:', error);
    }
  }

  public emitUserOnlineStatus(userId: string, isOnline: boolean) {
    try {
      const socketManager = getSocketManager();
      // Emit to all users who have this user in their chats
      socketManager.getSocketInstance().emit('user-status-changed', {
        userId,
        isOnline,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error emitting user status:', error);
    }
  }

  public emitMessageReaction(chatId: string, messageId: string, reaction: any, userId: string) {
    try {
      const socketManager = getSocketManager();
      socketManager.getSocketInstance().to(`chat:${chatId}`).emit('message-reaction', {
        chatId,
        messageId,
        reaction,
        userId,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error emitting message reaction:', error);
    }
  }

  public joinChatRoom(socketId: string, chatId: string) {
    try {
      const socketManager = getSocketManager();
      const socket = socketManager.getSocketInstance().sockets.sockets.get(socketId);
      if (socket) {
        socket.join(`chat:${chatId}`);
      }
    } catch (error) {
      console.error('Error joining chat room:', error);
    }
  }

  public leaveChatRoom(socketId: string, chatId: string) {
    try {
      const socketManager = getSocketManager();
      const socket = socketManager.getSocketInstance().sockets.sockets.get(socketId);
      if (socket) {
        socket.leave(`chat:${chatId}`);
      }
    } catch (error) {
      console.error('Error leaving chat room:', error);
    }
  }

  public emitToLeaderboard(event: string, data: any) {
    try {
      const socketManager = getSocketManager();
      socketManager.getSocketInstance().to('leaderboard').emit(event, {
        ...data,
        timestamp: new Date()
      });
    } catch (error) {
      console.error(`Error emitting ${event} to leaderboard:`, error);
    }
  }

  public isUserOnline(userId: string): boolean {
    try {
      const socketManager = getSocketManager();
      return socketManager.isUserOnline(userId);
    } catch (error) {
      console.error('Error checking if user is online:', error);
      return false;
    }
  }

  public getConnectedUsers(): string[] {
    try {
      const socketManager = getSocketManager();
      return socketManager.getConnectedUsers();
    } catch (error) {
      console.error('Error getting connected users:', error);
      return [];
    }
  }
}

// Export singleton instance
export const socketService = SocketService.getInstance();
