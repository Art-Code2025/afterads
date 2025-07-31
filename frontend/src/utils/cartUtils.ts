import { toast } from 'react-toastify';
import { apiCall, API_ENDPOINTS } from '../config/api';

// دالة موحدة لإضافة منتج إلى السلة - تدعم المستخدمين المسجلين والضيوف
export const addToCartUnified = async (
  productId: string | number, // Support both string and number IDs
  productName: string,
  price: number,
  quantity: number = 1,
  selectedOptions: Record<string, string> = {},
  optionsPricing: Record<string, number> = {},
  attachments: { images?: string[]; text?: string } = {},
  product: any = {}
): Promise<boolean> => {
  try {
    // Ensure mainImage is properly formatted
    const mainImage = product?.mainImage || product?.image || '';
    // Avoid adding leading slash for data URLs ("data:image/")
    const formattedMainImage =
      mainImage.startsWith('http') ||
      mainImage.startsWith('/') ||
      mainImage.startsWith('data:image/')
        ? mainImage
        : `/${mainImage}`;

    console.log('🛒 [CartUtils] Adding to cart:', {
      productId,
      productName,
      price,
      quantity,
      selectedOptions,
      optionsPricing,
      attachments,
      hasProduct: !!product,
      mainImage: formattedMainImage
    });

    // تحضير البيانات للطلب
    const requestBody = {
      productId,
      productName,
      price,
      quantity,
      selectedOptions,
      optionsPricing,
      attachments,
      image: formattedMainImage,
      product: {
        id: productId,
        name: productName,
        price,
        mainImage: formattedMainImage,
        description: product?.description || '',
        stock: product?.stock || 0,
        productType: product?.productType || '',
        dynamicOptions: product?.dynamicOptions || [],
        specifications: product?.specifications || [],
        sizeGuideImage: product?.sizeGuideImage || '',
        ...product
      }
    };

    // محاولة الحصول على بيانات المستخدم
    const userData = localStorage.getItem('user');
    
    if (userData) {
      // المستخدم مسجل - حفظ في الخادم
      try {
        const user = JSON.parse(userData);
        if (!user?.id) {
          throw new Error('بيانات المستخدم غير صحيحة');
        }

        console.log('👤 [CartUtils] User is logged in, saving to server:', user.id);

        const response = await apiCall(API_ENDPOINTS.USER_CART(user.id), {
          method: 'POST',
          body: JSON.stringify(requestBody)
        });

        console.log('✅ [CartUtils] Successfully added to server cart:', response);
        
        // تحديث localStorage أيضاً للتوافق مع النظام القديم
        await updateLocalCartFromServer(user.id);
        
        toast.success(`تم إضافة ${productName} إلى السلة بنجاح! 🛒`, {
          position: "top-center",
          autoClose: 3000,
          style: {
            background: '#10B981',
            color: 'white',
            fontWeight: 'bold'
          }
        });

        // إطلاق حدث لتحديث عداد السلة
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        
        return true;
      } catch (serverError) {
        console.error('❌ [CartUtils] Server error, falling back to localStorage:', serverError);
        // في حالة فشل الخادم، احفظ في localStorage
      }
    }

    // المستخدم غير مسجل أو فشل الخادم - حفظ في localStorage
    console.log('💾 [CartUtils] Saving to localStorage');
    
    // الحصول على السلة الحالية من localStorage
    const existingCart = localStorage.getItem('cartItems');
    let cartItems = [];
    
    if (existingCart) {
      try {
        cartItems = JSON.parse(existingCart);
        if (!Array.isArray(cartItems)) {
          cartItems = [];
        }
      } catch (parseError) {
        console.error('❌ [CartUtils] Error parsing existing cart:', parseError);
        cartItems = [];
      }
    }

    // البحث عن المنتج الموجود
    const existingItemIndex = cartItems.findIndex((item: any) => 
      item.productId === productId &&
      JSON.stringify(item.selectedOptions || {}) === JSON.stringify(selectedOptions)
    );

    if (existingItemIndex !== -1) {
      // تحديث الكمية للمنتج الموجود
      cartItems[existingItemIndex].quantity += quantity;
      cartItems[existingItemIndex].optionsPricing = { ...cartItems[existingItemIndex].optionsPricing, ...optionsPricing };
      cartItems[existingItemIndex].attachments = { ...cartItems[existingItemIndex].attachments, ...attachments };
      console.log('📦 [CartUtils] Updated existing item quantity:', cartItems[existingItemIndex].quantity);
    } else {
      // إضافة منتج جديد
      const newItem = {
        id: Date.now() + Math.random(), // معرف مؤقت للعنصر
        productId,
        quantity,
        selectedOptions,
        optionsPricing,
        attachments,
        product: requestBody.product,
        productImage: formattedMainImage // إضافة صورة المنتج مباشرة في العنصر
      };
      cartItems.push(newItem);
      console.log('🆕 [CartUtils] Added new item to cart');
    }

    // حفظ السلة المحدثة
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    console.log('💾 [CartUtils] Cart saved to localStorage:', cartItems.length, 'items');

    // إطلاق حدث لتحديث عداد السلة
    window.dispatchEvent(new CustomEvent('cartUpdated'));

    toast.success(`تم إضافة ${productName} إلى السلة بنجاح! 🛒`, {
      position: "top-center",
      autoClose: 3000,
      style: {
        background: '#10B981',
        color: 'white',
        fontWeight: 'bold'
      }
    });

    return true;
  } catch (error) {
    console.error('❌ [CartUtils] Error adding to cart:', error);
    toast.error('فشل في إضافة المنتج إلى السلة');
    return false;
  }
};

