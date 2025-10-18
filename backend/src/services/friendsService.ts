import User from '../models/User';
import mongoose from 'mongoose';
import {
  PublicProfile,
  FriendRequest,
  SendFriendRequestRequest,
  RespondToFriendRequestRequest
} from '../types/profile';
import { ProfileService } from './profileService';

export class FriendsService {
  // Send friend request
  static async sendFriendRequest(fromUserId: string, requestData: SendFriendRequestRequest): Promise<void> {
    const { userId: toUserId, message } = requestData;

    if (fromUserId === toUserId) {
      throw new Error('Cannot send friend request to yourself');
    }

    const [fromUser, toUser] = await Promise.all([
      User.findById(fromUserId),
      User.findById(toUserId)
    ]);

    if (!fromUser || !toUser) {
      throw new Error('User not found');
    }

    // Check if users are already friends
    if (fromUser.friends.includes(new mongoose.Types.ObjectId(toUserId))) {
      throw new Error('Users are already friends');
    }

    // Check if friend request already exists
    if (fromUser.friendRequests.sent.includes(new mongoose.Types.ObjectId(toUserId)) ||
        toUser.friendRequests.received.includes(new mongoose.Types.ObjectId(fromUserId))) {
      throw new Error('Friend request already sent');
    }

    // Check if there's a pending request from the other user
    if (fromUser.friendRequests.received.includes(new mongoose.Types.ObjectId(toUserId))) {
      throw new Error('This user has already sent you a friend request');
    }

    // Check privacy settings
    if (toUser.settings?.privacy?.allowFriendRequests === false) {
      throw new Error('This user is not accepting friend requests');
    }

    // Add to friend requests
    await Promise.all([
      User.findByIdAndUpdate(fromUserId, {
        $addToSet: { 'friendRequests.sent': new mongoose.Types.ObjectId(toUserId) }
      }),
      User.findByIdAndUpdate(toUserId, {
        $addToSet: { 'friendRequests.received': new mongoose.Types.ObjectId(fromUserId) }
      })
    ]);
  }

  // Respond to friend request
  static async respondToFriendRequest(userId: string, requestData: RespondToFriendRequestRequest): Promise<void> {
    const { requestId, action } = requestData;

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const requesterId = new mongoose.Types.ObjectId(requestId);

    // Check if friend request exists
    if (!user.friendRequests.received.includes(requesterId)) {
      throw new Error('Friend request not found');
    }

    if (action === 'accept') {
      // Add to friends list for both users
      await Promise.all([
        User.findByIdAndUpdate(userId, {
          $addToSet: { friends: requesterId },
          $pull: { 'friendRequests.received': requesterId }
        }),
        User.findByIdAndUpdate(requestId, {
          $addToSet: { friends: new mongoose.Types.ObjectId(userId) },
          $pull: { 'friendRequests.sent': new mongoose.Types.ObjectId(userId) }
        })
      ]);
    } else if (action === 'decline') {
      // Remove from friend requests
      await Promise.all([
        User.findByIdAndUpdate(userId, {
          $pull: { 'friendRequests.received': requesterId }
        }),
        User.findByIdAndUpdate(requestId, {
          $pull: { 'friendRequests.sent': new mongoose.Types.ObjectId(userId) }
        })
      ]);
    } else {
      throw new Error('Invalid action');
    }
  }

