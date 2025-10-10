import { motion } from 'framer-motion';
import classNames from 'classnames';
import { COMPONENT_SIZES, PROGRESS_BAR_COLORS, type ComponentSize, type ProgressBarColor } from '../../utils/constants';

interface ProgressBarProps {
  progress: number;
  size?: ComponentSize;
  color?: ProgressBarColor;
  showPercentage?: boolean;
  animated?: boolean;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className,
  size = COMPONENT_SIZES.MEDIUM,
  color = PROGRESS_BAR_COLORS.PRIMARY,
  showPercentage = false,
  animated = true,
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  const containerClasses = classNames(
    'relative overflow-hidden rounded-full',
    {
      'h-1': size === COMPONENT_SIZES.SMALL,
      'h-2': size === COMPONENT_SIZES.MEDIUM,
      'h-3': size === COMPONENT_SIZES.LARGE,
      'bg-gray-200 dark:bg-gray-700': true,
    },
    className
  );

  const barClasses = classNames('h-full rounded-full', {
    'bg-blue-500': color === PROGRESS_BAR_COLORS.PRIMARY,
    'bg-green-500': color === PROGRESS_BAR_COLORS.SUCCESS,
    'bg-yellow-500': color === PROGRESS_BAR_COLORS.WARNING,
    'bg-red-500': color === PROGRESS_BAR_COLORS.ERROR,
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
      {showPercentage && (
        <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {Math.round(clampedProgress)}%
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
