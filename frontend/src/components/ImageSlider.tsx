import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Pause, Sparkles, Star, Crown, Droplets } from 'lucide-react';
// تأكد أن مسار ملف الـ CSS هذا صحيح، وأنه لا يحتوي على ستايلات تتعارض مع أسهم السلايدر
// import '../styles/mobile-slider.css'; 

interface Slide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  description: string;
  cta: string;
  link: string;
  perfumeType?: string;
  scentFamily?: string;
  luxury?: boolean;
}

interface ImageSliderProps {
  slides?: Slide[];
  autoPlay?: boolean;
  interval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  className?: string;
}

const defaultSlides: Slide[] = [
  {
    id: 1,
    image: '/api/placeholder/1200/600',
    title: 'زيكو العود الملكي',
    subtitle: 'عطر فاخر للرجال',
    description: 'تجربة عطرية استثنائية تجمع بين أرقى أنواع العود والمسك الأبيض',
    cta: 'اكتشف المجموعة',
    link: '/category/mens-luxury',
    perfumeType: 'عود',
    scentFamily: 'شرقي',
    luxury: true
  },
  { 
    id: 2,
    image: '/api/placeholder/1200/600',
    title: 'زيكو روز الذهبي',
    subtitle: 'عطر نسائي راقي',
    description: 'مزيج ساحر من الورد البلغاري والياسمين مع لمسات من الفانيليا',
    cta: 'تسوق الآن',
    link: '/category/womens-floral',
    perfumeType: 'زهري',
    scentFamily: 'زهري',
    luxury: true
  },
  {
    id: 3,
    image: '/api/placeholder/1200/600',
    title: 'زيكو أكوا فريش',
    subtitle: 'عطر منعش للجنسين',
    description: 'نفحات منعشة من الحمضيات والنعناع مع قاعدة خشبية دافئة',
    cta: 'جرب العطر',
    link: '/category/unisex-fresh',
    perfumeType: 'منعش',
    scentFamily: 'حمضي',
    luxury: false
  },
  {
    id: 4,
    image: '/api/placeholder/1200/600',
    title: 'زيكو عنبر الليل',
    subtitle: 'عطر مسائي فاخر',
    description: 'عطر غامض وجذاب بنفحات العنبر والصندل للمناسبات الخاصة',
    cta: 'احجز الآن',
    link: '/category/evening-luxury',
    perfumeType: 'عنبر',
    scentFamily: 'شرقي',
    luxury: true
  }
];