  // Remove friend
  static async removeFriend(userId: string, friendId: string): Promise<void> {
    if (userId === friendId) {
      throw new Error('Cannot remove yourself as friend');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const friendObjectId = new mongoose.Types.ObjectId(friendId);

    // Check if they are friends
    if (!user.friends.includes(friendObjectId)) {
      throw new Error('Users are not friends');
    }

    // Remove from both users' friends lists
    await Promise.all([
      User.findByIdAndUpdate(userId, {
        $pull: { friends: friendObjectId }
      }),
      User.findByIdAndUpdate(friendId, {
        $pull: { friends: new mongoose.Types.ObjectId(userId) }
      })
    ]);
  }

  // Get user's friends list
  static async getFriends(userId: string): Promise<PublicProfile[]> {
    const user = await User.findById(userId).populate('friends').lean();
    if (!user) {
      throw new Error('User not found');
    }

    const friends = await User.find({
      _id: { $in: user.friends }
    }).lean();

    return friends.map(friend => ({
      _id: friend._id.toString(),
      name: friend.name,
      level: Math.floor(friend.xp / 500) + 1,
      xp: friend.xp,
      avatarUrl: friend.avatarUrl,
      avatarCustomization: friend.avatarCustomization,
      achievements: friend.achievements,
      stats: friend.settings?.privacy?.showStats !== false ? {
        totalTasksCompleted: friend.stats.totalTasksCompleted,
        totalFocusTime: friend.stats.totalFocusTime,
        longestStreak: friend.stats.longestStreak,
        totalChallengesCompleted: 0 // Would need to calculate
      } : undefined,
      createdAt: friend.createdAt.toISOString(),
      isOnline: friend.settings?.privacy?.showOnlineStatus !== false ? 
        (Date.now() - new Date(friend.lastActiveDate).getTime() < 5 * 60 * 1000) : undefined,
      lastActiveDate: friend.settings?.privacy?.showOnlineStatus !== false ? 
        friend.lastActiveDate.toISOString() : undefined
    }));
  }

  // Get pending friend requests (received)
  static async getPendingFriendRequests(userId: string): Promise<PublicProfile[]> {
    const user = await User.findById(userId).lean();
    if (!user) {
      throw new Error('User not found');
    }

    const requesters = await User.find({
      _id: { $in: user.friendRequests.received }
    }).lean();

    return requesters.map(requester => ({
      _id: requester._id.toString(),
      name: requester.name,
      level: Math.floor(requester.xp / 500) + 1,
      xp: requester.xp,
      avatarUrl: requester.avatarUrl,
      avatarCustomization: requester.avatarCustomization,
      achievements: requester.achievements,
      createdAt: requester.createdAt.toISOString(),
      isOnline: requester.settings?.privacy?.showOnlineStatus !== false ? 
        (Date.now() - new Date(requester.lastActiveDate).getTime() < 5 * 60 * 1000) : undefined
    }));
  }

  // Get sent friend requests
  static async getSentFriendRequests(userId: string): Promise<PublicProfile[]> {
    const user = await User.findById(userId).lean();
    if (!user) {
      throw new Error('User not found');
    }

    const recipients = await User.find({
      _id: { $in: user.friendRequests.sent }
    }).lean();

    return recipients.map(recipient => ({
      _id: recipient._id.toString(),
      name: recipient.name,
      level: Math.floor(recipient.xp / 500) + 1,
      xp: recipient.xp,
      avatarUrl: recipient.avatarUrl,
      avatarCustomization: recipient.avatarCustomization,
      achievements: recipient.achievements,
      createdAt: recipient.createdAt.toISOString()
    }));
  }

  // Cancel sent friend request
  static async cancelFriendRequest(userId: string, targetUserId: string): Promise<void> {
    if (userId === targetUserId) {
      throw new Error('Cannot cancel friend request to yourself');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const targetUserObjectId = new mongoose.Types.ObjectId(targetUserId);

    // Check if friend request exists
    if (!user.friendRequests.sent.includes(targetUserObjectId)) {
      throw new Error('Friend request not found');
    }

    // Remove from both users' friend requests
    await Promise.all([
      User.findByIdAndUpdate(userId, {
        $pull: { 'friendRequests.sent': targetUserObjectId }
      }),
      User.findByIdAndUpdate(targetUserId, {
        $pull: { 'friendRequests.received': new mongoose.Types.ObjectId(userId) }
      })
    ]);
  }

  // Get mutual friends between two users
  static async getMutualFriends(userId: string, otherUserId: string): Promise<PublicProfile[]> {
    const [user, otherUser] = await Promise.all([
      User.findById(userId).lean(),
      User.findById(otherUserId).lean()
    ]);

    if (!user || !otherUser) {
      throw new Error('User not found');
    }

    // Find mutual friends
    const mutualFriendIds = user.friends.filter(friendId => 
      otherUser.friends.some(otherFriendId => 
        friendId.toString() === otherFriendId.toString()
      )
    );

    if (mutualFriendIds.length === 0) {
      return [];
    }

    const mutualFriends = await User.find({
      _id: { $in: mutualFriendIds }
    }).lean();

    return mutualFriends.map(friend => ({
      _id: friend._id.toString(),
      name: friend.name,
      level: Math.floor(friend.xp / 500) + 1,
      xp: friend.xp,
      avatarUrl: friend.avatarUrl,
      avatarCustomization: friend.avatarCustomization,
      achievements: friend.achievements,
      createdAt: friend.createdAt.toISOString()
    }));
  }

  // Get friend suggestions based on mutual friends and activity
  static async getFriendSuggestions(userId: string, limit: number = 10): Promise<PublicProfile[]> {
    const user = await User.findById(userId).lean();
    if (!user) {
      throw new Error('User not found');
    }

    // Get users who are not already friends and haven't been sent requests
    const excludeIds = [
      new mongoose.Types.ObjectId(userId),
      ...user.friends,
      ...user.friendRequests.sent,
      ...user.friendRequests.received
    ];

    // Find users with mutual friends or similar activity levels
    const suggestions = await User.find({
      _id: { $nin: excludeIds },
      'settings.privacy.profilePublic': true,
      'settings.privacy.allowFriendRequests': { $ne: false }
    })
    .sort({ xp: -1 }) // Sort by XP for now
    .limit(limit)
    .lean();

    return suggestions.map(suggestion => ({
      _id: suggestion._id.toString(),
      name: suggestion.name,
      level: Math.floor(suggestion.xp / 500) + 1,
      xp: suggestion.xp,
      avatarUrl: suggestion.avatarUrl,
      avatarCustomization: suggestion.avatarCustomization,
      achievements: suggestion.achievements,
      createdAt: suggestion.createdAt.toISOString()
    }));
  }
}
