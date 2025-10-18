import express from 'express';
import { ProfileController } from '../controllers/profileController';
import { FriendsController } from '../controllers/friendsController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Profile management routes
router.get('/me', ProfileController.getMyProfile);
router.get('/users/:userId', ProfileController.getUserProfile);
router.put('/me', ProfileController.updateProfile);

// Settings management routes
router.put('/settings', ProfileController.updateSettings);

// Statistics routes
router.get('/stats', ProfileController.getProfileStats);

// User search routes
router.get('/search', ProfileController.searchUsers);

// Avatar customization routes
router.get('/customizations', ProfileController.getAvailableCustomizations);
router.post('/customizations/purchase', ProfileController.purchaseCustomization);
router.post('/avatar/upload', ProfileController.uploadAvatar);

// Friends management routes
router.get('/friends', FriendsController.getFriends);
router.post('/friends/request', FriendsController.sendFriendRequest);
router.put('/friends/request', FriendsController.respondToFriendRequest);
router.delete('/friends/:friendId', FriendsController.removeFriend);
router.get('/friends/requests/pending', FriendsController.getPendingFriendRequests);
router.get('/friends/requests/sent', FriendsController.getSentFriendRequests);
router.delete('/friends/requests/:targetUserId', FriendsController.cancelFriendRequest);
router.get('/friends/mutual/:otherUserId', FriendsController.getMutualFriends);
router.get('/friends/suggestions', FriendsController.getFriendSuggestions);

// Account management routes
router.delete('/account', ProfileController.deleteAccount);
router.get('/export', ProfileController.exportUserData);

export default router;
