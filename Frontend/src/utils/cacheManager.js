// Enhanced Cache Manager with TTL, compression, and game-specific optimizations
class CacheManager {
  constructor() {
    this.prefix = 'snake_game_';
    this.defaultTTL = 300000; // 5 minutes
    this.maxCacheSize = 10 * 1024 * 1024; // 10MB for enhanced game data
    this.compressionThreshold = 1024; // Compress items larger than 1KB
    this.init();
  }

  // Enhanced cache keys for game features
  static KEYS = {
    USER_STATS: 'user_game_stats',
    LEADERBOARD: 'leaderboard_data',
    FRIENDS: 'friends_list',
    USER_PROFILE: 'user_profile',
    GAME_CONFIG: 'game_config',
    ACHIEVEMENTS: 'achievements_list',
    RECENT_GAMES: 'recent_games',
    SETTINGS: 'user_settings',
    POWER_UPS: 'power_ups_data',
    ANALYTICS: 'game_analytics',
    SESSION_DATA: 'session_data',
    HIGH_SCORES: 'high_scores',
    GAME_HISTORY: 'game_history',
    USER_PREFERENCES: 'user_preferences',
    DEVICE_STATS: 'device_statistics',
    PERFORMANCE_METRICS: 'performance_metrics',
    SOCIAL_DATA: 'social_data',
    GAME_TIPS: 'game_tips',
    TUTORIAL_PROGRESS: 'tutorial_progress',
    DAILY_CHALLENGES: 'daily_challenges',
    SEASONAL_EVENTS: 'seasonal_events'
  };

  // Metadata management methods (moved to top)
  _getMetadata() {
    try {
      const metadata = localStorage.getItem(`${this.prefix}metadata`);
      return metadata ? JSON.parse(metadata) : {
        items: {},
        version: '2.0',
        created: Date.now()
      };
    } catch (error) {
      console.warn('Metadata retrieval failed:', error);
      return { items: {}, version: '2.0', created: Date.now() };
    }
  }

  _updateMetadata(key, item) {
    try {
      const metadata = this._getMetadata();
      if (!metadata.items) metadata.items = {};

      metadata.items[key] = {
        timestamp: item.timestamp,
        accessTime: item.timestamp,
        size: item.data.length,
        ...item.metadata
      };

      localStorage.setItem(`${this.prefix}metadata`, JSON.stringify(metadata));
    } catch (error) {
      console.warn('Metadata update failed:', error);
    }
  }

  _updateAccessTime(key) {
    try {
      const metadata = this._getMetadata();
      if (metadata.items && metadata.items[key]) {
        metadata.items[key].accessTime = Date.now();
        localStorage.setItem(`${this.prefix}metadata`, JSON.stringify(metadata));
      }
    } catch (error) {
      console.warn('Access time update failed:', error);
    }
  }

  _removeFromMetadata(key) {
    try {
      const metadata = this._getMetadata();
      if (metadata.items && metadata.items[key]) {
        delete metadata.items[key];
        localStorage.setItem(`${this.prefix}metadata`, JSON.stringify(metadata));
      }
    } catch (error) {
      console.warn('Metadata removal failed:', error);
    }
  }

  _clearMetadata() {
    try {
      localStorage.removeItem(`${this.prefix}metadata`);
    } catch (error) {
      console.warn('Metadata clear failed:', error);
    }
  }

  loadMetadata() {
    // This method is now just an alias for consistency
    return this._getMetadata();
  }

  init() {
    this.loadMetadata();
    this.setupAutoCleanup();
    this.setupStorageListener();
    this.optimizeCache();
  }

  // Generate cache key with prefix
  _getKey(key) {
    return `${this.prefix}${key}`;
  }

