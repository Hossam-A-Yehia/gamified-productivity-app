import React from 'react';
import { motion } from 'framer-motion';
import { LAYOUT_SIDES, type LayoutSide } from '../../../utils/constants';

interface Feature {
  icon: string;
  label: string;
}

interface FeatureCardsProps {
  side: LayoutSide;
}

const featuresData: Feature[] = [
  { icon: '🏆', label: 'Earn XP' },
  { icon: '🎯', label: 'Complete Tasks' },
  { icon: '⚡', label: 'Level Up' },
];

// Split features for left and right sides
const getFeaturesForSide = (side: LayoutSide) => {
  if (side === LAYOUT_SIDES.LEFT) {
    return [featuresData[0], featuresData[1]];
  } else if (side === LAYOUT_SIDES.RIGHT) {
    return [featuresData[2], featuresData[3]];
  }
  return featuresData;
};

const FeatureCards: React.FC<FeatureCardsProps> = ({ side = 'mobile' }) => {
  const currentFeatures = getFeaturesForSide(side);
  
  const getLayoutClasses = () => {
    if (side === LAYOUT_SIDES.MOBILE) {
      return 'mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center';
    }
    return 'flex flex-col space-y-4';
  };

  const getCardClasses = () => {
    if (side === LAYOUT_SIDES.MOBILE) {
      return 'bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700';
    }
    return 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50 text-center';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className={getLayoutClasses()}
    >
      {currentFeatures.map((feature, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1,
            y: [0, -6, 0]
          }}
          transition={{
            opacity: { duration: 0.5, delay: index * 0.1 + 0.6 },
            y: {
              duration: 3 + index * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.3 + 1
            }
          }}
          whileHover={{ scale: 1.05, y: -8 }}
          className={getCardClasses()}
        >
          <motion.div 
            className={`${side === LAYOUT_SIDES.MOBILE ? 'text-2xl' : 'text-3xl'} mb-2`}
            animate={{
              rotate: [0, 3, -3, 0]
            }}
            transition={{
              duration: 4 + index * 0.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.5 + 1.5
            }}
          >
            {feature?.icon}
          </motion.div>
          <div className={`${side === LAYOUT_SIDES.MOBILE ? 'text-sm' : 'text-base font-medium'} text-gray-600 dark:text-gray-400`}>
            {feature?.label}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default FeatureCards;
