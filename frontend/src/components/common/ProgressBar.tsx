import React from 'react';
import { motion } from 'framer-motion';
import classNames from 'classnames';

interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  color?: 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className,
  color = 'primary',
  size = 'md',
  showLabel = false,
  animated = true,
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  const containerClasses = classNames(
    'relative overflow-hidden rounded-full',
    {
      'h-1': size === 'sm',
      'h-2': size === 'md',
      'h-3': size === 'lg',
      'bg-gray-200 dark:bg-gray-700': true,
    },
    className
  );

  const barClasses = classNames('h-full rounded-full', {
    'bg-blue-500': color === 'primary',
    'bg-green-500': color === 'success',
    'bg-yellow-500': color === 'warning',
    'bg-red-500': color === 'error',
  });

  return (
    <div className="w-full">
      <div className={containerClasses}>
        <motion.div
          className={barClasses}
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{
            duration: animated ? 0.5 : 0,
            ease: 'easeOut',
          }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {Math.round(clampedProgress)}%
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
