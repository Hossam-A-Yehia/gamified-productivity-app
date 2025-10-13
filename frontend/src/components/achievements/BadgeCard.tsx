import { motion } from 'framer-motion';
import type { Achievement, AchievementProgress } from '../../types/achievement';

interface BadgeCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
  progress?: AchievementProgress;
  onClick?: () => void;
}

const rarityColors = {
  common: {
    gradient: 'from-gray-400 to-gray-600',
    glow: 'shadow-gray-500/50',
    text: 'text-gray-600',
    bg: 'bg-gray-100',
  },
  rare: {
    gradient: 'from-blue-400 to-blue-600',
    glow: 'shadow-blue-500/50',
    text: 'text-blue-600',
    bg: 'bg-blue-100',
  },
  epic: {
    gradient: 'from-purple-400 to-pink-600',
    glow: 'shadow-purple-500/50',
    text: 'text-purple-600',
    bg: 'bg-purple-100',
  },
  legendary: {
    gradient: 'from-yellow-400 via-orange-500 to-red-600',
    glow: 'shadow-orange-500/50',
    text: 'text-orange-600',
    bg: 'bg-gradient-to-r from-yellow-100 to-orange-100',
  },
};

const categoryIcons = {
  consistency: '🔥',
  productivity: '⚡',
  social: '👥',
  special: '⭐',
};

export const BadgeCard = ({ achievement, isUnlocked, progress, onClick }: BadgeCardProps) => {
  const colors = rarityColors[achievement.rarity];
  const progressPercent = progress ? (progress.progress / progress.target) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative p-6 rounded-xl cursor-pointer transition-all duration-300 ${
        isUnlocked
          ? `bg-white dark:bg-gray-800 border-2 border-transparent bg-gradient-to-br ${colors.gradient} bg-clip-padding`
          : 'bg-gray-100 dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700'
      } ${isUnlocked ? `shadow-lg hover:shadow-xl ${colors.glow}` : 'shadow-sm hover:shadow-md opacity-60'}`}
    >
      {isUnlocked && (
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-10 rounded-xl`}
          animate={{
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className={`text-4xl ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
            {categoryIcons[achievement.category]}
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${colors.bg} ${colors.text}`}>
            {achievement.rarity}
          </div>
        </div>

        <h3 className={`text-lg font-bold mb-2 ${isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-600'}`}>
          {achievement.name}
        </h3>

        <p className={`text-sm mb-4 ${isUnlocked ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-600'}`}>
          {achievement.description}
        </p>

        {!isUnlocked && progress && !progress.completed && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mb-1">
              <span>Progress</span>
              <span>{progress.progress} / {progress.target}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${colors.gradient}`}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-lg">⚡</span>
              <span className={`text-sm font-semibold ${isUnlocked ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                {achievement.rewards.xp} XP
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-lg">💰</span>
              <span className={`text-sm font-semibold ${isUnlocked ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-400'}`}>
                {achievement.rewards.coins}
              </span>
            </div>
          </div>
          {isUnlocked && (
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
              className="text-2xl"
            >
              ✓
            </motion.div>
          )}
        </div>

        {isUnlocked && (
          <div className="absolute -top-2 -right-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg"
            >
              ✓
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
