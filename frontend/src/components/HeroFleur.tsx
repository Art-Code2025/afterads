import React from 'react';
import { ArrowRight, Sparkles, Star } from 'lucide-react';

const HeroFleur: React.FC = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-700 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-dark-500/30 to-dark-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-48 h-48 bg-gradient-to-br from-dark-300/20 to-dark-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-br from-dark-400/25 to-dark-300/25 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-dark-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
          {/* Left Content (Text) */}
          <div className="space-y-8 text-center lg:text-right order-2 lg:order-1">

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="font-english text-6xl md:text-7xl lg:text-8xl font-bold leading-tight">
                <span className="block bg-gradient-to-r from-dark-200 via-dark-100 to-dark-200 bg-clip-text text-transparent">
                  THE ART
                </span>
                <span className="block bg-gradient-to-r from-dark-300 via-dark-200 to-dark-300 bg-clip-text text-transparent">
                  OF SCENT
                </span>
              </h1>
            </div>

            {/* Description */}
            {/* Mobile-short text */}
            <p className="sm:hidden text-dark-300 text-base leading-relaxed max-w-md mx-auto lg:mx-0">
              روائح فاخرة تحكي قصة الأناقة والجمال.
            </p>
            {/* Full text for ≥sm */}
            <p className="hidden sm:block text-dark-300 text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
              اكتشف عالماً من الروائح الفاخرة والعطور المميزة التي تحكي قصة الأناقة والجمال. 
              تجربة عطرية لا تُنسى تأخذك إلى عوالم من السحر والإبداع.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="group relative px-8 py-4 bg-gradient-to-r from-dark-500 to-dark-400 text-dark-50 rounded-full font-semibold shadow-2xl hover:shadow-dark-500/25 transition-all duration-300 overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  استكشف مجموعاتنا
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-dark-400 to-dark-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>

      
          </div>

          {/* Right Visual (Main Image) */}
          <div className="relative order-1 lg:order-2">
            {/* Main Product Image */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-dark-500/20 to-dark-400/20 rounded-3xl blur-3xl group-hover:blur-2xl transition-all duration-500"></div>
              
              <div className="relative bg-dark-900/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-dark-500/50 group-hover:shadow-dark-500/20 transition-all duration-500">
                <img
                  src="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80"
                  alt="luxury perfume"
                  className="w-full h-96 object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-dark-200 to-dark-300 rounded-full animate-bounce"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-br from-dark-500 to-dark-400 rounded-full animate-bounce delay-1000"></div>
                <div className="absolute top-1/2 -right-6 w-4 h-4 bg-gradient-to-br from-dark-400 to-dark-500 rounded-full animate-bounce delay-2000"></div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-8 -left-8 w-16 h-16 border-2 border-dark-500/50 rounded-full animate-spin-slow"></div>
            <div className="absolute -bottom-8 -right-8 w-12 h-12 border-2 border-dark-400/50 rounded-full animate-spin-slow delay-1000"></div>
            
            {/* Floating Cards */}
            <div className="absolute top-8 -left-8 bg-dark-800/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-dark-500/50 animate-float">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-dark-300 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-dark-200">متوفر الآن</span>
              </div>
            </div>
            
            <div className="absolute bottom-8 -right-8 bg-dark-800/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-dark-500/50 animate-float delay-1000">
              <div className="flex items-center gap-3">
                <Star className="w-4 h-4 text-dark-200 fill-dark-200" />
                <span className="text-sm font-medium text-dark-300">تقييم 4.9</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" className="w-full h-20 fill-dark-900">
          <path d="M0,60 C300,120 600,0 900,60 C1050,90 1150,30 1200,60 L1200,120 L0,120 Z" />
        </svg>
      </div>
    </section>
  );
};

export default HeroFleur;