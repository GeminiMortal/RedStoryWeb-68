
// 数据缓存管理工具
// 支持内存缓存、localStorage、sessionStorage

class DataCache {
  constructor() {
    this.memoryCache = new Map();
    this.cacheConfig = {
      // 缓存配置
      stories: {
        ttl: 5 * 60 * 1000, // 5分钟
        storage: 'localStorage',
        key: 'red_story_cache'
      },
      storyDetail: {
        ttl: 10 * 60 * 1000, // 10分钟
        storage: 'localStorage',
        key: 'red_story_detail_cache'
      },
      userData: {
        ttl: 30 * 60 * 1000, // 30分钟
        storage: 'sessionStorage',
        key: 'user_data_cache'
      },
      searchResults: {
        ttl: 2 * 60 * 1000, // 2分钟
        storage: 'sessionStorage',
        key: 'search_cache'
      }
    };
  }

  /**
   * 设置缓存
   * @param {string} key - 缓存键
   * @param {any} data - 缓存数据
   * @param {Object} options - 缓存选项
   */
  set(key, data, options = {}) {
    const cacheKey = options.key || key;
    const ttl = options.ttl || 5 * 60 * 1000; // 默认5分钟
    const storage = options.storage || 'memory'; // memory, localStorage, sessionStorage

    const cacheData = {
      data,
      timestamp: Date.now(),
      ttl,
      storage
    };

    try {
      switch (storage) {
        case 'localStorage':
          localStorage.setItem(cacheKey, JSON.stringify(cacheData));
          break;
        case 'sessionStorage':
          sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
          break;
        default:
          // 内存缓存
          this.memoryCache.set(cacheKey, cacheData);
          break;
      }
    } catch (error) {
      console.warn('缓存存储失败:', error);
      // 如果外部存储失败，回退到内存缓存
      this.memoryCache.set(cacheKey, cacheData);
    }
  }

  /**
   * 获取缓存
   * @param {string} key - 缓存键
   * @param {Object} options - 获取选项
   * @returns {any|null} 缓存数据或null
   */
  get(key, options = {}) {
    const cacheKey = options.key || key;
    let cacheData = null;

    try {
      // 优先从内存缓存获取
      if (this.memoryCache.has(cacheKey)) {
        cacheData = this.memoryCache.get(cacheKey);
      } else {
        // 从外部存储获取
        const storage = options.storage || 'localStorage';
        const stored = storage === 'sessionStorage' 
          ? sessionStorage.getItem(cacheKey)
          : localStorage.getItem(cacheKey);
        
        if (stored) {
          cacheData = JSON.parse(stored);
          // 重新放入内存缓存
          this.memoryCache.set(cacheKey, cacheData);
        }
      }
    } catch (error) {
      console.warn('缓存读取失败:', error);
      return null;
    }

    if (!cacheData) return null;

    // 检查是否过期
    const now = Date.now();
    if (now - cacheData.timestamp > cacheData.ttl) {
      this.delete(key, options);
      return null;
    }

    return cacheData.data;
  }

  /**
   * 删除缓存
   * @param {string} key - 缓存键
   * @param {Object} options - 删除选项
   */
  delete(key, options = {}) {
    const cacheKey = options.key || key;
    
    // 从内存缓存删除
    this.memoryCache.delete(cacheKey);
    
    try {
      // 从外部存储删除
      const storage = options.storage || 'localStorage';
      if (storage === 'sessionStorage') {
        sessionStorage.removeItem(cacheKey);
      } else {
        localStorage.removeItem(cacheKey);
      }
    } catch (error) {
      console.warn('缓存删除失败:', error);
    }
  }

  /**
   * 清空所有缓存
   * @param {string} type - 缓存类型 (stories, storyDetail, userData, searchResults)
   */
  clear(type = null) {
    if (type && this.cacheConfig[type]) {
      const config = this.cacheConfig[type];
      this.delete(type, config);
    } else {
      // 清空所有缓存
      this.memoryCache.clear();
      try {
        Object.values(this.cacheConfig).forEach(config => {
          if (config.storage === 'localStorage') {
            localStorage.removeItem(config.key);
          } else if (config.storage === 'sessionStorage') {
            sessionStorage.removeItem(config.key);
          }
        });
      } catch (error) {
        console.warn('清空缓存失败:', error);
      }
    }
  }

