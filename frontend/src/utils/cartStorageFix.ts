// Cart Storage Fix - تنظيف وإصلاح localStorage للسلة
export const fixCartStorage = (): boolean => {
  console.log('🔧 [CartStorageFix] Starting cart storage cleanup...');
  
  try {
    // 1. تحقق من وجود السلة القديمة في 'cart'
    const oldCart = localStorage.getItem('cart');
    const newCart = localStorage.getItem('cartItems');
    
    console.log('📦 [CartStorageFix] Current storage state:', {
      oldCart: oldCart ? 'exists' : 'not found',
      newCart: newCart ? 'exists' : 'not found',
      oldCartLength: oldCart ? JSON.parse(oldCart).length : 0,
      newCartLength: newCart ? JSON.parse(newCart).length : 0
    });
    
    // 2. إذا كانت السلة القديمة موجودة والجديدة فارغة أو غير موجودة
    if (oldCart && (!newCart || JSON.parse(newCart).length === 0)) {
      try {
        const oldCartData = JSON.parse(oldCart);
        if (Array.isArray(oldCartData) && oldCartData.length > 0) {
          console.log('🔄 [CartStorageFix] Moving cart from "cart" to "cartItems"');
          localStorage.setItem('cartItems', oldCart);
          console.log('✅ [CartStorageFix] Cart moved successfully:', oldCartData.length, 'items');
        }
      } catch (error) {
        console.error('❌ [CartStorageFix] Error parsing old cart:', error);
      }
    }
    
    // 3. إذا كانت كلاهما موجودتان، دمج البيانات
    if (oldCart && newCart) {
      try {
        const oldCartData = JSON.parse(oldCart);
        const newCartData = JSON.parse(newCart);
        
        if (Array.isArray(oldCartData) && Array.isArray(newCartData)) {
          // دمج العناصر (تجنب التكرار)
          const mergedCart = [...newCartData];
          
          oldCartData.forEach((oldItem: any) => {
            const existsInNew = newCartData.find((newItem: any) => 
              newItem.productId === oldItem.productId &&
              JSON.stringify(newItem.selectedOptions) === JSON.stringify(oldItem.selectedOptions)
            );
            
            if (!existsInNew) {
              mergedCart.push(oldItem);
            }
          });
          
          if (mergedCart.length > newCartData.length) {
            localStorage.setItem('cartItems', JSON.stringify(mergedCart));
            console.log('🔄 [CartStorageFix] Carts merged:', mergedCart.length, 'total items');
          }
        }
      } catch (error) {
        console.error('❌ [CartStorageFix] Error merging carts:', error);
      }
    }
    
    // 4. حذف السلة القديمة بعد النقل
    if (oldCart) {
      localStorage.removeItem('cart');
      console.log('🗑️ [CartStorageFix] Old cart key removed');
    }
    
    // 5. تحديث عداد السلة
    const finalCart = localStorage.getItem('cartItems');
    if (finalCart) {
      try {
        const cartData = JSON.parse(finalCart);
        const totalItems = cartData.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
        
        // إرسال حدث لتحديث العداد
        window.dispatchEvent(new CustomEvent('cartCountChanged', { detail: totalItems }));
        console.log('📊 [CartStorageFix] Cart count updated:', totalItems);
      } catch (error) {
        console.error('❌ [CartStorageFix] Error updating cart count:', error);
      }
    }
    
    console.log('✅ [CartStorageFix] Cart storage cleanup completed');
    return true;
    
  } catch (error) {
    console.error('❌ [CartStorageFix] Error during cart storage fix:', error);
    return false;
  }
};

// تشغيل الإصلاح عند تحميل الصفحة
export const initCartStorageFix = (): void => {
  // تشغيل الإصلاح بعد تحميل الصفحة
  if (typeof window !== 'undefined') {
    // تشغيل فوري إذا كانت الصفحة محملة بالفعل
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fixCartStorage);
    } else {
      fixCartStorage();
    }
  }
}; 