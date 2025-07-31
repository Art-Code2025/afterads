import React from 'react';
import ProductCard from './ProductCard';
import { Star, TrendingUp, ArrowRight } from 'lucide-react';

interface Product {
  id: number | string;
  name: string;
  price: number;
  originalPrice?: number;
  mainImage?: string;
  rating?: number;
  brand?: string;
}

interface Props {
  products: Product[];
}

const CustomerFavoritesSection: React.FC<Props> = ({ products }) => {
  if (!products || products.length === 0) return null;

  const shown = products.slice(0, 3);

  return (
    <section className="relative py-24 bg-gradient-to-br from-white via-[#FAF8F5]/50 to-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-br from-[#C4A484]/20 to-[#D4B896]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 left-16 w-32 h-32 bg-gradient-to-br from-[#E5D5C8]/15 to-[#C4A484]/15 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center space-y-6 mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-[#C4A484]/50">
            <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
            <span className="text-sm font-medium text-[#6B4226]">الأكثر مبيعاً</span>
            <TrendingUp className="w-4 h-4 text-[#8B5A3C]" />
          </div>

          {/* Main Title */}
          <div className="space-y-4">
            <h2 className="font-english text-5xl md:text-6xl font-bold bg-gradient-to-r from-[#6B4226] via-[#8B5A3C] to-[#6B4226] bg-clip-text text-transparent">
              CUSTOMER
            </h2>
            <h3 className="font-english text-4xl md:text-5xl font-light bg-gradient-to-r from-[#A67C52] via-[#C4A484] to-[#A67C52] bg-clip-text text-transparent">
              FAVORITES
            </h3>
            
            {/* Decorative Line */}
            <div className="flex justify-center">
              <div className="w-24 h-1 bg-gradient-to-r from-[#C4A484] to-[#D4B896] rounded-full"></div>
            </div>
          </div>

          {/* Description */}
          <p className="text-[#8B5A3C] text-lg max-w-2xl mx-auto leading-relaxed">
            اكتشف العطور الأكثر حباً من قبل عملائنا المميزين. تشكيلة منتقاة بعناية من أفضل الروائح العالمية
          </p>

          {/* CTA Link */}
          <div className="pt-4">
            <a
              href="#"
              className="group inline-flex items-center gap-3 text-[#8B5A3C] hover:text-[#6B4226] transition-all duration-300"
            >
              <span className="text-sm font-medium tracking-wider uppercase">جميع المنتجات الأكثر مبيعاً</span>
              <div className="flex items-center gap-1">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                <div className="w-12 h-px bg-gradient-to-r from-[#C4A484] to-[#D4B896] group-hover:w-16 transition-all duration-300"></div>
              </div>
            </a>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {shown.map((product, index) => (
            <div 
              key={product.id} 
              className="group relative"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Rank Badge */}
              <div className="absolute -top-4 -left-4 z-20 w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#E5D5C8] rounded-full shadow-2xl flex items-center justify-center">
                <span className="text-[#6B4226] font-bold text-lg">#{index + 1}</span>
              </div>

              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#C4A484]/10 to-[#D4B896]/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 scale-110"></div>
              
              <div className="relative">
                <ProductCard
                  product={{
                    id: product.id.toString(),
                    name: product.name,
                    price: product.price,
                    originalPrice: product.originalPrice,
                    image: product.mainImage || '/placeholder-image.png',
                    category: '',
                    rating: product.rating,
                    brand: product.brand,
                    inStock: true,
                  }}
                  className="card-premium hover-lift border-0 shadow-premium group-hover:shadow-premium-xl"
                />
              </div>

              {/* Bestseller Badge */}
              {index === 0 && (
                <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-[#8B5A3C] to-[#A67C52] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                  الأكثر مبيعاً
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <button className="group relative px-10 py-4 bg-gradient-to-r from-[#8B5A3C] to-[#A67C52] text-white rounded-full font-semibold shadow-2xl hover:shadow-[#8B5A3C]/25 transition-all duration-300 overflow-hidden">
            <span className="relative z-10 flex items-center gap-2">
              عرض جميع المنتجات
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#A67C52] to-[#8B5A3C] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>

      {/* Decorative Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" className="w-full h-16 fill-[#FAF8F5]">
          <path d="M0,60 C300,120 600,0 900,60 C1050,90 1150,30 1200,60 L1200,120 L0,120 Z" />
        </svg>
      </div>
    </section>
  );
};

export default CustomerFavoritesSection;