  // Advanced compression using LZ-string-like algorithm
  _compress(data) {
    try {
      const jsonString = JSON.stringify(data);

      // Only compress if data is larger than threshold
      if (jsonString.length < this.compressionThreshold) {
        return { data: jsonString, compressed: false };
      }

      // Simple compression: replace common patterns
      let compressed = jsonString
        .replace(/{"([^"]+)":/g, '{"$1":') // Remove spaces around colons
        .replace(/,"/g, ',"') // Remove spaces after commas
        .replace(/null/g, 'N') // Replace null with shorter representation
        .replace(/true/g, 'T') // Replace true with T
        .replace(/false/g, 'F'); // Replace false with F

      return {
        data: compressed,
        compressed: true,
        originalSize: jsonString.length,
        compressedSize: compressed.length
      };
    } catch (error) {
      console.warn('Cache compression failed:', error);
      return { data: JSON.stringify(data), compressed: false };
    }
  }

  // Decompress data after retrieval
  _decompress(compressedData, metadata = {}) {
    try {
      // FIXED: Handle undefined/null data
      if (compressedData === undefined || compressedData === null) {
        console.warn('Attempted to decompress undefined data');
        return null;
      }

      if (!metadata.compressed) {
        // FIXED: Additional check for string data
        if (typeof compressedData !== 'string') {
          console.warn('Non-string data in uncompressed cache item');
          return compressedData; // Return as-is if it's already parsed
        }
        return JSON.parse(compressedData);
      }

      // Reverse compression
      let decompressed = compressedData
        .replace(/F/g, 'false')
        .replace(/T/g, 'true')
        .replace(/N/g, 'null');

      return JSON.parse(decompressed);
    } catch (error) {
      console.warn('Cache decompression failed:', error);
      return null;
    }
  }

  // Enhanced set with metadata and optimization
  set(key, data, ttl = this.defaultTTL, options = {}) {
    try {
      const cacheKey = this._getKey(key);
      const compressed = this._compress(data);
      const timestamp = Date.now();

      const item = {
        data: compressed.data,
        timestamp,
        ttl,
        metadata: {
          compressed: compressed.compressed,
          originalSize: compressed.originalSize || compressed.data.length,
          compressedSize: compressed.compressedSize || compressed.data.length,
          version: options.version || 1,
          priority: options.priority || 'normal', // 'low', 'normal', 'high', 'critical'
          category: options.category || 'general',
          tags: options.tags || [],
          accessCount: 0,
          lastAccessed: timestamp
        }
      };

      // Check cache size and evict if necessary
      if (this._getCacheSize() + item.data.length > this.maxCacheSize) {
        this._evictByStrategy(item.data.length);
      }

      localStorage.setItem(cacheKey, JSON.stringify(item));
      this._updateMetadata(key, item);

      return true;
    } catch (error) {
      console.warn('Cache set failed:', error);
      return false;
    }
  }

  // Enhanced get with analytics - FIXED METADATA ACCESS
  get(key, options = {}) {
    try {
      const cacheKey = this._getKey(key);
      const item = localStorage.getItem(cacheKey);

      if (!item) return null;

      // FIXED: Parse with error handling
      let parsedItem;
      try {
        parsedItem = JSON.parse(item);
      } catch (parseError) {
        console.warn(`Failed to parse cache item ${key}:`, parseError);
        this.remove(key);
        return null;
      }

      const { data, timestamp, ttl, metadata } = parsedItem;

      // FIXED: Check for undefined data
      if (data === undefined || data === null) {
        console.warn(`Cache item ${key} has undefined data`);
        this.remove(key);
        return null;
      }

      // Check if expired
      if (Date.now() - timestamp > ttl) {
        this.remove(key);
        return null;
      }

      // FIXED: Ensure metadata exists and has safe defaults
      const safeMetadata = {
        accessCount: 0,
        lastAccessed: timestamp,
        compressed: false,
        ...metadata
      };

      // Update access statistics
      safeMetadata.accessCount = (safeMetadata.accessCount || 0) + 1;
      safeMetadata.lastAccessed = Date.now();

      // Update item in storage with new metadata
      if (!options.skipMetadataUpdate) {
        try {
          localStorage.setItem(cacheKey, JSON.stringify({
            data,
            timestamp,
            ttl,
            metadata: safeMetadata
          }));
        } catch (updateError) {
          console.warn(`Failed to update cache metadata for ${key}:`, updateError);
        }
      }

      this._updateAccessTime(key);

      return this._decompress(data, safeMetadata);
    } catch (error) {
      console.warn('Cache get failed:', error);
      this.remove(key);
      return null;
    }
  }

  // Game-specific caching methods
  setGameStats(stats, ttl = 300000) {
    return this.set(CacheManager.KEYS.USER_STATS, stats, ttl, {
      priority: 'high',
      category: 'game_data',
      tags: ['stats', 'user', 'game']
    });
  }

  getGameStats() {
    return this.get(CacheManager.KEYS.USER_STATS);
  }

  setLeaderboard(data, type = 'global', ttl = 180000) {
    const key = `${CacheManager.KEYS.LEADERBOARD}_${type}`;
    return this.set(key, data, ttl, {
      priority: 'normal',
      category: 'social',
      tags: ['leaderboard', type]
    });
  }

  getLeaderboard(type = 'global') {
    const key = `${CacheManager.KEYS.LEADERBOARD}_${type}`;
    return this.get(key);
  }

  setAchievements(achievements, ttl = 600000) {
    return this.set(CacheManager.KEYS.ACHIEVEMENTS, achievements, ttl, {
      priority: 'high',
      category: 'game_data',
      tags: ['achievements', 'user']
    });
  }

  getAchievements() {
    return this.get(CacheManager.KEYS.ACHIEVEMENTS);
  }

  setPowerUpData(powerUps, ttl = 3600000) {
    return this.set(CacheManager.KEYS.POWER_UPS, powerUps, ttl, {
      priority: 'normal',
      category: 'game_config',
      tags: ['powerups', 'config']
    });
  }

  getPowerUpData() {
    return this.get(CacheManager.KEYS.POWER_UPS);
  }

  setGameHistory(history, ttl = 86400000) {
    return this.set(CacheManager.KEYS.GAME_HISTORY, history, ttl, {
      priority: 'normal',
      category: 'game_data',
      tags: ['history', 'games']
    });
  }

  getGameHistory() {
    return this.get(CacheManager.KEYS.GAME_HISTORY);
  }

  // Session-specific caching
  setSessionData(sessionId, data, ttl = 1800000) { // 30 minutes
    const key = `session_${sessionId}`;
    return this.set(key, data, ttl, {
      priority: 'low',
      category: 'session',
      tags: ['session', 'temporary']
    });
  }

  getSessionData(sessionId) {
    const key = `session_${sessionId}`;
    return this.get(key);
  }

  // Performance metrics caching
  setPerformanceMetrics(metrics, ttl = 300000) {
    return this.set(CacheManager.KEYS.PERFORMANCE_METRICS, metrics, ttl, {
      priority: 'low',
      category: 'analytics',
      tags: ['performance', 'metrics']
    });
  }

  getPerformanceMetrics() {
    return this.get(CacheManager.KEYS.PERFORMANCE_METRICS);
  }

  // Advanced cache management
  _evictByStrategy(requiredSpace) {
    const metadata = this._getMetadata();
    const items = Object.entries(metadata.items || {});

    // Sort by priority and access patterns
    items.sort((a, b) => {
      const [, itemA] = a;
      const [, itemB] = b;

      // Priority-based eviction
      const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 };
      const priorityDiff = (priorityOrder[itemA.priority] || 2) - (priorityOrder[itemB.priority] || 2);

      if (priorityDiff !== 0) return priorityDiff;

      // LRU within same priority - use safe access
      const lastAccessedA = itemA.lastAccessed || itemA.accessTime || itemA.timestamp || 0;
      const lastAccessedB = itemB.lastAccessed || itemB.accessTime || itemB.timestamp || 0;
      return lastAccessedA - lastAccessedB;
    });

    // Evict items starting from lowest priority and least recently used
    let freedSpace = 0;
    for (const [key] of items) {
      if (freedSpace >= requiredSpace) break;

      const itemSize = this._getItemSize(key);
      this.remove(key);
      freedSpace += itemSize;
    }
  }

