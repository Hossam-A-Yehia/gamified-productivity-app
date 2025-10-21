import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Reply, Edit, Trash2, Copy } from 'lucide-react';
import { useChatOperations } from '../../hooks/useChat';
import { chatService } from '../../services/chatService';
import { useAuth } from '../../hooks/useAuth';
import type { Message } from '../../types/chat';
import { CHAT_CONSTANTS } from '../../types/chat';

interface MessageBubbleProps {
  message: Message;
  isGrouped?: boolean;
  showAvatar?: boolean;
  onReply?: (message: Message) => void;
  onEdit?: (message: Message) => void;
  className?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isGrouped = false,
  showAvatar = true,
  onReply,
  onEdit,
  className = ''
}) => {
  const { user } = useAuth();
  const { addReaction, deleteMessage } = useChatOperations();
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const isOwnMessage = message.sender._id === user?.id;
  const canEdit = chatService.canEditMessage(message, user?.id || '');
  const canDelete = chatService.canDeleteMessage(message, user?.id || '');

  const handleReaction = async (emoji: string) => {
    try {
      await addReaction.mutateAsync({ messageId: message._id, emoji });
      setShowReactions(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this message?')) return;
    
    try {
      await deleteMessage.mutateAsync(message._id);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setShowActions(false);
  };

  const formatTime = (dateString: string) => {
    return chatService.formatMessageTime(dateString);
  };

  const renderReactions = () => {
    if (!message.reactions || message.reactions.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {message.reactions.map((reaction, index) => (
          <motion.button
            key={`${reaction.emoji}-${index}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleReaction(reaction.emoji)}
            className="flex items-center space-x-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <span>{reaction.emoji}</span>
            <span className="text-gray-600 dark:text-gray-400">{reaction.count}</span>
          </motion.button>
        ))}
      </div>
    );
  };

  const renderReplyTo = () => {
    if (!message.replyTo) return null;

    return (
      <div className="mb-2 p-2 border-l-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 rounded">
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
          {message.replyTo.sender.name}
        </div>
        <div className="text-sm text-gray-700 dark:text-gray-300 truncate">
          {message.replyTo.content}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative ${isOwnMessage ? 'ml-12' : 'mr-12'} ${className}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${isGrouped ? 'mt-1' : 'mt-4'}`}>
        {/* Avatar */}
        {!isOwnMessage && showAvatar && !isGrouped && (
          <div className="flex-shrink-0 mr-3">
            {message.sender.avatarUrl ? (
              <img
                src={message.sender.avatarUrl}
                alt={message.sender.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {message.sender.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Message content */}
        <div className={`max-w-xs lg:max-w-md ${!isOwnMessage && showAvatar && isGrouped ? 'ml-11' : ''}`}>
          {/* Sender name for group messages */}
          {!isOwnMessage && !isGrouped && (
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              {message.sender.name}
            </div>
          )}

          {/* Message bubble */}
          <div
            className={`relative px-4 py-2 rounded-2xl ${
              isOwnMessage
                ? 'bg-blue-600 text-white rounded-br-md'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
            }`}
          >
            {renderReplyTo()}
            
            <div className="break-words">
              {message.content}
            </div>

            {/* Message status and time */}
            <div className={`flex items-center justify-end mt-1 space-x-1 text-xs ${
              isOwnMessage ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {message.isEdited && (
                <span className="italic">edited</span>
              )}
              <span>{formatTime(message.createdAt)}</span>
              {isOwnMessage && (
                <span>{chatService.getMessageStatusIcon(message, user?.id || '')}</span>
              )}
            </div>
          </div>

          {/* Reactions */}
          {renderReactions()}
        </div>
      </div>

      {/* Message actions */}
      {showActions && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`absolute -top-10 ${isOwnMessage ? 'right-4' : 'left-4'} flex items-center space-x-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-1 z-10`}
        >
          {/* Reply */}
          <button
            onClick={() => onReply?.(message)}
            className="p-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            title="Reply"
          >
            <Reply className="w-4 h-4" />
          </button>

          {/* React */}
          <div className="relative">
            <button
              onClick={() => setShowReactions(!showReactions)}
              className="p-1 text-gray-500 hover:text-yellow-500 transition-colors"
              title="Add reaction"
            >
              😊
            </button>

            {/* Reaction picker */}
            {showReactions && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-2 flex space-x-1 z-20"
              >
                {CHAT_CONSTANTS.MESSAGE_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="p-1 text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            title="Copy message"
          >
            <Copy className="w-4 h-4" />
          </button>

          {/* Edit (own messages only) */}
          {canEdit && (
            <button
              onClick={() => onEdit?.(message)}
              className="p-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title="Edit message"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}

          {/* Delete (own messages only) */}
          {canDelete && (
            <button
              onClick={handleDelete}
              className="p-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Delete message"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default MessageBubble;
