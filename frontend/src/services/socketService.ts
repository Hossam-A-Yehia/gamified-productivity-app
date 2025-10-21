// Socket.io client implementation
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

interface SocketEvents {
  // Task events
  'task-completed': (data: { task: any; rewards: any; timestamp: Date }) => void;
  'task-created': (data: { task: any; timestamp: Date }) => void;
  'xp-gained': (data: { xp: { amount: number; source: string; total: number }; timestamp: Date }) => void;
  'coins-earned': (data: { coins: { amount: number; source: string; total: number }; timestamp: Date }) => void;
  'level-up': (data: { levelData: any; timestamp: Date }) => void;
  
  // Challenge events
  'challenge-progress-updated': (data: { challengeId: string; userId: string; progress: number; timestamp: Date }) => void;
  'challenge-completed': (data: { challengeId: string; userId: string; completionData: any; timestamp: Date }) => void;
  'participant-joined': (data: { challengeId: string; userId: string; participantData: any; timestamp: Date }) => void;
  'participant-left': (data: { challengeId: string; userId: string; timestamp: Date }) => void;
  
  // Leaderboard events
  'leaderboard-updated': (data: { leaderboard: any; timestamp: Date }) => void;
  'user-achievement-unlocked': (data: { userId: string; achievement: any; timestamp: Date }) => void;
  'user-level-up': (data: { userId: string; levelData: any; timestamp: Date }) => void;
  'rank-changed': (data: { oldRank: number; newRank: number; timestamp: Date }) => void;
  
  // Focus session events
  'focus-session-started': (data: { session: any; timestamp: Date }) => void;
  'focus-session-completed': (data: { session: any; rewards: any; timestamp: Date }) => void;
  
  // Achievement events
  'achievement-unlocked': (data: { achievement: any; timestamp: Date }) => void;
  
  // Notification events
  'new-notification': (data: { notification: any; timestamp: Date }) => void;
  
  // Friend events
  'friend-request-received': (data: { friendRequest: any; timestamp: Date }) => void;
  'friend-request-accepted': (data: { friend: any; timestamp: Date }) => void;
  'friend-status-changed': (data: { userId: string; isOnline: boolean; timestamp: Date }) => void;
  
  // Streak events
  'streak-updated': (data: { streak: { current: number; previous: number; isNewRecord: boolean }; timestamp: Date }) => void;
  
  // Chat events
  'new-message': (data: { chatId: string; message: any; timestamp: Date }) => void;
  'message-edited': (data: { chatId: string; messageId: string; newContent: string; editorId: string; timestamp: Date }) => void;
  'message-deleted': (data: { chatId: string; messageId: string; deleterId: string; timestamp: Date }) => void;
  'message-reaction': (data: { chatId: string; messageId: string; reaction: any; userId: string; timestamp: Date }) => void;
  'typing-start': (data: { chatId: string; userId: string; userName: string; timestamp: Date }) => void;
  'typing-stop': (data: { chatId: string; userId: string; timestamp: Date }) => void;
  'user-status-changed': (data: { userId: string; isOnline: boolean; timestamp: Date }) => void;
  'chat-marked-read': (data: { chatId: string }) => void;
  'chat-unread-updated': (data: { chatId: string; unreadCount: number }) => void;
}

