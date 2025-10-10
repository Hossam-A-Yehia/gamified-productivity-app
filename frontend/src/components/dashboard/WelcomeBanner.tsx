import React from 'react';
import { motion } from 'framer-motion';

interface WelcomeBannerProps {
  userName: string;
  completedTasks: number;
  streak: number;
  onCreateTask: () => void;
}

const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { greeting: 'Good Morning', emoji: '🌅', gradient: 'from-orange-400 via-pink-500 to-purple-600' };
  if (hour < 18) return { greeting: 'Good Afternoon', emoji: '☀️', gradient: 'from-blue-400 via-cyan-500 to-teal-600' };
  return { greeting: 'Good Evening', emoji: '🌙', gradient: 'from-indigo-500 via-purple-600 to-pink-600' };
};

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  userName,
  completedTasks,
  streak,
  onCreateTask
}) => {
  const timeGreeting = getTimeBasedGreeting();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${timeGreeting.gradient} p-8 md:p-12 text-white shadow-2xl`}
    >
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24 animate-pulse delay-1000"></div>
      
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4 mb-6"
        >
          <motion.span 
            className="text-6xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            {timeGreeting.emoji}
          </motion.span>
          <div>
            <h2 className="text-4xl md:text-5xl font-black mb-2">
              {timeGreeting.greeting}, {userName}!
            </h2>
            <p className="text-xl md:text-2xl font-light opacity-90">
              Ready to conquer your goals today?
            </p>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05, rotate: 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCreateTask}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg border border-white/20 transition-all duration-200"
          >
            <span className="mr-2">✨</span>
            Create New Task
          </motion.button>
          <div className="flex items-center space-x-6 text-white/90">
            <div className="text-center">
              <div className="text-2xl font-bold">{completedTasks}</div>
              <div className="text-sm opacity-75">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{streak}</div>
              <div className="text-sm opacity-75">Day Streak</div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
