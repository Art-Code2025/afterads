import { toast } from 'react-toastify';

const API_BASE_URL = '/.netlify/functions';

interface WishlistItem {
  id?: string;
  userId: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  originalPrice?: number;
  category: string;
  isAvailable: boolean;
  createdAt?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
  inWishlist?: boolean;
  itemId?: string | null;
  alreadyExists?: boolean;
  deletedCount?: number;
}

class ProfessionalWishlistService {
  private static instance: ProfessionalWishlistService;
  private pendingOperations = new Set<string>();
  private cache = new Map<string, any>();
  private cacheTimeout = 30000; // 30 seconds

  static getInstance(): ProfessionalWishlistService {
    if (!ProfessionalWishlistService.instance) {
      ProfessionalWishlistService.instance = new ProfessionalWishlistService();
    }
    return ProfessionalWishlistService.instance;
  }

  private generateOperationKey(userId: string, productId: string): string {
    return `${userId}-${productId}`;
  }

  private getCacheKey(type: string, userId: string, productId?: string): string {
    return productId ? `${type}-${userId}-${productId}` : `${type}-${userId}`;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private getCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  private async apiCall(endpoint: string, options: RequestInit = {}): Promise<ApiResponse> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Get user's wishlist with caching
  async getUserWishlist(userId: string): Promise<WishlistItem[]> {
    if (!userId) {
      console.warn('getUserWishlist: userId is required');
      return [];
    }

    const cacheKey = this.getCacheKey('wishlist', userId);
    const cached = this.getCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await this.apiCall(`/wishlists/user/${userId}`);
      
      if (response.success) {
        const wishlistItems = response.data || [];
        this.setCache(cacheKey, wishlistItems);
        return wishlistItems;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      return [];
    }
  }

  // Check if product is in wishlist with caching
  async isProductInWishlist(userId: string, productId: string): Promise<boolean> {
    if (!userId || !productId) {
      return false;
    }

    const cacheKey = this.getCacheKey('check', userId, productId);
    const cached = this.getCache(cacheKey);
    if (cached !== null) {
      return cached;
    }

    try {
      const response = await this.apiCall(`/wishlists/user/${userId}/check/${productId}`);
      
      if (response.success) {
        const isInWishlist = response.inWishlist || false;
        this.setCache(cacheKey, isInWishlist);
        return isInWishlist;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking wishlist status:', error);
      return false;
    }
  }

  // Add product to wishlist with enhanced error handling
  async addToWishlist(
    userId: string,
    product: {
      id: string;
      name: string;
      image: string;
      price: number;
      originalPrice?: number;
      category: string;
    }
  ): Promise<boolean> {
    if (!userId || !product.id) {
      toast.error('بيانات غير صحيحة');
      return false;
    }

    const operationKey = this.generateOperationKey(userId, product.id);
    
    // Prevent duplicate operations
    if (this.pendingOperations.has(operationKey)) {
      return false;
    }

    this.pendingOperations.add(operationKey);

    try {
      // First check if already exists (with cache)
      const isAlreadyInWishlist = await this.isProductInWishlist(userId, product.id);
      if (isAlreadyInWishlist) {
        toast.info(`${product.name} موجود بالفعل في المفضلة 💖`);
        return false;
      }

      const wishlistData = {
        userId,
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        price: product.price,
        originalPrice: product.originalPrice,
        category: product.category,
        isAvailable: true,
      };

      const response = await this.apiCall('/wishlists', {
        method: 'POST',
        body: JSON.stringify(wishlistData),
      });

      if (response.success) {
        // Clear cache to force refresh
        this.clearCache(userId);
        
        // Show success message
        toast.success(`تم إضافة ${product.name} للمفضلة 💖`, {
          position: "top-center",
          autoClose: 2000,
          style: {
            background: 'linear-gradient(135deg, #ff6b9d, #c44569)',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: '12px'
          }
        });
        
        // Dispatch update event
        this.dispatchWishlistUpdate();
        return true;
      }
      
      if (response.alreadyExists) {
        toast.info(`${product.name} موجود بالفعل في المفضلة 💖`);
        return false;
      }
      
      toast.error(response.error || 'حدث خطأ أثناء إضافة المنتج للمفضلة');
      return false;

    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('حدث خطأ أثناء إضافة المنتج للمفضلة');
      return false;
    } finally {
      this.pendingOperations.delete(operationKey);
    }
  }

  // Remove product from wishlist with enhanced feedback
  async removeFromWishlist(userId: string, productId: string, productName: string): Promise<boolean> {
    if (!userId || !productId) {
      return false;
    }

    const operationKey = this.generateOperationKey(userId, productId);
    
    if (this.pendingOperations.has(operationKey)) {
      return false;
    }

    this.pendingOperations.add(operationKey);

    try {
      const response = await this.apiCall(`/wishlists/user/${userId}/product/${productId}`, {
        method: 'DELETE',
      });

      if (response.success) {
        // Clear cache to force refresh
        this.clearCache(userId);
        
        toast.info(`تم إزالة ${productName} من المفضلة 💔`, {
          position: "top-center",
          autoClose: 2000,
          style: {
            background: 'linear-gradient(135deg, #74b9ff, #0984e3)',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: '12px'
          }
        });
        
        // Dispatch update event
        this.dispatchWishlistUpdate();
        return true;
      }
      
      toast.error(response.error || 'حدث خطأ أثناء إزالة المنتج من المفضلة');
      return false;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('حدث خطأ أثناء إزالة المنتج من المفضلة');
      return false;
    } finally {
      this.pendingOperations.delete(operationKey);
    }
  }

  // Toggle wishlist status (add/remove in one operation)
  async toggleWishlist(
    userId: string,
    product: {
      id: string;
      name: string;
      image: string;
      price: number;
      originalPrice?: number;
      category: string;
    }
  ): Promise<boolean> {
    if (!userId) {
      toast.info('يرجى تسجيل الدخول أولاً لإضافة المنتجات إلى المفضلة 🔐');
      return false;
    }

    try {
      const isInWishlist = await this.isProductInWishlist(userId, product.id);
      
      if (isInWishlist) {
        return await this.removeFromWishlist(userId, product.id, product.name);
      } else {
        return await this.addToWishlist(userId, product);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('حدث خطأ أثناء تحديث المفضلة');
      return false;
    }
  }

  // Clear entire wishlist with confirmation
  async clearUserWishlist(userId: string): Promise<boolean> {
    if (!userId) {
      return false;
    }

    try {
      const response = await this.apiCall(`/wishlists/user/${userId}/clear`, {
        method: 'DELETE'
      });
      
      if (response.success) {
        // Clear all cache
        this.clearCache();
        
        toast.success(`تم مسح المفضلة بنجاح 🗑️ (${response.deletedCount || 0} منتج)`, {
          position: "top-center",
          autoClose: 3000,
          style: {
            background: 'linear-gradient(135deg, #00b894, #00a085)',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: '12px'
          }
        });
        
        this.dispatchWishlistUpdate();
        return true;
      }
      
      toast.error(response.error || 'حدث خطأ أثناء مسح المفضلة');
      return false;
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast.error('حدث خطأ أثناء مسح المفضلة');
      return false;
    }
  }

  // Get wishlist count with caching
  async getWishlistCount(userId: string): Promise<number> {
    if (!userId) {
      return 0;
    }

    try {
      const wishlist = await this.getUserWishlist(userId);
      return wishlist.length;
    } catch (error) {
      console.error('Error getting wishlist count:', error);
      return 0;
    }
  }

  // Dispatch wishlist update event
  private dispatchWishlistUpdate(): void {
    window.dispatchEvent(new CustomEvent('wishlistUpdated', {
      detail: {
        timestamp: Date.now(),
        source: 'ProfessionalWishlistService'
      }
    }));
  }

  // Batch operations for better performance
  async batchRemoveFromWishlist(userId: string, productIds: string[]): Promise<boolean> {
    if (!userId || !productIds.length) {
      return false;
    }

    try {
      const promises = productIds.map(productId => 
        this.removeFromWishlist(userId, productId, 'منتج')
      );
      
      const results = await Promise.all(promises);
      const successCount = results.filter(result => result).length;
      
      if (successCount > 0) {
        toast.success(`تم حذف ${successCount} منتج من المفضلة`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error in batch remove:', error);
      return false;
    }
  }
}

export const wishlistService = ProfessionalWishlistService.getInstance();
export type { WishlistItem, ApiResponse };