import React from 'react';
import { motion } from 'framer-motion';

interface Feature {
  icon: string;
  label: string;
}

const featuresData: Feature[] = [
  { icon: '🏆', label: 'Earn XP' },
  { icon: '🎯', label: 'Complete Tasks' },
  { icon: '🔥', label: 'Build Streaks' },
];

const FeatureCards: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="mt-8 grid grid-cols-3 gap-4 text-center"
    >
      {featuresData.map((feature, index) => (
        <motion.div
          key={index}
          whileHover={{ scale: 1.05, y: -2 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <div className="text-2xl mb-2">{feature.icon}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {feature.label}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default FeatureCards;
