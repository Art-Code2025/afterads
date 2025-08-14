/**
 * نظام إدارة التخزين المؤقت المتقدم
 * Cache Manager - نظام احترافي لإدارة localStorage
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  version: string;
  expiresAt?: number;
}

interface CacheConfig {
  defaultTTL: number; // مدة البقاء الافتراضية بالميلي ثانية
  maxSize: number; // الحد الأقصى لحجم التخزين
  version: string; // إصدار التطبيق
  enableCompression: boolean; // ضغط البيانات
}

class CacheManager {
  private config: CacheConfig;
  private readonly CACHE_PREFIX = 'afterads_cache_';
  private readonly METADATA_KEY = 'afterads_cache_metadata';

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 10 * 60 * 1000, // 10 دقائق للسرعة
      maxSize: 30, // تقليل العدد للسرعة الخارقة
      version: '1.0.0',
      enableCompression: true,
      ...config
    };

    // تنظيف التخزين عند بدء التشغيل
    this.cleanup();
  }

  /**
   * حفظ البيانات في التخزين المؤقت
   */
  set<T>(key: string, data: T, ttl?: number): boolean {
    try {
      // تنظيف البيانات المنتهية الصلاحية أولاً
      this.cleanup();
      
      const expiresAt = ttl ? Date.now() + ttl : Date.now() + this.config.defaultTTL;
      
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        version: this.config.version,
        expiresAt
      };

      const serializedData = this.config.enableCompression 
        ? this.compress(JSON.stringify(cacheItem))
        : JSON.stringify(cacheItem);

      // فحص حجم البيانات قبل الحفظ
      const dataSize = new Blob([serializedData]).size;
      const availableSpace = this.getAvailableSpace();
      
      if (dataSize > availableSpace) {
        console.warn(`[CacheManager] البيانات كبيرة جداً (${this.formatBytes(dataSize)}), تنظيف إضافي...`);
        this.aggressiveCleanup();
        
        // إعادة فحص المساحة بعد التنظيف
        const newAvailableSpace = this.getAvailableSpace();
        if (dataSize > newAvailableSpace) {
          console.warn(`[CacheManager] لا توجد مساحة كافية لحفظ ${key}`);
          return false;
        }
      }

      localStorage.setItem(this.CACHE_PREFIX + key, serializedData);
      this.updateMetadata(key, expiresAt);
      
      // تنظيف التخزين إذا تجاوز الحد الأقصى
      this.enforceMaxSize();
      
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn(`[CacheManager] امتلأت مساحة التخزين، تنظيف قوي...`);
        this.aggressiveCleanup();
        
        // محاولة ثانية بعد التنظيف
        try {
          const expiresAt = ttl ? Date.now() + ttl : Date.now() + this.config.defaultTTL;
          const cacheItem: CacheItem<T> = {
            data,
            timestamp: Date.now(),
            version: this.config.version,
            expiresAt
          };
          
          const serializedData = this.config.enableCompression 
            ? this.compress(JSON.stringify(cacheItem))
            : JSON.stringify(cacheItem);
            
          localStorage.setItem(this.CACHE_PREFIX + key, serializedData);
          this.updateMetadata(key, expiresAt);
          return true;
        } catch (retryError) {
          console.error(`[CacheManager] فشل في الحفظ حتى بعد التنظيف:`, retryError);
          return false;
        }
      }
      console.warn(`[CacheManager] فشل في حفظ ${key}:`, error);
      return false;
    }
  }

  /**
   * استرجاع البيانات من التخزين المؤقت
   */
  get<T>(key: string): T | null {
    try {
      const cachedData = localStorage.getItem(this.CACHE_PREFIX + key);
      if (!cachedData) return null;

      const decompressedData = this.config.enableCompression 
        ? this.decompress(cachedData)
        : cachedData;

      const cacheItem: CacheItem<T> = JSON.parse(decompressedData);

      // التحقق من انتهاء الصلاحية
      if (cacheItem.expiresAt && Date.now() > cacheItem.expiresAt) {
        this.delete(key);
        return null;
      }

      // التحقق من إصدار التطبيق
      if (cacheItem.version !== this.config.version) {
        this.delete(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.warn(`[CacheManager] فشل في استرجاع ${key}:`, error);
      this.delete(key); // حذف البيانات التالفة
      return null;
    }
  }

  /**
   * التحقق من وجود البيانات وصحتها
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * حذف عنصر من التخزين المؤقت
   */
  delete(key: string): boolean {
    try {
      localStorage.removeItem(this.CACHE_PREFIX + key);
      this.removeFromMetadata(key);
      return true;
    } catch (error) {
      console.warn(`[CacheManager] فشل في حذف ${key}:`, error);
      return false;
    }
  }

  /**
   * مسح جميع البيانات المخزنة
   */
  clear(): boolean {
    try {
      const keys = this.getAllKeys();
      keys.forEach(key => {
        localStorage.removeItem(this.CACHE_PREFIX + key);
      });
      localStorage.removeItem(this.METADATA_KEY);
      return true;
    } catch (error) {
      console.warn('[CacheManager] فشل في مسح التخزين المؤقت:', error);
      return false;
    }
  }

  /**
   * الحصول على معلومات التخزين المؤقت
   */
  getStats(): {
    totalItems: number;
    totalSize: string;
    oldestItem: string | null;
    newestItem: string | null;
  } {
    const keys = this.getAllKeys();
    let totalSize = 0;
    let oldestTimestamp = Infinity;
    let newestTimestamp = 0;
    let oldestKey: string | null = null;
    let newestKey: string | null = null;

    keys.forEach(key => {
      const item = localStorage.getItem(this.CACHE_PREFIX + key);
      if (item) {
        totalSize += item.length;
        try {
          const cacheItem = JSON.parse(this.config.enableCompression ? this.decompress(item) : item);
          if (cacheItem.timestamp < oldestTimestamp) {
            oldestTimestamp = cacheItem.timestamp;
            oldestKey = key;
          }
          if (cacheItem.timestamp > newestTimestamp) {
            newestTimestamp = cacheItem.timestamp;
            newestKey = key;
          }
        } catch (e) {
          // تجاهل العناصر التالفة
        }
      }
    });

    return {
      totalItems: keys.length,
      totalSize: this.formatBytes(totalSize),
      oldestItem: oldestKey,
      newestItem: newestKey
    };
  }

  /**
   * تنظيف البيانات المنتهية الصلاحية
   */
  private cleanup(): void {
    const keys = this.getAllKeys();
    const now = Date.now();

    keys.forEach(key => {
      try {
        const cachedData = localStorage.getItem(this.CACHE_PREFIX + key);
        if (cachedData) {
          const decompressedData = this.config.enableCompression 
            ? this.decompress(cachedData)
            : cachedData;
          const cacheItem = JSON.parse(decompressedData);
          
          // حذف البيانات المنتهية الصلاحية أو القديمة
          if ((cacheItem.expiresAt && now > cacheItem.expiresAt) ||
              cacheItem.version !== this.config.version) {
            this.delete(key);
          }
        }
      } catch (error) {
        // حذف البيانات التالفة
        this.delete(key);
      }
    });
  }

  /**
   * فرض الحد الأقصى لحجم التخزين
   */
  private enforceMaxSize(): void {
    const keys = this.getAllKeys();
    if (keys.length <= this.config.maxSize) return;

    // ترتيب المفاتيح حسب التاريخ (الأقدم أولاً)
    const keyTimestamps: Array<{ key: string; timestamp: number }> = [];
    
    keys.forEach(key => {
      try {
        const cachedData = localStorage.getItem(this.CACHE_PREFIX + key);
        if (cachedData) {
          const decompressedData = this.config.enableCompression 
            ? this.decompress(cachedData)
            : cachedData;
          const cacheItem = JSON.parse(decompressedData);
          keyTimestamps.push({ key, timestamp: cacheItem.timestamp });
        }
      } catch (error) {
        // حذف البيانات التالفة
        this.delete(key);
      }
    });

    // ترتيب وحذف الأقدم
    keyTimestamps
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(0, keyTimestamps.length - this.config.maxSize)
      .forEach(item => this.delete(item.key));
  }

  /**
   * الحصول على جميع المفاتيح
   */
  private getAllKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.CACHE_PREFIX)) {
        keys.push(key.replace(this.CACHE_PREFIX, ''));
      }
    }
    return keys;
  }

  /**
   * تحديث البيانات الوصفية
   */
  private updateMetadata(key: string, expiresAt: number): void {
    try {
      const metadata = this.getMetadata();
      metadata[key] = { expiresAt, lastAccessed: Date.now() };
      localStorage.setItem(this.METADATA_KEY, JSON.stringify(metadata));
    } catch (error) {
      console.warn('[CacheManager] فشل في تحديث البيانات الوصفية:', error);
    }
  }

  /**
   * حذف من البيانات الوصفية
   */
  private removeFromMetadata(key: string): void {
    try {
      const metadata = this.getMetadata();
      delete metadata[key];
      localStorage.setItem(this.METADATA_KEY, JSON.stringify(metadata));
    } catch (error) {
      console.warn('[CacheManager] فشل في حذف البيانات الوصفية:', error);
    }
  }

  /**
   * الحصول على البيانات الوصفية
   */
  private getMetadata(): Record<string, { expiresAt: number; lastAccessed: number }> {
    try {
      const metadata = localStorage.getItem(this.METADATA_KEY);
      return metadata ? JSON.parse(metadata) : {};
    } catch (error) {
      return {};
    }
  }

  /**
   * ضغط البيانات (تنفيذ محسن)
   */
  private compress(data: string): string {
    try {
      // ضغط خارق: إزالة كل المسافات والتكرار
      const ultraMinified = data
        .replace(/\s+/g, '')  // إزالة كل المسافات
        .replace(/"([^"]+)":/g, '$1:')  // إزالة علامات التنصيص
        .replace(/,}/g, '}')  // إزالة الفواصل الزائدة
        .replace(/,]/g, ']')  // إزالة الفواصل الزائدة
        .replace(/null/g, 'n')  // اختصار null
        .replace(/true/g, 't')  // اختصار true
        .replace(/false/g, 'f'); // اختصار false
      
      // ضغط مضاعف
      return btoa(unescape(encodeURIComponent(ultraMinified)));
    } catch {
      return btoa(encodeURIComponent(data));
    }
  }

  /**
   * إلغاء ضغط البيانات
   */
  private decompress(data: string): string {
    try {
      // إلغاء الضغط
      return decodeURIComponent(escape(atob(data)));
    } catch (error) {
      // محاولة الطريقة القديمة في حالة الفشل
      try {
        return decodeURIComponent(atob(data));
      } catch {
        throw new Error('فشل في إلغاء ضغط البيانات');
      }
    }
  }

  /**
   * تنسيق حجم البيانات
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * حساب المساحة المتاحة في localStorage
   */
  private getAvailableSpace(): number {
    try {
      // تقدير تقريبي للمساحة المتاحة (5MB عادة)
      const maxStorage = 5 * 1024 * 1024; // 5MB
      let usedSpace = 0;
      
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          usedSpace += localStorage[key].length + key.length;
        }
      }
      
      return Math.max(0, maxStorage - usedSpace);
    } catch {
      return 1024 * 1024; // 1MB كاحتياطي
    }
  }

  /**
   * تنظيف قوي للتخزين المؤقت
   */
  private aggressiveCleanup(): void {
    try {
      const metadata = this.getMetadata();
      const keys = Object.keys(metadata);
      
      // ترتيب المفاتيح حسب آخر وصول (الأقدم أولاً)
      keys.sort((a, b) => metadata[a].lastAccessed - metadata[b].lastAccessed);
      
      // حذف 50% من البيانات القديمة
      const keysToDelete = keys.slice(0, Math.ceil(keys.length * 0.5));
      
      keysToDelete.forEach(key => {
        this.delete(key);
      });
      
      console.log(`[CacheManager] تم حذف ${keysToDelete.length} عنصر في التنظيف القوي`);
    } catch (error) {
      console.warn('[CacheManager] فشل في التنظيف القوي:', error);
    }
  }
}

