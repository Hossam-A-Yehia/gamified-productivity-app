import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { XPBar } from '../gamification/XPBar';

interface XPSectionProps {
  currentXP: number;
}

const StaticOrb = ({ className }: { className: string }) => (
  <div className={`absolute rounded-full mix-blend-overlay filter blur-3xl opacity-20 ${className}`} />
);

export const XPSection: React.FC<XPSectionProps> = ({ currentXP }) => {
  const levelXP = 1000;
  const currentLevelXP = currentXP % levelXP;
  const progress = (currentLevelXP / levelXP) * 100;

  const motivational = useMemo(() => {
    if (progress > 80) return { msg: "Almost there! Keep pushing!", emoji: '🔥' };
    if (progress > 50) return { msg: "Great progress! You're on a roll!", emoji: '🚀' };
    if (progress > 20) return { msg: "Keep up the great work!", emoji: '💪' };
    return { msg: "Every step counts. Let's go!", emoji: '🌱' };
  }, [progress]);

  const stats = useMemo(() => [
    { value: currentXP.toLocaleString(), label: "Total XP" },
    { value: currentLevelXP.toLocaleString(), label: "Current Level XP" },
    { value: (levelXP - currentLevelXP).toLocaleString(), label: "XP Needed for Next Level" }
  ], [currentXP, currentLevelXP, levelXP]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, type: 'spring' }}
      className="relative overflow-hidden bg-slate-900/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 p-8"
    >
      <StaticOrb className="w-72 h-72 bg-indigo-500 -top-20 -left-20" />
      <StaticOrb className="w-64 h-64 bg-purple-500 -bottom-16 -right-16" />
      <StaticOrb className="w-56 h-56 bg-pink-500 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />

      <div className="relative z-10">
        <div className="text-center mb-8">
          <motion.h3
            className="text-3xl md:text-4xl font-black text-white mb-2 flex items-center justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            Level Progression
            <span>🚀</span>
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
          {stats.map((stat, index) => (
            <StatCard key={stat.label} value={stat.value} label={stat.label} delay={0.9 + index * 0.1} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const StatCard = ({ value, label, delay }: { value: string; label: string; delay: number }) => (
  <motion.div
    className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-colors duration-200"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    whileHover={{ scale: 1.02 }}
  >
    <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300 mb-1">{value}</p>
    <p className="text-xs text-slate-300 uppercase tracking-wider">{label}</p>
  </motion.div>
);
