import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Users, MessageCircle } from 'lucide-react';
import { useChats } from '../../hooks/useChat';
import { chatService } from '../../services/chatService';
import { useAuth } from '../../hooks/useAuth';
import type { Chat, ChatFilters } from '../../types/chat';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ChatListProps {
  selectedChatId: string | null;
  onChatSelect: (chat: Chat) => void;
  onNewChat: () => void;
  className?: string;
}

const ChatList: React.FC<ChatListProps> = ({
  selectedChatId,
  onChatSelect,
  onNewChat,
  className = ''
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ChatFilters>({});

  const { data: chatsData, isLoading, error } = useChats(
    { ...filters, search: searchQuery },
    1,
    20
  );

  const chats = chatsData?.chats || [];

  const renderChatItem = (chat: Chat) => {
    const chatListItem = chatService.formatChatForList(chat, user?.id || '');
    const isSelected = selectedChatId === chat._id;
    const hasUnread = chat.unreadCount > 0;

    return (
      <motion.div
        key={chat._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onChatSelect(chat)}
        className={`p-4 cursor-pointer border-b border-gray-200 dark:border-gray-700 transition-all duration-200 ${
          isSelected 
            ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' 
            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
      >
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {chatListItem.displayAvatar ? (
              <img
                src={chatListItem.displayAvatar}
                alt={chatListItem.displayName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                {chat.type === 'group' ? (
                  <Users className="w-6 h-6 text-white" />
                ) : (
                  <span className="text-white font-semibold text-lg">
                    {chatListItem.displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            )}
            
            {/* Online indicator for direct chats */}
            {chat.type === 'direct' && chatListItem.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
            )}
          </div>

          {/* Chat info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className={`font-semibold truncate ${
                hasUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
              }`}>
                {chatListItem.displayName}
              </h3>
              
              <div className="flex items-center space-x-2 flex-shrink-0">
                {chat.lastMessage && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {chatService.formatTime(chat.lastMessage.timestamp)}
                  </span>
                )}
                
                {hasUnread && (
                  <div className="w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                  </div>
                )}
              </div>
            </div>
            
            <p className={`text-sm truncate ${
              hasUnread ? 'text-gray-600 dark:text-gray-400 font-medium' : 'text-gray-500 dark:text-gray-500'
            }`}>
              {chatListItem.lastMessagePreview}
            </p>
            
            {/* Group chat participants count */}
            {chat.type === 'group' && (
              <div className="flex items-center mt-1">
                <Users className="w-3 h-3 text-gray-400 mr-1" />
                <span className="text-xs text-gray-400">
                  {chat.participants.length} members
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-800 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <MessageCircle className="w-6 h-6 mr-2" />
            Chats
          </h2>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNewChat}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="New chat"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2 mt-3">
          <button
            onClick={() => setFilters({})}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              !filters.type && !filters.hasUnread
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All
          </button>
          
          <button
            onClick={() => setFilters({ hasUnread: true })}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filters.hasUnread
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Unread
          </button>
          
          <button
            onClick={() => setFilters({ type: 'group' })}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filters.type === 'group'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Groups
          </button>
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="p-4 text-center">
            <div className="text-red-500 mb-2">Failed to load chats</div>
            <button 
              onClick={() => window.location.reload()}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Try again
            </button>
          </div>
        ) : chats.length === 0 ? (
          <div className="p-8 text-center">
            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No chats yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start a conversation with your friends!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNewChat}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start New Chat
            </motion.button>
          </div>
        ) : (
          <div>
            {chats.map(renderChatItem)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
