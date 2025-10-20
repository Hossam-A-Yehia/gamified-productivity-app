import React from 'react';
import { motion } from 'framer-motion';

// Mobile-optimized container
export const MobileContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`
      px-4 sm:px-6 lg:px-8 
      py-4 sm:py-6 lg:py-8
      max-w-7xl mx-auto
      ${className}
    `}>
      {children}
    </div>
  );
};

// Mobile-friendly grid
export const ResponsiveGrid: React.FC<{
  children: React.ReactNode;
  cols?: { mobile: number; tablet: number; desktop: number };
  gap?: number;
  className?: string;
}> = ({ 
  children, 
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 4,
  className = '' 
}) => {
  const gridClasses = `
    grid gap-${gap}
    grid-cols-${cols.mobile}
    sm:grid-cols-${cols.tablet}
    lg:grid-cols-${cols.desktop}
    ${className}
  `;

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

// Touch-friendly button
export const TouchButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'min-h-[44px] px-4 py-2 text-sm',
    md: 'min-h-[48px] px-6 py-3 text-base',
    lg: 'min-h-[52px] px-8 py-4 text-lg'
  };

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
  };

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className={`
        rounded-lg font-medium transition-colors
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        active:scale-95 transform-gpu
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
};

// Swipeable card for mobile
export const SwipeableCard: React.FC<{
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}> = ({ children, onSwipeLeft, onSwipeRight, className = '' }) => {
  return (
    <motion.div
      className={`
        bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700
        touch-pan-y select-none
        ${className}
      `}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={(_, info) => {
        if (info.offset.x > 100 && onSwipeRight) {
          onSwipeRight();
        } else if (info.offset.x < -100 && onSwipeLeft) {
          onSwipeLeft();
        }
      }}
      whileDrag={{ scale: 0.95 }}
    >
      {children}
    </motion.div>
  );
};

// Mobile navigation drawer
export const MobileDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}> = ({ isOpen, onClose, children, title }) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl z-50 lg:hidden"
      >
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              ✕
            </button>
          </div>
        )}
        <div className="p-4 overflow-y-auto h-full">
          {children}
        </div>
      </motion.div>
    </>
  );
};

// Mobile-optimized input
export const MobileInput: React.FC<{
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  className?: string;
}> = ({ placeholder, value, onChange, type = 'text', className = '' }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`
        w-full min-h-[48px] px-4 py-3 text-base
        bg-white dark:bg-gray-800 
        border border-gray-300 dark:border-gray-600
        rounded-lg
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        placeholder-gray-500 dark:placeholder-gray-400
        text-gray-900 dark:text-white
        ${className}
      `}
    />
  );
};

// Pull-to-refresh component
export const PullToRefresh: React.FC<{
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}> = ({ onRefresh, children }) => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [pullDistance, setPullDistance] = React.useState(0);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
    setPullDistance(0);
  };

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDrag={(_, info) => {
        if (info.offset.y > 0) {
          setPullDistance(Math.min(info.offset.y, 100));
        }
      }}
      onDragEnd={(_, info) => {
        if (info.offset.y > 80 && !isRefreshing) {
          handleRefresh();
        } else {
          setPullDistance(0);
        }
      }}
      className="relative"
    >
      {/* Pull indicator */}
      {pullDistance > 0 && (
        <motion.div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full
                     flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full text-white"
          animate={{ rotate: pullDistance > 80 ? 180 : 0 }}
        >
          ↓
        </motion.div>
      )}

      {/* Loading indicator */}
      {isRefreshing && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full
                       flex items-center justify-center w-8 h-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
        </div>
      )}

      <motion.div
        animate={{ y: pullDistance * 0.5 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};
