import React from 'react';
import { motion } from 'framer-motion';

interface StatCard {
  icon: string;
  label: string;
  value: string;
}

const statsData: StatCard[] = [
  { icon: '👥', label: '10K+ Users', value: '10,247' },
  { icon: '✅', label: 'Tasks Done', value: '1.2M+' },
  { icon: '🏆', label: 'XP Earned', value: '50M+' },
];

const StatsCards: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="mt-8 grid grid-cols-3 gap-4 text-center"
    >
      {statsData.map((stat, index) => (
        <motion.div
          key={index}
          whileHover={{ scale: 1.05, y: -2 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <div className="text-xl mb-1">{stat.icon}</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {stat.value}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {stat.label}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StatsCards;
