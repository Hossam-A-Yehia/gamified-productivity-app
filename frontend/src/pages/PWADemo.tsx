import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Smartphone, 
  Download, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  Settings,
  Share2,
  Bell
} from 'lucide-react';
import { usePWA } from '../hooks/usePWA';
import { pwaShare, pwaNotifications, managePWACache } from '../utils/pwaUtils';
import PWAInstallPrompt from '../components/common/PWAInstallPrompt';
import PWAIconGenerator from '../components/common/PWAIconGenerator';
import { ConnectionStatus } from '../components/common/OfflineIndicator';

const PWADemo: React.FC = () => {
  const { 
    isInstallable, 
    isInstalled, 
    isOffline, 
    isUpdateAvailable, 
    installApp, 
    updateApp 
  } = usePWA();
  
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [cacheSize, setCacheSize] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleInstall = async () => {
    if (isInstallable) {
      try {
        await installApp();
      } catch (error) {
        console.error('Failed to install app:', error);
      }
    } else {
      setShowInstallPrompt(true);
    }
  };

  const handleShare = async () => {
    await pwaShare.share({
      title: 'Gamified Productivity App',
      text: 'Check out this amazing productivity app that turns tasks into a game!',
      url: window.location.href
    });
  };

  const handleNotification = async () => {
    const permission = await pwaNotifications.requestPermission();
    if (permission === 'granted') {
      pwaNotifications.show('PWA Demo', {
        body: 'This is a test notification from your PWA!',
        icon: '/icons/icon-192x192.png'
      });
    }
  };

  const handleClearCache = async () => {
    setIsLoading(true);
    try {
      await managePWACache.clearAll();
      setCacheSize(0);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCache = async () => {
    setIsLoading(true);
    try {
      await managePWACache.update();
      const size = await managePWACache.getSize();
      setCacheSize(size);
    } catch (error) {
      console.error('Failed to update cache:', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    const loadCacheSize = async () => {
      const size = await managePWACache.getSize();
      setCacheSize(size);
    };
    loadCacheSize();
  }, []);

  const features = [
    {
      icon: Download,
      title: 'App Installation',
      description: 'Install the app on your device for native experience',
      status: isInstalled ? 'Installed' : isInstallable ? 'Available' : 'Not Available',
      color: isInstalled ? 'green' : isInstallable ? 'blue' : 'gray',
      action: handleInstall,
      actionText: isInstalled ? 'Already Installed' : 'Install App'
    },
    {
      icon: isOffline ? WifiOff : Wifi,
      title: 'Offline Support',
      description: 'Works completely offline with data synchronization',
      status: isOffline ? 'Offline' : 'Online',
      color: isOffline ? 'amber' : 'green',
      action: () => window.location.reload(),
      actionText: 'Test Connection'
    },
    {
      icon: RefreshCw,
      title: 'App Updates',
      description: 'Automatic updates with user-friendly prompts',
      status: isUpdateAvailable ? 'Update Available' : 'Up to Date',
      color: isUpdateAvailable ? 'blue' : 'green',
      action: updateApp,
      actionText: isUpdateAvailable ? 'Update Now' : 'Check Updates'
    },
    {
      icon: Share2,
      title: 'Web Share API',
      description: 'Native sharing capabilities',
      status: pwaShare.isSupported() ? 'Supported' : 'Not Supported',
      color: pwaShare.isSupported() ? 'green' : 'gray',
      action: handleShare,
      actionText: 'Test Share'
    },
    {
      icon: Bell,
      title: 'Push Notifications',
      description: 'Native notification support',
      status: 'Notification' in window ? 'Supported' : 'Not Supported',
      color: 'Notification' in window ? 'green' : 'gray',
      action: handleNotification,
      actionText: 'Test Notification'
    }
  ];

  const getStatusColor = (color: string) => {
    const colors = {
      green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      gray: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Smartphone className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          PWA Features Demo
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Explore the Progressive Web App capabilities of your Gamified Productivity App
        </p>

        <div className="flex items-center justify-center mt-6">
          <ConnectionStatus />
        </div>
      </div>

      {/* PWA Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(feature.color)}`}>
                {feature.status}
              </span>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {feature.title}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {feature.description}
            </p>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={feature.action}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {feature.actionText}
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* Cache Management */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Cache Management
            </h2>
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Cache Size: {(cacheSize / 1024 / 1024).toFixed(2)} MB
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleUpdateCache}
            disabled={isLoading}
            className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <RefreshCw className="w-5 h-5" />
            )}
            <span>Update Cache</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClearCache}
            disabled={isLoading}
            className="bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Settings className="w-5 h-5" />
            )}
            <span>Clear Cache</span>
          </motion.button>
        </div>
      </div>

      {/* Icon Generator */}
      <PWAIconGenerator />

      {/* Install Prompt Modal */}
      <PWAInstallPrompt 
        isOpen={showInstallPrompt} 
        onClose={() => setShowInstallPrompt(false)} 
      />
    </div>
  );
};

export default PWADemo;
