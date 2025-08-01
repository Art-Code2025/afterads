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

class WishlistService {
  private static instance: WishlistService;
  private pendingOperations = new Set<string>();

  static getInstance(): WishlistService {
    if (!WishlistService.instance) {
      WishlistService.instance = new WishlistService();
    }
    return WishlistService.instance;
  }

  private generateOperationKey(userId: string, productId: string): string {
    return `${userId}-${productId}`;
  }

  private async apiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'حدث خطأ في الخادم');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Get user's wishlist
  async getUserWishlist(userId: string): Promise<WishlistItem[]> {
    try {
      const data = await this.apiCall(`/wishlists/user/${userId}`);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      return [];
    }
  }

  // Check if product is in wishlist
  async isProductInWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      const data = await this.apiCall(`/wishlists/user/${userId}/check/${productId}`);
      return data?.inWishlist || false;
    } catch (error) {
      console.error('Error checking wishlist status:', error);
      return false;
    }
  }

  // Add product to wishlist with duplicate prevention
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
    const operationKey = this.generateOperationKey(userId, product.id);
    
    // Prevent duplicate operations
    if (this.pendingOperations.has(operationKey)) {
      return false;
    }

    this.pendingOperations.add(operationKey);

    try {
      // First check if already exists
      const isAlreadyInWishlist = await this.isProductInWishlist(userId, product.id);
      if (isAlreadyInWishlist) {
        toast.info(`${product.name} موجود بالفعل في المفضلة`);
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

      const result = await this.apiCall('/wishlists', {
        method: 'POST',
        body: JSON.stringify(wishlistData),
      });

      if (result) {
        toast.success(`تم إضافة ${product.name} للمفضلة ❤️`);
        
        // Dispatch update event
        window.dispatchEvent(new CustomEvent('wishlistUpdated'));
        return true;
      }
      
      return false;
    } catch (error: any) {
      if (error.message?.includes('موجود بالفعل')) {
        toast.info(`${product.name} موجود بالفعل في المفضلة`);
      } else {
        console.error('Error adding to wishlist:', error);
        toast.error('حدث خطأ أثناء إضافة المنتج للمفضلة');
      }
      return false;
    } finally {
      this.pendingOperations.delete(operationKey);
    }
  }

  // Remove product from wishlist
  async removeFromWishlist(userId: string, productId: string, productName: string): Promise<boolean> {
    const operationKey = this.generateOperationKey(userId, productId);
    
    if (this.pendingOperations.has(operationKey)) {
      return false;
    }

    this.pendingOperations.add(operationKey);

    try {
      // Find the wishlist item first
      const wishlist = await this.getUserWishlist(userId);
      const item = wishlist.find(item => item.productId === productId);
      
      if (!item?.id) {
        console.warn('Wishlist item not found:', productId);
        return false;
      }

      await this.apiCall(`/wishlists/${item.id}`, {
        method: 'DELETE',
      });

      toast.info(`تم إزالة ${productName} من المفضلة 💔`);
      
      // Dispatch update event
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
      return true;
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
      toast.info('يرجى تسجيل الدخول أولاً لإضافة المنتجات إلى المفضلة');
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
      return false;
    }
  }

  // Clear entire wishlist
  async clearUserWishlist(userId: string): Promise<boolean> {
    try {
      const wishlist = await this.getUserWishlist(userId);
      
      // Delete all items
      const deletePromises = wishlist.map(item => 
        this.apiCall(`/wishlists/${item.id}`, { method: 'DELETE' })
      );
      
      await Promise.all(deletePromises);
      
      toast.success('تم مسح المفضلة بنجاح');
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
      return true;
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast.error('حدث خطأ أثناء مسح المفضلة');
      return false;
    }
  }

  // Get wishlist count
  async getWishlistCount(userId: string): Promise<number> {
    try {
      const wishlist = await this.getUserWishlist(userId);
      return wishlist.length;
    } catch (error) {
      console.error('Error getting wishlist count:', error);
      return 0;
    }
  }
}

export const wishlistService = WishlistService.getInstance();
export type { WishlistItem };