import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Smile, Paperclip, X, Reply, Edit } from 'lucide-react';
import { useChatOperations } from '../../hooks/useChat';
import { chatService } from '../../services/chatService';
import type { Message, SendMessageRequest } from '../../types/chat';
import { CHAT_CONSTANTS } from '../../types/chat';

interface MessageInputProps {
  chatId: string;
  replyingTo?: Message | null;
  onCancelReply?: () => void;
  editingMessage?: Message | null;
  onCancelEdit?: () => void;
  onSaveEdit?: () => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  className?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  chatId,
  replyingTo,
  onCancelReply,
  editingMessage,
  onCancelEdit,
  onSaveEdit,
  onTypingStart,
  onTypingStop,
  className = ''
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, editMessage } = useChatOperations();
  
  const isEditing = !!editingMessage;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Focus textarea when replying or editing
  useEffect(() => {
    if ((replyingTo || editingMessage) && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyingTo, editingMessage]);

  // Populate message content when editing
  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.content);
    } else if (!replyingTo) {
      setMessage('');
    }
  }, [editingMessage, replyingTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    const validation = chatService.validateMessageContent(trimmedMessage);
    if (!validation.isValid) {
      // Handle validation error (could show toast or inline error)
      console.error(validation.error);
      return;
    }

    try {
      if (isEditing && editingMessage) {
        // Edit existing message
        await editMessage.mutateAsync({
          messageId: editingMessage._id,
          content: trimmedMessage
        });
        onSaveEdit?.();
      } else {
        // Send new message
        const messageData: SendMessageRequest = {
          chatId,
          content: trimmedMessage,
          type: 'text',
          replyTo: replyingTo?._id
        };
        await sendMessage.mutateAsync(messageData);
        onCancelReply?.();
      }
      
      setMessage('');
      setIsTyping(false);
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    
    if (value.length > 0 && !isTyping) {
      setIsTyping(true);
      onTypingStart?.();
    } else if (value.length === 0 && isTyping) {
      setIsTyping(false);
      onTypingStop?.();
    }
  };

  const isMessageValid = message.trim().length > 0 && message.length <= CHAT_CONSTANTS.MAX_MESSAGE_LENGTH;
  const characterCount = message.length;
  const isNearLimit = characterCount > CHAT_CONSTANTS.MAX_MESSAGE_LENGTH * 0.8;

  return (
    <div className={`border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${className}`}>
      {/* Edit indicator */}
      {editingMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-700"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Edit className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
                Editing message
              </span>
            </div>
            <button
              onClick={onCancelEdit}
              className="p-1 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Reply indicator */}
      {replyingTo && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Reply className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Replying to <span className="font-medium">{replyingTo.sender.name}</span>
              </span>
            </div>
            <button
              onClick={onCancelReply}
              className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
            {replyingTo.content}
          </p>
        </motion.div>
      )}

      {/* Message input */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-end space-x-3">
          {/* Attachment button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </motion.button>

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={isEditing ? "Edit your message..." : "Type a message..."}
              rows={1}
              className="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32 overflow-y-auto"
              style={{ minHeight: '40px' }}
              disabled={sendMessage.isPending}
            />
            
            {/* Emoji button */}
            <button
              type="button"
              className="absolute right-3 bottom-2 p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              title="Add emoji"
            >
              <Smile className="w-4 h-4" />
            </button>
            
            {/* Character count */}
            {isNearLimit && (
              <div className={`absolute -top-6 right-0 text-xs ${
                characterCount > CHAT_CONSTANTS.MAX_MESSAGE_LENGTH 
                  ? 'text-red-500' 
                  : 'text-yellow-500'
              }`}>
                {characterCount}/{CHAT_CONSTANTS.MAX_MESSAGE_LENGTH}
              </div>
            )}
          </div>

          {/* Send button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!isMessageValid || sendMessage.isPending || editMessage.isPending}
            className={`p-2 rounded-lg transition-colors ${
              isMessageValid && !sendMessage.isPending && !editMessage.isPending
                ? (isEditing ? 'bg-yellow-600 text-white hover:bg-yellow-700' : 'bg-blue-600 text-white hover:bg-blue-700')
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
            title={isEditing ? "Save changes" : "Send message"}
          >
            {(sendMessage.isPending || editMessage.isPending) ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isEditing ? (
              <Edit className="w-5 h-5" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </motion.button>
        </div>

        {/* Typing indicator placeholder */}
        {isTyping && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Typing...
          </div>
        )}
      </form>
    </div>
  );
};

export default MessageInput;
