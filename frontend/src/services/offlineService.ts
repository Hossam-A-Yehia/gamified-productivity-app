// Offline Service for managing offline data and synchronization

interface OfflineAction {
  id: string;
  type: 'CREATE_TASK' | 'UPDATE_TASK' | 'COMPLETE_TASK' | 'CREATE_FOCUS_SESSION' | 'JOIN_CHALLENGE';
  data: any;
  timestamp: number;
  retryCount: number;
}

interface OfflineData {
  tasks: any[];
  focusSessions: any[];
  achievements: any[];
  userProfile: any;
  lastSync: number;
}

class OfflineService {
  private dbName = 'gamified-productivity-offline';
  private version = 1;
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('offlineActions')) {
          const actionsStore = db.createObjectStore('offlineActions', { keyPath: 'id' });
          actionsStore.createIndex('timestamp', 'timestamp', { unique: false });
          actionsStore.createIndex('type', 'type', { unique: false });
        }

        if (!db.objectStoreNames.contains('cachedData')) {
          const dataStore = db.createObjectStore('cachedData', { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains('tasks')) {
          const tasksStore = db.createObjectStore('tasks', { keyPath: 'id' });
          tasksStore.createIndex('status', 'status', { unique: false });
          tasksStore.createIndex('category', 'category', { unique: false });
        }

        if (!db.objectStoreNames.contains('focusSessions')) {
          const sessionsStore = db.createObjectStore('focusSessions', { keyPath: 'id' });
          sessionsStore.createIndex('startTime', 'startTime', { unique: false });
        }

        if (!db.objectStoreNames.contains('achievements')) {
          const achievementsStore = db.createObjectStore('achievements', { keyPath: 'id' });
          achievementsStore.createIndex('category', 'category', { unique: false });
        }
      };
    });
  }

  // Store offline action for later synchronization
  async storeOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    if (!this.db) await this.initDB();

    const offlineAction: OfflineAction = {
      ...action,
      id: `${action.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineActions'], 'readwrite');
      const store = transaction.objectStore('offlineActions');
      const request = store.add(offlineAction);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get all pending offline actions
  async getOfflineActions(): Promise<OfflineAction[]> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineActions'], 'readonly');
      const store = transaction.objectStore('offlineActions');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Remove offline action after successful sync
  async removeOfflineAction(id: string): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineActions'], 'readwrite');
      const store = transaction.objectStore('offlineActions');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Cache data for offline access
  async cacheData(key: string, data: any): Promise<void> {
    if (!this.db) await this.initDB();

    const cachedItem = {
      key,
      data,
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedData'], 'readwrite');
      const store = transaction.objectStore('cachedData');
      const request = store.put(cachedItem);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get cached data
  async getCachedData(key: string): Promise<any | null> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedData'], 'readonly');
      const store = transaction.objectStore('cachedData');
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          // Check if data is not too old (24 hours)
          const isExpired = Date.now() - result.timestamp > 24 * 60 * 60 * 1000;
          resolve(isExpired ? null : result.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Store tasks for offline access
  async storeTasks(tasks: any[]): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tasks'], 'readwrite');
      const store = transaction.objectStore('tasks');

      // Clear existing tasks
      store.clear();

      // Add new tasks
      tasks.forEach(task => {
        store.add(task);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Get offline tasks
  async getOfflineTasks(): Promise<any[]> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tasks'], 'readonly');
      const store = transaction.objectStore('tasks');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Add task for offline creation
  async addOfflineTask(task: any): Promise<void> {
    if (!this.db) await this.initDB();

    const offlineTask = {
      ...task,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isOffline: true,
      createdAt: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tasks'], 'readwrite');
      const store = transaction.objectStore('tasks');
      const request = store.add(offlineTask);

      request.onsuccess = () => {
        // Also store as offline action for sync
        this.storeOfflineAction({
          type: 'CREATE_TASK',
          data: task
        });
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Update task offline
  async updateOfflineTask(taskId: string, updates: any): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tasks'], 'readwrite');
      const store = transaction.objectStore('tasks');
      const getRequest = store.get(taskId);

      getRequest.onsuccess = () => {
        const task = getRequest.result;
        if (task) {
          const updatedTask = { ...task, ...updates, updatedAt: new Date().toISOString() };
          const putRequest = store.put(updatedTask);

          putRequest.onsuccess = () => {
            // Store as offline action for sync
            this.storeOfflineAction({
              type: 'UPDATE_TASK',
              data: { id: taskId, updates }
            });
            resolve();
          };
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Task not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Store focus sessions
  async storeFocusSessions(sessions: any[]): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['focusSessions'], 'readwrite');
      const store = transaction.objectStore('focusSessions');

      // Clear existing sessions
      store.clear();

      // Add new sessions
      sessions.forEach(session => {
        store.add(session);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Add offline focus session
  async addOfflineFocusSession(session: any): Promise<void> {
    if (!this.db) await this.initDB();

    const offlineSession = {
      ...session,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isOffline: true
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['focusSessions'], 'readwrite');
      const store = transaction.objectStore('focusSessions');
      const request = store.add(offlineSession);

      request.onsuccess = () => {
        // Store as offline action for sync
        this.storeOfflineAction({
          type: 'CREATE_FOCUS_SESSION',
          data: session
        });
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Get offline focus sessions
  async getOfflineFocusSessions(): Promise<any[]> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['focusSessions'], 'readonly');
      const store = transaction.objectStore('focusSessions');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Store achievements
  async storeAchievements(achievements: any[]): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['achievements'], 'readwrite');
      const store = transaction.objectStore('achievements');

      // Clear existing achievements
      store.clear();

      // Add new achievements
      achievements.forEach(achievement => {
        store.add(achievement);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Get offline achievements
  async getOfflineAchievements(): Promise<any[]> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['achievements'], 'readonly');
      const store = transaction.objectStore('achievements');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Sync offline actions with server
  async syncOfflineActions(): Promise<{ success: number; failed: number }> {
    const actions = await this.getOfflineActions();
    let success = 0;
    let failed = 0;

    for (const action of actions) {
      try {
        await this.syncAction(action);
        await this.removeOfflineAction(action.id);
        success++;
      } catch (error) {
        console.error('Failed to sync action:', action, error);
        failed++;
        
        // Increment retry count
        action.retryCount++;
        
        // Remove action if it has failed too many times
        if (action.retryCount >= 3) {
          await this.removeOfflineAction(action.id);
        }
      }
    }

    return { success, failed };
  }

  // Sync individual action
  private async syncAction(action: OfflineAction): Promise<void> {
    const { type, data } = action;

    switch (type) {
      case 'CREATE_TASK':
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        break;

      case 'UPDATE_TASK':
        await fetch(`/api/tasks/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data.updates)
        });
        break;

      case 'COMPLETE_TASK':
        await fetch(`/api/tasks/${data.id}/complete`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' }
        });
        break;

      case 'CREATE_FOCUS_SESSION':
        await fetch('/api/focus/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        break;

      case 'JOIN_CHALLENGE':
        await fetch(`/api/challenges/${data.challengeId}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        break;

      default:
        throw new Error(`Unknown action type: ${type}`);
    }
  }

  // Clear all offline data
  async clearOfflineData(): Promise<void> {
    if (!this.db) await this.initDB();

    const storeNames = ['offlineActions', 'cachedData', 'tasks', 'focusSessions', 'achievements'];
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeNames, 'readwrite');
      
      storeNames.forEach(storeName => {
        transaction.objectStore(storeName).clear();
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Get offline storage usage
  async getStorageUsage(): Promise<{ used: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        quota: estimate.quota || 0
      };
    }
    
    return { used: 0, quota: 0 };
  }
}

export const offlineService = new OfflineService();
export default offlineService;
