import { apiService } from './api';
import type {
  Chat,
  Message,
  ChatResponse,
  CreateDirectChatRequest,
  CreateGroupChatRequest,
  SendMessageRequest,
  EditMessageRequest,
  AddReactionRequest,
  ChatFilters,
  ChatListItem
} from '../types/chat';

class ChatService {
  // Get user's chats
  async getChats(
    filters: ChatFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<ChatResponse> {
    const params = new URLSearchParams();
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = queryString ? `/chats?${queryString}` : '/chats';
    
    const response = await apiService.get<ChatResponse>(url);
    return response.data.data!;
  }

  // Create or get direct chat with a friend
  async createOrGetDirectChat(friendId: string): Promise<Chat> {
    const requestData: CreateDirectChatRequest = { friendId };
    const response = await apiService.post<Chat>('/chats/direct', requestData);
    return response.data.data!;
  }

  // Create group chat
  async createGroupChat(chatData: CreateGroupChatRequest): Promise<Chat> {
    const response = await apiService.post<Chat>('/chats/group', chatData);
    return response.data.data!;
  }

  // Get messages for a chat
  async getChatMessages(
    chatId: string,
    page: number = 1,
    limit: number = 50,
    beforeMessageId?: string
  ): Promise<Message[]> {
    const params = new URLSearchParams();
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (beforeMessageId) {
      params.append('before', beforeMessageId);
    }

    const response = await apiService.get<Message[]>(
      `/chats/${chatId}/messages?${params.toString()}`
    );
    return response.data.data!;
  }

  // Send message
  async sendMessage(messageData: SendMessageRequest): Promise<Message> {
    const response = await apiService.post<Message>('/chats/messages', messageData);
    return response.data.data!;
  }

  // Mark chat as read
  async markChatAsRead(chatId: string): Promise<void> {
    await apiService.put(`/chats/${chatId}/read`);
  }

  // Edit message
  async editMessage(messageId: string, content: string): Promise<Message> {
    const requestData: EditMessageRequest = { content };
    const response = await apiService.put<Message>(`/chats/messages/${messageId}`, requestData);
    return response.data.data!;
  }

  // Delete message
  async deleteMessage(messageId: string): Promise<void> {
    await apiService.delete(`/chats/messages/${messageId}`);
  }

  // Add reaction to message
  async addReaction(messageId: string, emoji: string): Promise<Message> {
    const requestData: AddReactionRequest = { emoji };
    const response = await apiService.post<Message>(
      `/chats/messages/${messageId}/reactions`,
      requestData
    );
    return response.data.data!;
  }

  // Search messages in chat
  async searchMessages(chatId: string, searchTerm: string): Promise<Message[]> {
    const params = new URLSearchParams();
    params.append('q', searchTerm);
    
    const response = await apiService.get<Message[]>(
      `/chats/${chatId}/search?${params.toString()}`
    );
    return response.data.data!;
  }

  // Helper methods for UI
  formatChatForList(chat: Chat, currentUserId: string): ChatListItem {
    let displayName = chat.name || '';
    let displayAvatar = chat.avatar;
    let isOnline = false;

    if (chat.type === 'direct') {
      // For direct chats, show the other participant's info
      const otherParticipant = chat.participants.find(p => p._id !== currentUserId);
      if (otherParticipant) {
        displayName = otherParticipant.name;
        displayAvatar = otherParticipant.avatarUrl;
        isOnline = otherParticipant.isOnline;
      }
    }

    const lastMessagePreview = this.getLastMessagePreview(chat.lastMessage);

    return {
      ...chat,
      displayName,
      displayAvatar,
      lastMessagePreview,
      isOnline
    };
  }

  getLastMessagePreview(lastMessage?: Chat['lastMessage']): string {
    if (!lastMessage) return 'No messages yet';
    if (!lastMessage.content) return 'No messages yet';

    switch (lastMessage.type) {
      case 'image':
        return '📷 Image';
      case 'file':
        return '📎 File';
      case 'system':
        return lastMessage.content;
      default:
        return lastMessage.content.length > 50 
          ? `${lastMessage.content.substring(0, 50)}...`
          : lastMessage.content;
    }
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (hours < 24 * 7) {
      return date.toLocaleDateString('en-US', {
        weekday: 'short'
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  }

  formatMessageTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isToday(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  isYesterday(dateString: string): boolean {
    const date = new Date(dateString);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
  }

  formatMessageDate(dateString: string): string {
    if (this.isToday(dateString)) {
      return 'Today';
    } else if (this.isYesterday(dateString)) {
      return 'Yesterday';
    } else {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  }

  groupMessagesByDate(messages: Message[]): { [date: string]: Message[] } {
    const grouped: { [date: string]: Message[] } = {};

    messages.forEach(message => {
      const dateKey = this.formatMessageDate(message.createdAt);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(message);
    });

    return grouped;
  }

  shouldGroupMessages(currentMessage: Message, previousMessage?: Message): boolean {
    if (!previousMessage) return false;
    
    // Group if same sender and within 5 minutes
    const timeDiff = new Date(currentMessage.createdAt).getTime() - 
                    new Date(previousMessage.createdAt).getTime();
    const fiveMinutes = 5 * 60 * 1000;
    
    return currentMessage.sender._id === previousMessage.sender._id && 
           timeDiff < fiveMinutes;
  }

  getMessageStatusIcon(message: Message, currentUserId: string): string {
    if (message.sender._id !== currentUserId) return '';
    
    const readByOthers = message.readBy.filter(r => r.user._id !== currentUserId);
    
    if (readByOthers.length === 0) {
      return '✓'; // Sent
    } else if (readByOthers.length === 1) {
      return '✓✓'; // Delivered/Read
    } else {
      return '✓✓'; // Read by multiple
    }
  }

  canEditMessage(message: Message, currentUserId: string): boolean {
    // Can edit own text messages within 15 minutes
    if (message.sender._id !== currentUserId) return false;
    if (message.type !== 'text') return false;
    if (message.isDeleted) return false;
    
    const fifteenMinutes = 15 * 60 * 1000;
    const timeDiff = Date.now() - new Date(message.createdAt).getTime();
    
    return timeDiff < fifteenMinutes;
  }

  canDeleteMessage(message: Message, currentUserId: string): boolean {
    // Can delete own messages
    return message.sender._id === currentUserId && !message.isDeleted;
  }

  getEmojiForReaction(emoji: string): string {
    // Ensure emoji is properly formatted
    return emoji;
  }

  validateMessageContent(content: string): { isValid: boolean; error?: string } {
    if (!content || content.trim().length === 0) {
      return { isValid: false, error: 'Message cannot be empty' };
    }
    
    if (content.length > 2000) {
      return { isValid: false, error: 'Message is too long (max 2000 characters)' };
    }
    
    return { isValid: true };
  }

  validateGroupChatData(data: CreateGroupChatRequest): { isValid: boolean; error?: string } {
    if (!data.name || data.name.trim().length === 0) {
      return { isValid: false, error: 'Group name is required' };
    }
    
    if (data.name.length > 100) {
      return { isValid: false, error: 'Group name is too long (max 100 characters)' };
    }
    
    if (!data.participants || data.participants.length < 2) {
      return { isValid: false, error: 'At least 2 participants are required' };
    }
    
    if (data.participants.length > 50) {
      return { isValid: false, error: 'Too many participants (max 50)' };
    }
    
    if (data.description && data.description.length > 500) {
      return { isValid: false, error: 'Description is too long (max 500 characters)' };
    }
    
    return { isValid: true };
  }
}

export const chatService = new ChatService();
export default chatService;
