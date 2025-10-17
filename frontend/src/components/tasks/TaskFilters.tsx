import React from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Tag } from 'lucide-react';
import { TASK_CATEGORIES, TASK_DIFFICULTIES, TASK_PRIORITIES, TASK_STATUSES } from '../../types/task';

interface TaskFiltersState {
  search: string;
  status: string[];
  category: string[];
  difficulty: string[];
  priority: string[];
  dateRange: {
    start: string;
    end: string;
  };
  tags: string[];
}

interface TaskFiltersProps {
  filters: TaskFiltersState;
  onFiltersChange: (filters: TaskFiltersState) => void;
  onClearFilters: () => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const handleMultiSelectChange = (
    field: keyof Pick<TaskFiltersState, 'status' | 'category' | 'difficulty' | 'priority'>,
    value: string,
    checked: boolean
  ) => {
    const currentValues = filters[field] as string[];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);
    
    onFiltersChange({
      ...filters,
      [field]: newValues,
    });
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: value,
      },
    });
  };

  const handleTagsChange = (value: string) => {
    const tags = value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    onFiltersChange({
      ...filters,
      tags,
    });
  };

  const activeFiltersCount = Object.values(filters).reduce((count, value) => {
    if (Array.isArray(value)) return count + value.length;
    if (typeof value === 'object' && value !== null) {
      return count + Object.values(value).filter(v => v !== '').length;
    }
    return count + (value ? 1 : 0);
  }, 0);

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Advanced Filters
        </h3>
        {activeFiltersCount > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClearFilters}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
          >
            <X size={12} />
            Clear All ({activeFiltersCount})
          </motion.button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <div className="space-y-2">
            {TASK_STATUSES.map((status) => (
              <label key={status.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.status.includes(status.value)}
                  onChange={(e) => handleMultiSelectChange('status', status.value, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {status.label}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          <div className="space-y-2">
            {TASK_CATEGORIES.map((category) => (
              <label key={category.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.category.includes(category.value)}
                  onChange={(e) => handleMultiSelectChange('category', category.value, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <span className="ml-2 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className={`w-3 h-3 rounded-full ${category.color}`} />
                  {category.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Difficulty
          </label>
          <div className="space-y-2">
            {TASK_DIFFICULTIES.map((difficulty) => (
              <label key={difficulty.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.difficulty.includes(difficulty.value)}
                  onChange={(e) => handleMultiSelectChange('difficulty', difficulty.value, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {difficulty.label} ({difficulty.multiplier}x XP)
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Priority
          </label>
          <div className="space-y-2">
            {TASK_PRIORITIES.map((priority) => (
              <label key={priority.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.priority.includes(priority.value)}
                  onChange={(e) => handleMultiSelectChange('priority', priority.value, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {priority.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Calendar size={16} className="inline mr-1" />
            Deadline Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                placeholder="Start date"
              />
            </div>
            <div>
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                placeholder="End date"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Tag size={16} className="inline mr-1" />
            Tags
          </label>
          <input
            type="text"
            value={filters.tags.join(', ')}
            onChange={(e) => handleTagsChange(e.target.value)}
            placeholder="Enter tags separated by commas..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Filter tasks that contain any of these tags
          </p>
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700 dark:text-blue-400">
              {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
            </span>
            <div className="flex flex-wrap gap-1">
              {filters.status.length > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  Status: {filters.status.length}
                </span>
              )}
              {filters.category.length > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Category: {filters.category.length}
                </span>
              )}
              {filters.difficulty.length > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                  Difficulty: {filters.difficulty.length}
                </span>
              )}
              {filters.priority.length > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                  Priority: {filters.priority.length}
                </span>
              )}
              {(filters.dateRange.start || filters.dateRange.end) && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                  Date Range
                </span>
              )}
              {filters.tags.length > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400">
                  Tags: {filters.tags.length}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