  _getItemSize(key) {
    try {
      const item = localStorage.getItem(this._getKey(key));
      return item ? item.length : 0;
    } catch (error) {
      return 0;
    }
  }

  // Cache analytics and optimization
  getAnalytics() {
    const metadata = this._getMetadata();
    const items = metadata.items || {};
    const totalSize = this._getCacheSize();

    const analytics = {
      totalItems: Object.keys(items).length,
      totalSize,
      sizeFormatted: this._formatBytes(totalSize),
      utilizationPercentage: (totalSize / this.maxCacheSize) * 100,
      categoryCounts: {},
      priorityCounts: {},
      compressionStats: {
        compressedItems: 0,
        totalOriginalSize: 0,
        totalCompressedSize: 0,
        compressionRatio: 0
      },
      accessPatterns: {
        mostAccessed: null,
        leastAccessed: null,
        averageAccessCount: 0
      }
    };

    let totalAccessCount = 0;
    let maxAccess = 0;
    let minAccess = Infinity;
    let maxAccessKey = null;
    let minAccessKey = null;

    Object.entries(items).forEach(([key, item]) => {
      // FIXED: Safe property access with defaults
      const category = item.category || 'unknown';
      analytics.categoryCounts[category] = (analytics.categoryCounts[category] || 0) + 1;

      const priority = item.priority || 'normal';
      analytics.priorityCounts[priority] = (analytics.priorityCounts[priority] || 0) + 1;

      // Compression stats
      if (item.compressed) {
        analytics.compressionStats.compressedItems++;
        analytics.compressionStats.totalOriginalSize += item.originalSize || 0;
        analytics.compressionStats.totalCompressedSize += item.compressedSize || 0;
      }

      // FIXED: Safe access count with fallback
      const accessCount = item.accessCount || 0;
      totalAccessCount += accessCount;

      if (accessCount > maxAccess) {
        maxAccess = accessCount;
        maxAccessKey = key;
      }

      if (accessCount < minAccess) {
        minAccess = accessCount;
        minAccessKey = key;
      }
    });

    analytics.accessPatterns.mostAccessed = { key: maxAccessKey, count: maxAccess };
    analytics.accessPatterns.leastAccessed = { key: minAccessKey, count: minAccess };
    analytics.accessPatterns.averageAccessCount = totalAccessCount / Object.keys(items).length || 0;

    if (analytics.compressionStats.totalOriginalSize > 0) {
      analytics.compressionStats.compressionRatio =
        (1 - analytics.compressionStats.totalCompressedSize / analytics.compressionStats.totalOriginalSize) * 100;
    }

    return analytics;
  }

