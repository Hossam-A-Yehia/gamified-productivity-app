import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../services/chatService';
import type {
  Chat,
  Message,
  ChatResponse,
  CreateGroupChatRequest,
  SendMessageRequest,
  ChatFilters
} from '../types/chat';
import { toast } from 'sonner';

// Query keys
export const chatKeys = {
  all: ['chats'] as const,
  lists: () => [...chatKeys.all, 'list'] as const,
  list: (filters: ChatFilters, page: number, limit: number) => 
    [...chatKeys.lists(), { filters, page, limit }] as const,
  detail: (id: string) => [...chatKeys.all, 'detail', id] as const,
  messages: (chatId: string) => [...chatKeys.all, 'messages', chatId] as const,
  messagesList: (chatId: string, page: number, limit: number, beforeMessageId?: string) => 
    [...chatKeys.messages(chatId), { page, limit, beforeMessageId }] as const,
  search: (chatId: string, query: string) => 
    [...chatKeys.messages(chatId), 'search', query] as const,
};

// Get user's chats
export const useChats = (
  filters: ChatFilters = {},
  page: number = 1,
  limit: number = 20
) => {
  return useQuery({
    queryKey: chatKeys.list(filters, page, limit),
    queryFn: () => chatService.getChats(filters, page, limit),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get messages for a specific chat
export const useChatMessages = (
  chatId: string,
  page: number = 1,
  limit: number = 50,
  beforeMessageId?: string
) => {
  return useQuery({
    queryKey: chatKeys.messagesList(chatId, page, limit, beforeMessageId),
    queryFn: () => chatService.getChatMessages(chatId, page, limit, beforeMessageId),
    enabled: !!chatId,
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Search messages in a chat
export const useSearchMessages = (chatId: string, searchTerm: string) => {
  return useQuery({
    queryKey: chatKeys.search(chatId, searchTerm),
    queryFn: () => chatService.searchMessages(chatId, searchTerm),
    enabled: !!chatId && !!searchTerm && searchTerm.trim().length > 0,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Chat operations hook
export const useChatOperations = () => {
  const queryClient = useQueryClient();

  const createDirectChat = useMutation({
    mutationFn: (friendId: string) => chatService.createOrGetDirectChat(friendId),
    onSuccess: (chat) => {
      // Add the new chat to the cache
      queryClient.setQueryData(
        chatKeys.lists(),
        (oldData: ChatResponse | undefined) => {
          if (!oldData) return { chats: [chat], pagination: { page: 1, limit: 20, total: 1, pages: 1, hasNext: false, hasPrev: false } };
          
          // Check if chat already exists
          const existingChatIndex = oldData.chats.findIndex(c => c._id === chat._id);
          if (existingChatIndex >= 0) {
            // Update existing chat
            const updatedChats = [...oldData.chats];
            updatedChats[existingChatIndex] = chat;
            return { ...oldData, chats: updatedChats };
          } else {
            // Add new chat to the beginning
            return {
              ...oldData,
              chats: [chat, ...oldData.chats],
              pagination: {
                ...oldData.pagination,
                total: oldData.pagination.total + 1
              }
            };
          }
        }
      );
      
      toast.success('Chat created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create chat');
    },
  });

  const createGroupChat = useMutation({
    mutationFn: (chatData: CreateGroupChatRequest) => chatService.createGroupChat(chatData),
    onSuccess: (chat) => {
      // Add the new group chat to the cache
      queryClient.setQueryData(
        chatKeys.lists(),
        (oldData: ChatResponse | undefined) => {
          if (!oldData) return { chats: [chat], pagination: { page: 1, limit: 20, total: 1, pages: 1, hasNext: false, hasPrev: false } };
          
          return {
            ...oldData,
            chats: [chat, ...oldData.chats],
            pagination: {
              ...oldData.pagination,
              total: oldData.pagination.total + 1
            }
          };
        }
      );
      
      toast.success('Group chat created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create group chat');
    },
  });

  const sendMessage = useMutation({
    mutationFn: (messageData: SendMessageRequest) => chatService.sendMessage(messageData),
    onSuccess: (message, variables) => {
      // Add the message to the chat messages cache
      queryClient.setQueryData(
        chatKeys.messagesList(variables.chatId, 1, 50),
        (oldMessages: Message[] | undefined) => {
          if (!oldMessages) return [message];
          
          // Check if message already exists (to prevent duplicates from real-time updates)
          const existingMessageIndex = oldMessages.findIndex(m => m._id === message._id);
          if (existingMessageIndex >= 0) {
            return oldMessages;
          }
          
          return [...oldMessages, message];
        }
      );
      
      // Also invalidate all message queries for this chat to ensure consistency
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages(variables.chatId)
      });
      
      // Update the chat's last message in the chats list
      queryClient.setQueryData(
        chatKeys.list({}, 1, 20),
        (oldData: ChatResponse | undefined) => {
          if (!oldData) return oldData;
          
          const updatedChats = oldData.chats.map(chat => {
            if (chat._id === variables.chatId) {
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
          
          // Sort chats by last message timestamp
          updatedChats.sort((a, b) => {
            const aTime = a.lastMessage?.timestamp || a.updatedAt;
            const bTime = b.lastMessage?.timestamp || b.updatedAt;
            return new Date(bTime).getTime() - new Date(aTime).getTime();
          });
          
          return { ...oldData, chats: updatedChats };
        }
      );
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send message');
    },
  });

  const editMessage = useMutation({
    mutationFn: ({ messageId, content }: { messageId: string; content: string }) => 
      chatService.editMessage(messageId, content),
    onSuccess: (updatedMessage) => {
      // Update the message in all relevant caches
      queryClient.setQueriesData(
        { queryKey: chatKeys.messages(updatedMessage.chatId) },
        (oldMessages: Message[] | undefined) => {
          if (!oldMessages) return oldMessages;
          
          return oldMessages.map(message => 
            message._id === updatedMessage._id ? updatedMessage : message
          );
        }
      );
      
      toast.success('Message edited successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to edit message');
    },
  });

  const deleteMessage = useMutation({
    mutationFn: (messageId: string) => chatService.deleteMessage(messageId),
    onSuccess: () => {
      // Invalidate all message queries to refresh the data
      queryClient.invalidateQueries({
        queryKey: chatKeys.all
      });
      
      toast.success('Message deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete message');
    },
  });

  const addReaction = useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) => 
      chatService.addReaction(messageId, emoji),
    onSuccess: (updatedMessage) => {
      // Update the message in all relevant caches
      queryClient.setQueriesData(
        { queryKey: chatKeys.messages(updatedMessage.chatId) },
        (oldMessages: Message[] | undefined) => {
          if (!oldMessages) return oldMessages;
          
          return oldMessages.map(message => 
            message._id === updatedMessage._id ? updatedMessage : message
          );
        }
      );
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add reaction');
    },
  });

  const markChatAsRead = useMutation({
    mutationFn: (chatId: string) => chatService.markChatAsRead(chatId),
    onSuccess: (_, chatId) => {
      // Update all chat list queries to set unread count to 0
      queryClient.setQueriesData(
        { queryKey: chatKeys.lists() },
        (oldData: ChatResponse | undefined) => {
          if (!oldData) return oldData;
          
          const updatedChats = oldData.chats.map(chat => {
            if (chat._id === chatId) {
              return { ...chat, unreadCount: 0 };
            }
            return chat;
          });
          
          return { ...oldData, chats: updatedChats };
        }
      );
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to mark chat as read');
    },
  });

  return {
    createDirectChat,
    createGroupChat,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    markChatAsRead,
  };
};

// Helper hook for real-time chat updates
export const useChatManager = () => {
  const queryClient = useQueryClient();

  // Add new message to cache (for real-time updates)
  const addMessage = (message: Message) => {
    queryClient.setQueryData(
      chatKeys.messages(message.chatId),
      (oldMessages: Message[] | undefined) => {
        if (!oldMessages) return [message];
        
        // Check if message already exists
        const existingMessageIndex = oldMessages.findIndex(m => m._id === message._id);
        if (existingMessageIndex >= 0) {
          return oldMessages;
        }
        
        return [...oldMessages, message];
      }
    );
    
    // Update chat's last message
    queryClient.setQueryData(
      chatKeys.lists(),
      (oldData: ChatResponse | undefined) => {
        if (!oldData) return oldData;
        
        const updatedChats = oldData.chats.map(chat => {
          if (chat._id === message.chatId) {
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
        
        // Sort chats by last message timestamp
        updatedChats.sort((a, b) => {
          const aTime = a.lastMessage?.timestamp || a.updatedAt;
          const bTime = b.lastMessage?.timestamp || b.updatedAt;
          return new Date(bTime).getTime() - new Date(aTime).getTime();
        });
        
        return { ...oldData, chats: updatedChats };
      }
    );
  };

  // Update message in cache (for real-time edits)
  const updateMessage = (message: Message) => {
    queryClient.setQueryData(
      chatKeys.messages(message.chatId),
      (oldMessages: Message[] | undefined) => {
        if (!oldMessages) return oldMessages;
        
        return oldMessages.map(m => 
          m._id === message._id ? message : m
        );
      }
    );
  };

  // Remove message from cache (for real-time deletes)
  const removeMessage = (messageId: string, chatId: string) => {
    queryClient.setQueryData(
      chatKeys.messages(chatId),
      (oldMessages: Message[] | undefined) => {
        if (!oldMessages) return oldMessages;
        
        return oldMessages.filter(m => m._id !== messageId);
      }
    );
  };

  // Update chat unread count
  const updateChatUnreadCount = (chatId: string, unreadCount: number) => {
    queryClient.setQueryData(
      chatKeys.lists(),
      (oldData: ChatResponse | undefined) => {
        if (!oldData) return oldData;
        
        const updatedChats = oldData.chats.map(chat => {
          if (chat._id === chatId) {
            return { ...chat, unreadCount };
          }
          return chat;
        });
        
        return { ...oldData, chats: updatedChats };
      }
    );
  };

  // Add new chat to cache
  const addChat = (chat: Chat) => {
    queryClient.setQueryData(
      chatKeys.lists(),
      (oldData: ChatResponse | undefined) => {
        if (!oldData) return { chats: [chat], pagination: { page: 1, limit: 20, total: 1, pages: 1, hasNext: false, hasPrev: false } };
        
        // Check if chat already exists
        const existingChatIndex = oldData.chats.findIndex(c => c._id === chat._id);
        if (existingChatIndex >= 0) {
          return oldData;
        }
        
        return {
          ...oldData,
          chats: [chat, ...oldData.chats],
          pagination: {
            ...oldData.pagination,
            total: oldData.pagination.total + 1
          }
        };
      }
    );
  };

  return {
    addMessage,
    updateMessage,
    removeMessage,
    updateChatUnreadCount,
    addChat,
  };
};
