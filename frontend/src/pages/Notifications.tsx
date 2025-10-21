import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Filter, 
  Search,
  Check,
  CheckCheck,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  BarChart3
} from 'lucide-react';
import { 
  useNotifications, 
  useNotificationStats, 
  useNotificationOperations 
} from '../hooks/useNotifications';
import { notificationService } from '../services/notificationService';
import type { NotificationFilters, Notification } from '../types/notification';
import { toast } from 'sonner';
import LoadingSpinner from '../components/ui/LoadingSpinner';

type NotificationsTab = 'all' | 'unread' | 'read';

const Notifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NotificationsTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<NotificationFilters>({});

  const { 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    deleteNotifications 
  } = useNotificationOperations();

  // Build filters based on active tab
  const getFilters = (): NotificationFilters => {
    const baseFilters = { ...filters };
    
    if (activeTab === 'unread') {
      baseFilters.isRead = false;
    } else if (activeTab === 'read') {
      baseFilters.isRead = true;
    }
    
    return baseFilters;
  };

  const { 
    data: notificationsData, 
    isLoading, 
    error 
  } = useNotifications(getFilters(), currentPage, 20);

  const { data: stats } = useNotificationStats();

  const tabs = [
    { 
      id: 'all' as const, 
      label: 'All', 
      count: stats?.total || 0 
    },
    { 
      id: 'unread' as const, 
      label: 'Unread', 
      count: stats?.unread || 0 
    },
    { 
      id: 'read' as const, 
      label: 'Read', 
      count: (stats?.total || 0) - (stats?.unread || 0) 
    }
  ];

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    if (!notificationsData?.notifications) return;
    
    const allIds = notificationsData.notifications.map(n => n._id);
    setSelectedNotifications(
      selectedNotifications.length === allIds.length ? [] : allIds
    );
  };

  const handleMarkAsRead = async (notificationIds: string[]) => {
    try {
      await markAsRead.mutateAsync(notificationIds);
      setSelectedNotifications([]);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead.mutateAsync();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedNotifications.length === 0) return;
    
    if (!confirm(`Delete ${selectedNotifications.length} notification(s)?`)) return;
    
    try {
      await deleteNotifications.mutateAsync(selectedNotifications);
      setSelectedNotifications([]);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (!confirm('Delete this notification?')) return;
    
    try {
      await deleteNotification.mutateAsync(notificationId);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      await handleMarkAsRead([notification._id]);
    }
    
    // Navigate to action URL if available
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const renderNotificationCard = (notification: Notification) => {
    const isSelected = selectedNotifications.includes(notification._id);
    
    return (
      <motion.div
        key={notification._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${
          isSelected ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' : 'border-gray-200 dark:border-gray-700'
        } ${!notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
      >
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleSelectNotification(notification._id)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              
              <div 
                className="flex-1 cursor-pointer"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">
                    {notificationService.getCategoryIcon(notification.category)}
                  </span>
                  
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    notificationService.getCategoryColor(notification.category)
                  }`}>
                    {notification.category}
                  </span>
                  
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    notificationService.getPriorityColor(notification.priority)
                  }`}>
                    {notification.priority}
                  </span>
                  
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {notification.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  {notification.message}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>{notification.timeAgo}</span>
                  <span>{notificationService.formatTime(notification.createdAt)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              {!notification.isRead && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMarkAsRead([notification._id])}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Mark as read"
                >
                  <Eye className="w-4 h-4" />
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDeleteNotification(notification._id)}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Delete notification"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">Failed to load notifications</div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const notifications = notificationsData?.notifications || [];
  const pagination = notificationsData?.pagination;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Bell className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Notifications
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400">
          Stay updated with your productivity journey
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-600">{stats.unread}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Unread</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-green-600">{stats.recentCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Recent</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-purple-600">
              {Object.keys(stats.byCategory).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Categories</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setActiveTab(tab.id);
              setCurrentPage(1);
              setSelectedNotifications([]);
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              }`}>
                {tab.count}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSelectAll}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Select All</span>
          </button>
          
          {selectedNotifications.length > 0 && (
            <>
              <button
                onClick={() => handleMarkAsRead(selectedNotifications)}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>Mark Read ({selectedNotifications.length})</span>
              </button>
              
              <button
                onClick={handleDeleteSelected}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete ({selectedNotifications.length})</span>
              </button>
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {stats && stats.unread > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No notifications
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {activeTab === 'unread' 
                ? "You're all caught up! No unread notifications."
                : activeTab === 'read'
                ? "No read notifications yet."
                : "You don't have any notifications yet."
              }
            </p>
          </div>
        ) : (
          <>
            {notifications.map(renderNotificationCard)}
            
            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-center space-x-2 pt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={!pagination.hasPrev}
                  className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                  Page {pagination.page} of {pagination.pages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                  disabled={!pagination.hasNext}
                  className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Notifications;
