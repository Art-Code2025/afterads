import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, Star, Crown, Sparkles, Droplets, Wind, Flower, Leaf, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';

// Sample perfume products data
const samplePerfumes = [
  {
    id: '1',
    name: 'زيكو العود الملكي',
    price: 299.99,
    originalPrice: 399.99,
    image: '/api/placeholder/300/400',
    category: 'رجالي',
    rating: 4.8,
    reviewCount: 124,
    inStock: true,
    isNew: true,
    isLuxury: true,
    brand: 'زيكو',
    scentFamily: 'شرقي',
    fragranceNotes: {
      top: ['العود', 'الورد', 'البرغموت'],
      middle: ['الياسمين', 'المسك'],
      base: ['الصندل', 'العنبر']
    },
    scentStrength: 'intense' as const,
    size: '100ml',
    concentration: 'Parfum',
    longevity: '8-12 ساعة',
    sillage: 'قوي',
    seasonRecommendation: ['شتاء', 'خريف'],
    occasionRecommendation: ['مناسبات رسمية', 'سهرات']
  },
  {
    id: '2',
    name: 'زيكو روز الذهبي',
    price: 249.99,
    originalPrice: 329.99,
    image: '/api/placeholder/300/400',
    category: 'نسائي',
    rating: 4.9,
    reviewCount: 89,
    inStock: true,
    isLuxury: true,
    brand: 'زيكو',
    scentFamily: 'زهري',
    fragranceNotes: {
      top: ['الورد البلغاري', 'الليتشي'],
      middle: ['الياسمين', 'الفاوانيا'],
      base: ['المسك الأبيض', 'الأرز']
    },
    scentStrength: 'medium' as const,
    size: '50ml',
    concentration: 'EDP',
    longevity: '6-8 ساعات',
    sillage: 'متوسط',
    seasonRecommendation: ['ربيع', 'صيف'],
    occasionRecommendation: ['يومي', 'رومانسي']
  },
  {
    id: '3',
    name: 'زيكو أكوا فريش',
    price: 179.99,
    image: '/api/placeholder/300/400',
    category: 'مشترك',
    rating: 4.6,
    reviewCount: 156,
    inStock: true,
    isNew: true,
    brand: 'زيكو',
    scentFamily: 'منعش',
    fragranceNotes: {
      top: ['الليمون', 'النعناع', 'الجريب فروت'],
      middle: ['الخزامى', 'إكليل الجبل'],
      base: ['الأرز الأبيض', 'المسك']
    },
    scentStrength: 'light' as const,
    size: '75ml',
    concentration: 'EDT',
    longevity: '4-6 ساعات',
    sillage: 'خفيف',
    seasonRecommendation: ['صيف', 'ربيع'],
    occasionRecommendation: ['يومي', 'رياضي']
  },
  {
    id: '4',
    name: 'زيكو عنبر الليل',
    price: 349.99,
    image: '/api/placeholder/300/400',
    category: 'مسائي',
    rating: 4.7,
    reviewCount: 78,
    inStock: true,
    isLuxury: true,
    brand: 'زيكو',
    scentFamily: 'شرقي',
    fragranceNotes: {
      top: ['البرغموت الأسود', 'الهيل'],
      middle: ['العنبر', 'اللبان'],
      base: ['الصندل', 'الباتشولي']
    },
    scentStrength: 'strong' as const,
    size: '100ml',
    concentration: 'Parfum',
    longevity: '10+ ساعات',
    sillage: 'قوي جداً',
    seasonRecommendation: ['شتاء', 'خريف'],
    occasionRecommendation: ['مسائي', 'مناسبات خاصة']
  },
  {
    id: '5',
    name: 'زيكو فانيليا الحرير',
    price: 199.99,
    originalPrice: 249.99,
    image: '/api/placeholder/300/400',
    category: 'نسائي',
    rating: 4.5,
    reviewCount: 92,
    inStock: true,
    brand: 'زيكو',
    scentFamily: 'حلو',
    fragranceNotes: {
      top: ['الكمثرى', 'الفريزيا'],
      middle: ['الفانيليا', 'الكراميل'],
      base: ['المسك', 'خشب الصندل']
    },
    scentStrength: 'medium' as const,
    size: '50ml',
    concentration: 'EDP',
    longevity: '6-8 ساعات',
    sillage: 'متوسط',
    seasonRecommendation: ['شتاء', 'خريف'],
    occasionRecommendation: ['يومي', 'مريح']
  },
  {
    id: '6',
    name: 'زيكو سيترس برست',
    price: 159.99,
    image: '/api/placeholder/300/400',
    category: 'مشترك',
    rating: 4.4,
    reviewCount: 134,
    inStock: true,
    brand: 'زيكو',
    scentFamily: 'حمضي',
    fragranceNotes: {
      top: ['البرتقال', 'الليمون الأخضر', 'الجريب فروت'],
      middle: ['النعناع', 'الريحان'],
      base: ['الأرز', 'المسك الأبيض']
    },
    scentStrength: 'light' as const,
    size: '75ml',
    concentration: 'EDT',
    longevity: '4-6 ساعات',
    sillage: 'خفيف',
    seasonRecommendation: ['صيف', 'ربيع'],
    occasionRecommendation: ['يومي', 'رياضي']
  },
  {
    id: '7',
    name: 'زيكو مسك الأميرة',
    price: 279.99,
    image: '/api/placeholder/300/400',
    category: 'نسائي',
    rating: 4.8,
    reviewCount: 67,
    inStock: true,
    isLuxury: true,
    brand: 'زيكو',
    scentFamily: 'شرقي',
    fragranceNotes: {
      top: ['الورد الدمشقي', 'الزعفران'],
      middle: ['المسك', 'العود الهندي'],
      base: ['العنبر الرمادي', 'خشب الصندل']
    },
    scentStrength: 'intense' as const,
    size: '50ml',
    concentration: 'Parfum',
    longevity: '12+ ساعة',
    sillage: 'قوي جداً',
    seasonRecommendation: ['شتاء', 'خريف'],
    occasionRecommendation: ['مناسبات رسمية', 'أعراس']
  },
  {
    id: '8',
    name: 'زيكو وود إلجانس',
    price: 229.99,
    image: '/api/placeholder/300/400',
    category: 'رجالي',
    rating: 4.6,
    reviewCount: 98,
    inStock: true,
    brand: 'زيكو',
    scentFamily: 'خشبي',
    fragranceNotes: {
      top: ['البرغموت', 'الفلفل الوردي'],
      middle: ['خشب الأرز', 'الباتشولي'],
      base: ['الفيتيفر', 'المسك']
    },
    scentStrength: 'medium' as const,
    size: '100ml',
    concentration: 'EDP',
    longevity: '8-10 ساعات',
    sillage: 'متوسط إلى قوي',
    seasonRecommendation: ['خريف', 'شتاء'],
    occasionRecommendation: ['عمل', 'كاجوال']
  }
];

