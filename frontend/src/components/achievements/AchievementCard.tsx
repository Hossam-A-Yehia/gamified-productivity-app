import React from 'react';
import { motion } from 'framer-motion';
import { 
  Star, Trophy, Award, Crown, Target, CheckCircle2, Flame, 
  Sunrise, Moon, Briefcase, Heart, GraduationCap, Zap, Lock
} from 'lucide-react';
import { EnhancedProgressBar } from '../ui/EnhancedProgressBar';
import type { DetailedAchievementProgress, AchievementRarity } from '../../types/achievement';

interface AchievementCardProps {
  achievementProgress: DetailedAchievementProgress;
  index?: number;
  onClick?: () => void;
}

const getRarityConfig = (rarity: AchievementRarity) => {
  switch (rarity) {
    case 'common':
      return {
        gradient: 'from-gray-400 to-gray-600',
        bgGradient: 'from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900',
        borderColor: 'border-gray-300 dark:border-gray-600',
        icon: Award,
        glow: 'shadow-gray-500/20'
      };
    case 'rare':
      return {
        gradient: 'from-blue-400 to-blue-600',
        bgGradient: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
        borderColor: 'border-blue-300 dark:border-blue-600',
        icon: Star,
        glow: 'shadow-blue-500/30'
      };
    case 'epic':
      return {
        gradient: 'from-purple-400 to-purple-600',
        bgGradient: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
        borderColor: 'border-purple-300 dark:border-purple-600',
        icon: Zap,
        glow: 'shadow-purple-500/30'
      };
    case 'legendary':
      return {
        gradient: 'from-yellow-400 to-orange-500',
        bgGradient: 'from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-800/20',
        borderColor: 'border-yellow-300 dark:border-orange-600',
        icon: Crown,
        glow: 'shadow-yellow-500/40'
      };
  }
};

const getCategoryEmoji = (category: string) => {
  switch (category) {
    case 'productivity': return '⚡';
    case 'consistency': return '🔥';
    case 'social': return '👥';
    case 'special': return '✨';
    default: return '🏆';
  }
};

const getLucideIcon = (iconName: string) => {
  const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
    'target': Target,
    'check-circle-2': CheckCircle2,
    'trophy': Trophy,
    'flame': Flame,
    'crown': Crown,
    'sunrise': Sunrise,
    'moon': Moon,
    'briefcase': Briefcase,
    'heart': Heart,
    'graduation-cap': GraduationCap
  };
  
  return iconMap[iconName] || null;
};

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievementProgress,
  index = 0,
  onClick
}) => {
  const { achievement, progress, target, isUnlocked, progressPercentage } = achievementProgress;
  const rarityConfig = getRarityConfig(achievement.rarity);
  const RarityIcon = rarityConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`
        relative overflow-hidden rounded-2xl border-2 cursor-pointer
        ${rarityConfig.borderColor} ${rarityConfig.bgGradient}
        ${isUnlocked ? `${rarityConfig.glow} shadow-lg` : 'shadow-md'}
        transition-all duration-300 hover:shadow-xl
        ${!isUnlocked ? 'opacity-75' : ''}
      `}
      onClick={onClick}
    >
      {/* Rarity Glow Effect */}
      {isUnlocked && (
        <div className={`absolute inset-0 bg-gradient-to-br ${rarityConfig.gradient} opacity-5`} />
      )}

      {/* Lock Overlay for Locked Achievements */}
      {!isUnlocked && (
        <div className="absolute inset-0 bg-black/10 dark:bg-black/20 z-10 flex items-center justify-center">
          <Lock className="w-8 h-8 text-gray-500 dark:text-gray-400" />
        </div>
      )}

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`
              w-12 h-12 rounded-xl flex items-center justify-center
              bg-gradient-to-br ${rarityConfig.gradient}
              ${isUnlocked ? 'shadow-lg' : 'grayscale'}
            `}>
              <div className="text-2xl flex items-center justify-center">
                {(() => {
                  const LucideIcon = getLucideIcon(achievement.iconUrl);
                  if (LucideIcon) {
                    return <LucideIcon className="w-6 h-6" />;
                  }
                  return <span>{getCategoryEmoji(achievement.category)}</span>;
                })()}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                {achievement.name}
              </h3>
              <div className="flex items-center space-x-2">
                <RarityIcon className={`w-4 h-4 text-gradient-to-r ${rarityConfig.gradient}`} />
                <span className={`text-sm font-medium capitalize bg-gradient-to-r ${rarityConfig.gradient} bg-clip-text text-transparent`}>
                  {achievement.rarity}
                </span>
              </div>
            </div>
          </div>

          {/* Category Badge */}
          <div className={`
            px-3 py-1 rounded-full text-xs font-medium
            bg-gradient-to-r ${rarityConfig.gradient} text-white
            ${isUnlocked ? 'shadow-md' : 'opacity-60'}
          `}>
            {getCategoryEmoji(achievement.category)} {achievement.category}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">
          {achievement.description}
        </p>

        {/* Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {progress}/{target} ({Math.round(progressPercentage)}%)
            </span>
          </div>

          <EnhancedProgressBar
            value={progress}
            max={target}
            variant="gradient"
            size="md"
            animated={isUnlocked}
            striped={!isUnlocked}
            glow={isUnlocked}
            className={`
              ${isUnlocked ? `bg-gradient-to-r ${rarityConfig.gradient}` : 'bg-gray-300 dark:bg-gray-600'}
            `}
          />
        </div>

        {/* Rewards */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-purple-500" />
              <span className="text-gray-600 dark:text-gray-400">
                +{achievement.rewards.xp} XP
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-gray-600 dark:text-gray-400">
                +{achievement.rewards.coins} coins
              </span>
            </div>
          </div>

          {isUnlocked && (
            <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
              <Trophy className="w-4 h-4" />
              <span className="text-sm font-medium">Unlocked!</span>
            </div>
          )}
        </div>
      </div>

      {/* Completion Celebration Effect */}
      {isUnlocked && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${rarityConfig.gradient} opacity-10`} />
        </motion.div>
      )}
    </motion.div>
  );
};
