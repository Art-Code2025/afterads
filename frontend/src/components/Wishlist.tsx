import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, Package, Sparkles, Eye, Gift } from 'lucide-react';
import { toast } from 'react-toastify';
import { createProductSlug } from '../utils/slugify';
import { buildImageUrl } from '../config/api';
import { addToCartUnified } from '../utils/cartUtils';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  mainImage: string;
  stock: number;
  description: string;
  categoryId?: number;
}

const Wishlist: React.FC = () => {
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false); // تم تغييرها من true إلى false
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWishlistProducts();
    
    // Listen for wishlist updates
    const handleWishlistUpdate = () => {
      loadWishlistProducts();
    };

    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    
    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
    };
  }, []);

  const loadWishlistProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        setWishlistProducts([]);
        setLoading(false);
        return;
      }

      const user = JSON.parse(userData);
      if (!user?.id) {
        setWishlistProducts([]);
        setLoading(false);
        return;
      }

      const { wishlistService } = await import('../services/wishlistService');
      const wishlistItems = await wishlistService.getUserWishlist(user.id);
      
      if (wishlistItems.length === 0) {
        setWishlistProducts([]);
        setLoading(false);
        return;
      }
      
      // Fetch product details for each wishlist item
      const productPromises = wishlistItems.map(async (item) => {
        try {
          const { apiCall, API_ENDPOINTS } = await import('../config/api');
          const product = await apiCall(API_ENDPOINTS.PRODUCT_BY_ID(item.productId));
          return product;
        } catch (error) {
          console.warn(`Product ${item.productId} not found or deleted, skipping from wishlist:`, error);
          // Remove the wishlist item for non-existent product
          try {
            const { wishlistService } = await import('../services/wishlistService');
            await wishlistService.removeFromWishlist(user.id, item.productId.toString(), 'Product not found');
          } catch (cleanupError) {
            console.warn('Could not cleanup wishlist item:', cleanupError);
          }
          return null;
        }
      });
      
      const products = await Promise.all(productPromises);
      const validProducts = products.filter(p => p !== null);
      
      setWishlistProducts(validProducts);
      
    } catch (error) {
      console.error('Error loading wishlist products:', error);
      setError('حدث خطأ أثناء تحميل المفضلة');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string | number, productName: string) => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        toast.info('يرجى تسجيل الدخول أولاً');
        return;
      }

      const user = JSON.parse(userData);
      if (!user?.id) {
        toast.info('يرجى تسجيل الدخول أولاً');
        return;
      }

      const { wishlistService } = await import('../services/wishlistService');
      await wishlistService.removeFromWishlist(user.id, productId.toString(), productName);
      
      // Update local state
      setWishlistProducts(prev => prev.filter(product => product.id !== productId));
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
      
      toast.success(`تم إزالة ${productName} من المفضلة`);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('حدث خطأ أثناء إزالة المنتج من المفضلة');
    }
  };

  const addToCart = async (productId: string | number, productName: string) => {
    try {
      const product = wishlistProducts.find(p => p.id.toString() === productId.toString());
      if (!product) return;

      const success = await addToCartUnified(
        product.id,
        product.name,
        product.price,
        1, 
        {}, 
        {}, 
        {},
        product
      );
      
      if (success) {
        toast.success(`تم إضافة ${productName} إلى السلة`);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('فشل في إضافة المنتج إلى السلة');
    }
  };

  const clearWishlist = async () => {
    if (window.confirm('هل أنت متأكد من حذف جميع المنتجات من المفضلة؟')) {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) {
          toast.info('يرجى تسجيل الدخول أولاً');
          return;
        }

        const user = JSON.parse(userData);
        if (!user?.id) {
          toast.info('يرجى تسجيل الدخول أولاً');
          return;
        }

        const { wishlistService } = await import('../services/wishlistService');
        await wishlistService.clearUserWishlist(user.id);
        
        setWishlistProducts([]);
        window.dispatchEvent(new CustomEvent('wishlistUpdated'));
        toast.success('تم مسح المفضلة');
      } catch (error) {
        console.error('Error clearing wishlist:', error);
        toast.error('حدث خطأ أثناء مسح المفضلة');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل المفضلة...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">خطأ في تحميل المفضلة</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadWishlistProducts}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <Heart className="w-8 h-8 text-pink-600" />
            <h1 className="text-3xl font-bold text-gray-900">المفضلة</h1>
          </div>
          <p className="text-gray-600">
            {wishlistProducts.length > 0 
              ? `لديك ${wishlistProducts.length} منتج في المفضلة`
              : 'لا توجد منتجات في المفضلة'
            }
          </p>
        </div>

        {wishlistProducts.length > 0 ? (
          <>
            {/* Clear All Button */}
            <div className="flex justify-end mb-6">
              <button
                onClick={clearWishlist}
                className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                مسح الكل
              </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <Link to={`/product/${createProductSlug(product.id, product.name)}`}>
                      <img
                        src={buildImageUrl(product.mainImage)}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-image.png';
                        }}
                      />
                    </Link>
                    
                    {/* Remove from Wishlist Button */}
                    <button
                      onClick={() => removeFromWishlist(product.id, product.name)}
                      className="absolute top-3 left-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-red-50 transition-colors group"
                    >
                      <Heart className="w-4 h-4 text-red-500 fill-red-500 group-hover:scale-110 transition-transform" />
                    </button>

                    {/* Stock Status */}
                    <div className="absolute bottom-3 right-3">
                      {product.stock > 0 ? (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                          متوفر
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                          نفذ
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <Link to={`/product/${createProductSlug(product.id, product.name)}`}>
                      <h3 className="font-semibold text-gray-900 mb-2 hover:text-pink-600 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Price */}
                    <div className="mb-3">
                      <span className="text-xl font-bold text-gray-800">{(product.price || 0).toFixed(0)} ر.س</span>
                      {product.originalPrice ? (
                        <span className="text-gray-500 line-through ml-2">{(product.originalPrice || 0).toFixed(0)} ر.س</span>
                      ) : null}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => addToCart(product.id, product.name)}
                        disabled={product.stock === 0}
                        className="flex-1 bg-pink-600 text-white py-2 px-3 rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        إضافة للسلة
                      </button>
                      
                      <Link
                        to={`/product/${createProductSlug(product.id, product.name)}`}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-pink-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">المفضلة فارغة</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              لم تقم بإضافة أي منتجات إلى المفضلة بعد. ابدأ بتصفح منتجاتنا وأضف ما يعجبك!
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              تصفح المنتجات
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;