// إنشاء مثيل مشترك
export const cacheManager = new CacheManager({
  defaultTTL: 10 * 60 * 1000, // 10 دقائق (سرعة خارقة)
  maxSize: 30, // 30 عنصر (سرعة خارقة)
  version: '1.0.0',
  enableCompression: true
});

// مفاتيح التخزين المؤقت
export const CACHE_KEYS = {
  CATEGORIES: 'categories',
  SERVICES: 'services',
  CATEGORY_SERVICES: (categoryId: string | number) => `category_services_${categoryId}`,
  SERVICE_DETAIL: (serviceId: string | number) => `service_detail_${serviceId}`,
  ALL_PRODUCTS: 'all_products',
  STATIC_PAGES: 'static_pages'
} as const;

// أنواع البيانات
export interface CachedCategory {
  id: string | number;
  name: string;
  description: string;
  image: string;
}

export interface CachedService {
  id: string | number;
  name: string;
  description: string;
  homeShortDescription?: string;
  detailsShortDescription?: string;
  price?: number;
  basePrice?: number;
  originalPrice?: number;
  stock: number;
  categoryId?: string | number | null;
  categories?: string[];
  productType?: string;
  dynamicOptions?: any[];
  mainImage: string;
  detailedImages?: string[];
  imageDetails?: string[];
  specifications?: { name: string; value: string }[];
  features?: string[];
  deliveryTime?: string;
  createdAt?: string;
}

export default CacheManager;