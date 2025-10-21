import Chat, { IChat } from '../models/Chat';
import Message, { IMessage } from '../models/Message';
import User from '../models/User';
import mongoose from 'mongoose';
import { SocketService } from './socketService';

export interface CreateChatRequest {
  participants: string[];
  type: 'direct' | 'group';
  name?: string;
  description?: string;
}

export interface SendMessageRequest {
  chatId: string;
  content: string;
  type?: 'text' | 'image' | 'file' | 'system';
  replyTo?: string;
  metadata?: any;
}

export interface ChatResponse {
  _id: string;
  participants: any[];
  type: string;
  name?: string;
  description?: string;
  avatar?: string;
  lastMessage?: any;
  unreadCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MessageResponse {
  _id: string;
  chatId: string;
  sender: any;
  content: string;
  type: string;
  metadata?: any;
  replyTo?: any;
  reactions?: any[];
  isEdited: boolean;
  editedAt?: string;
  readBy: any[];
  createdAt: string;
  timeAgo: string;
}

export class ChatService {
  // Create or get direct chat between two users
  static async createOrGetDirectChat(user1Id: string, user2Id: string): Promise<ChatResponse> {
    // Check if users are friends
    const user1 = await User.findById(user1Id);
    const user2 = await User.findById(user2Id);
    
    if (!user1 || !user2) {
      throw new Error('User not found');
    }
    
    const areFriends = user1.friends.some(friendId => 
      friendId.toString() === user2Id
    );
    
    if (!areFriends) {
      throw new Error('You can only chat with friends');
    }
    
    const chat = await (Chat as any).findOrCreateDirectChat(user1Id, user2Id);
    await chat.populate('participants', 'name avatarUrl lastActiveDate');
    
    return this.formatChatResponse(chat, user1Id);
  }

  // Create group chat
  static async createGroupChat(creatorId: string, request: CreateChatRequest): Promise<ChatResponse> {
    const { participants, name, description } = request;
    
    if (!name || name.trim().length === 0) {
      throw new Error('Group name is required');
    }
    
    if (participants.length < 2) {
      throw new Error('Group chat must have at least 2 participants besides creator');
    }
    
    // Verify all participants exist and are friends with creator
    const creator = await User.findById(creatorId);
    if (!creator) {
      throw new Error('Creator not found');
    }
    
    const participantUsers = await User.find({
      _id: { $in: participants.map(id => new mongoose.Types.ObjectId(id)) }
    });
    
    if (participantUsers.length !== participants.length) {
      throw new Error('Some participants not found');
    }
    
    // Check if all participants are friends with creator
    for (const participant of participants) {
      const isFriend = creator.friends.some(friendId => 
        friendId.toString() === participant
      );
      if (!isFriend) {
        throw new Error('You can only add friends to group chats');
      }
    }
    
    // Add creator to participants
    const allParticipants = [creatorId, ...participants];
    const unreadCounts = new Map();
    allParticipants.forEach(id => unreadCounts.set(id, 0));
    
    const chat = new Chat({
      participants: allParticipants.map(id => new mongoose.Types.ObjectId(id)),
      type: 'group',
      name: name.trim(),
      description: description?.trim(),
      createdBy: new mongoose.Types.ObjectId(creatorId),
      unreadCounts
    });
    
    await chat.save();
    await chat.populate('participants', 'name avatarUrl lastActiveDate');
    
    // Notify all participants about new group chat
    const socketService = SocketService.getInstance();
    allParticipants.forEach(participantId => {
      if (participantId !== creatorId) {
        socketService.emitToUser(participantId, 'chat-created', {
          chat: this.formatChatResponse(chat, participantId)
        });
      }
    });
    
    return this.formatChatResponse(chat, creatorId);
  }

  // Get user's chats
  static async getUserChats(userId: string, page: number = 1, limit: number = 20): Promise<{
    chats: ChatResponse[];
    pagination: any;
  }> {
    const result = await (Chat as any).getUserChats(userId, page, limit);
    
    const formattedChats = result.chats.map((chat: any) => 
      this.formatChatResponse(chat, userId)
    );
    
    return {
      chats: formattedChats,
      pagination: result.pagination
    };
  }

