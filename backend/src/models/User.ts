import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  googleId?: string;
  level: number;
  xp: number;
  coins: number;
  streak: number;
  lastActiveDate: Date;
  avatarUrl?: string;
  avatarCustomization: {
    skin?: string;
    accessories: string[];
    background?: string;
  };
  achievements: string[];
  friends: mongoose.Types.ObjectId[];
  friendRequests: {
    sent: mongoose.Types.ObjectId[];
    received: mongoose.Types.ObjectId[];
  };
  settings: {
    notifications: {
      email: boolean;
      push: boolean;
      inApp: boolean;
    };
    theme: 'light' | 'dark' | 'auto';
    language: string;
    privacy: {
      profilePublic: boolean;
      showInLeaderboard: boolean;
    };
  };
  stats: {
    totalTasksCompleted: number;
    totalFocusTime: number;
    longestStreak: number;
    averageTasksPerDay: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function(this: IUser) {
      return !this.googleId; // Password required only if not using Google OAuth
    }
  },
  googleId: {
    type: String,
    sparse: true
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  xp: {
    type: Number,
    default: 0,
    min: 0
  },
  coins: {
    type: Number,
    default: 0,
    min: 0
  },
  streak: {
    type: Number,
    default: 0,
    min: 0
  },
  lastActiveDate: {
    type: Date,
    default: Date.now
  },
  avatarUrl: {
    type: String,
    default: null
  },
  avatarCustomization: {
    skin: {
      type: String,
      default: 'default'
    },
    accessories: [{
      type: String
    }],
    background: {
      type: String,
      default: 'default'
    }
  },
  achievements: [{
    type: String
  }],
  friends: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  friendRequests: {
    sent: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    received: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  settings: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      inApp: {
        type: Boolean,
        default: true
      }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    language: {
      type: String,
      default: 'en'
    },
    privacy: {
      profilePublic: {
        type: Boolean,
        default: true
      },
      showInLeaderboard: {
        type: Boolean,
        default: true
      }
    }
  },
  stats: {
    totalTasksCompleted: {
      type: Number,
      default: 0,
      min: 0
    },
    totalFocusTime: {
      type: Number,
      default: 0,
      min: 0
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0
    },
    averageTasksPerDay: {
      type: Number,
      default: 0,
      min: 0
    }
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: {
    transform: function(doc: any, ret: any) {
      delete ret.password; // Never return password in JSON
      return ret;
    }
  }
});

// Index for performance
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ level: -1 });
userSchema.index({ xp: -1 });

export default mongoose.model<IUser>("User", userSchema);
