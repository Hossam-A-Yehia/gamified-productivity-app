import { useEffect, useCallback, useRef } from 'react';
import { socketService } from '../services/socketService';

type SocketEventHandler = (data: any) => void;

export const useSocket = () => {
  const handlersRef = useRef<Map<string, SocketEventHandler>>(new Map());

  const on = useCallback((event: string, handler: SocketEventHandler) => {
    // Store the handler reference
    handlersRef.current.set(event, handler);
    
    // Add the event listener
    socketService.on(event as any, handler);
  }, []);

  const off = useCallback((event: string) => {
    const handler = handlersRef.current.get(event);
    if (handler) {
      socketService.off(event as any, handler);
      handlersRef.current.delete(event);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Remove all event listeners when component unmounts
      handlersRef.current.forEach((handler, event) => {
        socketService.off(event as any, handler);
      });
      handlersRef.current.clear();
    };
  }, []);

  return {
    on,
    off,
    isConnected: socketService.isConnectedToServer(),
    joinChallengeRoom: socketService.joinChallengeRoom.bind(socketService),
    leaveChallengeRoom: socketService.leaveChallengeRoom.bind(socketService),
    joinLeaderboardRoom: socketService.joinLeaderboardRoom.bind(socketService),
    leaveLeaderboardRoom: socketService.leaveLeaderboardRoom.bind(socketService),
    reconnect: socketService.reconnect.bind(socketService),
  };
};

// Specialized hooks for different features

export const useTaskEvents = () => {
  const socket = useSocket();

  const onTaskCompleted = useCallback((handler: (data: any) => void) => {
    socket.on('task-completed', handler);
    return () => socket.off('task-completed');
  }, [socket]);

  const onXPGained = useCallback((handler: (data: any) => void) => {
    socket.on('xp-gained', handler);
    return () => socket.off('xp-gained');
  }, [socket]);

  const onCoinsEarned = useCallback((handler: (data: any) => void) => {
    socket.on('coins-earned', handler);
    return () => socket.off('coins-earned');
  }, [socket]);

  const onLevelUp = useCallback((handler: (data: any) => void) => {
    socket.on('level-up', handler);
    return () => socket.off('level-up');
  }, [socket]);

  return {
    onTaskCompleted,
    onXPGained,
    onCoinsEarned,
    onLevelUp,
    isConnected: socket.isConnected,
  };
};

export const useChallengeEvents = (challengeId?: string) => {
  const socket = useSocket();

  // Join/leave challenge room when challengeId changes
  useEffect(() => {
    if (challengeId) {
      socket.joinChallengeRoom(challengeId);
      return () => {
        socket.leaveChallengeRoom(challengeId);
      };
    }
  }, [challengeId, socket]);

  const onProgressUpdated = useCallback((handler: (data: any) => void) => {
    socket.on('challenge-progress-updated', handler);
    return () => socket.off('challenge-progress-updated');
  }, [socket]);

  const onChallengeCompleted = useCallback((handler: (data: any) => void) => {
    socket.on('challenge-completed', handler);
    return () => socket.off('challenge-completed');
  }, [socket]);

  const onParticipantJoined = useCallback((handler: (data: any) => void) => {
    socket.on('participant-joined', handler);
    return () => socket.off('participant-joined');
  }, [socket]);

  const onParticipantLeft = useCallback((handler: (data: any) => void) => {
    socket.on('participant-left', handler);
    return () => socket.off('participant-left');
  }, [socket]);

  return {
    onProgressUpdated,
    onChallengeCompleted,
    onParticipantJoined,
    onParticipantLeft,
    isConnected: socket.isConnected,
  };
};

export const useLeaderboardEvents = () => {
  const socket = useSocket();

  // Join leaderboard room on mount
  useEffect(() => {
    socket.joinLeaderboardRoom();
    return () => {
      socket.leaveLeaderboardRoom();
    };
  }, [socket]);

  const onLeaderboardUpdated = useCallback((handler: (data: any) => void) => {
    socket.on('leaderboard-updated', handler);
    return () => socket.off('leaderboard-updated');
  }, [socket]);

  const onRankChanged = useCallback((handler: (data: any) => void) => {
    socket.on('rank-changed', handler);
    return () => socket.off('rank-changed');
  }, [socket]);

  const onUserAchievementUnlocked = useCallback((handler: (data: any) => void) => {
    socket.on('user-achievement-unlocked', handler);
    return () => socket.off('user-achievement-unlocked');
  }, [socket]);

  const onUserLevelUp = useCallback((handler: (data: any) => void) => {
    socket.on('user-level-up', handler);
    return () => socket.off('user-level-up');
  }, [socket]);

  return {
    onLeaderboardUpdated,
    onRankChanged,
    onUserAchievementUnlocked,
    onUserLevelUp,
    isConnected: socket.isConnected,
  };
};

export const useFocusEvents = () => {
  const socket = useSocket();

  const onFocusSessionStarted = useCallback((handler: (data: any) => void) => {
    socket.on('focus-session-started', handler);
    return () => socket.off('focus-session-started');
  }, [socket]);

  const onFocusSessionCompleted = useCallback((handler: (data: any) => void) => {
    socket.on('focus-session-completed', handler);
    return () => socket.off('focus-session-completed');
  }, [socket]);

  return {
    onFocusSessionStarted,
    onFocusSessionCompleted,
    isConnected: socket.isConnected,
  };
};

export const useAchievementEvents = () => {
  const socket = useSocket();

  const onAchievementUnlocked = useCallback((handler: (data: any) => void) => {
    socket.on('achievement-unlocked', handler);
    return () => socket.off('achievement-unlocked');
  }, [socket]);

  return {
    onAchievementUnlocked,
    isConnected: socket.isConnected,
  };
};

export const useNotificationEvents = () => {
  const socket = useSocket();

  const onNewNotification = useCallback((handler: (data: any) => void) => {
    socket.on('new-notification', handler);
    return () => socket.off('new-notification');
  }, [socket]);

  return {
    onNewNotification,
    isConnected: socket.isConnected,
  };
};

export const useFriendEvents = () => {
  const socket = useSocket();

  const onFriendRequestReceived = useCallback((handler: (data: any) => void) => {
    socket.on('friend-request-received', handler);
    return () => socket.off('friend-request-received');
  }, [socket]);

  const onFriendRequestAccepted = useCallback((handler: (data: any) => void) => {
    socket.on('friend-request-accepted', handler);
    return () => socket.off('friend-request-accepted');
  }, [socket]);

  const onFriendStatusChanged = useCallback((handler: (data: any) => void) => {
    socket.on('friend-status-changed', handler);
    return () => socket.off('friend-status-changed');
  }, [socket]);

  return {
    onFriendRequestReceived,
    onFriendRequestAccepted,
    onFriendStatusChanged,
    isConnected: socket.isConnected,
  };
};
