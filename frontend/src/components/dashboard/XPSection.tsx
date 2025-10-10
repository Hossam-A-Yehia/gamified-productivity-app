import React from 'react';
import { motion } from 'framer-motion';
import { XPBar } from '../gamification/XPBar';

interface XPSectionProps {
  currentXP: number;
}

export const XPSection: React.FC<XPSectionProps> = ({ currentXP }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-r from-indigo-500/20 via-purple-600/20 to-pink-600/20 dark:from-indigo-900/40 dark:via-purple-900/40 dark:to-pink-900/40 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-600/10 to-pink-600/10 animate-pulse"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16 animate-spin" style={{ animationDuration: '20s' }}></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              <span className="mr-3">🚀</span>
              Level Progression
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Keep completing tasks to level up and unlock rewards!
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
              {Math.floor((currentXP % 1000) / 10)}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Progress</div>
          </div>
        </div>
        <XPBar currentXP={currentXP} />
      </div>
    </motion.div>
  );
};
