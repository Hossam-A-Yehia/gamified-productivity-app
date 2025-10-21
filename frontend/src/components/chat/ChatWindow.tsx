import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, MoreVertical, Phone, Video, Users } from 'lucide-react';
import { useChatMessages, useChatOperations } from '../../hooks/useChat';
import { useChatSocket } from '../../hooks/useChatSocket';
import { chatService } from '../../services/chatService';
import { useAuth } from '../../hooks/useAuth';
import type { Chat, Message } from '../../types/chat';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ChatWindowProps {
  chat: Chat;
  onBack?: () => void;
  className?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  onBack,
  className = ''
}) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const markedAsReadRef = useRef<string | null>(null);
  const markAsReadTimeoutRef = useRef<number | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());

  const { data: messages = [], isLoading, error } = useChatMessages(chat._id);
  const { markChatAsRead } = useChatOperations();

  // Socket.io integration for real-time features
  const { startTyping, stopTyping, isConnected } = useChatSocket({
    currentChatId: chat._id,
    onNewMessage: () => {
      // Message will be automatically added to cache by the hook
      scrollToBottom();
    },
    onTypingStart: (userId, userName) => {
      setTypingUsers(prev => new Map(prev.set(userId, userName)));
    },
    onTypingStop: (userId) => {
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        newMap.delete(userId);
        return newMap;
      });
    },
    onUserStatusChanged: (userId, isOnline) => {
      // Status will be automatically updated in cache by the hook
      console.log(`User ${userId} is now ${isOnline ? 'online' : 'offline'}`);
    }
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100); // Small delay to ensure DOM is updated
    
    return () => clearTimeout(timer);
  }, [messages]);

  // Mark chat as read when chat changes (debounced to prevent loops)
  useEffect(() => {
    // Clear any existing timeout
    if (markAsReadTimeoutRef.current) {
      clearTimeout(markAsReadTimeoutRef.current);
    }
    
    if (chat.unreadCount > 0 && markedAsReadRef.current !== chat._id) {
      // Debounce the markAsRead call to prevent rapid successive calls
      markAsReadTimeoutRef.current = window.setTimeout(() => {
        markedAsReadRef.current = chat._id;
        markChatAsRead.mutate(chat._id);
      }, 500); // 500ms delay
    }
    
    // Reset the ref when switching to a different chat
    if (markedAsReadRef.current !== chat._id && chat.unreadCount === 0) {
      markedAsReadRef.current = null;
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (markAsReadTimeoutRef.current) {
        clearTimeout(markAsReadTimeoutRef.current);
      }
    };
  }, [chat._id]); // Only depend on chat._id

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
    setEditingMessage(null);
  };

  const handleEdit = (message: Message) => {
    setEditingMessage(message);
    setReplyingTo(null);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
  };

  const handleSaveEdit = () => {
    setEditingMessage(null);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const getChatDisplayInfo = () => {
    const chatListItem = chatService.formatChatForList(chat, user?.id || '');
    return {
      name: chatListItem.displayName,
      avatar: chatListItem.displayAvatar,
      isOnline: chatListItem.isOnline,
      subtitle: chat.type === 'group' 
        ? `${chat.participants.length} members`
        : chatListItem.isOnline ? 'Online' : 'Offline'
    };
  };

  const groupMessagesByDate = () => {
    return chatService.groupMessagesByDate(messages);
  };

  const shouldGroupMessage = (currentMessage: Message, previousMessage?: Message) => {
    return chatService.shouldGroupMessages(currentMessage, previousMessage);
  };

  const renderMessages = () => {
    const groupedMessages = groupMessagesByDate();
    
    return Object.entries(groupedMessages).map(([date, dateMessages]) => (
      <div key={date}>
        {/* Date separator */}
        <div className="flex items-center justify-center my-4">
          <div className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm rounded-full">
            {date}
          </div>
        </div>

        {/* Messages for this date */}
        {dateMessages.map((message, index) => {
          const previousMessage = index > 0 ? dateMessages[index - 1] : undefined;
          const isGrouped = shouldGroupMessage(message, previousMessage);
          
          return (
            <MessageBubble
              key={message._id}
              message={message}
              isGrouped={isGrouped}
              showAvatar={chat.type === 'group'}
              onReply={handleReply}
              onEdit={handleEdit}
            />
          );
        })}
      </div>
    ));
  };

  const displayInfo = getChatDisplayInfo();

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-800 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          {/* Back button (mobile) */}
          {onBack && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors lg:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          )}

          {/* Chat avatar */}
          <div className="relative">
            {displayInfo.avatar ? (
              <img
                src={displayInfo.avatar}
                alt={displayInfo.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                {chat.type === 'group' ? (
                  <Users className="w-5 h-5 text-white" />
                ) : (
                  <span className="text-white font-semibold">
                    {displayInfo.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            )}
            
            {/* Online indicator */}
            {chat.type === 'direct' && displayInfo.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
            )}
          </div>

          {/* Chat info */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {displayInfo.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {displayInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Header actions */}
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            title="Search messages"
          >
            <Search className="w-5 h-5" />
          </motion.button>

          {chat.type === 'direct' && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                title="Voice call"
              >
                <Phone className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                title="Video call"
              >
                <Video className="w-5 h-5" />
              </motion.button>
            </>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            title="More options"
          >
            <MoreVertical className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Search bar */}
      {showSearch && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700"
        >
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </motion.div>
      )}

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-1"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-red-500 mb-2">Failed to load messages</div>
              <button 
                onClick={() => window.location.reload()}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Try again
              </button>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No messages yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Start the conversation by sending a message!
              </p>
            </div>
          </div>
        ) : (
          <>
            {renderMessages()}
            <div ref={messagesEndRef} />
          </>
        )}
        
        {/* Typing indicators */}
        {typingUsers.size > 0 && (
          <div className="px-4 py-2">
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span>
                {Array.from(typingUsers.values()).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Connection status indicator */}
      {!isConnected && (
        <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-700">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-yellow-700 dark:text-yellow-300">
              Connecting to real-time chat...
            </span>
          </div>
        </div>
      )}

      {/* Message input */}
      <MessageInput
        chatId={chat._id}
        replyingTo={replyingTo}
        onCancelReply={handleCancelReply}
        editingMessage={editingMessage}
        onCancelEdit={handleCancelEdit}
        onSaveEdit={handleSaveEdit}
        onTypingStart={() => startTyping(chat._id)}
        onTypingStop={() => stopTyping(chat._id)}
      />
    </div>
  );
};

export default ChatWindow;