// دالة لتحديث localStorage من الخادم
export const updateLocalCartFromServer = async (userId: number): Promise<void> => {
  try {
    const response = await apiCall(API_ENDPOINTS.USER_CART(userId));
    if (response.success) {
      localStorage.setItem('cartItems', JSON.stringify(response.data));
      console.log('✅ [CartUtils] Local cart updated from server:', response.data.length, 'items');
    }
  } catch (error) {
    console.error('❌ [CartUtils] Error updating local cart from server:', error);
  }
};

// دالة لدمج السلة المحلية مع سلة المستخدم عند تسجيل الدخول
export const mergeCartOnLogin = async (userId: number): Promise<void> => {
  try {
    const localCart = localStorage.getItem('cartItems');
    if (!localCart) {
      console.log('📭 [CartUtils] No local cart to merge');
      return;
    }

    const localItems = JSON.parse(localCart);
    if (!Array.isArray(localItems) || localItems.length === 0) {
      console.log('📭 [CartUtils] Local cart is empty');
      return;
    }

    console.log('🔄 [CartUtils] Merging local cart with server:', localItems.length, 'items');

    // إرسال العناصر للدمج
    const response = await apiCall(API_ENDPOINTS.USER_CART_MERGE(userId), {
      method: 'POST',
      body: JSON.stringify({ items: localItems })
    });

    if (response.success) {
      console.log('✅ [CartUtils] Cart merged successfully:', response.mergedCount, 'items');
      
      // تحديث localStorage من الخادم
      await updateLocalCartFromServer(userId);
      
      // إطلاق حدث لتحديث عداد السلة
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      if (response.mergedCount > 0) {
        toast.success(`تم دمج ${response.mergedCount} منتج في سلة التسوق! 🛒`, {
          position: "top-center",
          autoClose: 3000,
          style: {
            background: '#10B981',
            color: 'white',
            fontWeight: 'bold'
          }
        });
      }
    }
  } catch (error) {
    console.error('❌ [CartUtils] Error merging cart:', error);
    // لا نظهر خطأ للمستخدم، السلة المحلية ستبقى تعمل
  }
};

// دالة للحصول على عدد عناصر السلة
export const getCartItemsCount = async (): Promise<number> => {
  try {
    const userData = localStorage.getItem('user');
    
    if (userData) {
      // المستخدم مسجل - احصل من الخادم
      try {
        const user = JSON.parse(userData);
        if (user?.id) {
          const response = await apiCall(API_ENDPOINTS.USER_CART_COUNT(user.id));
          if (response.success) {
            return response.data.totalQuantity || 0;
          }
        }
      } catch (error) {
        console.error('❌ [CartUtils] Error getting cart count from server:', error);
      }
    }
    
    // المستخدم غير مسجل أو فشل الخادم - احصل من localStorage
    const localCart = localStorage.getItem('cartItems');
    if (localCart) {
      try {
        const cartItems = JSON.parse(localCart);
        if (Array.isArray(cartItems)) {
          return cartItems.reduce((total: number, item: any) => total + (item.quantity || 1), 0);
        }
      } catch (error) {
        console.error('❌ [CartUtils] Error parsing local cart:', error);
      }
    }
    
    return 0;
  } catch (error) {
    console.error('❌ [CartUtils] Error getting cart items count:', error);
    return 0;
  }
};

// دالة لمسح السلة
export const clearCart = async (): Promise<void> => {
  try {
    const userData = localStorage.getItem('user');
    
    if (userData) {
      // المستخدم مسجل - امسح من الخادم
      try {
        const user = JSON.parse(userData);
        if (user?.id) {
          await apiCall(API_ENDPOINTS.USER_CART(user.id), {
            method: 'DELETE'
          });
          console.log('✅ [CartUtils] Server cart cleared');
        }
      } catch (error) {
        console.error('❌ [CartUtils] Error clearing server cart:', error);
      }
    }
    
    // امسح من localStorage أيضاً
    localStorage.removeItem('cartItems');
    console.log('✅ [CartUtils] Local cart cleared');
    
    // إطلاق حدث لتحديث عداد السلة
    window.dispatchEvent(new CustomEvent('cartUpdated'));
    
  } catch (error) {
    console.error('❌ [CartUtils] Error clearing cart:', error);
  }
};

// دالة للحصول على السلة الكاملة
export const getCart = async (): Promise<any[]> => {
  try {
    const userData = localStorage.getItem('user');
    
    if (userData) {
      // المستخدم مسجل - احصل من الخادم
      try {
        const user = JSON.parse(userData);
        if (user?.id) {
          const response = await apiCall(API_ENDPOINTS.USER_CART(user.id));
          if (response.success) {
            // حدث localStorage أيضاً
            localStorage.setItem('cartItems', JSON.stringify(response.data));
            return response.data || [];
          }
        }
      } catch (error) {
        console.error('❌ [CartUtils] Error getting cart from server:', error);
      }
    }
    
    // المستخدم غير مسجل أو فشل الخادم - احصل من localStorage
    const localCart = localStorage.getItem('cartItems');
    if (localCart) {
      try {
        const cartItems = JSON.parse(localCart);
        return Array.isArray(cartItems) ? cartItems : [];
      } catch (error) {
        console.error('❌ [CartUtils] Error parsing local cart:', error);
      }
    }
    
    return [];
  } catch (error) {
    console.error('❌ [CartUtils] Error getting cart:', error);
    return [];
  }
}; 