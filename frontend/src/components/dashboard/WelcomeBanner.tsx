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
  const baseTheme = {
    gradient: 'from-slate-900 via-gray-900 to-black',
    accentColor: 'from-sky-500 to-cyan-400',
  };

  if (hour < 12) return {
    ...baseTheme,
    greeting: 'Good Morning',
    emoji: '🌅',
    particles: '🌟',
  };
  if (hour < 18) return {
    ...baseTheme,
    greeting: 'Good Afternoon',
    emoji: '☀️',
    particles: '💫',
  };
  return {
    ...baseTheme,
    greeting: 'Good Evening',
    emoji: '🌙',
    particles: '✨',
  };
};

const FloatingParticle: React.FC<{ delay: number; duration: number; emoji: string }> = ({ delay, duration, emoji }) => (
  <motion.div
    className="absolute text-2xl opacity-30"
    initial={{ y: 100, x: Math.random() * 400, opacity: 0 }}
    animate={{ 
      y: -100, 
      x: Math.random() * 400,
      opacity: [0, 0.6, 0],
      rotate: [0, 360]
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      repeatDelay: Math.random() * 3,
      ease: "easeOut"
    }}
  >
    {emoji}
  </motion.div>
);

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  userName,
  completedTasks,
  streak,
  onCreateTask
}) => {
  const timeGreeting = getTimeBasedGreeting();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${timeGreeting.gradient} p-6 md:p-10 text-white shadow-2xl border border-white/10`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-white/10"></div>
      
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <FloatingParticle
            key={i}
            delay={i * 0.8}
            duration={4 + Math.random() * 2}
            emoji={timeGreeting.particles}
          />
        ))}
      </div>

      <motion.div
        className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-20"
        style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))` }}
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: "linear" 
        }}
      />

      <motion.div
        className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full opacity-15"
        style={{ background: `linear-gradient(45deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))` }}
        animate={{ 
          rotate: [360, 0],
          scale: [1, 0.9, 1]
        }}
        transition={{ 
          duration: 15, 
          repeat: Infinity, 
          ease: "linear" 
        }}
      />
      
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
        >
          <div className="flex items-center space-x-4 mb-6 md:mb-0">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.1 }}
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                repeatDelay: 2 
              }}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${timeGreeting.accentColor} flex items-center justify-center shadow-2xl border border-white/20`}>
                <span className="text-3xl">{timeGreeting.emoji}</span>
              </div>
              <motion.div
                className="absolute -inset-2 rounded-2xl border-2 border-white/30"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity 
                }}
              />
            </motion.div>
            
            <div>
              <motion.h2 
                className="text-3xl md:text-4xl font-black mb-1 bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {timeGreeting.greeting}
              </motion.h2>
              <motion.h3 
                className="text-2xl md:text-3xl font-bold mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                {userName}! 👋
              </motion.h3>
              <motion.p 
                className="text-base md:text-lg font-medium opacity-80"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                Ready to level up your productivity?
              </motion.p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1, type: "spring" }}
            className="flex flex-col space-y-4"
          >
            <div className="flex space-x-4">
              <motion.div 
                className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <motion.div 
                  className="text-2xl font-black mb-1"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                >
                  {completedTasks}
                </motion.div>
                <div className="text-sm font-medium opacity-80">Tasks Done</div>
              </motion.div>
              
              <motion.div 
                className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <motion.div 
                  className="text-2xl font-black mb-1 flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5 }}
                >
                  {streak} 🔥
                </motion.div>
                <div className="text-sm font-medium opacity-80">Day Streak</div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="flex flex-wrap gap-4 items-center"
        >
          <motion.button
            whileHover={{ 
              scale: 1.05, 
              rotate: 1,
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={onCreateTask}
            className="cursor-pointer group relative bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-6 py-3 rounded-xl font-bold text-base shadow-lg border border-white/30 transition-all duration-300 overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.6 }}
            />
            <span className="relative flex items-center space-x-3">
              <motion.span
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                ✨
              </motion.span>
              <span>Create New Task</span>
              <motion.span
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                →
              </motion.span>
            </span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.5 }}
            className="hidden md:flex items-center space-x-4 text-white/80"
          >
            <div className="w-px h-8 bg-white/30"></div>
            <div className="text-sm font-medium">
              Keep the momentum going! 🚀
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};
