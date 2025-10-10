import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  category: 'work' | 'personal' | 'health' | 'learning' | 'other';
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  deadline?: Date;
  recurrence: {
    type: 'none' | 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: Date;
  };
  xpValue: number;
  coinsValue: number;
  tags: string[];
  completedAt?: Date;
  estimatedDuration?: number; // in minutes
  actualDuration?: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    category: {
      type: String,
      enum: ['work', 'personal', 'health', 'learning', 'other'],
      required: true,
      default: 'other',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      required: true,
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
      default: 'medium',
    },
    deadline: {
      type: Date,
    },
    recurrence: {
      type: {
        type: String,
        enum: ['none', 'daily', 'weekly', 'monthly'],
        default: 'none',
      },
      interval: {
        type: Number,
        default: 1,
        min: 1,
      },
      endDate: {
        type: Date,
      },
    },
    xpValue: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    coinsValue: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: 50,
    }],
    completedAt: {
      type: Date,
    },
    estimatedDuration: {
      type: Number,
      min: 1,
    },
    actualDuration: {
      type: Number,
      min: 1,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
TaskSchema.index({ userId: 1, status: 1 });
TaskSchema.index({ userId: 1, category: 1 });
TaskSchema.index({ userId: 1, createdAt: -1 });
TaskSchema.index({ deadline: 1 });

// Virtual for checking if task is overdue
TaskSchema.virtual('isOverdue').get(function() {
  if (!this.deadline || this.status === 'completed') return false;
  return new Date() > this.deadline;
});

// Virtual for calculating completion percentage (for recurring tasks)
TaskSchema.virtual('completionRate').get(function() {
  // This can be extended for recurring task tracking
  return this.status === 'completed' ? 100 : 0;
});

// Pre-save middleware to calculate XP and coins based on difficulty and category
TaskSchema.pre('save', function(next) {
  if (this.isNew || this.isModified(['difficulty', 'category'])) {
    // Base XP calculation
    let baseXP = 10;
    
    // Difficulty multipliers
    const difficultyMultipliers = {
      easy: 1.0,
      medium: 1.5,
      hard: 2.0
    };
    
    // Category bonuses
    const categoryBonuses = {
      work: 2,
      health: 3,
      learning: 5,
      personal: 1,
      other: 0
    };
    
    // Calculate XP value
    this.xpValue = Math.floor(
      baseXP * difficultyMultipliers[this.difficulty] + categoryBonuses[this.category]
    );
    
    // Calculate coins (typically 1/5 of XP)
    this.coinsValue = Math.floor(this.xpValue / 5);
  }
  
  next();
});


export const Task = mongoose.model<ITask>('Task', TaskSchema);
