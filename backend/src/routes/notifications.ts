import express from 'express';
import { NotificationController } from '../controllers/notificationController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get user notifications with filtering and pagination
router.get('/', NotificationController.getNotifications);

// Get recent notifications (for dropdown)
router.get('/recent', NotificationController.getRecentNotifications);

// Get notification statistics
router.get('/stats', NotificationController.getNotificationStats);

// Get unread count
router.get('/unread-count', NotificationController.getUnreadCount);

// Mark notifications as read
router.put('/mark-read', NotificationController.markAsRead);

// Mark all notifications as read
router.put('/mark-all-read', NotificationController.markAllAsRead);

// Delete notification
router.delete('/:notificationId', NotificationController.deleteNotification);

// Delete multiple notifications
router.delete('/', NotificationController.deleteNotifications);

// Create notification (admin only - you might want to add admin middleware)
router.post('/create', NotificationController.createNotification);

// Create bulk notifications (admin only - you might want to add admin middleware)
router.post('/bulk', NotificationController.createBulkNotifications);

export default router;
