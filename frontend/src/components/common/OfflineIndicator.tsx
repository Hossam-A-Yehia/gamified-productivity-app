import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, CloudOff, RefreshCw } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';

const OfflineIndicator: React.FC = () => {
  const { isOffline } = usePWA();

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-40"
        >
          <div className="bg-amber-500 text-white rounded-lg shadow-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <WifiOff className="w-5 h-5 mt-0.5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold">
                  You're Offline
                </h3>
                <p className="text-xs mt-1 opacity-90">
                  Some features may be limited. Your changes will sync when you're back online.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => window.location.reload()}
                className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
                aria-label="Retry connection"
              >
                <RefreshCw className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const OnlineIndicator: React.FC = () => {
  const { isOffline } = usePWA();
  const [showOnlineMessage, setShowOnlineMessage] = React.useState(false);

  React.useEffect(() => {
    if (!isOffline) {
      setShowOnlineMessage(true);
      const timer = setTimeout(() => setShowOnlineMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOffline]);

  return (
    <AnimatePresence>
      {!isOffline && showOnlineMessage && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-40"
        >
          <div className="bg-green-500 text-white rounded-lg shadow-lg p-4">
            <div className="flex items-center space-x-3">
              <Wifi className="w-5 h-5" />
              <div>
                <h3 className="text-sm font-semibold">
                  Back Online!
                </h3>
                <p className="text-xs mt-1 opacity-90">
                  All features are now available. Syncing your data...
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const ConnectionStatus: React.FC = () => {
  const { isOffline } = usePWA();

  return (
    <div className="flex items-center space-x-2">
      {isOffline ? (
        <>
          <CloudOff className="w-4 h-4 text-amber-500" />
          <span className="text-sm text-amber-600 dark:text-amber-400">
            Offline
          </span>
        </>
      ) : (
        <>
          <Wifi className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-600 dark:text-green-400">
            Online
          </span>
        </>
      )}
    </div>
  );
};

export default OfflineIndicator;
