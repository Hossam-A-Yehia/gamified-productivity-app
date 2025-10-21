import mongoose, { Schema, Document } from 'mongoose';

export interface IChat extends Document {
  participants: mongoose.Types.ObjectId[];
  type: 'direct' | 'group';
  name?: string; // For group chats
  description?: string; // For group chats
  avatar?: string; // For group chats
  lastMessage?: {
    content: string;
    sender: mongoose.Types.ObjectId;
    timestamp: Date;
    type: 'text' | 'image' | 'file' | 'system';
  };
  unreadCounts: Map<string, number>; // userId -> unread count
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  addParticipant(userId: string): Promise<IChat>;
  removeParticipant(userId: string): Promise<IChat>;
  updateLastMessage(message: any): Promise<IChat>;
  markAsRead(userId: string): Promise<IChat>;
  ensureUnreadCounts(): void;
}

const chatSchema = new Schema<IChat>({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  type: {
    type: String,
    enum: ['direct', 'group'],
    default: 'direct',
    required: true
  },
  name: {
    type: String,
    maxlength: 100,
    trim: true
  },
  description: {
    type: String,
    maxlength: 500,
    trim: true
  },
  avatar: {
    type: String,
    maxlength: 500
  },
  lastMessage: {
    content: {
      type: String,
      maxlength: 1000
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text'
    }
  },
  unreadCounts: {
    type: Map,
    of: Number,
    default: () => new Map()
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  collection: 'chats'
});

// Indexes for efficient queries
chatSchema.index({ participants: 1 });
chatSchema.index({ 'lastMessage.timestamp': -1 });
chatSchema.index({ createdAt: -1 });
chatSchema.index({ participants: 1, type: 1 });

// Compound index for finding direct chats between two users
chatSchema.index({ 
  participants: 1, 
  type: 1 
}, { 
  partialFilterExpression: { type: 'direct' } 
});

// Virtual for participant count
chatSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

// Method to add participant
chatSchema.methods.addParticipant = function(userId: string) {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  if (!this.participants.includes(userObjectId)) {
    this.participants.push(userObjectId);
    this.unreadCounts.set(userId, 0);
  }
  return this.save();
};

// Method to remove participant
chatSchema.methods.removeParticipant = function(userId: string) {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  this.participants = this.participants.filter(
    (id: mongoose.Types.ObjectId) => !id.equals(userObjectId)
  );
  this.unreadCounts.delete(userId);
  return this.save();
};

// Method to update last message
chatSchema.methods.updateLastMessage = function(message: any) {
  this.ensureUnreadCounts();
  
  this.lastMessage = {
    content: message.content,
    sender: message.sender,
    timestamp: message.createdAt || new Date(),
    type: message.type || 'text'
  };
  
  // Update unread counts for all participants except sender
  this.participants.forEach((participantId: mongoose.Types.ObjectId) => {
    const participantIdStr = participantId.toString();
    const senderIdStr = message.sender.toString();
    
    if (participantIdStr !== senderIdStr) {
      const currentCount = this.unreadCounts.get(participantIdStr) || 0;
      this.unreadCounts.set(participantIdStr, currentCount + 1);
    }
  });
  
  return this.save();
};

// Method to ensure unreadCounts is initialized
chatSchema.methods.ensureUnreadCounts = function() {
  if (!this.unreadCounts || typeof this.unreadCounts.set !== 'function') {
    this.unreadCounts = new Map();
    // Only initialize for existing participants to avoid infinite loops
    if (this.participants && Array.isArray(this.participants)) {
      this.participants.forEach((participantId: mongoose.Types.ObjectId) => {
        const participantIdStr = participantId.toString();
        if (!this.unreadCounts.has(participantIdStr)) {
          this.unreadCounts.set(participantIdStr, 0);
        }
      });
    }
  }
};

// Method to mark messages as read
chatSchema.methods.markAsRead = function(userId: string) {
  try {
    this.ensureUnreadCounts();
    this.unreadCounts.set(userId, 0);
    return this.save();
  } catch (error) {
    console.error('Error in markAsRead:', error);
    // Fallback: just save without unreadCounts update
    return this.save();
  }
};

// Static method to find or create direct chat
chatSchema.statics.findOrCreateDirectChat = async function(this: any, user1Id: string, user2Id: string) {
  const participants = [
    new mongoose.Types.ObjectId(user1Id),
    new mongoose.Types.ObjectId(user2Id)
  ].sort((a, b) => a.toString().localeCompare(b.toString()));

  let chat = await this.findOne({
    type: 'direct',
    participants: { $all: participants, $size: 2 }
  });

  if (!chat) {
    chat = new this({
      participants,
      type: 'direct',
      createdBy: participants[0],
      unreadCounts: new Map([
        [user1Id, 0],
        [user2Id, 0]
      ])
    });
    await chat.save();
  }

  return chat;
};

// Static method to get user's chats
chatSchema.statics.getUserChats = async function(this: any, userId: string, page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;
  
  const chats = await this.find({
    participants: new mongoose.Types.ObjectId(userId),
    isActive: true
  })
  .populate('participants', 'name avatarUrl lastActiveDate')
  .populate('lastMessage.sender', 'name avatarUrl')
  .sort({ 'lastMessage.timestamp': -1, updatedAt: -1 })
  .skip(skip)
  .limit(limit);

  const total = await this.countDocuments({
    participants: new mongoose.Types.ObjectId(userId),
    isActive: true
  });

  return {
    chats,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
};

export default mongoose.model<IChat>('Chat', chatSchema);
