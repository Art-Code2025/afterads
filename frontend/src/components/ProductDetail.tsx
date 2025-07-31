import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  ArrowRight, 
  Plus, 
  Minus, 
  Share2, 
  Truck, 
  Shield, 
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Eye,
  Package,
  AlertCircle,
  Sparkles,
  Gift,
  Clock,
  RefreshCw
} from 'lucide-react';
import WhatsAppButton from './WhatsAppButton';
import { buildImageUrl } from '../config/api';
import { addToCartUnified } from '../utils/cartUtils';
import { productsAPI } from '../utils/api';
import { createProductSlug } from '../utils/slugify';

interface Product {
  id: string | number;
  name: string;
  brand: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  categoryName: string;
  rating: number;
  mainImage: string;
  specifications: { name: string; value: string }[];
  createdAt?: string;
}

interface Category {
  id: string | number;
  name: string;
  description: string;
}

const ProductDetail: React.FC = () => {
  const { id, slug } = useParams<{ id?: string, slug?: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const findAndSetProduct = async () => {
      setLoading(true);
      setError(null);
      
      const identifier = id || slug;
      if (!identifier) {
        setError('معرف المنتج غير صحيح');
        setLoading(false);
        return;
      }
      
      try {
        const allProducts: Product[] = await productsAPI.getAll({}, true);
      
        if (!Array.isArray(allProducts)) {
          console.error("API did not return an array for products:", allProducts);
          throw new Error('فشل في تحميل قائمة المنتجات، البيانات المستلمة غير صالحة.');
        }

        console.log('✅ Products loaded successfully:', allProducts.length);

        const foundProduct = allProducts.find(p => {
          if (id) return p.id.toString() === id;
          if (slug) return createProductSlug(p.id, p.name) === slug;
          return false;
          });
          
        if (foundProduct) {
          console.log('✅ Product found:', foundProduct.name);
          setProduct(foundProduct);
          setSelectedImage(buildImageUrl(foundProduct.mainImage));
        } else {
          console.log('❌ Product not found with identifier:', identifier);
          throw new Error('المنتج غير موجود');
      }
      } catch (err) {
        console.error('❌ Error in findAndSetProduct:', err);
        const errorMessage = err instanceof Error ? err.message : 'فشل في تحميل المنتج';
      setError(errorMessage);
        toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

    findAndSetProduct();
  }, [id, slug]);

  const incrementQuantity = () => setQuantity(prev => Math.min(prev + 1, product?.stock || 1));
  const decrementQuantity = () => setQuantity(prev => Math.max(prev - 1, 1));

  const addToCart = async () => {
    if (!product) return;
    
    setAddingToCart(true);
    try {
      const success = await addToCartUnified(
        product.id,
        product.name,
        product.price,
        quantity,
        {},
        {},
        { images: [], text: '' },
        product
      );
      
      if (success) {
        toast.success('تم إضافة المنتج إلى السلة بنجاح!');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('فشل في إضافة المنتج إلى السلة');
    } finally {
      setAddingToCart(false);
    }
  };

  const addToWishlist = async () => {
    if (!product) return;
    
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const productId = product.id;
      
      if (wishlist.includes(productId)) {
        toast.info('المنتج موجود بالفعل في المفضلة');
        return;
      }
      
      wishlist.push(productId);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
      
      toast.success(`تم إضافة ${product.name} إلى المفضلة! ❤️`, {
        position: "top-center",
        autoClose: 3000,
        style: {
          background: '#8B5A3C',
          color: 'white',
          fontWeight: 'bold'
        }
      });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('فشل في إضافة المنتج إلى المفضلة');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-beige-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brown-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-brown-800 mb-2">جاري تحميل المنتج...</h2>
          <p className="text-brown-600">يرجى الانتظار قليلاً</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-beige-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-brown-800 mb-4">حدث خطأ</h2>
          <p className="text-brown-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
              }}
              className="w-full bg-gradient-to-r from-brown-500 to-brown-600 text-white px-6 py-3 rounded-xl hover:from-brown-600 hover:to-brown-700 transition-all duration-300 font-semibold"
            >
              <RefreshCw className="w-5 h-5 inline-block ml-2" />
              إعادة المحاولة
            </button>
            <Link
              to="/"
              className="block w-full bg-beige-100 text-brown-700 px-6 py-3 rounded-xl hover:bg-beige-200 transition-colors font-semibold"
            >
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show "not found" state if no product but not loading
  if (!product && !loading) {
    return (
      <div className="min-h-screen bg-beige-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-beige-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-brown-400" />
          </div>
          <h2 className="text-2xl font-bold text-brown-800 mb-4">المنتج غير موجود</h2>
          <p className="text-brown-600 mb-6">لم يتم العثور على المنتج المطلوب. قد يكون تم حذفه أو لا يوجد.</p>
          <div className="space-y-3">
            <Link
              to="/"
              className="block w-full bg-gradient-to-r from-brown-500 to-brown-600 text-white px-6 py-3 rounded-xl hover:from-brown-600 hover:to-brown-700 transition-all duration-300 font-semibold"
            >
              العودة للرئيسية
            </Link>
            <Link
              to="/products"
              className="block w-full bg-beige-100 text-brown-700 px-6 py-3 rounded-xl hover:bg-beige-200 transition-colors font-semibold"
            >
              تصفح جميع المنتجات
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // At this point, we know product is not null due to the checks above
  if (!product) return null;

  return (
    <div className="min-h-screen bg-beige-50" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 mb-8 text-sm">
          <Link to="/" className="text-brown-500 hover:text-brown-700">الرئيسية</Link>
          <ChevronLeft className="w-4 h-4 text-brown-400" />
          <Link to="/products" className="text-brown-500 hover:text-brown-700">المنتجات</Link>
          <ChevronLeft className="w-4 h-4 text-brown-400" />
          <span className="text-brown-800">{product.name}</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-xl bg-beige-100">
                <img
                  src={buildImageUrl(selectedImage)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-image.png';
                  }}
                />
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-brown-600 font-medium">{product.brand}</span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < product.rating ? 'text-gold fill-current' : 'text-beige-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-brown-600 mr-2">({product.rating})</span>
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-brown-900 mb-4">{product.name}</h1>
                <p className="text-brown-600 text-lg leading-relaxed">{product.description}</p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-brown-600">{(product.price || 0).toFixed(2)} ر.س</span>
                {product.originalPrice && (
                  <span className="text-xl text-brown-400 line-through">{(product.originalPrice || 0).toFixed(2)} ر.س</span>
                )}
              </div>

              {/* Specifications */}
              {product.specifications && product.specifications.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-brown-800">المواصفات:</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {product.specifications.map((spec, index) => (
                      <div key={index} className="flex justify-between py-2 border-b border-beige-200">
                        <span className="text-brown-600 font-medium">{spec.name}:</span>
                        <span className="text-brown-800">{spec.value}</span>
                    </div>
                  ))}
                </div>
                </div>
              )}

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <label className="text-lg font-semibold text-brown-800">الكمية:</label>
                  <div className="flex items-center border border-beige-300 rounded-xl overflow-hidden">
                    <button
                      onClick={decrementQuantity}
                      className="px-4 py-3 bg-beige-100 hover:bg-beige-200 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-6 py-3 font-semibold text-brown-800">{quantity}</span>
                    <button
                      onClick={incrementQuantity}
                      className="px-4 py-3 bg-beige-100 hover:bg-beige-200 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-sm text-brown-600">
                    متوفر: {product.stock} قطعة
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={addToCart}
                    disabled={addingToCart || product.stock === 0}
                    className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-brown-500 to-brown-600 text-white px-8 py-4 rounded-xl hover:from-brown-600 hover:to-brown-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg"
                  >
                    {addingToCart ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>جاري الإضافة...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        <span>أضف إلى السلة</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={addToWishlist}
                    className="px-6 py-4 border-2 border-brown-500 text-brown-500 rounded-xl hover:bg-brown-500 hover:text-white transition-all duration-300 transform hover:scale-105"
                  >
                    <Heart className="w-6 h-6" />
                  </button>
                </div>

                {/* Features */}
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-beige-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Truck className="w-6 h-6 text-brown-600" />
                    </div>
                    <p className="text-sm text-brown-600">شحن مجاني</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-beige-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Shield className="w-6 h-6 text-brown-600" />
                    </div>
                    <p className="text-sm text-brown-600">ضمان الجودة</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-beige-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <RotateCcw className="w-6 h-6 text-brown-600" />
                    </div>
                    <p className="text-sm text-brown-600">إرجاع سهل</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <RelatedProducts currentProductId={product.id} />
      </div>

      {/* WhatsApp Button */}
      <WhatsAppButton />
    </div>
  );
};