const categories = ['الكل', 'رجالي', 'نسائي', 'مشترك', 'مسائي'];
const scentFamilies = ['الكل', 'شرقي', 'زهري', 'منعش', 'حمضي', 'حلو', 'خشبي'];
const concentrations = ['الكل', 'Parfum', 'EDP', 'EDT'];
const priceRanges = [
  { label: 'الكل', min: 0, max: Infinity },
  { label: 'أقل من 200 ر.س', min: 0, max: 200 },
  { label: '200 - 300 ر.س', min: 200, max: 300 },
  { label: 'أكثر من 300 ر.س', min: 300, max: Infinity }
];

const Products: React.FC = () => {
  const [products, setProducts] = useState(samplePerfumes);
  const [filteredProducts, setFilteredProducts] = useState(samplePerfumes);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [selectedScentFamily, setSelectedScentFamily] = useState('الكل');
  const [selectedConcentration, setSelectedConcentration] = useState('الكل');
  const [selectedPriceRange, setSelectedPriceRange] = useState(priceRanges[0]);
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let filtered = products;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.scentFamily?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.fragranceNotes?.top?.some(note => note.toLowerCase().includes(searchQuery.toLowerCase())) ||
        product.fragranceNotes?.middle?.some(note => note.toLowerCase().includes(searchQuery.toLowerCase())) ||
        product.fragranceNotes?.base?.some(note => note.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'الكل') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by scent family
    if (selectedScentFamily !== 'الكل') {
      filtered = filtered.filter(product => product.scentFamily === selectedScentFamily);
    }

    // Filter by concentration
    if (selectedConcentration !== 'الكل') {
      filtered = filtered.filter(product => product.concentration === selectedConcentration);
    }

    // Filter by price range
    filtered = filtered.filter(product => 
      product.price >= selectedPriceRange.min && product.price <= selectedPriceRange.max
    );

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return a.isNew ? -1 : 1;
        default:
          return a.name.localeCompare(b.name, 'ar');
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory, selectedScentFamily, selectedConcentration, selectedPriceRange, sortBy]);

  const getScentFamilyIcon = (family: string) => {
    const iconMap: { [key: string]: JSX.Element } = {
      'زهري': <Flower className="w-4 h-4 text-pink-500" />,
      'شرقي': <Crown className="w-4 h-4 text-zico-gold" />,
      'حمضي': <Leaf className="w-4 h-4 text-green-500" />,
      'خشبي': <Wind className="w-4 h-4 text-amber-600" />,
      'منعش': <Droplets className="w-4 h-4 text-blue-500" />,
      'حلو': <Sparkles className="w-4 h-4 text-purple-500" />
    };
    
    return iconMap[family] || <Sparkles className="w-4 h-4 text-zico-primary" />;
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('الكل');
    setSelectedScentFamily('الكل');
    setSelectedConcentration('الكل');
    setSelectedPriceRange(priceRanges[0]);
    setSortBy('name');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zico-cream to-beige-50 pt-20">
      
      {/* Hero Section */}
      <section className="py-12 lg:py-16 bg-gradient-to-r from-zico-primary to-zico-secondary">
        <div className="container-responsive">
          <div className="text-center text-white">
            <h1 className="text-4xl lg:text-6xl font-bold luxury-heading mb-4">
              مجموعة عطور زيكو
            </h1>
            <p className="text-lg lg:text-xl text-beige-100 max-w-2xl mx-auto">
              اكتشف عالماً من العطور الفاخرة المصممة خصيصاً لتعكس شخصيتك المميزة
            </p>
          </div>
        </div>
      </section>

      <div className="container-responsive py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Filters Sidebar */}
          <aside className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-3xl shadow-zico-lg p-6 sticky top-24">
              
              {/* Filters Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-zico-primary" />
                  الفلاتر
                </h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-zico-primary hover:text-zico-secondary font-medium"
                >
                  مسح الكل
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">البحث</label>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ابحث عن العطر المفضل..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-10 pl-4 py-3 border border-beige-300 rounded-xl focus:outline-none focus:border-zico-primary focus:ring-2 focus:ring-zico-primary/20 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">الفئة</label>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-right px-4 py-2 rounded-xl transition-all duration-300 ${
                        selectedCategory === category
                          ? 'bg-zico-primary text-white'
                          : 'text-gray-700 hover:bg-beige-100'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scent Family Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">عائلة العطر</label>
                <div className="space-y-2">
                  {scentFamilies.map((family) => (
                    <button
                      key={family}
                      onClick={() => setSelectedScentFamily(family)}
                      className={`w-full text-right px-4 py-2 rounded-xl transition-all duration-300 flex items-center justify-between ${
                        selectedScentFamily === family
                          ? 'bg-zico-primary text-white'
                          : 'text-gray-700 hover:bg-beige-100'
                      }`}
                    >
                      <span>{family}</span>
                      {family !== 'الكل' && getScentFamilyIcon(family)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Concentration Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">التركيز</label>
                <div className="space-y-2">
                  {concentrations.map((concentration) => (
                    <button
                      key={concentration}
                      onClick={() => setSelectedConcentration(concentration)}
                      className={`w-full text-right px-4 py-2 rounded-xl transition-all duration-300 ${
                        selectedConcentration === concentration
                          ? 'bg-zico-primary text-white'
                          : 'text-gray-700 hover:bg-beige-100'
                      }`}
                    >
                      {concentration}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">السعر</label>
                <div className="space-y-2">
                  {priceRanges.map((range) => (
                    <button
                      key={range.label}
                      onClick={() => setSelectedPriceRange(range)}
                      className={`w-full text-right px-4 py-2 rounded-xl transition-all duration-300 ${
                        selectedPriceRange.label === range.label
                          ? 'bg-zico-primary text-white'
                          : 'text-gray-700 hover:bg-beige-100'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            
            {/* Toolbar */}
            <div className="bg-white rounded-3xl shadow-zico p-6 mb-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                
                {/* Results Count & Mobile Filter Button */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden btn-zico-outline px-4 py-2 text-sm"
                  >
                    <Filter className="w-4 h-4 ml-2" />
                    الفلاتر
                  </button>
                  <p className="text-gray-600">
                    <span className="font-bold text-zico-primary">{filteredProducts.length}</span> منتج
                  </p>
                </div>

                {/* Sort & View Options */}
                <div className="flex items-center gap-4">
                  
                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-beige-300 rounded-xl focus:outline-none focus:border-zico-primary transition-all duration-300"
                  >
                    <option value="name">ترتيب أبجدي</option>
                    <option value="price-low">السعر: من الأقل للأعلى</option>
                    <option value="price-high">السعر: من الأعلى للأقل</option>
                    <option value="rating">التقييم</option>
                    <option value="newest">الأحدث</option>
                  </select>

                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-beige-100 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        viewMode === 'grid' 
                          ? 'bg-white text-zico-primary shadow-md' 
                          : 'text-gray-500 hover:text-zico-primary'
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        viewMode === 'list' 
                          ? 'bg-white text-zico-primary shadow-md' 
                          : 'text-gray-500 hover:text-zico-primary'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {filteredProducts.length > 0 ? (
              <div className={`${
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                  : 'space-y-6'
              }`}>
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    className={viewMode === 'list' ? 'flex flex-row max-w-none' : ''}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-beige-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-beige-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">لا توجد نتائج</h3>
                <p className="text-gray-600 mb-6">
                  لم نجد أي عطور تطابق معايير البحث المحددة
                </p>
                <button
                  onClick={clearFilters}
                  className="btn-zico"
                >
                  مسح جميع الفلاتر
                </button>
              </div>
            )}

            {/* Load More Button (for pagination) */}
            {filteredProducts.length > 0 && (
              <div className="text-center mt-12">
                <button className="btn-zico-outline px-8 py-3">
                  عرض المزيد من المنتجات
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products; 