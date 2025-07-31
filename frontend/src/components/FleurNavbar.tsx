import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X } from 'lucide-react';

const FleurNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const updateCounts = () => {
      const cart = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setCartCount(Array.isArray(cart) ? cart.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) : 0);
      setWishlistCount(Array.isArray(wishlist) ? wishlist.length : 0);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('cartUpdated', updateCounts);
    window.addEventListener('wishlistUpdated', updateCounts);
    
    updateCounts();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('cartUpdated', updateCounts);
      window.removeEventListener('wishlistUpdated', updateCounts);
    };
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-[#F5F1EB]/95 backdrop-blur-xl shadow-xl border-b border-[#C4A484]/30' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Left Icons */}
          <div className="flex items-center gap-6">
            <button className="group relative p-3 rounded-full hover:bg-[#C4A484]/20 transition-all duration-300">
              <Search className="w-5 h-5 text-[#8B5A3C] group-hover:text-[#6B4226] transition-colors" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#C4A484]/20 to-[#D4B896]/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
            </button>
            
            <Link to="/wishlist" className="group relative p-3 rounded-full hover:bg-[#C4A484]/20 transition-all duration-300">
              <Heart className="w-5 h-5 text-[#8B5A3C] group-hover:text-[#6B4226] transition-colors" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#8B5A3C] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold animate-pulse">
                  {wishlistCount}
                </span>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-[#C4A484]/20 to-[#D4B896]/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
            </Link>

            <Link to="/cart" className="group relative p-3 rounded-full hover:bg-[#C4A484]/20 transition-all duration-300">
              <ShoppingCart className="w-5 h-5 text-[#8B5A3C] group-hover:text-[#6B4226] transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#8B5A3C] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold animate-pulse">
                  {cartCount}
                </span>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-[#C4A484]/20 to-[#D4B896]/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
            </Link>

            <button className="group relative p-3 rounded-full hover:bg-[#C4A484]/20 transition-all duration-300">
              <User className="w-5 h-5 text-[#8B5A3C] group-hover:text-[#6B4226] transition-colors" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#C4A484]/20 to-[#D4B896]/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
            </button>
          </div>

          {/* Center Navigation - Desktop */}
          <div className="hidden md:flex items-center gap-12">
            <Link to="/" className="group relative py-2 text-[#8B5A3C] hover:text-[#6B4226] transition-colors duration-300 font-medium">
              الرئيسية
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#C4A484] to-[#D4B896] group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link to="/products" className="group relative py-2 text-[#8B5A3C] hover:text-[#6B4226] transition-colors duration-300 font-medium">
              المنتجات
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#C4A484] to-[#D4B896] group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link to="/categories" className="group relative py-2 text-[#8B5A3C] hover:text-[#6B4226] transition-colors duration-300 font-medium">
              التصنيفات
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#C4A484] to-[#D4B896] group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link to="/about" className="group relative py-2 text-[#8B5A3C] hover:text-[#6B4226] transition-colors duration-300 font-medium">
              من نحن
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#C4A484] to-[#D4B896] group-hover:w-full transition-all duration-300"></span>
            </Link>
          </div>

          {/* Right Brand */}
          <div className="flex items-center">
            <Link to="/" className="group">
              <h1 className="font-english text-3xl font-bold bg-gradient-to-r from-[#8B5A3C] via-[#A67C52] to-[#8B5A3C] bg-clip-text text-transparent group-hover:from-[#6B4226] group-hover:via-[#8B5A3C] group-hover:to-[#6B4226] transition-all duration-500">
                FLEUR
              </h1>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-3 rounded-full hover:bg-[#C4A484]/20 transition-all duration-300"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-[#8B5A3C]" />
            ) : (
              <Menu className="w-6 h-6 text-[#8B5A3C]" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-500 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="py-6 space-y-4 bg-[#F5F1EB]/95 backdrop-blur-xl rounded-2xl mt-4 shadow-2xl border border-[#C4A484]/30">
            <Link 
              to="/" 
              className="block px-6 py-3 text-[#8B5A3C] hover:text-[#6B4226] hover:bg-[#C4A484]/10 transition-all duration-300 rounded-lg mx-4"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              الرئيسية
            </Link>
            <Link 
              to="/products" 
              className="block px-6 py-3 text-[#8B5A3C] hover:text-[#6B4226] hover:bg-[#C4A484]/10 transition-all duration-300 rounded-lg mx-4"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              المنتجات
            </Link>
            <Link 
              to="/categories" 
              className="block px-6 py-3 text-[#8B5A3C] hover:text-[#6B4226] hover:bg-[#C4A484]/10 transition-all duration-300 rounded-lg mx-4"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              التصنيفات
            </Link>
            <Link 
              to="/about" 
              className="block px-6 py-3 text-[#8B5A3C] hover:text-[#6B4226] hover:bg-[#C4A484]/10 transition-all duration-300 rounded-lg mx-4"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              من نحن
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default FleurNavbar; 