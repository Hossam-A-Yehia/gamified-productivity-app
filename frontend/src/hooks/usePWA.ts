import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOffline: boolean;
  isUpdateAvailable: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
}

interface PWAActions {
  installApp: () => Promise<void>;
  updateApp: () => Promise<void>;
  dismissInstallPrompt: () => void;
}

export const usePWA = (): PWAState & PWAActions => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstallation = () => {
      // Check for standalone mode (iOS)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      
      // Check for Android PWA
      const isAndroidPWA = window.navigator.standalone === true;
      
      // Check for desktop PWA
      const isDesktopPWA = window.matchMedia('(display-mode: standalone)').matches;
      
      setIsInstalled(isStandalone || isAndroidPWA || isDesktopPWA);
    };

    checkInstallation();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setInstallPrompt(promptEvent);
      setIsInstallable(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
      
      // Track installation
      if (typeof gtag !== 'undefined') {
        gtag('event', 'pwa_install', {
          event_category: 'PWA',
          event_label: 'App Installed'
        });
      }
    };

    // Listen for online/offline events
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    // Service worker update detection
    const handleServiceWorkerUpdate = () => {
      setIsUpdateAvailable(true);
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Service worker registration and update detection
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully');
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  handleServiceWorkerUpdate();
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installApp = async (): Promise<void> => {
    if (!installPrompt) {
      throw new Error('Install prompt not available');
    }

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setIsInstallable(false);
        setInstallPrompt(null);
        
        // Track installation attempt
        if (typeof gtag !== 'undefined') {
          gtag('event', 'pwa_install_accepted', {
            event_category: 'PWA',
            event_label: 'Install Prompt Accepted'
          });
        }
      } else {
        console.log('User dismissed the install prompt');
        
        // Track dismissal
        if (typeof gtag !== 'undefined') {
          gtag('event', 'pwa_install_dismissed', {
            event_category: 'PWA',
            event_label: 'Install Prompt Dismissed'
          });
        }
      }
    } catch (error) {
      console.error('Error during app installation:', error);
      throw error;
    }
  };

  const updateApp = async (): Promise<void> => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && registration.waiting) {
          // Tell the waiting service worker to skip waiting and become active
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          
          // Listen for the controlling service worker change
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
          });
        }
      } catch (error) {
        console.error('Error updating app:', error);
        throw error;
      }
    }
  };

  const dismissInstallPrompt = (): void => {
    setIsInstallable(false);
    setInstallPrompt(null);
    
    // Track dismissal
    if (typeof gtag !== 'undefined') {
      gtag('event', 'pwa_install_banner_dismissed', {
        event_category: 'PWA',
        event_label: 'Install Banner Dismissed'
      });
    }
  };

  return {
    isInstallable,
    isInstalled,
    isOffline,
    isUpdateAvailable,
    installPrompt,
    installApp,
    updateApp,
    dismissInstallPrompt,
  };
};

// Hook for PWA install banner
export const usePWAInstallBanner = () => {
  const { isInstallable, isInstalled, installApp, dismissInstallPrompt } = usePWA();
  const [showBanner, setShowBanner] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    // Check if banner was previously dismissed
    const dismissed = localStorage.getItem('pwa-install-banner-dismissed');
    setBannerDismissed(dismissed === 'true');
  }, []);

  useEffect(() => {
    // Show banner if app is installable, not installed, and not previously dismissed
    setShowBanner(isInstallable && !isInstalled && !bannerDismissed);
  }, [isInstallable, isInstalled, bannerDismissed]);

  const handleInstall = async () => {
    try {
      await installApp();
      setShowBanner(false);
    } catch (error) {
      console.error('Failed to install app:', error);
    }
  };

  const handleDismiss = () => {
    dismissInstallPrompt();
    setShowBanner(false);
    setBannerDismissed(true);
    localStorage.setItem('pwa-install-banner-dismissed', 'true');
  };

  return {
    showBanner,
    handleInstall,
    handleDismiss,
  };
};

// Hook for offline functionality
export const useOfflineSync = () => {
  const { isOffline } = usePWA();
  const [pendingActions, setPendingActions] = useState<any[]>([]);

  const addOfflineAction = (action: any) => {
    if (isOffline) {
      setPendingActions(prev => [...prev, { ...action, timestamp: Date.now() }]);
      
      // Store in IndexedDB for persistence
      if ('indexedDB' in window) {
        const request = indexedDB.open('gamified-productivity-offline', 1);
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(['offlineActions'], 'readwrite');
          const store = transaction.objectStore('offlineActions');
          store.add({ ...action, id: Date.now(), timestamp: Date.now() });
        };
      }
    }
  };

  const syncPendingActions = async () => {
    if (!isOffline && pendingActions.length > 0) {
      try {
        // Sync actions with server
        for (const action of pendingActions) {
          // Implement sync logic based on action type
          console.log('Syncing action:', action);
        }
        
        setPendingActions([]);
        
        // Clear IndexedDB
        if ('indexedDB' in window) {
          const request = indexedDB.open('gamified-productivity-offline', 1);
          request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['offlineActions'], 'readwrite');
            const store = transaction.objectStore('offlineActions');
            store.clear();
          };
        }
      } catch (error) {
        console.error('Failed to sync offline actions:', error);
      }
    }
  };

  useEffect(() => {
    if (!isOffline) {
      syncPendingActions();
    }
  }, [isOffline]);

  return {
    isOffline,
    pendingActions,
    addOfflineAction,
    syncPendingActions,
  };
};

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
