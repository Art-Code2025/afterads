import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  Eye,
  Sparkles,
  Crown,
  Droplets,
  Wind,
  Flower,
  Leaf
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { buildImageUrl } from '../config/api';
import { addToCartUnified } from '../utils/cartUtils';

interface Product {
  id: string | number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  isNew?: boolean;
  isLuxury?: boolean;
  discount?: number;
  // Perfume-specific properties
  brand?: string;
  scentFamily?: string;
  fragranceNotes?: {
    top?: string[];
    middle?: string[];
    base?: string[];
  };
  scentStrength?: 'light' | 'medium' | 'strong' | 'intense';
  size?: string;
  concentration?: string; // EDT, EDP, Parfum, etc.
  longevity?: string; // 4-6 hours, 6-8 hours, etc.
  sillage?: string; // Close, Moderate, Strong
  seasonRecommendation?: string[];
  occasionRecommendation?: string[];
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  className?: string;
  viewMode?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart, 
  onAddToWishlist, 
  className = '',
  viewMode
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  // Check wishlist status on mount and when user changes
  useEffect(() => {
    const checkWishlistStatus = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) {
        setIsWishlisted(false);
        return;
      }
      
      try {
        const user = JSON.parse(userData);
        if (user?.id) {
          const { wishlistService } = await import('../services/wishlistService');
          const isInWishlist = await wishlistService.isProductInWishlist(user.id, product.id.toString());
          setIsWishlisted(isInWishlist);
          console.log(`✅ [ProductCard] Wishlist status for ${product.name}:`, isInWishlist);
        }
      } catch (error) {
        console.error('❌ [ProductCard] Error checking wishlist status:', error);
        setIsWishlisted(false);
      }
    };
    
