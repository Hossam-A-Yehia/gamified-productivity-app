import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  Send,
  Share2,
  MessageCircle,
  Heart,
} from "lucide-react";
import type { Challenge } from "../../types/challenge";

interface Friend {
  id: string;
  username: string;
  avatar?: string;
  isOnline: boolean;
  level: number;
}

interface ChallengeInvite {
  id: string;
  challengeId: string;
  challengeTitle: string;
  fromUserId: string;
  fromUsername: string;
  toUserId: string;
  message?: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}

interface ChallengeSocialFeaturesProps {
  challenge: Challenge;
  friends: Friend[];
  pendingInvites: ChallengeInvite[];
  onInviteFriend: (friendId: string, message?: string) => void;
  onShareChallenge: () => void;
  onRespondToInvite: (
    inviteId: string,
    response: "accepted" | "declined"
  ) => void;
}

export const ChallengeSocialFeatures: React.FC<
  ChallengeSocialFeaturesProps
> = ({
  challenge,
  friends,
  pendingInvites,
  onInviteFriend,
  onShareChallenge,
  onRespondToInvite,
}) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [inviteMessage, setInviteMessage] = useState("");
  const [showInvites, setShowInvites] = useState(false);

  const handleInviteFriends = () => {
    selectedFriends.forEach((friendId) => {
      onInviteFriend(friendId, inviteMessage);
    });
    setSelectedFriends([]);
    setInviteMessage("");
    setShowInviteModal(false);
  };

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const participatingFriends = friends.filter((friend) =>
    challenge.participants.some((p) => p.userId === friend.id)
  );

  const availableFriends = friends.filter(
    (friend) => !challenge.participants.some((p) => p.userId === friend.id)
  );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Users className="text-blue-500" size={20} />
          Social Features
        </h3>

        <div className="flex flex-wrap gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <UserPlus size={18} />
            Invite Friends
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onShareChallenge}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            <Share2 size={18} />
            Share Challenge
          </motion.button>

          {pendingInvites.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowInvites(!showInvites)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors relative"
            >
              <MessageCircle size={18} />
              Invites
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                {pendingInvites.length}
              </span>
            </motion.button>
          )}
        </div>
      </div>
      {participatingFriends.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Friends in this Challenge ({participatingFriends.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {participatingFriends.map((friend) => {
              const participant = challenge.participants.find(
                (p) => p.userId === friend.id
              );
              return (
                <motion.div
                  key={friend.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="relative">
                    {friend.avatar ? (
                      <img
                        src={friend.avatar}
                        alt={friend.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {friend.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {friend.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {friend.username}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>Level {friend.level}</span>
                      {participant && (
                        <>
                          <span>•</span>
                          <span>
                            {Math.round(participant.progress.overallProgress)}%
                            complete
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {participant?.rank && (
                    <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
                      #{participant.rank}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
      <AnimatePresence>
        {showInvites && pendingInvites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Pending Invites
            </h3>
            <div className="space-y-3">
              {pendingInvites.map((invite) => (
                <motion.div
                  key={invite.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                >
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {invite.fromUsername} invited you to join "
                      {invite.challengeTitle}"
                    </h4>
                    {invite.message && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        "{invite.message}"
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {new Date(invite.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onRespondToInvite(invite.id, "accepted")}
                      className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-colors"
                    >
                      Accept
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onRespondToInvite(invite.id, "declined")}
                      className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                    >
                      Decline
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Invite Friends to "{challenge.title}"
                </h3>

                {availableFriends.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="mx-auto text-gray-400 mb-3" size={32} />
                    <p className="text-gray-600 dark:text-gray-400">
                      All your friends are already participating in this
                      challenge!
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                      {availableFriends.map((friend) => (
                        <motion.div
                          key={friend.id}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => toggleFriendSelection(friend.id)}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedFriends.includes(friend.id)
                              ? "bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500"
                              : "bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                        >
                          <div className="relative">
                            {friend.avatar ? (
                              <img
                                src={friend.avatar}
                                alt={friend.username}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                {friend.username.charAt(0).toUpperCase()}
                              </div>
                            )}
                            {friend.isOnline && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-white dark:border-gray-800" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {friend.username}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Level {friend.level}
                            </p>
                          </div>
                          {selectedFriends.includes(friend.id) && (
                            <Heart
                              className="text-blue-500"
                              size={16}
                              fill="currentColor"
                            />
                          )}
                        </motion.div>
                      ))}
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Personal Message (Optional)
                      </label>
                      <textarea
                        value={inviteMessage}
                        onChange={(e) => setInviteMessage(e.target.value)}
                        placeholder="Add a personal message to your invitation..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                    </div>
                  </>
                )}
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleInviteFriends}
                    disabled={selectedFriends.length === 0}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={16} />
                    Send Invites ({selectedFriends.length})
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
