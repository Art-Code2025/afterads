import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  Package, 
  Sparkles, 
  Eye, 
  Gift,
  Star,
  ArrowRight,
  RefreshCw,
  Filter,
  Grid,
  List
} from 'lucide-react';
import { toast } from 'react-toastify';
import { createProductSlug } from '../utils/slugify';
import { buildImageUrl } from '../config/api';
import { addToCartUnified } from '../utils/cartUtils';
import { wishlistService, WishlistItem } from '../services/wishlistService';

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

const ProfessionalWishlist: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price-low' | 'price-high' | 'name'>('newest');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadWishlistData();
    
    // Listen for wishlist updates
    const handleWishlistUpdate = () => {
      loadWishlistData();
    };

    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    
    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
    };
  }, []);

  const loadWishlistData = async () => {
    setLoading(true);
    setError(null);

    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        setWishlistItems([]);
        setProducts([]);
        setLoading(false);
        return;
      }

      const user = JSON.parse(userData);
      if (!user?.id) {
        setWishlistItems([]);
        setProducts([]);
        setLoading(false);
        return;
      }

      // Get wishlist items
      const items = await wishlistService.getUserWishlist(user.id);
      setWishlistItems(items);
      
      if (items.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      
      // Fetch product details for each wishlist item
      const productPromises = items.map(async (item) => {
        try {
          const { apiCall, API_ENDPOINTS } = await import('../config/api');
          const product = await apiCall(API_ENDPOINTS.PRODUCT_BY_ID(item.productId));
          return product;
        } catch (error) {
          console.warn(`Product ${item.productId} not found, removing from wishlist:`, error);
          // Remove the wishlist item for non-existent product
          try {
            await wishlistService.removeFromWishlist(user.id, item.productId, item.productName);
          } catch (cleanupError) {
            console.warn('Could not cleanup wishlist item:', cleanupError);
          }
          return null;
        }
      });
      
      const productResults = await Promise.all(productPromises);
      const validProducts = productResults.filter(p => p !== null);
      
      setProducts(validProducts);
      
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setError('حدث خطأ أثناء تحميل المفضلة');
    } finally {
      setLoading(false);
    }
  };

  const refreshWishlist = async () => {
    setIsRefreshing(true);
    await loadWishlistData();
    setIsRefreshing(false);
    toast.success('تم تحديث المفضلة بنجاح! 🔄');
  };

  const removeFromWishlist = async (productId: number, productName: string) => {
    const userData = localStorage.getItem('user');
    if (!userData) return;

    const user = JSON.parse(userData);
    if (!user?.id) return;

    const success = await wishlistService.removeFromWishlist(user.id, productId.toString(), productName);
    if (success) {
      // Update local state immediately for better UX
      setWishlistItems(prev => prev.filter(item => item.productId !== productId.toString()));
      setProducts(prev => prev.filter(product => product.id !== productId));
    }
  };

  const clearWishlist = async () => {
    const userData = localStorage.getItem('user');
    if (!userData) return;

    const user = JSON.parse(userData);
    if (!user?.id) return;

    // Show confirmation dialog
    const confirmed = window.confirm('هل أنت متأكد من مسح جميع المنتجات من المفضلة؟');
    if (!confirmed) return;

    const success = await wishlistService.clearUserWishlist(user.id);
    if (success) {
      setWishlistItems([]);
      setProducts([]);
    }
  };

  const addToCart = async (product: Product) => {
    try {
      await addToCartUnified(
        product.id,
        product.name,
        product.price,
        1,
        {}, // selectedOptions
        {}, // optionsPricing
        { images: [], text: '' }, // attachments
        product as any // productData
      );
      toast.success(`تم إضافة ${product.name} إلى السلة! 🛒`, {
        position: "top-center",
        autoClose: 2000,
        style: {
          background: 'linear-gradient(135deg, #00b894, #00a085)',
          color: 'white',
          fontWeight: 'bold',
          borderRadius: '12px'
        }
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('حدث خطأ أثناء إضافة المنتج للسلة');
    }
  };

  // Filter and sort products
  const getFilteredAndSortedProducts = () => {
    let filtered = products;

    // Filter by category
    if (filterCategory !== 'all') {
      const categoryItem = wishlistItems.find(item => 
        products.find(p => p.id.toString() === item.productId)?.id.toString() === item.productId
      );
      if (categoryItem) {
        filtered = products.filter(product => {
          const item = wishlistItems.find(i => i.productId === product.id.toString());
          return item?.category === filterCategory;
        });
      }
    }

    // Sort products
    filtered.sort((a, b) => {
      const itemA = wishlistItems.find(i => i.productId === a.id.toString());
      const itemB = wishlistItems.find(i => i.productId === b.id.toString());

      switch (sortBy) {
        case 'newest':
          return new Date(itemB?.createdAt || 0).getTime() - new Date(itemA?.createdAt || 0).getTime();
        case 'oldest':
          return new Date(itemA?.createdAt || 0).getTime() - new Date(itemB?.createdAt || 0).getTime();
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name, 'ar');
        default:
          return 0;
      }
    });

    return filtered;
  };

  const getUniqueCategories = () => {
    const categories = wishlistItems.map(item => item.category).filter(Boolean);
    return [...new Set(categories)];
  };

  const filteredProducts = getFilteredAndSortedProducts();
  const categories = getUniqueCategories();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">جاري تحميل المفضلة...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button
            onClick={loadWishlistData}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mb-6 shadow-lg">
            <Heart className="w-10 h-10 text-white fill-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            مفضلتي الشخصية
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            اكتشف مجموعتك المختارة من المنتجات المفضلة
          </p>
        </div>

        {products.length > 0 ? (
          <>
            {/* Controls */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Stats and Actions */}
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                    {products.length} منتج
                  </div>
                  <button
                    onClick={refreshWishlist}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    تحديث
                  </button>
                  <button
                    onClick={clearWishlist}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    مسح الكل
                  </button>
                </div>

                {/* Filters and View Controls */}
                <div className="flex items-center gap-4">
                  {/* Category Filter */}
                  {categories.length > 0 && (
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="all">جميع الفئات</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  )}

                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="newest">الأحدث</option>
                    <option value="oldest">الأقدم</option>
                    <option value="price-low">السعر: من الأقل للأعلى</option>
                    <option value="price-high">السعر: من الأعلى للأقل</option>
                    <option value="name">الاسم</option>
                  </select>

                  {/* View Mode */}
                  <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-pink-500 text-white' : 'text-gray-600 hover:bg-gray-50'} transition-colors`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-pink-500 text-white' : 'text-gray-600 hover:bg-gray-50'} transition-colors`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            <div className={`${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }`}>
              {filteredProducts.map((product) => {
                const wishlistItem = wishlistItems.find(item => item.productId === product.id.toString());
                
                return viewMode === 'grid' ? (
                  // Grid View
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden">
                      <Link to={`/product/${createProductSlug(product.id, product.name)}`}>
                        <img
                          src={buildImageUrl(product.mainImage)}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-image.png';
                          }}
                        />
                      </Link>
                      
                      {/* Remove from Wishlist Button */}
                      <button
                        onClick={() => removeFromWishlist(product.id, product.name)}
                        className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all duration-300 group/heart"
                      >
                        <Heart className="w-5 h-5 text-red-500 fill-red-500 group-hover/heart:scale-110 transition-transform" />
                      </button>

                      {/* Stock Status */}
                      <div className="absolute bottom-4 right-4">
                        {product.stock > 0 ? (
                          <span className="bg-green-500/90 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full">
                            متوفر
                          </span>
                        ) : (
                          <span className="bg-red-500/90 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full">
                            نفذ
                          </span>
                        )}
                      </div>

                      {/* Discount Badge */}
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div className="absolute top-4 right-4">
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-6">
                      <Link to={`/product/${createProductSlug(product.id, product.name)}`}>
                        <h3 className="font-bold text-gray-900 mb-3 hover:text-pink-600 transition-colors line-clamp-2 text-lg">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Category */}
                      {wishlistItem?.category && (
                        <div className="mb-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {wishlistItem.category}
                          </span>
                        </div>
                      )}

                      {/* Price */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-gray-900">
                            {product.price.toLocaleString()} ر.س
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-lg text-gray-500 line-through">
                              {product.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => addToCart(product)}
                          disabled={product.stock === 0}
                          className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-pink-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          {product.stock > 0 ? 'أضف للسلة' : 'نفذ'}
                        </button>
                        <Link
                          to={`/product/${createProductSlug(product.id, product.name)}`}
                          className="bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>

                      {/* Added Date */}
                      {wishlistItem?.createdAt && (
                        <div className="mt-3 text-xs text-gray-500 text-center">
                          أُضيف في {new Date(wishlistItem.createdAt).toLocaleDateString('ar-SA')}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // List View
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* Product Image */}
                      <div className="relative w-full sm:w-48 h-48 sm:h-32 overflow-hidden">
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
                        
                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromWishlist(product.id, product.name)}
                          className="absolute top-2 left-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all"
                        >
                          <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                        </button>
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between h-full">
                          <div className="flex-1">
                            <Link to={`/product/${createProductSlug(product.id, product.name)}`}>
                              <h3 className="font-bold text-lg text-gray-900 mb-2 hover:text-pink-600 transition-colors">
                                {product.name}
                              </h3>
                            </Link>
                            
                            {/* Category and Stock */}
                            <div className="flex items-center gap-3 mb-3">
                              {wishlistItem?.category && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  {wishlistItem.category}
                                </span>
                              )}
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                product.stock > 0 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {product.stock > 0 ? 'متوفر' : 'نفذ'}
                              </span>
                            </div>

                            {/* Price */}
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xl font-bold text-gray-900">
                                {product.price.toLocaleString()} ر.س
                              </span>
                              {product.originalPrice && product.originalPrice > product.price && (
                                <span className="text-sm text-gray-500 line-through">
                                  {product.originalPrice.toLocaleString()}
                                </span>
                              )}
                            </div>

                            {/* Added Date */}
                            {wishlistItem?.createdAt && (
                              <div className="text-xs text-gray-500">
                                أُضيف في {new Date(wishlistItem.createdAt).toLocaleDateString('ar-SA')}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 mt-4 sm:mt-0 sm:ml-4">
                            <button
                              onClick={() => addToCart(product)}
                              disabled={product.stock === 0}
                              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              <ShoppingCart className="w-4 h-4" />
                              {product.stock > 0 ? 'أضف للسلة' : 'نفذ'}
                            </button>
                            <Link
                              to={`/product/${createProductSlug(product.id, product.name)}`}
                              className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Continue Shopping */}
            <div className="text-center mt-12">
              <Link
                to="/products"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Sparkles className="w-6 h-6" />
                اكتشف المزيد من المنتجات
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </>
        ) : (
          // Empty State
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full mb-8">
              <Heart className="w-16 h-16 text-pink-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              مفضلتك فارغة
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
              لم تقم بإضافة أي منتجات إلى المفضلة بعد. ابدأ بتصفح منتجاتنا الرائعة!
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Sparkles className="w-6 h-6" />
              تصفح المنتجات
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalWishlist;