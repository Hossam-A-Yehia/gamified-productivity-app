export interface ChatParticipant {
  _id: string;
  name: string;
  avatarUrl?: string;
  isOnline: boolean;
}

export interface LastMessage {
  content: string;
  sender: string;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'system';
}

export interface Chat {
  _id: string;
  participants: ChatParticipant[];
  type: 'direct' | 'group';
  name?: string;
  description?: string;
  avatar?: string;
  lastMessage?: LastMessage;
  unreadCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MessageSender {
  _id: string;
  name: string;
  avatarUrl?: string;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: {
    _id: string;
    name: string;
  }[];
}

export interface MessageReadBy {
  user: {
    _id: string;
    name: string;
  };
  readAt: string;
}

export interface MessageReplyTo {
  _id: string;
  content: string;
  sender: MessageSender;
  type: string;
}

export interface MessageMetadata {
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number;
}

export interface Message {
  _id: string;
  chatId: string;
  sender: MessageSender;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  metadata?: MessageMetadata;
  replyTo?: MessageReplyTo;
  reactions: MessageReaction[];
  isEdited: boolean;
  editedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  readBy: MessageReadBy[];
  createdAt: string;
  timeAgo: string;
}

export interface ChatResponse {
  chats: Chat[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CreateDirectChatRequest {
  friendId: string;
}

export interface CreateGroupChatRequest {
  participants: string[];
  name: string;
  description?: string;
}

export interface SendMessageRequest {
  chatId: string;
  content: string;
  type?: 'text' | 'image' | 'file' | 'system';
  replyTo?: string;
  metadata?: MessageMetadata;
}

export interface EditMessageRequest {
  content: string;
}

export interface AddReactionRequest {
  emoji: string;
}

export interface ChatFilters {
  search?: string;
  type?: 'direct' | 'group';
  hasUnread?: boolean;
}

export interface MessageFilters {
  search?: string;
  type?: 'text' | 'image' | 'file' | 'system';
  sender?: string;
  beforeMessageId?: string;
}

// Socket event types
export interface ChatSocketEvents {
  'message-received': {
    message: Message;
    chatId: string;
  };
  'message-edited': {
    message: Message;
  };
  'message-deleted': {
    messageId: string;
    chatId: string;
  };
  'message-reaction-updated': {
    message: Message;
  };
  'chat-created': {
    chat: Chat;
  };
  'chat-unread-updated': {
    chatId: string;
    unreadCount: number;
  };
  'chat-marked-read': {
    chatId: string;
  };
  'user-typing': {
    chatId: string;
    userId: string;
    userName: string;
    isTyping: boolean;
  };
}

// UI State types
export interface ChatUIState {
  selectedChatId: string | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  filters: ChatFilters;
}

export interface MessageUIState {
  messages: Message[];
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  replyingTo: Message | null;
  editingMessage: Message | null;
  typingUsers: {
    userId: string;
    userName: string;
  }[];
}

// Chat list item for UI
export interface ChatListItem extends Chat {
  displayName: string;
  displayAvatar?: string;
  lastMessagePreview: string;
  isOnline?: boolean;
}

// Message group for UI (messages grouped by date/sender)
export interface MessageGroup {
  date: string;
  messages: Message[];
}

// Typing indicator
export interface TypingIndicator {
  chatId: string;
  users: {
    userId: string;
    userName: string;
  }[];
}

// Chat constants
export const CHAT_CONSTANTS = {
  MAX_MESSAGE_LENGTH: 2000,
  MAX_GROUP_NAME_LENGTH: 100,
  MAX_GROUP_DESCRIPTION_LENGTH: 500,
  MAX_PARTICIPANTS: 50,
  MESSAGES_PER_PAGE: 50,
  CHATS_PER_PAGE: 20,
  TYPING_TIMEOUT: 3000,
  MESSAGE_REACTIONS: ['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🔥'],
} as const;

export type ChatConstantKey = keyof typeof CHAT_CONSTANTS;
export type MessageReactionEmoji = typeof CHAT_CONSTANTS.MESSAGE_REACTIONS[number];