// مكون المنتجات ذات الصلة
const RelatedProducts: React.FC<{ currentProductId: string | number }> = ({ currentProductId }) => {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRelatedProducts();
  }, [currentProductId]);

  const fetchRelatedProducts = async () => {
    try {
      const products = JSON.parse(localStorage.getItem('products') || '[]');
      
      const filtered = products.filter((product: Product) => 
        product.id.toString() !== currentProductId.toString()
      );
      
      const shuffled = filtered.sort(() => Math.random() - 0.5);
      
      setRelatedProducts(shuffled.slice(0, 3));
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  if (relatedProducts.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-brown-800 mb-2">منتجات ذات صلة</h2>
        <div className="h-1 w-16 bg-gradient-to-r from-brown-500 to-brown-600 mx-auto rounded-full"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedProducts.map((product) => (
          <div 
            key={product.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden border border-beige-200 hover:shadow-xl transition-shadow duration-200 cursor-pointer"
            onClick={() => navigate(`/product/${product.id}`)}
          >
            <div className="relative">
              <div className="aspect-square overflow-hidden">
                <img 
                  src={buildImageUrl(product.mainImage)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-image.png';
                  }}
                />
              </div>
              <div className="absolute top-3 right-3 bg-brown-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                {product.brand}
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-md font-bold text-brown-800 mb-2 line-clamp-2">{product.name}</h3>
              <p className="text-brown-600 text-sm mb-3 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-brown-600">{(product.price || 0).toFixed(2)} ر.س</span>
                    {product.originalPrice && (
                        <span className="bg-red-500 text-white px-1 py-0.5 rounded text-xs font-bold">
                          -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                        </span>
                    )}
                      </div>
                </div>
                <button className="bg-gradient-to-r from-brown-500 to-brown-600 text-white px-3 py-2 rounded-lg hover:from-brown-600 hover:to-brown-700 transition-colors duration-200 text-sm">
                  عرض
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductDetail;