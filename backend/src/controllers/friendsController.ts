import { Response } from 'express';
import { FriendsService } from '../services/friendsService';
import { AuthenticatedRequest } from '../types/express';
import {
  SendFriendRequestRequest,
  RespondToFriendRequestRequest
} from '../types/profile';

export class FriendsController {
  // Send friend request
  static async sendFriendRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const requestData: SendFriendRequestRequest = req.body;

      // Validation
      if (!requestData.userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
        return;
      }

      if (requestData.message && requestData.message.length > 500) {
        res.status(400).json({
          success: false,
          message: 'Message must be 500 characters or less'
        });
        return;
      }

      await FriendsService.sendFriendRequest(userId, requestData);

      res.status(200).json({
        success: true,
        message: 'Friend request sent successfully'
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('already friends') || 
            error.message.includes('already sent') ||
            error.message.includes('not accepting friend requests') ||
            error.message.includes('already sent you a friend request')) {
          res.status(400).json({
            success: false,
            message: error.message
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        message: 'Failed to send friend request',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Respond to friend request
  static async respondToFriendRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const requestData: RespondToFriendRequestRequest = req.body;

      // Validation
      if (!requestData.requestId) {
        res.status(400).json({
          success: false,
          message: 'Request ID is required'
        });
        return;
      }

      if (!requestData.action || !['accept', 'decline'].includes(requestData.action)) {
        res.status(400).json({
          success: false,
          message: 'Action must be either "accept" or "decline"'
        });
        return;
      }

      await FriendsService.respondToFriendRequest(userId, requestData);

      res.status(200).json({
        success: true,
        message: `Friend request ${requestData.action}ed successfully`
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Friend request not found') {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to respond to friend request',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Remove friend
  static async removeFriend(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { friendId } = req.params;

      if (!friendId) {
        res.status(400).json({
          success: false,
          message: 'Friend ID is required'
        });
        return;
      }

      await FriendsService.removeFriend(userId, friendId);

      res.status(200).json({
        success: true,
        message: 'Friend removed successfully'
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Users are not friends') {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to remove friend',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get friends list
  static async getFriends(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const friends = await FriendsService.getFriends(userId);

      res.status(200).json({
        success: true,
        data: friends
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch friends',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get pending friend requests (received)
  static async getPendingFriendRequests(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const requests = await FriendsService.getPendingFriendRequests(userId);

      res.status(200).json({
        success: true,
        data: requests
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch pending friend requests',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get sent friend requests
  static async getSentFriendRequests(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const requests = await FriendsService.getSentFriendRequests(userId);

      res.status(200).json({
        success: true,
        data: requests
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sent friend requests',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Cancel sent friend request
  static async cancelFriendRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { targetUserId } = req.params;

      if (!targetUserId) {
        res.status(400).json({
          success: false,
          message: 'Target user ID is required'
        });
        return;
      }

      await FriendsService.cancelFriendRequest(userId, targetUserId);

      res.status(200).json({
        success: true,
        message: 'Friend request cancelled successfully'
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Friend request not found') {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to cancel friend request',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get mutual friends
  static async getMutualFriends(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { otherUserId } = req.params;

      if (!otherUserId) {
        res.status(400).json({
          success: false,
          message: 'Other user ID is required'
        });
        return;
      }

      const mutualFriends = await FriendsService.getMutualFriends(userId, otherUserId);

      res.status(200).json({
        success: true,
        data: mutualFriends
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch mutual friends',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get friend suggestions
  static async getFriendSuggestions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const suggestions = await FriendsService.getFriendSuggestions(userId, Math.min(limit, 50));

      res.status(200).json({
        success: true,
        data: suggestions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch friend suggestions',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