    checkWishlistStatus();
  }, [product.id]);
  
  // Listen for wishlist updates
  useEffect(() => {
    const handleWishlistUpdate = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) {
        setIsWishlisted(false);
        return;
      }
      
      try {
        const user = JSON.parse(userData);
        if (user?.id) {
          const { wishlistService } = await import('../services/wishlistService');
          const isInWishlist = await wishlistService.isProductInWishlist(user.id, product.id.toString());
          setIsWishlisted(isInWishlist);
          console.log(`🔄 [ProductCard] Wishlist updated for ${product.name}:`, isInWishlist);
        }
      } catch (error) {
        console.error('❌ [ProductCard] Error updating wishlist status:', error);
        setIsWishlisted(false);
      }
    };
    
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
  }, [product.id]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const success = await addToCartUnified(
        product.id,
        product.name,
        product.price,
        1,
        {}, // selectedOptions
        {}, // optionsPricing
        {}, // attachments
        product as any
      );

      if (success) {
      toast.success(`تم إضافة ${product.name} إلى السلة!`, {
        position: "bottom-right",
        autoClose: 2000,
      });

        // Notify parent if needed
        if (onAddToCart) {
          onAddToCart(product);
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('حدث خطأ أثناء إضافة المنتج إلى السلة');
    }
  };

  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔥 [ProductCard] handleAddToWishlist clicked for:', product.name);
    
    // Prevent multiple clicks
    if (isWishlistLoading) {
      console.log('⏳ [ProductCard] Already loading, ignoring click');
      return;
    }
    
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    console.log('👤 [ProductCard] User data from localStorage:', userData ? 'Found' : 'Not found');
    
    if (!userData) {
      toast.info('يرجى تسجيل الدخول أولاً لإضافة المنتجات إلى المفضلة');
      return;
    }
    
    const user = JSON.parse(userData);
    console.log('👤 [ProductCard] Parsed user:', { id: user?.id, email: user?.email, firstName: user?.firstName });
    
    if (!user?.id) {
      toast.info('يرجى تسجيل الدخول أولاً');
      return;
    }
    
    setIsWishlistLoading(true);
    console.log('⏳ [ProductCard] Starting wishlist operation...');
    
    try {
      const { wishlistService } = await import('../services/wishlistService');
      console.log('📦 [ProductCard] wishlistService imported successfully');
      
      // Toggle wishlist status using backend API
      const result = await wishlistService.toggleWishlist(user.id, {
        id: product.id.toString(),
        name: product.name,
        image: product.image || '',
        price: product.price,
        originalPrice: product.originalPrice,
        category: product.category || 'عام',
      });
      
      console.log('✅ [ProductCard] toggleWishlist result:', result);
      
      // Update local state
      setIsWishlisted(!isWishlisted);
      console.log('🔄 [ProductCard] Local state updated:', !isWishlisted);
      
      // Show appropriate toast message
      if (!isWishlisted) {
        toast.success(`تم إضافة ${product.name} للمفضلة ❤️`);
      } else {
        toast.info(`تم إزالة ${product.name} من المفضلة 💔`);
      }
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
      console.log('📡 [ProductCard] wishlistUpdated event dispatched');
      
      // Call parent callback if provided
      if (onAddToWishlist) {
        onAddToWishlist(product);
      }
      
    } catch (error) {
      console.error('❌ [ProductCard] Error updating wishlist:', error);
      toast.error('حدث خطأ أثناء تحديث المفضلة');
      
      // Refresh state from backend to ensure consistency
      try {
        const { wishlistService } = await import('../services/wishlistService');
        const isInWishlist = await wishlistService.isProductInWishlist(user.id, product.id.toString());
        setIsWishlisted(isInWishlist);
        console.log('🔄 [ProductCard] State refreshed from backend:', isInWishlist);
      } catch (refreshError) {
        console.error('❌ [ProductCard] Error refreshing wishlist state:', refreshError);
      }
    } finally {
      setIsWishlistLoading(false);
      console.log('✅ [ProductCard] Wishlist operation completed');
    }
  };

  const getScentStrengthDots = (strength: string) => {
    const strengthLevels: Record<string, number> = {
      light: 1,
      medium: 2,
      strong: 3,
      intense: 4
    };
    
    const level = strengthLevels[strength] || 2;
    
    return (
      <div className="flex items-center gap-1">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < level ? 'bg-zico-primary' : 'bg-beige-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getScentFamilyIcon = (family?: string) => {
    const iconMap: { [key: string]: JSX.Element } = {
      'زهري': <Flower className="w-4 h-4 text-pink-500" />,
      'شرقي': <Crown className="w-4 h-4 text-zico-gold" />,
      'حمضي': <Leaf className="w-4 h-4 text-green-500" />,
      'خشبي': <Wind className="w-4 h-4 text-amber-600" />,
      'منعش': <Droplets className="w-4 h-4 text-blue-500" />
    };
    
    return family ? iconMap[family] || <Sparkles className="w-4 h-4 text-zico-primary" /> : null;
  };

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discount;

  const cardVariants: any = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } as any },
    whileHover: { scale: 1.05, rotateX: 5, rotateY: -5, transition: { type: 'spring', stiffness: 200, damping: 15 } },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="whileHover"
      className={`perfume-card group cursor-pointer perspective-1000 bg-dark-800 border border-dark-700 rounded-xl shadow-sm hover:shadow-md ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product.id}`} className="block">
        
        {/* Product Image Container */}
        <div className="perfume-bottle-container relative p-6">
          
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 left-4 w-16 h-16 border border-zico-primary rounded-full"></div>
            <div className="absolute bottom-4 right-4 w-12 h-12 border border-beige-500 rounded-full"></div>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
            {product.isNew && (
              <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                جديد
              </span>
            )}
            {product.isLuxury && (
              <span className="luxury-badge flex items-center gap-1">
                <Crown className="w-3 h-3" />
                فاخر
              </span>
            )}
            {discountPercentage && (
              <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                -{discountPercentage}%
              </span>
            )}
          </div>

          {/* Professional Wishlist Button */}
          <button
            onClick={handleAddToWishlist}
            disabled={isWishlistLoading}
            className={`absolute top-3 right-3 z-10 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group/heart transform hover:scale-110 ${
              isWishlistLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white'
            } ${
              isWishlisted ? 'ring-2 ring-red-200' : ''
            }`}
          >
            <Heart 
              className={`w-5 h-5 transition-all duration-300 ${
                isWishlisted 
                  ? 'text-red-500 fill-red-500 scale-110' 
                  : 'text-gray-400 hover:text-red-500 group-hover/heart:scale-110'
              } ${
                isWishlistLoading ? 'animate-pulse' : ''
              }`} 
            />
            {/* Animated Ring Effect */}
            {isWishlisted && (
              <div className="absolute inset-0 rounded-full bg-red-100 animate-ping opacity-20"></div>
            )}
          </button>

          {/* Product Image */}
          <div className="relative z-5">
            <img
              src={buildImageUrl(product.image || (product as any).mainImage)}
              alt={product.name}
              className="w-full h-48 lg:h-56 object-contain transition-all duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                console.log('❌ ProductCard image failed to load:', product.image || (product as any).mainImage);
                // Use a better placeholder
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+PGNpcmNsZSBjeD0iMjAwIiBjeT0iMTYwIiByPSI0MCIgZmlsbD0iIzlDQTNBRiIvPjxwYXRoIGQ9Ik0xNTAgMjIwTDE4MCAyMDBMMjAwIDIyMEwyNDAgMjgwSDE1MFYyMjBaIiBmaWxsPSIjOUNBM0FGIi8+PHRleHQgeD0iMjAwIiB5PSIzMjAiIGZpbGw9IiM2QjczODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtZmFtaWx5PSJBcmlhbCI+2YTYpyDYqtmI2KzYryDYtdmI2LHYqTwvdGV4dD48L3N2Zz4K';
              }}
            />
            
            {/* Perfume Shimmer Effect */}
            <div className="perfume-shimmer"></div>
            
            {/* Floating Sparkles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-zico-gold rounded-full animate-float opacity-0 group-hover:opacity-60 transition-opacity duration-500"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${2 + Math.random()}s`
                  }}
                />
              ))}
            </div>
          </div>

          {/* Quick Actions - Show on Hover */}
          <div className={`absolute inset-x-4 bottom-4 z-10 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-gradient-to-r from-zico-primary to-zico-secondary text-white py-2 px-4 rounded-xl font-medium hover:shadow-zico-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="text-sm">أضف للسلة</span>
              </button>
              <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white transition-all duration-300">
                <Eye className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 lg:p-6">
          
          {/* Brand & Category */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-beige-600 uppercase tracking-wide">
              {product.brand || 'زيكو'}
            </span>
            <div className="flex items-center gap-1">
              {getScentFamilyIcon(product.scentFamily)}
              <span className="text-xs text-beige-600">{product.scentFamily}</span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="font-bold text-gray-900 text-base lg:text-lg mb-2 line-clamp-2 group-hover:text-zico-primary transition-colors duration-300">
            {product.name}
          </h3>

          {/* Concentration & Size */}
          {(product.concentration || product.size) && (
            <div className="flex items-center gap-2 mb-3">
              {product.concentration && (
                <span className="fragrance-note">{product.concentration}</span>
              )}
              {product.size && (
                <span className="fragrance-note">{product.size}</span>
              )}
            </div>
          )}

          {/* Fragrance Notes */}
          {product.fragranceNotes?.top && (
            <div className="fragrance-notes mb-3">
              {product.fragranceNotes.top.slice(0, 3).map((note, index) => (
                <span key={index} className="fragrance-note">{note}</span>
              ))}
            </div>
          )}

          {/* Scent Strength */}
          {product.scentStrength && (
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-beige-600">قوة العطر:</span>
              {getScentStrengthDots(product.scentStrength)}
            </div>
          )}

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(product.rating!) 
                        ? 'text-zico-gold fill-zico-gold' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-beige-600">
                ({product.reviewCount || 0})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-dark-100">{(product.price || 0).toFixed(2)} ر.س</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-dark-400 line-through text-sm">{(product.originalPrice || 0).toFixed(2)} ر.س</span>
              )}
            </div>
            
            {/* Stock Status */}
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${
                product.inStock !== false ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className={`text-xs ${
                product.inStock !== false ? 'text-green-400' : 'text-red-400'
              }`}>
                {product.inStock !== false ? 'متوفر' : 'غير متوفر'}
              </span>
            </div>
          </div>

          {/* Longevity & Sillage */}
          {(product.longevity || product.sillage) && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-dark-700">
              {product.longevity && (
                <div className="text-center">
                  <div className="text-xs text-dark-300">الثبات</div>
                  <div className="text-xs font-medium text-dark-100">{product.longevity}</div>
                </div>
              )}
              {product.sillage && (
                <div className="text-center">
                  <div className="text-xs text-dark-300">الإنتشار</div>
                  <div className="text-xs font-medium text-dark-100">{product.sillage}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;