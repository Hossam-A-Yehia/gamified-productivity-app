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
    relative overflow-hidden rounded-xl border border-gray-200/50 dark:border-gray-600/50
    ${gradient 
      ? 'bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 dark:from-gray-800/90 dark:via-gray-700/50 dark:to-blue-900/20' 
      : 'bg-white/80 backdrop-blur-sm dark:bg-gray-800/90 dark:backdrop-blur-sm'
    }
    ${clickable ? 'cursor-pointer' : ''}
    ${glow ? 'shadow-xl shadow-blue-500/20 dark:shadow-blue-400/20' : 'shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50'}
  `;

  return (
    <motion.div
      className={`${baseClasses} ${className}`}
      onClick={onClick}
      whileHover={hover ? {
        y: -6,
        scale: 1.02,
        boxShadow: glow 
          ? '0 25px 50px rgba(59, 130, 246, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.1)' 
          : '0 25px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(99, 102, 241, 0.1)',
        transition: { duration: 0.2 }
      } : undefined}
      whileTap={clickable ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Subtle gradient overlay on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-indigo-500/6 to-purple-500/8 opacity-0"
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
          className="absolute inset-0 rounded-xl border-2 border-blue-500/30"
          animate={{
            borderColor: [
              'rgba(59, 130, 246, 0.3)',
              'rgba(99, 102, 241, 0.5)',
              'rgba(139, 92, 246, 0.4)',
              'rgba(59, 130, 246, 0.3)'
            ]
          }}
          transition={{
            duration: 3,
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
  variant?: 'default' | 'success' | 'warning' | 'info' | 'purple' | 'gradient';
}> = ({ title, value, icon, trend, className = '', variant = 'default' }) => {
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          card: 'bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200/50 dark:border-emerald-700/50',
          icon: 'bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-800/40 dark:to-green-800/40',
          value: 'text-emerald-900 dark:text-emerald-100',
          title: 'text-emerald-700 dark:text-emerald-300'
        };
      case 'warning':
        return {
          card: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200/50 dark:border-amber-700/50',
          icon: 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-800/40 dark:to-orange-800/40',
          value: 'text-amber-900 dark:text-amber-100',
          title: 'text-amber-700 dark:text-amber-300'
        };
      case 'info':
        return {
          card: 'bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border-cyan-200/50 dark:border-cyan-700/50',
          icon: 'bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-800/40 dark:to-blue-800/40',
          value: 'text-cyan-900 dark:text-cyan-100',
          title: 'text-cyan-700 dark:text-cyan-300'
        };
      case 'purple':
        return {
          card: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200/50 dark:border-purple-700/50',
          icon: 'bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-800/40 dark:to-pink-800/40',
          value: 'text-purple-900 dark:text-purple-100',
          title: 'text-purple-700 dark:text-purple-300'
        };
      case 'gradient':
        return {
          card: 'bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 dark:from-indigo-900/20 dark:via-blue-900/20 dark:to-purple-900/20 border-indigo-200/50 dark:border-indigo-700/50',
          icon: 'bg-gradient-to-br from-indigo-100 via-blue-100 to-purple-100 dark:from-indigo-800/40 dark:via-blue-800/40 dark:to-purple-800/40',
          value: 'text-indigo-900 dark:text-indigo-100',
          title: 'text-indigo-700 dark:text-indigo-300'
        };
      default:
        return {
          card: 'bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800/90 dark:to-gray-800/90 border-slate-200/50 dark:border-slate-600/50',
          icon: 'bg-gradient-to-br from-slate-100 to-gray-100 dark:from-slate-700/40 dark:to-gray-700/40',
          value: 'text-slate-900 dark:text-slate-100',
          title: 'text-slate-700 dark:text-slate-300'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative overflow-hidden rounded-2xl border shadow-lg hover:shadow-xl
        transition-all duration-300 p-6 ${styles.card} ${className}
      `}
    >
      {/* Subtle animated background */}
      <motion.div
        className="absolute inset-0 opacity-0"
        whileHover={{ opacity: 0.1 }}
        transition={{ duration: 0.3 }}
        style={{
          background: variant === 'gradient' 
            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))' 
            : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1))'
        }}
      />
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex-1">
          <motion.p 
            className={`text-sm font-semibold mb-2 ${styles.title}`}
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 1 }}
          >
            {title}
          </motion.p>
          <motion.p 
            className={`text-3xl font-bold mb-1 ${styles.value}`}
            key={value}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            {value}
          </motion.p>
          {trend && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`flex items-center text-sm font-medium ${
                trend.isPositive 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-red-500 dark:text-red-400'
              }`}
            >
              <motion.span
                animate={{ rotate: trend.isPositive ? [0, -10, 0] : [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              >
                {trend.isPositive ? '↗' : '↘'}
              </motion.span>
              <span className="ml-1">{Math.abs(trend.value)}%</span>
            </motion.div>
          )}
        </div>
        
        <motion.div
          whileHover={{ rotate: 15, scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          className={`
            p-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300
            ${styles.icon}
          `}
        >
          <div className="w-6 h-6 flex items-center justify-center">
            {icon}
          </div>
        </motion.div>
      </div>
      
      {/* Subtle border glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl border-2 border-transparent"
        whileHover={{
          borderColor: variant === 'gradient' 
            ? 'rgba(99, 102, 241, 0.3)' 
            : 'rgba(59, 130, 246, 0.2)'
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};
