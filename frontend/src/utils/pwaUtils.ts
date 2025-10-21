// PWA Utility functions for icon generation and management

export interface PWAIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: string;
}

export const PWA_ICON_SIZES = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' }
];

export const SHORTCUT_ICONS = [
  { name: 'shortcut-add-task.png', size: 96 },
  { name: 'shortcut-focus.png', size: 96 },
  { name: 'shortcut-challenges.png', size: 96 }
];

// Generate PWA icons programmatically
export const generatePWAIcon = (size: number, text: string = '🎮'): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
  canvas.width = size;
  canvas.height = size;
  
  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#6366f1');
  gradient.addColorStop(1, '#8b5cf6');
  
  // Fill background
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // Add rounded corners
  ctx.globalCompositeOperation = 'destination-in';
  ctx.beginPath();
  const radius = size * 0.2;
  ctx.roundRect(0, 0, size, size, radius);
  ctx.fill();
  
  // Reset composite operation
  ctx.globalCompositeOperation = 'source-over';
  
  // Add emoji/text
  ctx.fillStyle = '#ffffff';
  ctx.font = `${size * 0.5}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, size / 2, size / 2);
  
  return canvas.toDataURL('image/png');
};

// Generate all PWA icons
export const generateAllPWAIcons = (): { [key: string]: string } => {
  const icons: { [key: string]: string } = {};
  
  PWA_ICON_SIZES.forEach(({ size, name }) => {
    icons[name] = generatePWAIcon(size);
  });
  
  // Generate shortcut icons
  SHORTCUT_ICONS.forEach(({ name, size }) => {
    let emoji = '🎮';
    if (name.includes('add-task')) emoji = '➕';
    if (name.includes('focus')) emoji = '🎯';
    if (name.includes('challenges')) emoji = '🏆';
    
    icons[name] = generatePWAIcon(size, emoji);
  });
  
  return icons;
};

// Download generated icons
export const downloadPWAIcons = () => {
  const icons = generateAllPWAIcons();
  
  Object.entries(icons).forEach(([name, dataUrl]) => {
    const link = document.createElement('a');
    link.download = name;
    link.href = dataUrl;
    link.click();
  });
};

// Check PWA installation status
export const isPWAInstalled = (): boolean => {
  // Check for standalone mode (iOS)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  
  // Check for Android PWA
  const isAndroidPWA = (window.navigator as any).standalone === true;
  
  return isStandalone || isAndroidPWA;
};

// Get PWA display mode
export const getPWADisplayMode = (): string => {
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return 'standalone';
  }
  if (window.matchMedia('(display-mode: minimal-ui)').matches) {
    return 'minimal-ui';
  }
  if (window.matchMedia('(display-mode: fullscreen)').matches) {
    return 'fullscreen';
  }
  return 'browser';
};

// Check if device supports PWA installation
export const supportsPWAInstallation = (): boolean => {
  return 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window;
};

// Get device type for PWA optimization
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent);
  
  if (isTablet) return 'tablet';
  if (isMobile) return 'mobile';
  return 'desktop';
};

// PWA analytics tracking
export const trackPWAEvent = (eventName: string, eventData?: any) => {
  // Google Analytics 4
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, {
      event_category: 'PWA',
      custom_parameter_1: getPWADisplayMode(),
      custom_parameter_2: getDeviceType(),
      ...eventData
    });
  }
  
  // Custom analytics
  console.log(`PWA Event: ${eventName}`, {
    displayMode: getPWADisplayMode(),
    deviceType: getDeviceType(),
    isInstalled: isPWAInstalled(),
    timestamp: new Date().toISOString(),
    ...eventData
  });
};

// PWA performance metrics
export const getPWAPerformanceMetrics = () => {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  return {
    loadTime: navigation.loadEventEnd - navigation.loadEventStart,
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
    firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
    displayMode: getPWADisplayMode(),
    isInstalled: isPWAInstalled(),
    deviceType: getDeviceType()
  };
};

// PWA cache management
export const managePWACache = {
  // Clear all caches
  clearAll: async (): Promise<void> => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
  },
  
  // Get cache size
  getSize: async (): Promise<number> => {
    if ('caches' in window && 'storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return estimate.usage || 0;
    }
    return 0;
  },
  
  // Update cache
  update: async (): Promise<void> => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        registration.update();
      }
    }
  }
};

// PWA notification helpers
export const pwaNotifications = {
  // Request permission
  requestPermission: async (): Promise<NotificationPermission> => {
    if ('Notification' in window) {
      return await Notification.requestPermission();
    }
    return 'denied';
  },
  
  // Show notification
  show: (title: string, options?: NotificationOptions): Notification | null => {
    if ('Notification' in window && Notification.permission === 'granted') {
      return new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        ...options
      });
    }
    return null;
  },
  
  // Show persistent notification via service worker
  showPersistent: async (title: string, options?: NotificationOptions): Promise<void> => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.showNotification(title, {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          ...options
        });
      }
    }
  }
};

// PWA share functionality
export const pwaShare = {
  // Check if Web Share API is supported
  isSupported: (): boolean => {
    return 'share' in navigator;
  },
  
  // Share content
  share: async (data: ShareData): Promise<void> => {
    if (pwaShare.isSupported()) {
      try {
        await navigator.share(data);
        trackPWAEvent('pwa_share_success', { title: data.title });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
          trackPWAEvent('pwa_share_error', { error: (error as Error).message });
        }
      }
    } else {
      // Fallback to clipboard
      if (data.url) {
        await navigator.clipboard.writeText(data.url);
        trackPWAEvent('pwa_share_fallback', { method: 'clipboard' });
      }
    }
  }
};

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
