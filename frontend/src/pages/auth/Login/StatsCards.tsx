import React from 'react';
import { motion } from 'framer-motion';
import { LAYOUT_SIDES, type LayoutSide } from '../../../utils/constants';

interface StatCard {
  icon: string;
  label: string;
  value: string;
}

interface StatsCardsProps {
  side: LayoutSide;
}

const statsData: StatCard[] = [
  { icon: '👥', label: '10K+ Users', value: '10,247' },
  { icon: '✅', label: 'Tasks Done', value: '1.2M+' },
  { icon: '🏆', label: 'XP Earned', value: '50M+' },
  { icon: '🔥', label: 'Daily Streaks', value: '365+' },
];

const getStatsForSide = (side: LayoutSide) => {
  if (side === LAYOUT_SIDES.LEFT) {
    return [statsData[0], statsData[1]];
  } else if (side === LAYOUT_SIDES.RIGHT) {
    return [statsData[2], statsData[3]]; 
  }
  return statsData;
};

const StatsCards: React.FC<StatsCardsProps> = ({ side = 'mobile' }) => {
  const currentStats = getStatsForSide(side);
  
  const getLayoutClasses = () => {
    if (side === LAYOUT_SIDES.MOBILE) {
      return 'mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center';
    }
    return 'flex flex-col space-y-4';
  };

  const getCardClasses = () => {
    if (side === LAYOUT_SIDES.MOBILE) {
      return 'bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700';
    }
    return 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50 text-center';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className={getLayoutClasses()}
    >
      {currentStats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1,
            y: [0, -6, 0]
          }}
          transition={{
            opacity: { duration: 0.5, delay: index * 0.1 },
            y: {
              duration: 3 + index * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.3
            }
          }}
          whileHover={{ scale: 1.05, y: -8 }}
          className={getCardClasses()}
        >
          <motion.div 
            className={`${side === LAYOUT_SIDES.MOBILE ? 'text-xl' : 'text-3xl'} mb-2`}
            animate={{
              rotate: [0, 3, -3, 0]
            }}
            transition={{
              duration: 4 + index * 0.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.5
            }}
          >
            {stat.icon}
          </motion.div>
          <div className={`${side === LAYOUT_SIDES.MOBILE ? 'text-lg' : 'text-2xl'} font-bold text-gray-900 dark:text-white mb-1`}>
            {stat.value}
          </div>
          <div className={`${side === LAYOUT_SIDES.MOBILE ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-400`}>
            {stat.label}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StatsCards;
