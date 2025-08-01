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

  // Wishlist functionality has been removed
  useEffect(() => {
    setIsWishlisted(false);
  }, [product.id]);
  
  // Wishlist update listener has been removed

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
    
    // Wishlist functionality has been removed
    toast.info('ميزة المفضلة غير متوفرة حالياً');
    
    // Call parent callback if provided
    if (onAddToWishlist) {
      onAddToWishlist(product);
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
              i < level ? 'bg-dark-400' : 'bg-dark-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const getScentFamilyIcon = (family?: string) => {
    const iconMap: { [key: string]: JSX.Element } = {
      'زهري': <Flower className="w-4 h-4 text-dark-300" />,
      'شرقي': <Crown className="w-4 h-4 text-dark-400" />,
      'حمضي': <Leaf className="w-4 h-4 text-dark-400" />,
      'خشبي': <Wind className="w-4 h-4 text-dark-500" />,
      'منعش': <Droplets className="w-4 h-4 text-dark-400" />
    };
    
    return family ? iconMap[family] || <Sparkles className="w-4 h-4 text-dark-400" /> : null;
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
      className={`perfume-card group cursor-pointer perspective-1000 bg-dark-800 border border-dark-600 rounded-xl shadow-sm hover:shadow-md ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product.id}`} className="block">
        
        {/* Product Image Container */}
        <div className="perfume-bottle-container relative p-6">
          
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 left-4 w-16 h-16 border border-dark-400 rounded-full"></div>
            <div className="absolute bottom-4 right-4 w-12 h-12 border border-dark-300 rounded-full"></div>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
            {product.isNew && (
              <span className="bg-gradient-to-r from-dark-400 to-dark-500 text-white px-2 py-1 rounded-full text-xs font-bold">
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
              <span className="bg-gradient-to-r from-dark-500 to-dark-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                -{discountPercentage}%
              </span>
            )}
          </div>

          {/* Professional Wishlist Button */}
          <button
            onClick={handleAddToWishlist}
            disabled={isWishlistLoading}
            className={`absolute top-3 right-3 z-10 w-10 h-10 bg-dark-100/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group/heart transform hover:scale-110 ${
              isWishlistLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-dark-50'
            } ${
              isWishlisted ? 'ring-2 ring-dark-400' : ''
            }`}
          >
            <Heart 
              className={`w-5 h-5 transition-all duration-300 ${
                isWishlisted 
                  ? 'text-dark-400 fill-dark-400 scale-110' 
                  : 'text-dark-600 hover:text-dark-400 group-hover/heart:scale-110'
              } ${
                isWishlistLoading ? 'animate-pulse' : ''
              }`} 
            />
            {/* Animated Ring Effect */}
            {isWishlisted && (
              <div className="absolute inset-0 rounded-full bg-dark-300 animate-ping opacity-20"></div>
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
                  className="absolute w-1 h-1 bg-dark-400 rounded-full animate-float opacity-0 group-hover:opacity-60 transition-opacity duration-500"
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
                className="flex-1 bg-gradient-to-r from-dark-500 to-dark-600 text-white py-2 px-4 rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
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