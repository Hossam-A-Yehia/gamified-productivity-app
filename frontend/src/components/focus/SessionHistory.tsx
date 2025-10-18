import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Timer, 
  Calendar, 
  AlertTriangle, 
  Award,
  Trash2,
  Filter,
  ChevronDown,
  Clock,
  Target
} from 'lucide-react';
import { useFocusSessions, useFocusOperations } from '../../hooks/useFocus';
import { focusService } from '../../services/focusService';
import type { FocusSessionFilters } from '../../types/focus';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Pagination } from '../common/Pagination';

interface SessionHistoryProps {
  className?: string;
  limit?: number;
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({ 
  className = '',
  limit = 20 
}) => {
  const [filters, setFilters] = useState<FocusSessionFilters>({
    limit,
    sortBy: 'startTime',
    sortOrder: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error } = useFocusSessions({ ...filters, page: currentPage });
  const { deleteSession } = useFocusOperations();

  const handleFilterChange = (newFilters: Partial<FocusSessionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      await deleteSession.mutateAsync(sessionId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 ${className}`}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 ${className}`}>
        <p className="text-red-500 text-center">Failed to load session history</p>
      </div>
    );
  }

  const sessions = data?.sessions || [];
  const pagination = data?.pagination;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Session History
            </h3>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    value={filters.type || ''}
                    onChange={(e) => handleFilterChange({ type: e.target.value as any || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">All Types</option>
                    <option value="pomodoro">Pomodoro</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.completed?.toString() || ''}
                    onChange={(e) => handleFilterChange({ 
                      completed: e.target.value === '' ? undefined : e.target.value === 'true' 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">All Sessions</option>
                    <option value="true">Completed</option>
                    <option value="false">Incomplete</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy || 'startTime'}
                    onChange={(e) => handleFilterChange({ sortBy: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="startTime">Start Time</option>
                    <option value="duration">Duration</option>
                    <option value="productivity">Productivity</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sessions List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {sessions.length === 0 ? (
          <div className="p-8 text-center">
            <Timer className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No sessions found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Start your first focus session to see it here!
            </p>
          </div>
        ) : (
          sessions.map((session, index) => (
            <motion.div
              key={session._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Session Type Icon */}
                  <div className={`
                    p-2 rounded-lg
                    ${session.type === 'pomodoro' 
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600' 
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                    }
                  `}>
                    <Timer className="w-4 h-4" />
                  </div>

                  {/* Session Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {session.type === 'pomodoro' ? 'Pomodoro' : 'Custom'} Session
                      </h4>
                      {!session.completed && (
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-full">
                          Incomplete
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{session.actualDuration || session.duration}m</span>
                      </div>
                      
                      {session.completed && (
                        <div className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          <span className={focusService.calculateProductivityColor(session.productivity)}>
                            {session.productivity}%
                          </span>
                        </div>
                      )}
                      
                      {session.interruptions > 0 && (
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{session.interruptions} interruptions</span>
                        </div>
                      )}
                      
                      {session.xpEarned > 0 && (
                        <div className="flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          <span>+{session.xpEarned} XP</span>
                        </div>
                      )}
                    </div>
                    
                    {session.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                        {session.notes}
                      </p>
                    )}
                  </div>

                  {/* Time */}
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(session.startTime)}
                    </p>
                    {session.completed && session.endTime && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {focusService.formatDuration(
                          Math.floor((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / (1000 * 60))
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="ml-4">
                  <button
                    onClick={() => handleDeleteSession(session._id)}
                    disabled={deleteSession.isPending}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};