  // Send message
  static async sendMessage(senderId: string, request: SendMessageRequest): Promise<MessageResponse> {
    const { chatId, content, type = 'text', replyTo, metadata } = request;
    
    // Verify chat exists and user is participant
    const chat = await Chat.findById(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }
    
    const isParticipant = chat.participants.some(id => 
      id.toString() === senderId
    );
    
    if (!isParticipant) {
      throw new Error('You are not a participant in this chat');
    }
    
    // Verify reply-to message if provided
    if (replyTo) {
      const replyMessage = await Message.findOne({
        _id: new mongoose.Types.ObjectId(replyTo),
        chatId: new mongoose.Types.ObjectId(chatId),
        isDeleted: false
      });
      
      if (!replyMessage) {
        throw new Error('Reply-to message not found');
      }
    }
    
    // Create message
    const message = new Message({
      chatId: new mongoose.Types.ObjectId(chatId),
      sender: new mongoose.Types.ObjectId(senderId),
      content: content.trim(),
      type,
      replyTo: replyTo ? new mongoose.Types.ObjectId(replyTo) : undefined,
      metadata,
      readBy: [{
        user: new mongoose.Types.ObjectId(senderId),
        readAt: new Date()
      }]
    });
    
    await message.save();
    
    // Update chat's last message and unread counts
    await (chat as any).updateLastMessage(message);
    
    // Populate message for response
    await message.populate([
      { path: 'sender', select: 'name avatarUrl' },
      { path: 'replyTo', select: 'content sender type', populate: { path: 'sender', select: 'name' } },
      { path: 'readBy.user', select: 'name' }
    ]);
    
    const formattedMessage = this.formatMessageResponse(message);
    
    // Emit real-time message to all participants
    const socketService = SocketService.getInstance();
    socketService.emitNewMessage(chatId, formattedMessage, senderId);
    
    // Emit unread count updates to participants (except sender)
    chat.participants.forEach(participantId => {
      const participantIdStr = participantId.toString();
      if (participantIdStr !== senderId) {
        const unreadCount = chat.unreadCounts.get(participantIdStr) || 0;
        socketService.emitToUser(participantIdStr, 'chat-unread-updated', {
          chatId,
          unreadCount
        });
      }
    });
    
    return formattedMessage;
  }

  // Get chat messages
  static async getChatMessages(
    userId: string, 
    chatId: string, 
    page: number = 1, 
    limit: number = 50,
    beforeMessageId?: string
  ): Promise<MessageResponse[]> {
    // Verify user is participant
    const chat = await Chat.findById(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }
    
    const isParticipant = chat.participants.some(id => 
      id.toString() === userId
    );
    
    if (!isParticipant) {
      throw new Error('You are not a participant in this chat');
    }
    
    const messages = await (Message as any).getChatMessages(chatId, page, limit, beforeMessageId);
    
    return messages.map((message: any) => this.formatMessageResponse(message));
  }

  // Mark chat as read
  static async markChatAsRead(userId: string, chatId: string): Promise<void> {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }
    
    const isParticipant = chat.participants.some(id => 
      id.toString() === userId
    );
    
    if (!isParticipant) {
      throw new Error('You are not a participant in this chat');
    }
    
    // Use bulk update for better performance and avoid loops
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // Update chat unread count
    await (chat as any).markAsRead(userId);
    
    // Bulk update all unread messages to mark as read
    await Message.updateMany(
      {
        chatId: new mongoose.Types.ObjectId(chatId),
        'readBy.user': { $ne: userObjectId },
        sender: { $ne: userObjectId },
        isDeleted: false
      },
      {
        $addToSet: {
          readBy: {
            user: userObjectId,
            readAt: new Date()
          }
        }
      }
    );
    
    // Emit real-time update
    try {
      const socketService = SocketService.getInstance();
      socketService.emitToUser(userId, 'chat-marked-read', { chatId });
    } catch (socketError) {
      // Don't fail the request if socket emission fails
      console.error('Socket emission failed:', socketError);
    }
  }

  // Edit message
  static async editMessage(userId: string, messageId: string, newContent: string): Promise<MessageResponse> {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }
    
    if (message.sender.toString() !== userId) {
      throw new Error('You can only edit your own messages');
    }
    
    if (message.isDeleted) {
      throw new Error('Cannot edit deleted message');
    }
    
    await (message as any).editContent(newContent.trim());
    await message.populate([
      { path: 'sender', select: 'name avatarUrl' },
      { path: 'replyTo', select: 'content sender type', populate: { path: 'sender', select: 'name' } },
      { path: 'readBy.user', select: 'name' }
    ]);
    
    const formattedMessage = this.formatMessageResponse(message);
    
    // Emit real-time update
    const socketService = SocketService.getInstance();
    socketService.emitMessageEdited(message.chatId.toString(), messageId, newContent.trim(), userId);
    
