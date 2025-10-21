// Service Worker for Gamified Productivity App
// Provides offline functionality, caching, and background sync

const CACHE_NAME = 'gamified-productivity-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Resources to cache immediately
const STATIC_CACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// API endpoints that should be cached
const API_CACHE_PATTERNS = [
  /^\/api\/auth\/me$/,
  /^\/api\/profile\/me$/,
  /^\/api\/tasks\?/,
  /^\/api\/achievements/,
  /^\/api\/leaderboard/
];

// Resources that should always be fetched from network
const NETWORK_FIRST_PATTERNS = [
  /^\/api\/auth\/(login|logout|register)/,
  /^\/api\/tasks\/\w+\/(complete|update)/,
  /^\/api\/challenges\/\w+\/join/,
  /^\/api\/focus\/(start|stop)/
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static resources');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Static resources cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static resources:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle network requests with caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle different types of requests with appropriate caching strategies
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
  } else if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$/)) {
    event.respondWith(handleStaticAsset(request));
  } else {
    event.respondWith(handlePageRequest(request));
  }
});

// Handle API requests with network-first or cache-first strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname + url.search;

  try {
    // Network-first for critical operations
    if (NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(pathname))) {
      return await networkFirst(request);
    }

    // Cache-first for read operations that can be cached
    if (API_CACHE_PATTERNS.some(pattern => pattern.test(pathname))) {
      return await cacheFirst(request);
    }

    // Default to network-first for other API calls
    return await networkFirst(request);
  } catch (error) {
    console.error('[SW] API request failed:', error);
    
    // Return cached version if available, otherwise return offline response
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline API response
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'This feature is not available offline'
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  try {
    return await cacheFirst(request);
  } catch (error) {
    console.error('[SW] Static asset request failed:', error);
    return new Response('Asset not available offline', { status: 404 });
  }
}

// Handle page requests with network-first, fallback to offline page
async function handlePageRequest(request) {
  try {
    return await networkFirst(request);
  } catch (error) {
    console.error('[SW] Page request failed:', error);
    
    // Try to return cached version of the page
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fallback to offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineResponse = await caches.match(OFFLINE_URL);
      if (offlineResponse) {
        return offlineResponse;
      }
    }

    return new Response('Page not available offline', { status: 404 });
  }
}

// Network-first caching strategy
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Cache-first caching strategy
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Update cache in background
    fetch(request)
      .then(response => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
      })
      .catch(() => {
        // Ignore network errors for background updates
      });
    
    return cachedResponse;
  }
  
  // Not in cache, fetch from network
  const networkResponse = await fetch(request);
  if (networkResponse.ok) {
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'task-sync') {
    event.waitUntil(syncOfflineTasks());
  } else if (event.tag === 'focus-sync') {
    event.waitUntil(syncOfflineFocusSessions());
  }
});

// Sync offline tasks when connection is restored
async function syncOfflineTasks() {
  try {
    console.log('[SW] Syncing offline tasks...');
    
    // Get offline tasks from IndexedDB
    const offlineTasks = await getOfflineData('tasks');
    
    for (const task of offlineTasks) {
      try {
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(task.data)
        });
        
        if (response.ok) {
          // Remove from offline storage
          await removeOfflineData('tasks', task.id);
          console.log('[SW] Task synced successfully:', task.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync task:', task.id, error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Sync offline focus sessions
async function syncOfflineFocusSessions() {
  try {
    console.log('[SW] Syncing offline focus sessions...');
    
    const offlineSessions = await getOfflineData('focusSessions');
    
    for (const session of offlineSessions) {
      try {
        const response = await fetch('/api/focus/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(session.data)
        });
        
        if (response.ok) {
          await removeOfflineData('focusSessions', session.id);
          console.log('[SW] Focus session synced successfully:', session.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync focus session:', session.id, error);
      }
    }
  } catch (error) {
    console.error('[SW] Focus session sync failed:', error);
  }
}

// IndexedDB helpers for offline data
async function getOfflineData(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('gamified-productivity-offline', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id' });
      }
    };
  });
}

async function removeOfflineData(storeName, id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('gamified-productivity-offline', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: 'You have new updates in your productivity app!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icons/action-open.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/action-dismiss.png'
      }
    ]
  };
  
  if (event.data) {
    const payload = event.data.json();
    options.body = payload.body || options.body;
    options.data = { ...options.data, ...payload.data };
  }
  
  event.waitUntil(
    self.registration.showNotification('Gamified Productivity', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    const url = event.notification.data?.url || '/';
    
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then((clientList) => {
          // Check if app is already open
          for (const client of clientList) {
            if (client.url.includes(url) && 'focus' in client) {
              return client.focus();
            }
          }
          
          // Open new window
          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
    );
  }
});

console.log('[SW] Service worker loaded successfully');
