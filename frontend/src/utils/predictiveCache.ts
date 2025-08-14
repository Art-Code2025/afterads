// نظام التخزين المؤقت التنبؤي للسرعة الخارقة
import { cacheManager, CACHE_KEYS } from './cacheManager';
import { servicesAPI, categoriesAPI } from './api';

interface CachedService {
  id: number | string;
  name: string;
  categoryId?: number | string;
  [key: string]: any;
}

interface PredictiveConfig {
  maxPredictions: number;
  predictionThreshold: number;
  preloadDelay: number;
}

class PredictiveCache {
  private config: PredictiveConfig = {
    maxPredictions: 10,
    predictionThreshold: 0.7,
    preloadDelay: 100
  };
  
  private userBehavior: Map<string, number> = new Map();
  private preloadQueue: Set<string> = new Set();
  private isPreloading = false;

  // تتبع سلوك المستخدم
  trackUserInteraction(pageType: string, pageId: string) {
    const key = `${pageType}:${pageId}`;
    const currentCount = this.userBehavior.get(key) || 0;
    this.userBehavior.set(key, currentCount + 1);
    
    // تنبؤ الصفحات المحتملة
    this.predictNextPages(pageType, pageId);
  }

  // تنبؤ الصفحات التالية المحتملة
  private predictNextPages(currentPageType: string, currentPageId: string) {
    if (currentPageType === 'category') {
      // تحميل مسبق للخدمات في نفس التصنيف
      this.preloadCategoryServices(currentPageId);
    } else if (currentPageType === 'service') {
      // تحميل مسبق للخدمات ذات الصلة
      this.preloadRelatedServices(currentPageId);
    }
  }

  // تحميل مسبق لخدمات التصنيف
  private async preloadCategoryServices(categoryId: string) {
    if (this.isPreloading) return;
    
    try {
      this.isPreloading = true;
      
      // جلب الخدمات من Cache أولاً
      const cachedServices = cacheManager.get<CachedService[]>(CACHE_KEYS.SERVICES);
      if (cachedServices && Array.isArray(cachedServices)) {
        const categoryServices = cachedServices.filter((service: CachedService) => 
          service.categoryId?.toString() === categoryId
        );
        
        // تحميل مسبق لأول 5 خدمات
        const servicesToPreload = categoryServices.slice(0, 5);
        
        for (const service of servicesToPreload) {
          const serviceKey = CACHE_KEYS.SERVICE_DETAIL(service.id.toString());
          if (!cacheManager.get(serviceKey)) {
            this.addToPreloadQueue(service.id.toString());
          }
        }
        
        this.processPreloadQueue();
      }
    } catch (error) {
      console.warn('فشل في التحميل المسبق لخدمات التصنيف:', error);
    } finally {
      this.isPreloading = false;
    }
  }

  // تحميل مسبق للخدمات ذات الصلة
  private async preloadRelatedServices(serviceId: string) {
    if (this.isPreloading) return;
    
    try {
      this.isPreloading = true;
      
      // جلب الخدمة الحالية لمعرفة تصنيفها
      const currentService = cacheManager.get<CachedService>(CACHE_KEYS.SERVICE_DETAIL(serviceId));
      if (currentService && currentService.categoryId) {
        await this.preloadCategoryServices(currentService.categoryId.toString());
      }
    } catch (error) {
      console.warn('فشل في التحميل المسبق للخدمات ذات الصلة:', error);
    } finally {
      this.isPreloading = false;
    }
  }

  // إضافة إلى قائمة التحميل المسبق
  private addToPreloadQueue(serviceId: string) {
    if (this.preloadQueue.size < this.config.maxPredictions) {
      this.preloadQueue.add(serviceId);
    }
  }

  // معالجة قائمة التحميل المسبق
  private async processPreloadQueue() {
    if (this.preloadQueue.size === 0) return;
    
    const serviceIds = Array.from(this.preloadQueue);
    this.preloadQueue.clear();
    
    // تحميل مسبق بتأخير صغير لتجنب التأثير على الأداء
    setTimeout(async () => {
      for (const serviceId of serviceIds) {
        try {
          const service = await servicesAPI.getById(serviceId);
          if (service) {
            cacheManager.set(
              CACHE_KEYS.SERVICE_DETAIL(serviceId), 
              service, 
              30 * 60 * 1000
            );
            console.log(`⚡ تم التحميل المسبق للخدمة: ${service.name}`);
          }
        } catch (error) {
          console.warn(`فشل في التحميل المسبق للخدمة ${serviceId}:`, error);
        }
        
        // تأخير صغير بين كل تحميل
        await new Promise(resolve => setTimeout(resolve, this.config.preloadDelay));
      }
    }, 500);
  }

  // تحميل مسبق ذكي للصفحات الأكثر زيارة
  async preloadPopularPages() {
    try {
      // ترتيب الصفحات حسب عدد الزيارات
      const sortedPages = Array.from(this.userBehavior.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, this.config.maxPredictions);
      
      for (const [pageKey, visits] of sortedPages) {
        if (visits >= this.config.predictionThreshold) {
          const [pageType, pageId] = pageKey.split(':');
          
          if (pageType === 'service') {
            const serviceKey = CACHE_KEYS.SERVICE_DETAIL(pageId);
            if (!cacheManager.get(serviceKey)) {
              this.addToPreloadQueue(pageId);
            }
          }
        }
      }
      
      this.processPreloadQueue();
    } catch (error) {
      console.warn('فشل في التحميل المسبق للصفحات الشائعة:', error);
    }
  }

  // تنظيف البيانات القديمة
  cleanup() {
    // الاحتفاظ بآخر 50 تفاعل فقط
    if (this.userBehavior.size > 50) {
      const entries = Array.from(this.userBehavior.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 50);
      
      this.userBehavior.clear();
      entries.forEach(([key, value]) => {
        this.userBehavior.set(key, value);
      });
    }
  }

  // إحصائيات الأداء
  getStats() {
    return {
      trackedInteractions: this.userBehavior.size,
      queueSize: this.preloadQueue.size,
      isPreloading: this.isPreloading,
      topPages: Array.from(this.userBehavior.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
    };
  }
}

// إنشاء مثيل واحد للاستخدام العام
export const predictiveCache = new PredictiveCache();

// تنظيف دوري كل 5 دقائق
setInterval(() => {
  predictiveCache.cleanup();
}, 5 * 60 * 1000);

export default predictiveCache;