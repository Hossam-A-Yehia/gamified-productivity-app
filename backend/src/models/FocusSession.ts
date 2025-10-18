import mongoose, { Document, Schema } from 'mongoose';

export interface IFocusSession extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'pomodoro' | 'custom';
  duration: number; // planned duration in minutes
  actualDuration: number; // actual duration in minutes
  breakDuration: number; // break duration in minutes
  completed: boolean;
  interruptions: number;
  taskId?: mongoose.Types.ObjectId; // optional linked task
  xpEarned: number;
  productivity: number; // calculated productivity score (0-100)
  startTime: Date;
  endTime?: Date;
  pausedTime: number; // total paused time in minutes
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const focusSessionSchema = new Schema<IFocusSession>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['pomodoro', 'custom'],
    required: true,
    default: 'pomodoro'
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
    max: 480 // max 8 hours
  },
  actualDuration: {
    type: Number,
    default: 0,
    min: 0
  },
  breakDuration: {
    type: Number,
    default: 5,
    min: 0,
    max: 60
  },
  completed: {
    type: Boolean,
    default: false
  },
  interruptions: {
    type: Number,
    default: 0,
    min: 0
  },
  taskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
    required: false
  },
  xpEarned: {
    type: Number,
    default: 0,
    min: 0
  },
  productivity: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: false
  },
  pausedTime: {
    type: Number,
    default: 0,
    min: 0
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Indexes for performance
focusSessionSchema.index({ userId: 1, createdAt: -1 });
focusSessionSchema.index({ userId: 1, completed: 1 });
focusSessionSchema.index({ startTime: 1 });

// Virtual for session efficiency
focusSessionSchema.virtual('efficiency').get(function() {
  if (this.duration === 0) return 0;
  return Math.round((this.actualDuration / this.duration) * 100);
});

// Calculate productivity score before saving
focusSessionSchema.pre('save', function(next) {
  if (this.completed && this.actualDuration > 0) {
    // Productivity calculation based on:
    // - Completion rate (actualDuration / duration)
    // - Interruption penalty
    // - Pause time penalty
    
    const completionRate = Math.min(this.actualDuration / this.duration, 1);
    const interruptionPenalty = Math.max(0, 1 - (this.interruptions * 0.1));
    const pausePenalty = Math.max(0, 1 - (this.pausedTime / this.duration * 0.5));
    
    this.productivity = Math.round(completionRate * interruptionPenalty * pausePenalty * 100);
  }
  next();
});

export const FocusSession = mongoose.model<IFocusSession>('FocusSession', focusSessionSchema);