  // Cache optimization
  optimizeCache() {
    try {
      const analytics = this.getAnalytics();

      // Remove expired items
      this.cleanup();

      // Compress large uncompressed items
      this._compressLargeItems();

      // Adjust TTL based on access patterns
      this._adjustTTLBasedOnUsage();

      console.log('Cache optimized:', analytics);
    } catch (error) {
      console.warn('Cache optimization failed:', error);
    }
  }

  _compressLargeItems() {
    try {
      const keys = this.keys();

      keys.forEach(key => {
        try {
          const itemString = localStorage.getItem(this._getKey(key));

          // FIXED: Check if item exists and is valid
          if (!itemString) {
            return;
          }

          let item;
          try {
            item = JSON.parse(itemString);
          } catch (parseError) {
            console.warn(`Failed to parse item ${key} for compression:`, parseError);
            this.remove(key); // Remove corrupted items
            return;
          }

          // FIXED: Validate item structure
          if (!item || typeof item !== 'object' || !item.data) {
            return;
          }

          // FIXED: Check data length safely
          const dataLength = typeof item.data === 'string' ? item.data.length : 0;

          if (item && !item.metadata?.compressed && dataLength > this.compressionThreshold) {
            const data = this._decompress(item.data);
            if (data !== null) { // Only compress if decompression was successful
              this.set(key, data, item.ttl - (Date.now() - item.timestamp), {
                ...item.metadata,
                version: (item.metadata?.version || 1) + 1
              });
            }
          }
        } catch (error) {
          console.warn(`Failed to compress item ${key}:`, error);
          // Don't remove the item here, just skip compression
        }
      });
    } catch (error) {
      console.warn('Large items compression failed:', error);
    }
  }

