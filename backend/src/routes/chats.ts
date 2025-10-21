import express from 'express';
import { ChatController } from '../controllers/chatController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get user's chats
router.get('/', ChatController.getChats);

// Create or get direct chat with a friend
router.post('/direct', ChatController.createOrGetDirectChat);

// Create group chat
router.post('/group', ChatController.createGroupChat);

// Get messages for a specific chat
router.get('/:chatId/messages', ChatController.getChatMessages);

// Send message to a chat
router.post('/messages', ChatController.sendMessage);

// Mark chat as read
router.put('/:chatId/read', ChatController.markChatAsRead);

// Edit a message
router.put('/messages/:messageId', ChatController.editMessage);

// Delete a message
router.delete('/messages/:messageId', ChatController.deleteMessage);

// Add reaction to a message
router.post('/messages/:messageId/reactions', ChatController.addReaction);

// Search messages in a chat
router.get('/:chatId/search', ChatController.searchMessages);

export default router;