    return formattedMessage;
  }

  // Delete message
  static async deleteMessage(userId: string, messageId: string): Promise<void> {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }
    
    if (message.sender.toString() !== userId) {
      throw new Error('You can only delete your own messages');
    }
    
    if (message.isDeleted) {
      throw new Error('Message already deleted');
    }
    
    await (message as any).softDelete(userId);
    
    // Emit real-time update
    const socketService = SocketService.getInstance();
    socketService.emitMessageDeleted(message.chatId.toString(), messageId, userId);
  }

  // Add reaction to message
  static async addReaction(userId: string, messageId: string, emoji: string): Promise<MessageResponse> {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }
    
    // Verify user is participant in the chat
    const chat = await Chat.findById(message.chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }
    
    const isParticipant = chat.participants.some(id => 
      id.toString() === userId
    );
    
    if (!isParticipant) {
      throw new Error('You are not a participant in this chat');
    }
    
    await (message as any).addReaction(emoji, userId);
    await message.populate([
      { path: 'sender', select: 'name avatarUrl' },
      { path: 'replyTo', select: 'content sender type', populate: { path: 'sender', select: 'name' } },
      { path: 'readBy.user', select: 'name' },
      { path: 'reactions.users', select: 'name' }
    ]);
    
    const formattedMessage = this.formatMessageResponse(message);
    
    // Emit real-time update
    const socketService = SocketService.getInstance();
    const reactionData = message.reactions?.find(r => r.emoji === emoji);
    socketService.emitMessageReaction(message.chatId.toString(), messageId, reactionData, userId);
    
    return formattedMessage;
  }

  // Search messages in chat
  static async searchMessages(userId: string, chatId: string, searchTerm: string): Promise<MessageResponse[]> {
    // Verify user is participant
    const chat = await Chat.findById(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }
    
    const isParticipant = chat.participants.some(id => 
      id.toString() === userId
    );
    
    if (!isParticipant) {
      throw new Error('You are not a participant in this chat');
    }
    
    const messages = await (Message as any).searchMessages(chatId, searchTerm);
    
    return messages.map((message: any) => this.formatMessageResponse(message));
  }

  // Helper method to format chat response
  private static formatChatResponse(chat: any, currentUserId: string): ChatResponse {
    // Ensure unreadCounts is properly initialized
    if (typeof chat.ensureUnreadCounts === 'function') {
      chat.ensureUnreadCounts();
    }
    
    // Handle unreadCounts as either Map or plain object
    let unreadCount = 0;
    if (chat.unreadCounts) {
      if (typeof chat.unreadCounts.get === 'function') {
        // It's a Map
        unreadCount = chat.unreadCounts.get(currentUserId) || 0;
      } else if (typeof chat.unreadCounts === 'object') {
        // It's a plain object (from lean queries)
        unreadCount = chat.unreadCounts[currentUserId] || 0;
      }
    }
    
    return {
      _id: chat._id.toString(),
      participants: chat.participants.map((p: any) => ({
        _id: p._id.toString(),
        name: p.name,
        avatarUrl: p.avatarUrl,
        isOnline: p.lastActiveDate ? 
          (Date.now() - new Date(p.lastActiveDate).getTime() < 5 * 60 * 1000) : false
      })),
      type: chat.type,
      name: chat.name,
      description: chat.description,
      avatar: chat.avatar,
      lastMessage: chat.lastMessage ? {
        content: chat.lastMessage.content,
        sender: chat.lastMessage.sender,
        timestamp: chat.lastMessage.timestamp.toISOString(),
        type: chat.lastMessage.type
      } : undefined,
      unreadCount,
      isActive: chat.isActive,
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString()
    };
  }

  // Helper method to format message response
  private static formatMessageResponse(message: any): MessageResponse {
    return {
      _id: message._id.toString(),
      chatId: message.chatId.toString(),
      sender: {
        _id: message.sender._id.toString(),
        name: message.sender.name,
        avatarUrl: message.sender.avatarUrl
      },
      content: message.content,
      type: message.type,
      metadata: message.metadata,
      replyTo: message.replyTo ? {
        _id: message.replyTo._id.toString(),
        content: message.replyTo.content,
        sender: message.replyTo.sender,
        type: message.replyTo.type
      } : undefined,
      reactions: message.reactions?.map((r: any) => ({
        emoji: r.emoji,
        count: r.count,
        users: r.users?.map((u: any) => ({
          _id: u._id.toString(),
          name: u.name
        })) || []
      })) || [],
      isEdited: message.isEdited,
      editedAt: message.editedAt?.toISOString(),
      readBy: message.readBy?.map((r: any) => ({
        user: {
          _id: r.user._id.toString(),
          name: r.user.name
        },
        readAt: r.readAt.toISOString()
      })) || [],
      createdAt: message.createdAt.toISOString(),
      timeAgo: this.getTimeAgo(message.createdAt)
    };
  }

  // Helper method to calculate time ago
  private static getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }
}
