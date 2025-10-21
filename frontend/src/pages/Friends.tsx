import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Search,
  Send,
  Star
} from 'lucide-react';
import { 
  useFriends, 
  usePendingFriendRequests, 
  useSentFriendRequests, 
  useFriendSuggestions,
  useFriendsOperations 
} from '../hooks/useProfile';
import type { PublicProfile } from '../types/profile';
import { toast } from 'sonner';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import FriendCard from '../components/friends/FriendCard';

type FriendsTab = 'all' | 'requests' | 'sent' | 'suggestions';

const Friends: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FriendsTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Queries
  const { data: friends, isLoading: isLoadingFriends, refetch: refetchFriends } = useFriends();
  const { data: pendingRequests, refetch: refetchPendingRequests } = usePendingFriendRequests();
  const { data: sentRequests, refetch: refetchSentRequests } = useSentFriendRequests();
  const { data: friendSuggestions, refetch: refetchFriendSuggestions } = useFriendSuggestions();

  // Mutations
  const { 
    sendFriendRequest, 
    respondToFriendRequest, 
    removeFriend, 
    cancelFriendRequest 
  } = useFriendsOperations();

  const tabs = [
    { id: 'all' as const, label: 'Friends', icon: Users, count: friends?.length || 0 },
    { id: 'requests' as const, label: 'Requests', icon: UserPlus, count: pendingRequests?.length || 0 },
    { id: 'sent' as const, label: 'Sent', icon: Send, count: sentRequests?.length || 0 },
    { id: 'suggestions' as const, label: 'Suggestions', icon: Star, count: friendSuggestions?.length || 0 }
  ];

  const handleSendFriendRequest = async (userId: string) => {
    try {
      setIsLoading(true);
      await sendFriendRequest.mutateAsync({ userId });
      toast.success('Friend request sent!');
      refetchFriendSuggestions();
      refetchSentRequests();
    } catch (error) {
      toast.error('Failed to send friend request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespondToRequest = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      setIsLoading(true);
      await respondToFriendRequest.mutateAsync({ requestId, action });
      toast.success(`Friend request ${action}ed!`);
      refetchPendingRequests();
      if (action === 'accept') {
        refetchFriends();
      }
    } catch (error) {
      toast.error(`Failed to ${action} friend request`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!confirm('Are you sure you want to remove this friend?')) return;
    
    try {
      setIsLoading(true);
      await removeFriend.mutateAsync(friendId);
      toast.success('Friend removed');
      refetchFriends();
    } catch (error) {
      toast.error('Failed to remove friend');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRequest = async (targetUserId: string) => {
    try {
      setIsLoading(true);
      await cancelFriendRequest.mutateAsync(targetUserId);
      toast.success('Friend request cancelled');
      refetchSentRequests();
      refetchFriendSuggestions();
    } catch (error) {
      toast.error('Failed to cancel friend request');
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredData = () => {
    let data: PublicProfile[] = [];
    
    switch (activeTab) {
      case 'all':
        data = friends || [];
        break;
      case 'requests':
        data = pendingRequests || [];
        break;
      case 'sent':
        data = sentRequests || [];
        break;
      case 'suggestions':
        data = friendSuggestions || [];
        break;
    }

    if (searchQuery.trim()) {
      data = data.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return data;
  };

  const renderUserCard = (user: PublicProfile) => {
    const getCardType = () => {
      switch (activeTab) {
        case 'all': return 'friend' as const;
        case 'requests': return 'request' as const;
        case 'sent': return 'sent' as const;
        case 'suggestions': return 'suggestion' as const;
        default: return 'friend' as const;
      }
    };

    return (
      <FriendCard
        key={user._id}
        user={user}
        type={getCardType()}
        onSendRequest={handleSendFriendRequest}
        onAcceptRequest={(userId) => handleRespondToRequest(userId, 'accept')}
        onDeclineRequest={(userId) => handleRespondToRequest(userId, 'decline')}
        onRemoveFriend={handleRemoveFriend}
        onCancelRequest={handleCancelRequest}
        isLoading={isLoading}
      />
    );
  };

  const filteredData = getFilteredData();

  if (isLoadingFriends) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Friends
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400">
          Connect with friends and build your productivity network
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              }`}>
                {tab.count}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {filteredData.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {activeTab === 'all' && 'No friends yet'}
                {activeTab === 'requests' && 'No pending requests'}
                {activeTab === 'sent' && 'No sent requests'}
                {activeTab === 'suggestions' && 'No suggestions available'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {activeTab === 'all' && 'Start building your network by sending friend requests!'}
                {activeTab === 'requests' && 'Friend requests will appear here when you receive them.'}
                {activeTab === 'sent' && 'Requests you send will appear here.'}
                {activeTab === 'suggestions' && 'We\'ll suggest friends based on your activity.'}
              </p>
              {activeTab === 'all' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab('suggestions')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Find Friends
                </motion.button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData.map(renderUserCard)}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Friends;
