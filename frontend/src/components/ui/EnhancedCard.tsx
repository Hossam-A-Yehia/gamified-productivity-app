import React from 'react';
import { motion } from 'framer-motion';

interface EnhancedCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  gradient?: boolean;
  glow?: boolean;
}

export const EnhancedCard: React.FC<EnhancedCardProps> = ({
  children,
  className = '',
  hover = true,
  clickable = false,
  onClick,
  gradient = false,
  glow = false
}) => {
  const baseClasses = `
    relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700
    ${gradient 
      ? 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900' 
      : 'bg-white dark:bg-gray-800'
    }
    ${clickable ? 'cursor-pointer' : ''}
    ${glow ? 'shadow-lg shadow-blue-500/10 dark:shadow-blue-400/10' : 'shadow-sm'}
  `;

  return (
    <motion.div
      className={`${baseClasses} ${className}`}
      onClick={onClick}
      whileHover={hover ? {
        y: -4,
        scale: 1.02,
        boxShadow: glow 
          ? '0 20px 40px rgba(59, 130, 246, 0.15)' 
          : '0 20px 40px rgba(0, 0, 0, 0.1)',
        transition: { duration: 0.2 }
      } : undefined}
      whileTap={clickable ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Subtle gradient overlay on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0"
        whileHover={{ opacity: hover ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Animated border glow */}
      {glow && (
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-blue-500/20"
          animate={{
            borderColor: [
              'rgba(59, 130, 246, 0.2)',
              'rgba(59, 130, 246, 0.4)',
              'rgba(59, 130, 246, 0.2)'
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}
    </motion.div>
  );
};

// Specialized card variants
export const StatsCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  className?: string;
}> = ({ title, value, icon, trend, className = '' }) => {
  return (
    <EnhancedCard hover glow className={`p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <motion.p 
            className="text-2xl font-bold text-gray-900 dark:text-white"
            key={value}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {value}
          </motion.p>
          {trend && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center text-sm ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              <span>{trend.isPositive ? '↗' : '↘'}</span>
              <span className="ml-1">{Math.abs(trend.value)}%</span>
            </motion.div>
          )}
        </div>
        <motion.div
          whileHover={{ rotate: 10, scale: 1.1 }}
          className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg"
        >
          {icon}
        </motion.div>
      </div>
    </EnhancedCard>
  );
};