const ImageSlider: React.FC<ImageSliderProps> = ({
  slides = defaultSlides,
  autoPlay = true,
  interval = 5000,
  showDots = true,
  showArrows = true,
  className = ''
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (isPlaying && !isHovered) {
      const timer = setInterval(nextSlide, interval);
      return () => clearInterval(timer);
    }
  }, [isPlaying, isHovered, nextSlide, interval]);

  const currentSlideData = slides[currentSlide];

  return (
    <div 
      className={`relative w-full h-[400px] sm:h-[500px] lg:h-[600px] xl:h-[700px] overflow-hidden rounded-3xl shadow-zico-xl group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-zico-dark via-zico-primary to-zico-secondary opacity-90 z-10"></div>
      
      {/* Slides Container */}
      <div 
        className="flex transition-transform duration-700 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="relative w-full h-full flex-shrink-0 bg-gradient-to-br from-beige-100 to-beige-200"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 border border-zico-primary rounded-full"></div>
              <div className="absolute top-20 right-20 w-24 h-24 border border-zico-secondary rounded-full"></div>
              <div className="absolute bottom-20 left-20 w-40 h-40 border border-beige-500 rounded-full"></div>
              <div className="absolute bottom-10 right-10 w-20 h-20 border border-zico-accent rounded-full"></div>
            </div>

            {/* Perfume Bottle Illustration */}
            <div className="absolute right-8 lg:right-16 top-1/2 transform -translate-y-1/2 z-20">
              <div className="relative">
                {/* Bottle Shape */}
                <div className="w-32 h-48 lg:w-40 lg:h-60 bg-gradient-to-b from-transparent via-white/20 to-zico-primary/30 rounded-t-full rounded-b-lg border-2 border-white/30 backdrop-blur-sm">
                  {/* Bottle Cap */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-8 bg-gradient-to-b from-zico-gold to-yellow-600 rounded-t-lg border border-yellow-400"></div>
                  
                  {/* Perfume Liquid */}
                  <div className="absolute bottom-0 left-2 right-2 h-3/4 bg-gradient-to-t from-zico-primary to-zico-secondary rounded-b-lg opacity-80"></div>
                  
                  {/* Sparkle Effects */}
                  <div className="absolute top-1/4 left-1/4 animate-pulse">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="absolute top-1/2 right-1/4 animate-pulse delay-300">
                    <Star className="w-3 h-3 text-zico-gold" />
                  </div>
                  <div className="absolute bottom-1/3 left-1/3 animate-pulse delay-700">
                    <Droplets className="w-3 h-3 text-white" />
                  </div>
                </div>

                {/* Mist Effect */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                  <div className="w-20 h-16 bg-gradient-to-t from-white/40 to-transparent rounded-full animate-pulse opacity-60"></div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="relative z-30 h-full flex items-center">
              <div className="container mx-auto px-6 lg:px-12">
                <div className="max-w-2xl">
                  {/* Luxury Badge */}
                  {slide.luxury && (
                    <div className="flex items-center gap-2 mb-4 animate-fade-in-up">
                      <Crown className="w-5 h-5 text-zico-gold" />
                      <span className="luxury-badge">مجموعة فاخرة</span>
                    </div>
                  )}

                  {/* Perfume Type & Scent Family */}
                  <div className="flex items-center gap-4 mb-4 animate-fade-in-up delay-100">
                    <span className="fragrance-note">{slide.perfumeType}</span>
                    <span className="fragrance-note">{slide.scentFamily}</span>
                  </div>

                  {/* Title */}
                  <h1 className="text-4xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 luxury-heading animate-fade-in-up delay-200">
                    {slide.title}
                  </h1>

                  {/* Subtitle */}
                  <h2 className="text-xl lg:text-2xl xl:text-3xl font-medium text-beige-100 mb-6 animate-fade-in-up delay-300">
                    {slide.subtitle}
                  </h2>

                  {/* Description */}
                  <p className="text-base lg:text-lg text-beige-200 mb-8 leading-relaxed max-w-lg animate-fade-in-up delay-400">
                    {slide.description}
                  </p>

                  {/* CTA Button */}
                  <div className="animate-fade-in-up delay-500">
                    <a
                      href={slide.link}
                      className="inline-flex items-center gap-3 bg-gradient-to-r from-zico-gold to-yellow-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:from-yellow-500 hover:to-zico-gold"
                    >
                      <Sparkles className="w-5 h-5" />
                      {slide.cta}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {showArrows && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 lg:left-8 top-1/2 transform -translate-y-1/2 z-40 w-12 h-12 lg:w-16 lg:h-16 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 group-hover:scale-110"
            aria-label="الشريحة السابقة"
          >
            <ChevronRight className="w-6 h-6 lg:w-8 lg:h-8" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 lg:right-8 top-1/2 transform -translate-y-1/2 z-40 w-12 h-12 lg:w-16 lg:h-16 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 group-hover:scale-110"
            aria-label="الشريحة التالية"
          >
            <ChevronLeft className="w-6 h-6 lg:w-8 lg:h-8" />
          </button>
        </>
      )}

      {/* Play/Pause Button */}
      <button
        onClick={togglePlayPause}
        className="absolute top-4 lg:top-8 right-4 lg:right-8 z-40 w-10 h-10 lg:w-12 lg:h-12 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
        aria-label={isPlaying ? 'إيقاف التشغيل التلقائي' : 'تشغيل التلقائي'}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 lg:w-5 lg:h-5" />
        ) : (
          <Play className="w-4 h-4 lg:w-5 lg:h-5" />
        )}
      </button>

      {/* Dots Indicator */}
      {showDots && (
        <div className="absolute bottom-6 lg:bottom-8 left-1/2 transform -translate-x-1/2 z-40 flex space-x-3 rtl:space-x-reverse">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 lg:w-4 lg:h-4 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-zico-gold shadow-lg scale-125'
                  : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`انتقل إلى الشريحة ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-40">
        <div 
          className="h-full bg-gradient-to-r from-zico-gold to-yellow-500 transition-all duration-300"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-float opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;