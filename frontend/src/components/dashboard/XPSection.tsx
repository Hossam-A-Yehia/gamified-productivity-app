import React from 'react';
import { motion } from 'framer-motion';
import { XPBar } from '../gamification/XPBar';

interface XPSectionProps {
  currentXP: number;
}

const AnimatedOrb = ({ className, duration, initial, animate }: any) => (
  <motion.div
    className={`absolute rounded-full mix-blend-overlay filter blur-3xl opacity-40 ${className}`}
    initial={initial}
    animate={animate}
    transition={{ duration, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
  />
);

export const XPSection: React.FC<XPSectionProps> = ({ currentXP }) => {
  const levelXP = 1000;
  const currentLevelXP = currentXP % levelXP;
  const progress = (currentLevelXP / levelXP) * 100;

  const getMotivationalMessage = () => {
    if (progress > 80) return { msg: "Almost there! Keep pushing!", emoji: '🔥' };
    if (progress > 50) return { msg: "Great progress! You're on a roll!", emoji: '🚀' };
    if (progress > 20) return { msg: "Keep up the great work!", emoji: '💪' };
    return { msg: "Every step counts. Let's go!", emoji: '🌱' };
  };

  const motivational = getMotivationalMessage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, type: 'spring' }}
      className="relative overflow-hidden bg-slate-900/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 p-8"
    >
      <AnimatedOrb className="w-72 h-72 bg-indigo-500" duration={15} initial={{ x: -100, y: -50 }} animate={{ x: 100, y: 50, scale: 1.2 }} />
      <AnimatedOrb className="w-64 h-64 bg-purple-500" duration={12} initial={{ x: 200, y: 100 }} animate={{ x: 0, y: -100, scale: 0.8 }} />
      <AnimatedOrb className="w-56 h-56 bg-pink-500" duration={18} initial={{ x: 50, y: 150 }} animate={{ x: -150, y: -50, scale: 1.1 }} />

      <div className="relative z-10">
        <div className="text-center mb-8">
          <motion.h3
            className="text-3xl md:text-4xl font-black text-white mb-2 flex items-center justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            Level Progression
            <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
              🚀
            </motion.span>
          </motion.h3>
          <motion.p
            className="text-slate-300 text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            {motivational.msg} <span className="inline-block ml-1">{motivational.emoji}</span>
          </motion.p>
        </div>

        <div className="relative mb-6">
          <XPBar currentXP={currentXP} />
          <motion.div
            className="absolute -top-1 text-center font-bold text-white bg-gradient-to-r from-sky-400 to-cyan-300 rounded-full px-3 py-1 text-xs shadow-lg"
            style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.8, type: 'spring' }}
          >
            {Math.floor(progress)}%
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-white">
          <StatCard value={currentXP.toLocaleString()} label="Total XP" delay={0.9} />
          <StatCard value={currentLevelXP.toLocaleString()} label="Current Level XP" delay={1.0} />
          <StatCard value={(levelXP - currentLevelXP).toLocaleString()} label="XP Needed for Next Level" delay={1.1} />
        </div>
      </div>
    </motion.div>
  );
};

const StatCard = ({ value, label, delay }: { value: string; label: string; delay: number }) => (
  <motion.div
    className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300 mb-1">{value}</p>
    <p className="text-xs text-slate-300 uppercase tracking-wider">{label}</p>
  </motion.div>
);
