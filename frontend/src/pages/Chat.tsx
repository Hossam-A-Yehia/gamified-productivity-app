import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, UserPlus, X } from 'lucide-react';
import { useChatOperations } from '../hooks/useChat';
import { useFriends } from '../hooks/useProfile';
import type { Chat, CreateGroupChatRequest } from '../types/chat';
import ChatList from '../components/chat/ChatList';
import ChatWindow from '../components/chat/ChatWindow';

type NewChatModalType = 'direct' | 'group' | null;

const ChatPage: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState<NewChatModalType>(null);
  const [groupChatData, setGroupChatData] = useState({
    name: '',
    description: '',
    selectedFriends: [] as string[]
  });

  const { data: friends = [] } = useFriends();
  const { createDirectChat, createGroupChat } = useChatOperations();

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
  };

  const handleBackToList = () => {
    setSelectedChat(null);
  };

  const handleNewChat = () => {
    setShowNewChatModal('direct');
  };

  const handleCreateDirectChat = async (friendId: string) => {
    try {
      const chat = await createDirectChat.mutateAsync(friendId);
      setSelectedChat(chat);
      setShowNewChatModal(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleCreateGroupChat = async () => {
    if (!groupChatData.name.trim() || groupChatData.selectedFriends.length < 2) {
      return;
    }

    const chatData: CreateGroupChatRequest = {
      name: groupChatData.name.trim(),
      description: groupChatData.description.trim() || undefined,
      participants: groupChatData.selectedFriends
    };

    try {
      const chat = await createGroupChat.mutateAsync(chatData);
      setSelectedChat(chat);
      setShowNewChatModal(null);
      setGroupChatData({ name: '', description: '', selectedFriends: [] });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const toggleFriendSelection = (friendId: string) => {
    setGroupChatData(prev => ({
      ...prev,
      selectedFriends: prev.selectedFriends.includes(friendId)
        ? prev.selectedFriends.filter(id => id !== friendId)
        : [...prev.selectedFriends, friendId]
    }));
  };

  const renderNewChatModal = () => {
    if (!showNewChatModal) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={() => setShowNewChatModal(null)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {showNewChatModal === 'direct' ? 'Start New Chat' : 'Create Group Chat'}
            </h3>
            <button
              onClick={() => setShowNewChatModal(null)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {showNewChatModal === 'direct' ? (
              // Direct chat - select friend
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Select a friend to start chatting with:
                </p>
                
                {friends.length === 0 ? (
                  <div className="text-center py-8">
                    <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No friends yet. Add some friends to start chatting!
                    </p>
                  </div>
                ) : (
                  friends.map((friend) => (
                    <motion.button
                      key={friend._id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCreateDirectChat(friend._id)}
                      disabled={createDirectChat.isPending}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                      {friend.avatarUrl ? (
                        <img
                          src={friend.avatarUrl}
                          alt={friend.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {friend.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {friend.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {friend.isOnline ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </motion.button>
                  ))
                )}
              </div>
            ) : (
              // Group chat - form
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    value={groupChatData.name}
                    onChange={(e) => setGroupChatData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter group name"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={groupChatData.description}
                    onChange={(e) => setGroupChatData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter group description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    maxLength={500}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Add Friends ({groupChatData.selectedFriends.length} selected)
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {friends.map((friend) => (
                      <label
                        key={friend._id}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={groupChatData.selectedFriends.includes(friend._id)}
                          onChange={() => toggleFriendSelection(friend._id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        {friend.avatarUrl ? (
                          <img
                            src={friend.avatarUrl}
                            alt={friend.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {friend.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {friend.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
            {showNewChatModal === 'direct' ? (
              <button
                onClick={() => setShowNewChatModal('group')}
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Create Group Instead
              </button>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowNewChatModal('direct')}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors"
                >
                  Direct Chat Instead
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateGroupChat}
                  disabled={!groupChatData.name.trim() || groupChatData.selectedFriends.length < 2 || createGroupChat.isPending}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {createGroupChat.isPending ? 'Creating...' : 'Create Group'}
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Messages
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Chat with your friends and stay connected
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat List - Hidden on mobile when chat is selected */}
        <div className={`w-full lg:w-1/3 xl:w-1/4 border-r border-gray-200 dark:border-gray-700 ${
          selectedChat ? 'hidden lg:block' : 'block'
        }`}>
          <ChatList
            selectedChatId={selectedChat?._id || null}
            onChatSelect={handleChatSelect}
            onNewChat={handleNewChat}
            className="h-full"
          />
        </div>

        {/* Chat Window */}
        <div className={`flex-1 ${selectedChat ? 'block' : 'hidden lg:block'}`}>
          {selectedChat ? (
            <ChatWindow
              chat={selectedChat}
              onBack={handleBackToList}
              className="h-full"
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Select a chat to start messaging
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Choose a conversation from the sidebar or start a new one
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNewChat}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start New Chat
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      <AnimatePresence>
        {renderNewChatModal()}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;
