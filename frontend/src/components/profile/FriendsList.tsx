import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Search, 
  MoreHorizontal,
  MessageCircle,
  UserMinus,
  Eye
} from 'lucide-react';
import { 
  useFriends, 
  usePendingFriendRequests, 
  useFriendSuggestions,
  useFriendsOperations 
} from '../../hooks/useProfile';
import { ProfileCard } from './ProfileCard';
import LoadingSpinner from '../ui/LoadingSpinner';

interface FriendsListProps {
  className?: string;
}

type FriendsView = 'friends' | 'requests' | 'suggestions';

export const FriendsList: React.FC<FriendsListProps> = ({ className = '' }) => {
  const [activeView, setActiveView] = useState<FriendsView>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);

  const { data: friends, isLoading: friendsLoading } = useFriends();
  const { data: pendingRequests, isLoading: requestsLoading } = usePendingFriendRequests();
  const { data: suggestions, isLoading: suggestionsLoading } = useFriendSuggestions();
  
  const { 
    sendFriendRequest, 
    respondToFriendRequest, 
    removeFriend 
  } = useFriendsOperations();

  const handleSendFriendRequest = async (userId: string) => {
    try {
      await sendFriendRequest.mutateAsync({ userId });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await respondToFriendRequest.mutateAsync({ requestId, action: 'accept' });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await respondToFriendRequest.mutateAsync({ requestId, action: 'decline' });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (window.confirm('Are you sure you want to remove this friend?')) {
      try {
        await removeFriend.mutateAsync(friendId);
        setSelectedFriend(null);
      } catch (error) {
        // Error handled by mutation
      }
    }
  };

  const filteredFriends = friends?.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const views = [
    { key: 'friends', label: 'Friends', count: friends?.length || 0 },
    { key: 'requests', label: 'Requests', count: pendingRequests?.length || 0 },
    { key: 'suggestions', label: 'Suggestions', count: suggestions?.length || 0 },
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Friends
            </h3>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-2 mb-4">
          {views.map(({ key, label, count }) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveView(key as FriendsView)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === key
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeView === key
                    ? 'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {count}
                </span>
              )}
            </motion.button>
          ))}
        </div>

        {/* Search */}
        {activeView === 'friends' && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeView === 'friends' && (
            <motion.div
              key="friends"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {friendsLoading ? (
                <LoadingSpinner />
              ) : filteredFriends.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {searchQuery ? 'No friends found' : 'No friends yet'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchQuery 
                      ? 'Try adjusting your search terms'
                      : 'Start by sending friend requests to connect with others!'
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFriends.map((friend) => (
                    <motion.div
                      key={friend._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group"
                    >
                      <ProfileCard
                        profile={friend}
                        showActions={false}
                        className="h-full"
                      />
                      
                      {/* Friend Actions */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="relative">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSelectedFriend(
                              selectedFriend === friend._id ? null : friend._id
                            )}
                            className="p-2 bg-white dark:bg-gray-700 rounded-full shadow-lg border border-gray-200 dark:border-gray-600"
                          >
                            <MoreHorizontal className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </motion.button>
                          
                          {selectedFriend === friend._id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-2 min-w-[150px] z-10"
                            >
                              <button
                                onClick={() => {
                                  // View profile logic
                                  setSelectedFriend(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                View Profile
                              </button>
                              <button
                                onClick={() => {
                                  // Message logic
                                  setSelectedFriend(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2"
                              >
                                <MessageCircle className="w-4 h-4" />
                                Message
                              </button>
                              <button
                                onClick={() => handleRemoveFriend(friend._id)}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                              >
                                <UserMinus className="w-4 h-4" />
                                Remove Friend
                              </button>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeView === 'requests' && (
            <motion.div
              key="requests"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {requestsLoading ? (
                <LoadingSpinner />
              ) : !pendingRequests || pendingRequests.length === 0 ? (
                <div className="text-center py-8">
                  <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No pending requests
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    You don't have any pending friend requests at the moment.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <motion.div
                      key={request._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                          {request.avatarUrl ? (
                            <img
                              src={request.avatarUrl}
                              alt={request.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Users className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {request.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Level {request.level} • {request.xp.toLocaleString()} XP
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeclineRequest(request._id)}
                          disabled={respondToFriendRequest.isPending}
                          className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
                        >
                          Decline
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAcceptRequest(request._id)}
                          disabled={respondToFriendRequest.isPending}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                          Accept
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeView === 'suggestions' && (
            <motion.div
              key="suggestions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {suggestionsLoading ? (
                <LoadingSpinner />
              ) : !suggestions || suggestions.length === 0 ? (
                <div className="text-center py-8">
                  <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No suggestions available
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    We'll suggest new friends based on your activity and mutual connections.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suggestions.map((suggestion) => (
                    <motion.div
                      key={suggestion._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <ProfileCard
                        profile={suggestion}
                        showActions={true}
                        onSendFriendRequest={() => handleSendFriendRequest(suggestion._id)}
                        className="h-full"
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