  _adjustTTLBasedOnUsage() {
    try {
      const metadata = this._getMetadata();
      const items = metadata.items || {};

      Object.entries(items).forEach(([key, item]) => {
        try {
          // FIXED: Safe access with defaults
          const accessCount = item.accessCount || 0;
          const itemTimestamp = item.timestamp || Date.now();
          const accessFrequency = accessCount / Math.max(1, (Date.now() - itemTimestamp) / 86400000); // per day

          // Extend TTL for frequently accessed items
          if (accessFrequency > 10) { // More than 10 accesses per day
            const currentData = this.get(key, { skipMetadataUpdate: true });
            if (currentData) {
              this.set(key, currentData, this.defaultTTL * 2, {
                ...item,
                version: (item.version || 1) + 1
              });
            }
          }
        } catch (error) {
          console.warn(`Failed to adjust TTL for item ${key}:`, error);
        }
      });
    } catch (error) {
      console.warn('TTL adjustment failed:', error);
    }
  }

  // Utility methods
  _formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  _getCacheSize() {
    let totalSize = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          const item = localStorage.getItem(key);
          if (item) {
            totalSize += item.length;
          }
        }
      }
    } catch (error) {
      console.warn('Cache size calculation failed:', error);
    }
    return totalSize;
  }

  // Auto cleanup and maintenance
  setupAutoCleanup() {
    // Cleanup expired items every 5 minutes
    setInterval(() => {
      this.cleanup();
    }, 300000);

    // Full optimization every hour
    setInterval(() => {
      this.optimizeCache();
    }, 3600000);
  }

  setupStorageListener() {
    // Listen for storage events from other tabs
    window.addEventListener('storage', (e) => {
      if (e.key && e.key.startsWith(this.prefix)) {
        console.log('Cache updated from another tab:', e.key);
      }
    });
  }

  // FIXED: Enhanced cleanup with safe property access
  cleanup() {
    try {
      const keys = this.keys();
      let cleanedCount = 0;

      keys.forEach(key => {
        try {
          const item = this.get(key, { skipMetadataUpdate: true });
          if (item === null) {
            cleanedCount++;
          }
        } catch (error) {
          // If we can't read the item, remove it
          this.remove(key);
          cleanedCount++;
        }
      });

      if (cleanedCount > 0) {
        console.log(`Cache cleanup: removed ${cleanedCount} expired items`);
      }
    } catch (error) {
      console.warn('Cache cleanup failed:', error);
    }
  }

  // Enhanced utility methods
  keys() {
    const keys = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix) && !key.includes('metadata')) {
          keys.push(key.replace(this.prefix, ''));
        }
      }
    } catch (error) {
      console.warn('Cache keys retrieval failed:', error);
    }
    return keys;
  }

  has(key) {
    try {
      const item = this.get(key);
      return item !== null;
    } catch (error) {
      return false;
    }
  }

  remove(key) {
    try {
      const cacheKey = this._getKey(key);
      localStorage.removeItem(cacheKey);
      this._removeFromMetadata(key);
      return true;
    } catch (error) {
      console.warn('Cache remove failed:', error);
      return false;
    }
  }

  clear() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
      this._clearMetadata();
      return true;
    } catch (error) {
      console.warn('Cache clear failed:', error);
      return false;
    }
  }

  // Export/Import functionality
  export() {
    const exportData = {
      version: '2.0',
      exportedAt: Date.now(),
      data: {},
      metadata: this._getMetadata()
    };

    const keys = this.keys();
    keys.forEach(key => {
      try {
        const data = this.get(key);
        if (data !== null) {
          exportData.data[key] = data;
        }
      } catch (error) {
        console.warn(`Failed to export item ${key}:`, error);
      }
    });

    return exportData;
  }

  import(importData, options = {}) {
    const { overwrite = false, ttl = this.defaultTTL } = options;

    try {
      Object.entries(importData.data || {}).forEach(([key, data]) => {
        if (!overwrite && this.has(key)) {
          return; // Skip existing items
        }

        this.set(key, data, ttl, {
          imported: true,
          importedAt: Date.now(),
          originalExportTime: importData.exportedAt
        });
      });

      return true;
    } catch (error) {
      console.error('Cache import failed:', error);
      return false;
    }
  }
}

