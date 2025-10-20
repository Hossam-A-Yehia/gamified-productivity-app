import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = '100%',
  height = '1rem',
  rounded = false,
  animate = true
}) => {
  const skeletonClasses = `
    bg-gray-200 dark:bg-gray-700
    ${rounded ? 'rounded-full' : 'rounded'}
    ${animate ? 'animate-pulse' : ''}
    ${className}
  `;

  return (
    <div
      className={skeletonClasses}
      style={{ width, height }}
    />
  );
};

// Task Card Skeleton
export const TaskCardSkeleton: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Skeleton height="1.25rem" width="75%" className="mb-2" />
          <Skeleton height="0.875rem" width="50%" />
        </div>
        <Skeleton width="2rem" height="2rem" rounded />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton width="4rem" height="1.5rem" rounded />
          <Skeleton width="3rem" height="1.5rem" rounded />
        </div>
        <Skeleton width="5rem" height="2rem" rounded />
      </div>
    </motion.div>
  );
};

// Stats Card Skeleton
export const StatsCardSkeleton: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Skeleton height="0.875rem" width="60%" className="mb-2" />
          <Skeleton height="2rem" width="40%" className="mb-2" />
          <Skeleton height="0.75rem" width="30%" />
        </div>
        <Skeleton width="3rem" height="3rem" rounded />
      </div>
    </motion.div>
  );
};

// Leaderboard Entry Skeleton
export const LeaderboardEntrySkeleton: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-3"
    >
      <div className="flex items-center gap-3">
        <Skeleton width="2.5rem" height="2.5rem" rounded />
        <div>
          <Skeleton height="1rem" width="8rem" className="mb-1" />
          <Skeleton height="0.75rem" width="5rem" />
        </div>
      </div>
      <div className="text-right">
        <Skeleton height="1rem" width="4rem" className="mb-1" />
        <Skeleton height="0.75rem" width="3rem" />
      </div>
    </motion.div>
  );
};

// Challenge Card Skeleton
export const ChallengeCardSkeleton: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Skeleton height="1.5rem" width="70%" className="mb-2" />
          <Skeleton height="1rem" width="90%" className="mb-1" />
          <Skeleton height="1rem" width="60%" />
        </div>
        <Skeleton width="2rem" height="2rem" rounded />
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton width="1rem" height="1rem" />
          <Skeleton height="0.875rem" width="30%" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton width="1rem" height="1rem" />
          <Skeleton height="0.875rem" width="25%" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton width="1rem" height="1rem" />
          <Skeleton height="0.875rem" width="35%" />
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <Skeleton height="2rem" width="6rem" rounded />
          <Skeleton height="1.5rem" width="4rem" rounded />
        </div>
      </div>
    </motion.div>
  );
};

// Grid Skeleton for multiple items
export const GridSkeleton: React.FC<{
  count: number;
  component: React.ComponentType;
  className?: string;
}> = ({ count, component: Component, className = '' }) => {
  return (
    <div className={`grid gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <Component key={index} />
      ))}
    </div>
  );
};
