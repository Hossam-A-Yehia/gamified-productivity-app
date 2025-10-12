import React from 'react';
import { motion } from 'framer-motion';

interface XPBarProps {
  currentXP: number;
  showDetails?: boolean;
  className?: string;
}

const calculateXPForLevel = (level: number): number => {
  if (level <= 1) return 0;
  return 500 * (level - 1) + 1000 * ((level - 1) * (level - 2) / 2);
};

const calculateLevelFromXP = (xp: number): number => {
  let level = 1;
  let requiredXP = 0;

  while (xp >= requiredXP) {
    level++;
    requiredXP = calculateXPForLevel(level);
  }

  return level - 1;
};

export const XPBar: React.FC<XPBarProps> = ({
  currentXP,
  showDetails = true,
  className = '',
}) => {
  const level = calculateLevelFromXP(currentXP);
  const currentLevelXP = calculateXPForLevel(level);
  const nextLevelXP = calculateXPForLevel(level + 1);
  const xpInCurrentLevel = currentXP - currentLevelXP;
  const xpNeededForNextLevel = nextLevelXP - currentLevelXP;
  const progressPercentage = (xpInCurrentLevel / xpNeededForNextLevel) * 100;

  return (
    <div className={`${className}`}>
      {showDetails && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              Level {level}
            </span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {xpInCurrentLevel.toLocaleString()} / {xpNeededForNextLevel.toLocaleString()} XP
          </div>
        </div>
      )}
      
      <div className="relative">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 opacity-60" />
          </motion.div>
        </div>
        
        {showDetails && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-white drop-shadow-sm">
              {Math.round(progressPercentage)}%
            </span>
          </div>
        )}
      </div>

      {showDetails && (
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>Total XP: {currentXP.toLocaleString()}</span>
          <span>Next level: {(nextLevelXP - currentXP).toLocaleString()} XP</span>
        </div>
      )}
    </div>
  );
};
