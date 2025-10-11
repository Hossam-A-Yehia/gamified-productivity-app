import { toast } from 'sonner';

// Custom toast configurations for different types of actions
export const showToast = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 3000,
    });
  },

  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 5000,
    });
  },

  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 4000,
    });
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 4000,
    });
  },

  loading: (message: string) => {
    return toast.loading(message);
  },

  promise: <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
    });
  },

  // Dashboard-specific toasts
  taskCreated: (taskName: string) => {
    toast.success('Task Created! 🎯', {
      description: `"${taskName}" has been added to your tasks`,
      duration: 3000,
    });
  },

  taskCompleted: (taskName: string, xpGained: number, coinsGained: number) => {
    toast.success('Task Completed! 🏆', {
      description: `"${taskName}" completed! +${xpGained} XP, +${coinsGained} coins`,
      duration: 4000,
    });
  },

  taskDeleted: (taskName: string) => {
    toast.info('Task Deleted', {
      description: `"${taskName}" has been removed`,
      duration: 2000,
    });
  },

  taskUpdated: (taskName: string) => {
    toast.success('Task Updated ✏️', {
      description: `"${taskName}" has been updated`,
      duration: 2000,
    });
  },

  levelUp: (newLevel: number) => {
    toast.success('Level Up! 🚀', {
      description: `Congratulations! You've reached level ${newLevel}`,
      duration: 5000,
    });
  },

  streakBonus: (streakCount: number) => {
    toast.success('Streak Bonus! 🔥', {
      description: `${streakCount} day streak maintained! Keep it up!`,
      duration: 3000,
    });
  },

  achievementUnlocked: (achievementName: string) => {
    toast.success('Achievement Unlocked! 🏅', {
      description: `You've earned: ${achievementName}`,
      duration: 5000,
    });
  },

  // Auth toasts
  loginSuccess: (userName: string) => {
    toast.success('Welcome back! 👋', {
      description: `Good to see you again, ${userName}`,
      duration: 3000,
    });
  },

  logoutSuccess: () => {
    toast.info('Logged out successfully', {
      description: 'See you next time!',
      duration: 2000,
    });
  },

  registrationSuccess: (email: string) => {
    toast.success('Registration Successful! 🎉', {
      description: `Welcome aboard! Check ${email} for verification`,
      duration: 4000,
    });
  },

  // Generic action toasts
  saveSuccess: () => {
    toast.success('Changes saved successfully ✓');
  },

  saveError: () => {
    toast.error('Failed to save changes', {
      description: 'Please try again or contact support',
    });
  },

  networkError: () => {
    toast.error('Network Error', {
      description: 'Please check your internet connection',
      duration: 5000,
    });
  },

  // Dismiss all toasts
  dismiss: () => {
    toast.dismiss();
  },
};

export { toast };
