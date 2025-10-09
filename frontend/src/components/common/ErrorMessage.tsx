import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ErrorMessageProps {
  message?: string | null;
  className?: string;
  variant?: 'error' | 'warning' | 'info';
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  className = '', 
  variant = 'error' 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          container: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
          icon: '⚠️',
          iconColor: 'text-amber-500',
          textColor: 'text-amber-700 dark:text-amber-400'
        };
      case 'info':
        return {
          container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
          icon: 'ℹ️',
          iconColor: 'text-blue-500',
          textColor: 'text-blue-700 dark:text-blue-400'
        };
      default: // error
        return {
          container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
          icon: '❌',
          iconColor: 'text-red-500',
          textColor: 'text-red-700 dark:text-red-400'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0}}
          animate={{ 
            opacity: 1, 
            transition: {
              duration: 0.3,
              ease: 'easeOut'
            }
          }}
          className={`border rounded-xl p-4 backdrop-blur-sm ${styles.container} ${className}`}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-3"
          >
            <div className={`flex-shrink-0 ${styles.iconColor}`}>
              <span className="text-lg">{styles.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium leading-relaxed ${styles.textColor}`}>
                {message}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorMessage;
