import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { SocketService } from '../services/socketService';
import { chatKeys } from './useChat';
import type { Message, ChatResponse } from '../types/chat';
import { toast } from 'sonner';

interface UseChatSocketProps {
  currentChatId?: string;
  onNewMessage?: (message: Message) => void;
  onMessageEdited?: (messageId: string, newContent: string) => void;
  onMessageDeleted?: (messageId: string) => void;
  onTypingStart?: (userId: string, userName: string) => void;
  onTypingStop?: (userId: string) => void;
  onUserStatusChanged?: (userId: string, isOnline: boolean) => void;
}

export const useChatSocket = ({
  currentChatId,
  onNewMessage,
  onMessageEdited,
  onMessageDeleted,
  onTypingStart,
  onTypingStop,
  onUserStatusChanged
}: UseChatSocketProps = {}) => {
  const queryClient = useQueryClient();
  const socketService = SocketService.getInstance();
  const typingTimeoutRef = useRef<number | null>(null);

  // Handle new message
  const handleNewMessage = useCallback((data: { chatId: string; message: Message; timestamp: Date }) => {
    const { chatId, message } = data;
    
    // Add message to cache
    queryClient.setQueryData(
      chatKeys.messagesList(chatId, 1, 50),
      (oldMessages: Message[] | undefined) => {
        if (!oldMessages) return [message];
        
        // Check if message already exists
        const existingIndex = oldMessages.findIndex(m => m._id === message._id);
        if (existingIndex >= 0) return oldMessages;
        
        return [...oldMessages, message];
      }
    );

    // Update chat list with new last message
    queryClient.setQueriesData(
      { queryKey: chatKeys.lists() },
      (oldData: ChatResponse | undefined) => {
        if (!oldData) return oldData;
        
        const updatedChats = oldData.chats.map(chat => {
          if (chat._id === chatId) {
            return {
              ...chat,
              lastMessage: {
                content: message.content,
                sender: message.sender._id,
                timestamp: message.createdAt,
                type: message.type
              },
              updatedAt: message.createdAt
            };
          }
          return chat;
        });
        
        return { ...oldData, chats: updatedChats };
      }
    );

    // Show notification if not in current chat
    if (currentChatId !== chatId) {
      toast.info(`New message from ${message.sender.name}`, {
        description: message.content.length > 50 
          ? `${message.content.substring(0, 50)}...` 
          : message.content
      });
    }

    onNewMessage?.(message);
  }, [queryClient, currentChatId, onNewMessage]);

  // Handle message edited
  const handleMessageEdited = useCallback((data: { chatId: string; messageId: string; newContent: string; editorId: string; timestamp: Date }) => {
    const { chatId, messageId, newContent } = data;
    
    // Update message in cache
    queryClient.setQueriesData(
      { queryKey: chatKeys.messages(chatId) },
      (oldMessages: Message[] | undefined) => {
        if (!oldMessages) return oldMessages;
        
        return oldMessages.map(message => 
          message._id === messageId 
            ? { ...message, content: newContent, isEdited: true, editedAt: new Date().toISOString() }
            : message
        );
      }
    );

    onMessageEdited?.(messageId, newContent);
  }, [queryClient, onMessageEdited]);

  // Handle message deleted
  const handleMessageDeleted = useCallback((data: { chatId: string; messageId: string; deleterId: string; timestamp: Date }) => {
    const { chatId, messageId } = data;
    
    // Remove message from cache or mark as deleted
    queryClient.setQueriesData(
      { queryKey: chatKeys.messages(chatId) },
      (oldMessages: Message[] | undefined) => {
        if (!oldMessages) return oldMessages;
        
        return oldMessages.map(message => 
          message._id === messageId 
            ? { ...message, isDeleted: true, deletedAt: new Date().toISOString() }
            : message
        );
      }
    );

    onMessageDeleted?.(messageId);
  }, [queryClient, onMessageDeleted]);

  // Handle message reaction
  const handleMessageReaction = useCallback((data: { chatId: string; messageId: string; reaction: any; userId: string; timestamp: Date }) => {
    const { chatId, messageId, reaction } = data;
    
    // Update message reactions in cache
    queryClient.setQueriesData(
      { queryKey: chatKeys.messages(chatId) },
      (oldMessages: Message[] | undefined) => {
        if (!oldMessages) return oldMessages;
        
        return oldMessages.map(message => {
          if (message._id === messageId) {
            const updatedReactions = [...message.reactions];
            const existingReactionIndex = updatedReactions.findIndex(r => r.emoji === reaction?.emoji);
            
            if (existingReactionIndex >= 0) {
              updatedReactions[existingReactionIndex] = reaction;
            } else if (reaction) {
              updatedReactions.push(reaction);
            }
            
            return { ...message, reactions: updatedReactions };
          }
          return message;
        });
      }
    );
  }, [queryClient]);

  // Handle typing indicators
  const handleTypingStart = useCallback((data: { chatId: string; userId: string; userName: string; timestamp: Date }) => {
    if (data.chatId === currentChatId) {
      onTypingStart?.(data.userId, data.userName);
    }
  }, [currentChatId, onTypingStart]);

  const handleTypingStop = useCallback((data: { chatId: string; userId: string; timestamp: Date }) => {
    if (data.chatId === currentChatId) {
      onTypingStop?.(data.userId);
    }
  }, [currentChatId, onTypingStop]);

  // Handle user status changes
  const handleUserStatusChanged = useCallback((data: { userId: string; isOnline: boolean; timestamp: Date }) => {
    // Update user status in chat participants
    queryClient.setQueriesData(
      { queryKey: chatKeys.lists() },
      (oldData: ChatResponse | undefined) => {
        if (!oldData) return oldData;
        
        const updatedChats = oldData.chats.map(chat => ({
          ...chat,
          participants: chat.participants.map(participant => 
            participant._id === data.userId 
              ? { ...participant, isOnline: data.isOnline }
              : participant
          )
        }));
        
        return { ...oldData, chats: updatedChats };
      }
    );

    onUserStatusChanged?.(data.userId, data.isOnline);
  }, [queryClient, onUserStatusChanged]);

  // Handle chat unread count updates
  const handleChatUnreadUpdated = useCallback((data: { chatId: string; unreadCount: number }) => {
    queryClient.setQueriesData(
      { queryKey: chatKeys.lists() },
      (oldData: ChatResponse | undefined) => {
        if (!oldData) return oldData;
        
        const updatedChats = oldData.chats.map(chat => 
          chat._id === data.chatId 
            ? { ...chat, unreadCount: data.unreadCount }
            : chat
        );
        
        return { ...oldData, chats: updatedChats };
      }
    );
  }, [queryClient]);

  // Set up Socket.io event listeners
  useEffect(() => {
    socketService.on('new-message', handleNewMessage);
    socketService.on('message-edited', handleMessageEdited);
    socketService.on('message-deleted', handleMessageDeleted);
    socketService.on('message-reaction', handleMessageReaction);
    socketService.on('typing-start', handleTypingStart);
    socketService.on('typing-stop', handleTypingStop);
    socketService.on('user-status-changed', handleUserStatusChanged);
    socketService.on('chat-unread-updated', handleChatUnreadUpdated);

    return () => {
      socketService.off('new-message', handleNewMessage);
      socketService.off('message-edited', handleMessageEdited);
      socketService.off('message-deleted', handleMessageDeleted);
      socketService.off('message-reaction', handleMessageReaction);
      socketService.off('typing-start', handleTypingStart);
      socketService.off('typing-stop', handleTypingStop);
      socketService.off('user-status-changed', handleUserStatusChanged);
      socketService.off('chat-unread-updated', handleChatUnreadUpdated);
    };
  }, [
    handleNewMessage,
    handleMessageEdited,
    handleMessageDeleted,
    handleMessageReaction,
    handleTypingStart,
    handleTypingStop,
    handleUserStatusChanged,
    handleChatUnreadUpdated
  ]);

  // Join/leave chat room when currentChatId changes
  useEffect(() => {
    if (currentChatId) {
      socketService.joinChatRoom(currentChatId);
      
      return () => {
        socketService.leaveChatRoom(currentChatId);
      };
    }
  }, [currentChatId]);

  // Typing indicator methods
  const startTyping = useCallback((chatId: string) => {
    socketService.emitTypingStart(chatId);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Auto-stop typing after 3 seconds
    typingTimeoutRef.current = window.setTimeout(() => {
      socketService.emitTypingStop(chatId);
    }, 3000);
  }, []);

  const stopTyping = useCallback((chatId: string) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    socketService.emitTypingStop(chatId);
  }, []);

  return {
    startTyping,
    stopTyping,
    isConnected: socketService.isConnectedToServer()
  };
};
