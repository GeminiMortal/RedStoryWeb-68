
// 离线数据存储管理
// 支持 IndexedDB 和 localStorage

class OfflineStorage {
  constructor() {
    this.dbName = 'RedStoryOfflineDB';
    this.dbVersion = 1;
    this.db = null;
    this.isOnline = navigator.onLine;
    this.syncQueue = [];
    this.listeners = new Map();
    
    // 监听网络状态变化
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners('online');
      this.processSyncQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners('offline');
    });
  }

  /**
   * 初始化数据库
   */
  async init() {
    try {
      this.db = await this.openDB();
      console.log('离线存储初始化成功');
    } catch (error) {
      console.error('离线存储初始化失败:', error);
      // 回退到 localStorage
      this.useLocalStorageFallback();
    }
  }

  /**
   * 打开 IndexedDB
   */
  openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // 创建对象存储
        if (!db.objectStoreNames.contains('stories')) {
          const storyStore = db.createObjectStore('stories', { keyPath: '_id' });
          storyStore.createIndex('status', 'status', { unique: false });
          storyStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('drafts')) {
          const draftStore = db.createObjectStore('drafts', { keyPath: '_id' });
          draftStore.createIndex('lastSavedAt', 'lastSavedAt', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('type', 'type', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * 使用 localStorage 作为回退方案
   */
  useLocalStorageFallback() {
    console.log('使用 localStorage 作为离线存储回退方案');
    this.useLocalStorage = true;
  }

  /**
   * 保存故事到离线存储
   * @param {Object} story - 故事数据
   */
  async saveStory(story) {
    try {
      if (this.useLocalStorage) {
        return this.saveStoryToLocalStorage(story);
      }
      
      const transaction = this.db.transaction(['stories'], 'readwrite');
      const store = transaction.objectStore('stories');
      await store.put(story);
      
      console.log('故事已保存到离线存储:', story._id);
    } catch (error) {
      console.error('保存故事到离线存储失败:', error);
      throw error;
    }
  }

  /**
   * 从离线存储获取故事
   * @param {string} storyId - 故事ID
   * @returns {Promise<Object|null>}
   */
  async getStory(storyId) {
    try {
      if (this.useLocalStorage) {
        return this.getStoryFromLocalStorage(storyId);
      }
      
      const transaction = this.db.transaction(['stories'], 'readonly');
      const store = transaction.objectStore('stories');
      const request = store.get(storyId);
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('从离线存储获取故事失败:', error);
      return null;
    }
  }

  /**
   * 获取所有故事
   * @returns {Promise<Array>}
   */
  async getAllStories() {
    try {
      if (this.useLocalStorage) {
        return this.getAllStoriesFromLocalStorage();
      }
      
      const transaction = this.db.transaction(['stories'], 'readonly');
      const store = transaction.objectStore('stories');
      const request = store.getAll();
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('获取所有故事失败:', error);
      return [];
    }
  }

  /**
   * 保存草稿到离线存储
   * @param {Object} draft - 草稿数据
   */
  async saveDraft(draft) {
    try {
      if (this.useLocalStorage) {
        return this.saveDraftToLocalStorage(draft);
      }
      
      const transaction = this.db.transaction(['drafts'], 'readwrite');
      const store = transaction.objectStore('drafts');
      await store.put(draft);
      
      console.log('草稿已保存到离线存储:', draft._id);
    } catch (error) {
      console.error('保存草稿到离线存储失败:', error);
      throw error;
    }
  }

  /**
   * 添加到同步队列
   * @param {Object} item - 同步项目
   */
  async addToSyncQueue(item) {
    const syncItem = {
      ...item,
      id: Date.now() + Math.random(),
      timestamp: Date.now(),
      status: 'pending'
    };
    
    this.syncQueue.push(syncItem);
    
    try {
      if (this.useLocalStorage) {
        return this.addToSyncQueueLocalStorage(syncItem);
      }
      
      const transaction = this.db.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      await store.add(syncItem);
    } catch (error) {
      console.error('添加到同步队列失败:', error);
    }
    
    // 如果在线，立即处理同步
    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  /**
   * 处理同步队列
   */
  async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) {
      return;
    }
    
    console.log('开始处理同步队列:', this.syncQueue.length);
    
    const processedItems = [];
    
    for (const item of this.syncQueue) {
      try {
        await this.syncItem(item);
        processedItems.push(item);
      } catch (error) {
        console.error('同步项目失败:', item, error);
        // 保留失败的项目以便重试
      }
    }
    
    // 移除已处理的项目
    this.syncQueue = this.syncQueue.filter(item => !processedItems.includes(item));
    
    // 从数据库中移除已处理的项目
    if (!this.useLocalStorage) {
      await this.removeProcessedSyncItems(processedItems);
    }
    
    console.log('同步队列处理完成');
  }

  /**
   * 同步单个项目
   * @param {Object} item - 同步项目
   */
  async syncItem(item) {
    // 这里应该调用实际的API进行同步
    console.log('同步项目:', item);
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 标记为已同步
    item.status = 'synced';
    item.syncedAt = Date.now();
  }

  /**
   * 获取同步状态
   * @returns {Object} 同步状态信息
   */
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      pendingCount: this.syncQueue.length,
      lastSyncTime: this.getLastSyncTime()
    };
  }

  /**
   * 获取最后同步时间
   * @returns {number|null}
   */
  getLastSyncTime() {
    try {
      const lastSync = localStorage.getItem('lastSyncTime');
      return lastSync ? parseInt(lastSync) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * 设置最后同步时间
   * @param {number} timestamp - 时间戳
   */
  setLastSyncTime(timestamp) {
    try {
      localStorage.setItem('lastSyncTime', timestamp.toString());
    } catch (error) {
      console.error('设置最后同步时间失败:', error);
    }
  }

  /**
   * 添加事件监听器
   * @param {string} event - 事件名
   * @param {Function} callback - 回调函数
   */
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * 移除事件监听器
   * @param {string} event - 事件名
   * @param {Function} callback - 回调函数
   */
  removeEventListener(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * 通知监听器
   * @param {string} event - 事件名
   * @param {any} data - 事件数据
   */
  notifyListeners(event, data = null) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('事件监听器执行失败:', error);
        }
      });
    }
  }

  // localStorage 回退方案方法
  saveStoryToLocalStorage(story) {
    const stories = this.getAllStoriesFromLocalStorage();
    const index = stories.findIndex(s => s._id === story._id);
    if (index >= 0) {
      stories[index] = story;
    } else {
      stories.push(story);
    }
    localStorage.setItem('offline_stories', JSON.stringify(stories));
  }

  getStoryFromLocalStorage(storyId) {
    const stories = this.getAllStoriesFromLocalStorage();
    return stories.find(s => s._id === storyId) || null;
  }

  getAllStoriesFromLocalStorage() {
    try {
      const stories = localStorage.getItem('offline_stories');
      return stories ? JSON.parse(stories) : [];
    } catch (error) {
      console.error('读取离线故事失败:', error);
      return [];
    }
  }

  saveDraftToLocalStorage(draft) {
    const drafts = this.getAllDraftsFromLocalStorage();
    const index = drafts.findIndex(d => d._id === draft._id);
    if (index >= 0) {
      drafts[index] = draft;
    } else {
      drafts.push(draft);
    }
    localStorage.setItem('offline_drafts', JSON.stringify(drafts));
  }

  getAllDraftsFromLocalStorage() {
    try {
      const drafts = localStorage.getItem('offline_drafts');
      return drafts ? JSON.parse(drafts) : [];
    } catch (error) {
      console.error('读取离线草稿失败:', error);
      return [];
    }
  }

  addToSyncQueueLocalStorage(item) {
    const queue = this.getSyncQueueFromLocalStorage();
    queue.push(item);
    localStorage.setItem('sync_queue', JSON.stringify(queue));
  }

  getSyncQueueFromLocalStorage() {
    try {
      const queue = localStorage.getItem('sync_queue');
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('读取同步队列失败:', error);
      return [];
    }
  }

  async removeProcessedSyncItems(processedItems) {
    // 在实际实现中，这里应该从数据库中删除已处理的项目
    console.log('移除已处理的同步项目:', processedItems.length);
  }
}

// 创建全局离线存储实例
export const offlineStorage = new OfflineStorage();

// 初始化离线存储
offlineStorage.init().catch(error => {
  console.error('离线存储初始化失败:', error);
});

// 离线存储装饰器
export function withOfflineStorage(storeName) {
  return function(target, propertyName, descriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args) {
      try {
        // 尝试在线操作
        const result = await originalMethod.apply(this, args);
        return result;
      } catch (error) {
        console.warn('在线操作失败，尝试离线存储:', error);
        
        // 离线操作逻辑
        switch (storeName) {
          case 'stories':
            return offlineStorage.getAllStories();
          case 'drafts':
            return offlineStorage.getAllDraftsFromLocalStorage();
          default:
            throw error;
        }
      }
    };
    
    return descriptor;
  };
}
