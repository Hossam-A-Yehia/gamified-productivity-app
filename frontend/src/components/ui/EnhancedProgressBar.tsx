import React from 'react';
import { motion } from 'framer-motion';

interface EnhancedProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'gradient';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  striped?: boolean;
  glow?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4'
};

const variantClasses = {
  default: 'bg-blue-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500',
  gradient: 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'
};

export const EnhancedProgressBar: React.FC<EnhancedProgressBarProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  animated = true,
  striped = false,
  glow = false,
  className = ''
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label || 'Progress'}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      
      <div className={`
        relative overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700
        ${sizeClasses[size]}
        ${glow ? 'shadow-lg' : ''}
      `}>
        {/* Background pattern for striped effect */}
        {striped && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:20px_100%] animate-pulse" />
        )}
        
        {/* Progress fill */}
        <motion.div
          className={`
            h-full rounded-full relative overflow-hidden
            ${variantClasses[variant]}
            ${glow ? `shadow-lg shadow-${variant === 'gradient' ? 'purple' : variant}-500/50` : ''}
          `}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={animated ? {
            duration: 1,
            ease: 'easeOut',
            type: 'spring',
            stiffness: 100
          } : { duration: 0 }}
        >
          {/* Animated shine effect */}
          {animated && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
                delay: 1
              }}
            />
          )}
          
          {/* Pulse effect for active progress */}
          {percentage > 0 && percentage < 100 && (
            <motion.div
              className="absolute right-0 top-0 h-full w-2 bg-white/50 rounded-full"
              animate={{
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

// Circular Progress Bar
export const CircularProgressBar: React.FC<{
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  className?: string;
}> = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  variant = 'default',
  showLabel = true,
  className = ''
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colors = {
    default: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444'
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200 dark:text-gray-700"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors[variant]}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{
            duration: 1,
            ease: 'easeOut'
          }}
          style={{
            filter: `drop-shadow(0 0 6px ${colors[variant]}40)`
          }}
        />
      </svg>
      
      {showLabel && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
        >
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.round(percentage)}%
          </span>
        </motion.div>
      )}
    </div>
  );
};

// Multi-step Progress Bar
export const StepProgressBar: React.FC<{
  steps: string[];
  currentStep: number;
  variant?: 'default' | 'success';
  className?: string;
}> = ({
  steps,
  currentStep,
  variant = 'default',
  className = ''
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <motion.div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${index <= currentStep
                    ? variant === 'success' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }
                `}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1 }}
              >
                {index + 1}
              </motion.div>
              <span className="mt-2 text-xs text-gray-600 dark:text-gray-400 text-center">
                {step}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <motion.div
                className={`
                  flex-1 h-1 mx-2 rounded-full
                  ${index < currentStep
                    ? variant === 'success'
                      ? 'bg-green-500'
                      : 'bg-blue-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                  }
                `}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: index < currentStep ? 1 : 0 }}
                transition={{ delay: (index + 1) * 0.1, duration: 0.5 }}
                style={{ transformOrigin: 'left' }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