// Create singleton instance
export const cacheManager = new CacheManager();

// Enhanced helper functions for game-specific operations
export const CacheHelpers = {
  // User-specific cache operations
  setUserData: (userId, key, data, ttl) => {
    return cacheManager.set(`user_${userId}_${key}`, data, ttl, {
      category: 'user_data',
      tags: ['user', userId]
    });
  },

  getUserData: (userId, key) => {
    return cacheManager.get(`user_${userId}_${key}`);
  },

  clearUserData: (userId) => {
    const keys = cacheManager.keys().filter(key => key.startsWith(`user_${userId}_`));
    keys.forEach(key => cacheManager.remove(key));
    return keys.length;
  },

  // Game session management
  startGameSession: (sessionId, initialData = {}) => {
    return cacheManager.setSessionData(sessionId, {
      ...initialData,
      startTime: Date.now(),
      active: true
    });
  },

  updateGameSession: (sessionId, updateData) => {
    const current = cacheManager.getSessionData(sessionId) || {};
    return cacheManager.setSessionData(sessionId, {
      ...current,
      ...updateData,
      lastUpdate: Date.now()
    });
  },

  endGameSession: (sessionId) => {
    const session = cacheManager.getSessionData(sessionId);
    if (session) {
      session.active = false;
      session.endTime = Date.now();
      session.duration = session.endTime - session.startTime;
      return cacheManager.setSessionData(sessionId, session, 86400000); // Keep for 24 hours
    }
    return false;
  },

  // Leaderboard management
  setLeaderboardData: (type, data, ttl = 180000) => {
    return cacheManager.setLeaderboard(data, type, ttl);
  },

  getLeaderboardData: (type) => {
    return cacheManager.getLeaderboard(type);
  },

  // Achievement management
  setAchievementProgress: (userId, progress, ttl = 3600000) => {
    return cacheManager.set(`achievement_progress_${userId}`, progress, ttl, {
      category: 'achievements',
      tags: ['progress', userId]
    });
  },

  getAchievementProgress: (userId) => {
    return cacheManager.get(`achievement_progress_${userId}`);
  },

  // Performance monitoring
  recordPerformanceMetric: (metric, value) => {
    const metrics = cacheManager.getPerformanceMetrics() || {};
    metrics[metric] = {
      value,
      timestamp: Date.now(),
      session: Date.now().toString() // Simple session ID
    };
    return cacheManager.setPerformanceMetrics(metrics);
  },

  // Cache health monitoring
  getCacheHealth: () => {
    const analytics = cacheManager.getAnalytics();
    const health = {
      status: 'healthy',
      issues: [],
      recommendations: []
    };

    // Check cache size
    if (analytics.utilizationPercentage > 90) {
      health.status = 'warning';
      health.issues.push('High cache utilization');
      health.recommendations.push('Consider clearing old data or increasing cache size');
    }

    // Check compression efficiency
    if (analytics.compressionStats.compressionRatio < 10 && analytics.compressionStats.compressedItems > 0) {
      health.issues.push('Low compression efficiency');
      health.recommendations.push('Review compression algorithm');
    }

    // Check access patterns
    if (analytics.accessPatterns.averageAccessCount < 1) {
      health.issues.push('Low cache hit rate');
      health.recommendations.push('Review caching strategy');
    }

    return { ...analytics, health };
  }
};

export default cacheManager;