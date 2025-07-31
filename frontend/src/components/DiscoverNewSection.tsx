import React from 'react';
import { ArrowRight, Sparkles, Eye, Calendar } from 'lucide-react';

const DiscoverNewSection: React.FC = () => {
  return (
    <section className="relative py-24 bg-gradient-to-br from-[#FAF8F5] via-white to-[#FAF8F5] overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-16 left-12 w-36 h-36 bg-gradient-to-br from-[#C4A484]/20 to-[#D4B896]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-gradient-to-br from-[#E5D5C8]/15 to-[#C4A484]/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-gradient-to-br from-[#D4B896]/20 to-[#E5D5C8]/20 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-[#C4A484] to-[#D4B896] rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Image */}
          <div className="order-2 lg:order-1 relative group">
            {/* Main Image Container */}
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#C4A484]/20 to-[#D4B896]/20 rounded-3xl blur-2xl group-hover:blur-xl transition-all duration-500"></div>
              
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-[#C4A484]/50 group-hover:shadow-[#C4A484]/20 transition-all duration-500">
                <img
                  src="https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=900&q=80"
                  alt="model"
                  className="w-full h-[500px] object-cover rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-[#D4AF37] to-[#E5D5C8] rounded-full animate-bounce shadow-lg"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-br from-[#C4A484] to-[#D4B896] rounded-full animate-bounce delay-1000 shadow-lg"></div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-8 -left-8 w-16 h-16 border-2 border-[#C4A484]/50 rounded-full animate-spin-slow"></div>
            <div className="absolute -bottom-8 -right-8 w-12 h-12 border-2 border-[#D4B896]/50 rounded-full animate-spin-slow delay-1000"></div>
            
            {/* Floating Info Cards */}
            <div className="absolute top-8 -right-8 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-[#C4A484]/50 animate-float">
              <div className="flex items-center gap-3">
                <Eye className="w-4 h-4 text-[#8B5A3C]" />
                <span className="text-sm font-medium text-[#6B4226]">مشاهدة حصرية</span>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="order-1 lg:order-2 space-y-8 text-center lg:text-right">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-[#C4A484]/50">
              <Sparkles className="w-4 h-4 text-[#8B5A3C]" />
              <span className="text-sm font-medium text-[#6B4226]">مجموعة حصرية</span>
              <Calendar className="w-4 h-4 text-[#A67C52]" />
            </div>

            {/* Main Heading */}
            <div className="space-y-6">
              <h2 className="font-english text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="block bg-gradient-to-r from-[#8B5A3C] via-[#A67C52] to-[#C4A484] bg-clip-text text-transparent">
                  DISCOVER
                </span>
                <span className="block mt-2 bg-gradient-to-r from-[#6B4226] via-[#8B5A3C] to-[#6B4226] bg-clip-text text-transparent">
                  NEW
                </span>
              </h2>
              
              {/* Decorative Line */}
              <div className="flex justify-center lg:justify-start">
                <div className="w-24 h-1 bg-gradient-to-r from-[#C4A484] to-[#D4B896] rounded-full"></div>
              </div>
            </div>

            {/* Product Showcase */}
            <div className="relative group max-w-xs mx-auto lg:mx-0">
              <div className="absolute inset-0 bg-gradient-to-br from-[#C4A484]/20 to-[#D4B896]/20 rounded-2xl blur-xl group-hover:blur-lg transition-all duration-500"></div>
              
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-[#C4A484]/50">
                <img
                  src="https://images.unsplash.com/photo-1589561084283-930aa7b1f1da?auto=format&fit=crop&w=300&q=60"
                  alt="air collection"
                  className="w-full h-64 object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Product Badge */}
                <div className="absolute top-3 right-3 bg-gradient-to-r from-[#8B5A3C] to-[#A67C52] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  جديد
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <p className="text-[#8B5A3C] text-lg leading-relaxed max-w-lg mx-auto lg:mx-0">
                عطرنا الجديد يأسر جوهر الربيع المتفتح بنفحات هوائية ناعمة وذكريات تدوم إلى الأبد. 
                تجربة عطرية استثنائية تنقلك إلى عالم من الأحلام والجمال.
              </p>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                <span className="bg-[#F5F1EB] text-[#8B5A3C] px-3 py-1 rounded-full text-sm font-medium">نفحات زهرية</span>
                <span className="bg-[#E5D5C8] text-[#6B4226] px-3 py-1 rounded-full text-sm font-medium">رائحة منعشة</span>
                <span className="bg-[#C4A484]/20 text-[#8B5A3C] px-3 py-1 rounded-full text-sm font-medium">ثبات طويل</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="group relative px-8 py-4 bg-gradient-to-r from-[#8B5A3C] to-[#A67C52] text-white rounded-full font-semibold shadow-2xl hover:shadow-[#8B5A3C]/25 transition-all duration-300 overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  تفاصيل أكثر
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#A67C52] to-[#8B5A3C] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              
              <button className="group px-8 py-4 bg-white/80 backdrop-blur-sm text-[#8B5A3C] rounded-full font-semibold border border-[#C4A484] hover:bg-white hover:shadow-xl transition-all duration-300">
                <span className="flex items-center gap-2">
                  إضافة للسلة
                  <div className="w-8 h-8 bg-gradient-to-r from-[#C4A484] to-[#D4B896] rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
                  </div>
                </span>
              </button>
            </div>

            {/* Stats */}
            <div className="flex justify-center lg:justify-start gap-8 pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-[#8B5A3C] to-[#A67C52] bg-clip-text text-transparent">NEW</div>
                <div className="text-sm text-[#A67C52]">إصدار حديث</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-[#A67C52] to-[#C4A484] bg-clip-text text-transparent">100%</div>
                <div className="text-sm text-[#A67C52]">طبيعي</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-[#C4A484] to-[#D4B896] bg-clip-text text-transparent">24H</div>
                <div className="text-sm text-[#A67C52]">ثبات</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Decorative Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" className="w-full h-16 fill-white">
          <path d="M0,60 C300,0 600,120 900,60 C1050,30 1150,90 1200,60 L1200,120 L0,120 Z" />
        </svg>
      </div>
    </section>
  );
};

export default DiscoverNewSection; 