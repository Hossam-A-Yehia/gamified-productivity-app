import { Response } from 'express';
import { ChatService, CreateChatRequest, SendMessageRequest } from '../services/chatService';
import { AuthenticatedRequest } from '../types/express';

export class ChatController {
  // Get user's chats
  static async getChats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

      const result = await ChatService.getUserChats(userId, page, limit);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch chats',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Create or get direct chat
  static async createOrGetDirectChat(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { friendId } = req.body;

      if (!friendId) {
        res.status(400).json({
          success: false,
          message: 'Friend ID is required'
        });
        return;
      }

      if (friendId === userId) {
        res.status(400).json({
          success: false,
          message: 'Cannot create chat with yourself'
        });
        return;
      }

      const chat = await ChatService.createOrGetDirectChat(userId, friendId);

      res.status(200).json({
        success: true,
        data: chat
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 :
                        error instanceof Error && error.message.includes('friends') ? 403 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create chat',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Create group chat
  static async createGroupChat(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const chatData: CreateChatRequest = req.body;

      // Validation
      if (!chatData.name || chatData.name.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'Group name is required'
        });
        return;
      }

      if (chatData.name.length > 100) {
        res.status(400).json({
          success: false,
          message: 'Group name must be 100 characters or less'
        });
        return;
      }

      if (!chatData.participants || !Array.isArray(chatData.participants) || chatData.participants.length < 2) {
        res.status(400).json({
          success: false,
          message: 'At least 2 participants are required for a group chat'
        });
        return;
      }

      if (chatData.participants.length > 50) {
        res.status(400).json({
          success: false,
          message: 'Group chat cannot have more than 50 participants'
        });
        return;
      }

      if (chatData.participants.includes(userId)) {
        res.status(400).json({
          success: false,
          message: 'You cannot add yourself as a participant'
        });
        return;
      }

      chatData.type = 'group';
      const chat = await ChatService.createGroupChat(userId, chatData);

      res.status(201).json({
        success: true,
        data: chat,
        message: 'Group chat created successfully'
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 :
                        error instanceof Error && error.message.includes('friends') ? 403 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create group chat',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get chat messages
  static async getChatMessages(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { chatId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const beforeMessageId = req.query.before as string;

      if (!chatId) {
        res.status(400).json({
          success: false,
          message: 'Chat ID is required'
        });
        return;
      }

      const messages = await ChatService.getChatMessages(userId, chatId, page, limit, beforeMessageId);

      res.status(200).json({
        success: true,
        data: messages
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 :
                        error instanceof Error && error.message.includes('participant') ? 403 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch messages',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Send message
  static async sendMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const messageData: SendMessageRequest = req.body;

      // Validation
      if (!messageData.chatId) {
        res.status(400).json({
          success: false,
          message: 'Chat ID is required'
        });
        return;
      }

      if (!messageData.content || messageData.content.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'Message content is required'
        });
        return;
      }

      if (messageData.content.length > 2000) {
        res.status(400).json({
          success: false,
          message: 'Message content must be 2000 characters or less'
        });
        return;
      }

      const message = await ChatService.sendMessage(userId, messageData);

      res.status(201).json({
        success: true,
        data: message,
        message: 'Message sent successfully'
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 :
                        error instanceof Error && error.message.includes('participant') ? 403 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send message',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Mark chat as read
  static async markChatAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { chatId } = req.params;

      if (!chatId) {
        res.status(400).json({
          success: false,
          message: 'Chat ID is required'
        });
        return;
      }

      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000); // 10 second timeout
      });

      await Promise.race([
        ChatService.markChatAsRead(userId, chatId),
        timeoutPromise
      ]);

      res.status(200).json({
        success: true,
        message: 'Chat marked as read'
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 :
                        error instanceof Error && error.message.includes('participant') ? 403 :
                        error instanceof Error && error.message.includes('timeout') ? 408 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to mark chat as read',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Edit message
  static async editMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { messageId } = req.params;
      const { content } = req.body;

      if (!messageId) {
        res.status(400).json({
          success: false,
          message: 'Message ID is required'
        });
        return;
      }

      if (!content || content.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'Message content is required'
        });
        return;
      }

      if (content.length > 2000) {
        res.status(400).json({
          success: false,
          message: 'Message content must be 2000 characters or less'
        });
        return;
      }

      const message = await ChatService.editMessage(userId, messageId, content);

      res.status(200).json({
        success: true,
        data: message,
        message: 'Message edited successfully'
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 :
                        error instanceof Error && error.message.includes('own messages') ? 403 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to edit message',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Delete message
  static async deleteMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { messageId } = req.params;

      if (!messageId) {
        res.status(400).json({
          success: false,
          message: 'Message ID is required'
        });
        return;
      }

      await ChatService.deleteMessage(userId, messageId);

      res.status(200).json({
        success: true,
        message: 'Message deleted successfully'
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 :
                        error instanceof Error && error.message.includes('own messages') ? 403 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete message',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Add reaction to message
  static async addReaction(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { messageId } = req.params;
      const { emoji } = req.body;

      if (!messageId) {
        res.status(400).json({
          success: false,
          message: 'Message ID is required'
        });
        return;
      }

      if (!emoji || emoji.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'Emoji is required'
        });
        return;
      }

      if (emoji.length > 10) {
        res.status(400).json({
          success: false,
          message: 'Emoji must be 10 characters or less'
        });
        return;
      }

      const message = await ChatService.addReaction(userId, messageId, emoji.trim());

      res.status(200).json({
        success: true,
        data: message,
        message: 'Reaction added successfully'
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 :
                        error instanceof Error && error.message.includes('participant') ? 403 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to add reaction',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Search messages in chat
  static async searchMessages(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { chatId } = req.params;
      const { q: searchTerm } = req.query;

      if (!chatId) {
        res.status(400).json({
          success: false,
          message: 'Chat ID is required'
        });
        return;
      }

      if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'Search term is required'
        });
        return;
      }

      if (searchTerm.length > 100) {
        res.status(400).json({
          success: false,
          message: 'Search term must be 100 characters or less'
        });
        return;
      }

      const messages = await ChatService.searchMessages(userId, chatId, searchTerm.trim());

      res.status(200).json({
        success: true,
        data: messages
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 :
                        error instanceof Error && error.message.includes('participant') ? 403 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to search messages',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