  /**
   * 获取缓存统计信息
   * @returns {Object} 缓存统计
   */
  getStats() {
    const memoryCount = this.memoryCache.size;
    let localStorageCount = 0;
    let sessionStorageCount = 0;

    try {
      Object.values(this.cacheConfig).forEach(config => {
        if (config.storage === 'localStorage' && localStorage.getItem(config.key)) {
          localStorageCount++;
        } else if (config.storage === 'sessionStorage' && sessionStorage.getItem(config.key)) {
          sessionStorageCount++;
        }
      });
    } catch (error) {
      console.warn('获取缓存统计失败:', error);
    }

    return {
      memory: memoryCount,
      localStorage: localStorageCount,
      sessionStorage: sessionStorageCount,
      total: memoryCount + localStorageCount + sessionStorageCount
    };
  }

  /**
   * 预加载数据到缓存
   * @param {string} type - 缓存类型
   * @param {Function} fetcher - 数据获取函数
   * @param {Object} options - 缓存选项
   */
  async preload(type, fetcher, options = {}) {
    const config = this.cacheConfig[type];
    if (!config) {
      console.warn(`未知的缓存类型: ${type}`);
      return;
    }

    try {
      // 检查缓存是否存在且未过期
      const cached = this.get(type, config);
      if (cached) {
        return cached;
      }

      // 获取新数据
      const data = await fetcher();
      this.set(type, data, config);
      return data;
    } catch (error) {
      console.error(`预加载缓存失败 (${type}):`, error);
      throw error;
    }
  }

  /**
   * 缓存故事列表
   * @param {Array} stories - 故事列表
   */
  setStories(stories) {
    this.set('stories', stories, this.cacheConfig.stories);
  }

  /**
   * 获取缓存的故事列表
   * @returns {Array|null}
   */
  getStories() {
    return this.get('stories', this.cacheConfig.stories);
  }

  /**
   * 缓存故事详情
   * @param {string} storyId - 故事ID
   * @param {Object} story - 故事详情
   */
  setStoryDetail(storyId, story) {
    const details = this.get('storyDetails', this.cacheConfig.storyDetail) || {};
    details[storyId] = story;
    this.set('storyDetails', details, this.cacheConfig.storyDetail);
  }

  /**
   * 获取缓存的故事详情
   * @param {string} storyId - 故事ID
   * @returns {Object|null}
   */
  getStoryDetail(storyId) {
    const details = this.get('storyDetails', this.cacheConfig.storyDetail);
    return details ? details[storyId] : null;
  }

  /**
   * 缓存搜索结果
   * @param {string} query - 搜索关键词
   * @param {Array} results - 搜索结果
   */
  setSearchResults(query, results) {
    const searches = this.get('searches', this.cacheConfig.searchResults) || {};
    searches[query] = results;
    this.set('searches', searches, this.cacheConfig.searchResults);
  }

  /**
   * 获取缓存的搜索结果
   * @param {string} query - 搜索关键词
   * @returns {Array|null}
   */
  getSearchResults(query) {
    const searches = this.get('searches', this.cacheConfig.searchResults);
    return searches ? searches[query] : null;
  }
}

// 创建全局缓存实例
export const dataCache = new DataCache();

// 缓存装饰器
export function withCache(key, options = {}) {
  return function(target, propertyName, descriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args) {
      // 尝试从缓存获取
      const cached = dataCache.get(key, options);
      if (cached !== null) {
        return cached;
      }
      
      // 执行原方法
      const result = await originalMethod.apply(this, args);
      
      // 缓存结果
      dataCache.set(key, result, options);
      
      return result;
    };
    
    return descriptor;
  };
}

// 缓存中间件
export function cacheMiddleware(cacheKey, options = {}) {
  return async (req, res, next) => {
    try {
      // 检查缓存
      const cached = dataCache.get(cacheKey, options);
      if (cached) {
        return res.json({
          success: true,
          data: cached,
          cached: true
        });
      }
      
      // 执行原逻辑
      next();
    } catch (error) {
      console.error('缓存中间件错误:', error);
      next();
    }
  };
}