export class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private eventListeners: Map<string, Function[]> = new Map();
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  private constructor() {
    // Initialize socket connection when service is created
    this.connect();
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  private connect() {
    try {
      const token = Cookies.get('accessToken');
      if (!token) {
        console.warn('No auth token found, skipping socket connection');
        return;
      }

      console.log('Found auth token for socket connection:', token.substring(0, 20) + '...');

      // Use VITE_SOCKET_URL from environment or fallback to API URL without /api
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 
                       import.meta.env.VITE_API_URL?.replace('/api', '') || 
                       'http://localhost:4000';

      console.log('Connecting to Socket.io server at:', socketUrl);

      this.socket = io(socketUrl, {
        auth: {
          token
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: this.reconnectDelay,
        reconnectionAttempts: this.maxReconnectAttempts
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to connect to socket:', error);
      this.isConnected = false;
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Show connection toast
      toast.success('Connected to real-time updates');
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('Disconnected from server:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('Connection error:', error);
      this.isConnected = false;
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        toast.error('Failed to connect to real-time updates');
      }
    });

    // Set up event handlers for real-time features
    this.setupTaskEventHandlers();
    this.setupChallengeEventHandlers();
    this.setupLeaderboardEventHandlers();
    this.setupFocusEventHandlers();
    this.setupAchievementEventHandlers();
    this.setupNotificationEventHandlers();
    this.setupFriendEventHandlers();
  }

  private setupTaskEventHandlers() {
    if (!this.socket) return;

    this.socket.on('task-completed', (data: any) => {
      console.log('Task completed:', data);
      toast.success(`Task completed! +${data.rewards.xp} XP, +${data.rewards.coins} coins`);
      this.emit('task-completed', data);
    });

    this.socket.on('xp-gained', (data: any) => {
      console.log('XP gained:', data);
      this.emit('xp-gained', data);
    });

    this.socket.on('coins-earned', (data: any) => {
      console.log('Coins earned:', data);
      this.emit('coins-earned', data);
    });

    this.socket.on('level-up', (data: any) => {
      console.log('Level up!', data);
      toast.success(`🎉 Level Up! You're now level ${data.levelData.newLevel}!`);
      this.emit('level-up', data);
    });
  }

  private setupChallengeEventHandlers() {
    if (!this.socket) return;

    this.socket.on('challenge-progress-updated', (data: any) => {
      console.log('Challenge progress updated:', data);
      this.emit('challenge-progress-updated', data);
    });

    this.socket.on('challenge-completed', (data: any) => {
      console.log('Challenge completed:', data);
      toast.success('🏆 Challenge completed!');
      this.emit('challenge-completed', data);
    });

    this.socket.on('participant-joined', (data: any) => {
      console.log('Participant joined challenge:', data);
      this.emit('participant-joined', data);
    });

    this.socket.on('participant-left', (data: any) => {
      console.log('Participant left challenge:', data);
      this.emit('participant-left', data);
    });
  }

  private setupLeaderboardEventHandlers() {
    if (!this.socket) return;

    this.socket.on('leaderboard-updated', (data: any) => {
      console.log('Leaderboard updated:', data);
      this.emit('leaderboard-updated', data);
    });

    this.socket.on('rank-changed', (data: any) => {
      console.log('Rank changed:', data);
      if (data.newRank < data.oldRank) {
        toast.success(`📈 Your rank improved to #${data.newRank}!`);
      }
      this.emit('rank-changed', data);
    });
  }

  private setupFocusEventHandlers() {
    if (!this.socket) return;

    this.socket.on('focus-session-completed', (data: any) => {
      console.log('Focus session completed:', data);
      toast.success(`🎯 Focus session completed! +${data.rewards.xp} XP`);
      this.emit('focus-session-completed', data);
    });
  }

  private setupAchievementEventHandlers() {
    if (!this.socket) return;

    this.socket.on('achievement-unlocked', (data: any) => {
      console.log('Achievement unlocked:', data);
      toast.success(`🏅 Achievement unlocked: ${data.achievement.name}!`);
      this.emit('achievement-unlocked', data);
    });
  }

  private setupNotificationEventHandlers() {
    if (!this.socket) return;

    this.socket.on('new-notification', (data: any) => {
      console.log('New notification:', data);
      toast.info(data.notification.message);
      this.emit('new-notification', data);
    });
  }

  private setupFriendEventHandlers() {
    if (!this.socket) return;

    this.socket.on('friend-request-received', (data: any) => {
      console.log('Friend request received:', data);
      toast.info('You have a new friend request!');
      this.emit('friend-request-received', data);
    });

    this.socket.on('friend-request-accepted', (data: any) => {
      console.log('Friend request accepted:', data);
      toast.success('Friend request accepted!');
      this.emit('friend-request-accepted', data);
    });

    this.socket.on('friend-status-changed', (data: any) => {
      console.log('Friend status changed:', data);
      this.emit('friend-status-changed', data);
    });
  }

  // Public methods for components to use

  public on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  public off<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit<K extends keyof SocketEvents>(event: K, data: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Challenge-specific methods
  public joinChallengeRoom(challengeId: string) {
    if (this.socket) {
      this.socket.emit('join-challenge', challengeId);
    }
  }

  public leaveChallengeRoom(challengeId: string) {
    if (this.socket) {
      this.socket.emit('leave-challenge', challengeId);
    }
  }

  public joinLeaderboardRoom() {
    if (this.socket) {
      this.socket.emit('join-leaderboard');
    }
  }

  public leaveLeaderboardRoom() {
    if (this.socket) {
      this.socket.emit('leave-leaderboard');
    }
  }

  // Chat-specific methods
  public joinChatRoom(chatId: string) {
    if (this.socket) {
      this.socket.emit('join-chat', { chatId });
    }
  }

  public leaveChatRoom(chatId: string) {
    if (this.socket) {
      this.socket.emit('leave-chat', { chatId });
    }
  }

  public emitTypingStart(chatId: string) {
    if (this.socket) {
      this.socket.emit('typing-start', { chatId });
    }
  }

  public emitTypingStop(chatId: string) {
    if (this.socket) {
      this.socket.emit('typing-stop', { chatId });
    }
  }

  // Utility methods
  public isConnectedToServer(): boolean {
    return this.isConnected;
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  public reconnect() {
    if (!this.isConnected) {
      this.connect();
    }
  }
}

// Export singleton instance
export const socketService = SocketService.getInstance();
