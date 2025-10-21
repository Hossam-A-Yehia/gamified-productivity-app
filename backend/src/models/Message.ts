import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  chatId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    imageUrl?: string;
    thumbnailUrl?: string;
    width?: number;
    height?: number;
    duration?: number; // For audio/video files
  };
  replyTo?: mongoose.Types.ObjectId; // Reference to another message
  reactions?: {
    emoji: string;
    users: mongoose.Types.ObjectId[];
    count: number;
  }[];
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;
  readBy: {
    user: mongoose.Types.ObjectId;
    readAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  chatId: {
    type: Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
    index: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000,
    trim: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text',
    required: true
  },
  metadata: {
    fileName: {
      type: String,
      maxlength: 255
    },
    fileSize: {
      type: Number,
      min: 0
    },
    mimeType: {
      type: String,
      maxlength: 100
    },
    imageUrl: {
      type: String,
      maxlength: 500
    },
    thumbnailUrl: {
      type: String,
      maxlength: 500
    },
    width: {
      type: Number,
      min: 0
    },
    height: {
      type: Number,
      min: 0
    },
    duration: {
      type: Number,
      min: 0
    }
  },
  replyTo: {
    type: Schema.Types.ObjectId,
    ref: 'Message'
  },
  reactions: [{
    emoji: {
      type: String,
      required: true,
      maxlength: 10
    },
    users: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    count: {
      type: Number,
      default: 0,
      min: 0
    }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: {
    type: Date
  },
  deletedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  readBy: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    readAt: {
      type: Date,
      default: Date.now,
      required: true
    }
  }]
}, {
  timestamps: true,
  collection: 'messages'
});

// Compound indexes for efficient queries
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ chatId: 1, isDeleted: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ replyTo: 1 });

// Text search index for message content
messageSchema.index({ content: 'text' });

// Virtual for formatted creation time
messageSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now.getTime() - this.createdAt.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
});

// Method to add reaction
messageSchema.methods.addReaction = function(emoji: string, userId: string) {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  let reaction = this.reactions.find((r: any) => r.emoji === emoji);
  
  if (!reaction) {
    reaction = {
      emoji,
      users: [userObjectId],
      count: 1
    };
    this.reactions.push(reaction);
  } else {
    const userIndex = reaction.users.findIndex((id: mongoose.Types.ObjectId) => 
      id.equals(userObjectId)
    );
    
    if (userIndex === -1) {
      reaction.users.push(userObjectId);
      reaction.count++;
    } else {
      reaction.users.splice(userIndex, 1);
      reaction.count--;
      
      if (reaction.count === 0) {
        this.reactions = this.reactions.filter((r: any) => r.emoji !== emoji);
      }
    }
  }
  
  return this.save();
};

// Method to mark as read by user
messageSchema.methods.markAsRead = function(userId: string) {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const existingRead = this.readBy.find((read: any) => 
    read.user.equals(userObjectId)
  );
  
  if (!existingRead) {
    this.readBy.push({
      user: userObjectId,
      readAt: new Date()
    });
  }
  
  return this.save();
};

// Method to edit message
messageSchema.methods.editContent = function(newContent: string) {
  this.content = newContent;
  this.isEdited = true;
  this.editedAt = new Date();
  return this.save();
};

// Method to soft delete message
messageSchema.methods.softDelete = function(deletedBy: string) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = new mongoose.Types.ObjectId(deletedBy);
  return this.save();
};

// Static method to get chat messages with pagination
messageSchema.statics.getChatMessages = async function(
  this: any,
  chatId: string, 
  page: number = 1, 
  limit: number = 50,
  beforeMessageId?: string
) {
  const query: any = { 
    chatId: new mongoose.Types.ObjectId(chatId),
    isDeleted: false
  };
  
  // For pagination with "load more" functionality
  if (beforeMessageId) {
    const beforeMessage = await this.findById(beforeMessageId);
    if (beforeMessage) {
      query.createdAt = { $lt: beforeMessage.createdAt };
    }
  }
  
  const messages = await this.find(query)
    .populate('sender', 'name avatarUrl')
    .populate('replyTo', 'content sender type')
    .populate('readBy.user', 'name')
    .sort({ createdAt: -1 })
    .limit(limit);
  
  // Reverse to show oldest first
  return messages.reverse();
};

// Static method to search messages
messageSchema.statics.searchMessages = async function(
  this: any,
  chatId: string,
  searchTerm: string,
  limit: number = 20
) {
  return await this.find({
    chatId: new mongoose.Types.ObjectId(chatId),
    isDeleted: false,
    $text: { $search: searchTerm }
  })
  .populate('sender', 'name avatarUrl')
  .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
  .limit(limit);
};

export default mongoose.model<IMessage>('Message', messageSchema);
