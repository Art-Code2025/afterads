import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X, LogOut } from 'lucide-react';
import AuthModal from './AuthModal';
import { toast } from 'react-toastify';

const FleurNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

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

    // Load user data
    const loadUser = () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('user');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('cartUpdated', updateCounts);
    window.addEventListener('wishlistUpdated', updateCounts);
    
    updateCounts();
    loadUser();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('cartUpdated', updateCounts);
      window.removeEventListener('wishlistUpdated', updateCounts);
    };
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isUserMenuOpen && !(event.target as Element).closest('.relative')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  const handleLoginSuccess = (userData: any) => {
    // Add name field for compatibility
    const userWithName = {
      ...userData,
      name: userData.firstName ? `${userData.firstName} ${userData.lastName || ''}`.trim() : userData.email
    };
    setUser(userWithName);
    localStorage.setItem('user', JSON.stringify(userWithName));
    setIsAuthModalOpen(false);
    toast.success(`مرحباً ${userWithName.name}! تم تسجيل الدخول بنجاح`);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setIsUserMenuOpen(false);
    toast.success('تم تسجيل الخروج بنجاح');
    navigate('/');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-dark-800/95 backdrop-blur-xl shadow-xl border-b border-dark-600/30' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Left Icons */}
          <div className="flex items-center gap-6">
            <button className="group relative p-3 rounded-full hover:bg-dark-400/20 transition-all duration-300">
              <Search className="w-5 h-5 text-dark-300 group-hover:text-dark-100 transition-colors" />
              <div className="absolute inset-0 bg-gradient-to-r from-dark-400/20 to-dark-500/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
            </button>
            
            <Link to="/wishlist" className="group relative p-3 rounded-full hover:bg-dark-400/20 transition-all duration-300">
              <Heart className="w-5 h-5 text-dark-300 group-hover:text-dark-100 transition-colors" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-dark-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold animate-pulse">
                  {wishlistCount}
                </span>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-dark-400/20 to-dark-500/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
            </Link>

            <Link to="/cart" className="group relative p-3 rounded-full hover:bg-dark-400/20 transition-all duration-300">
              <ShoppingCart className="w-5 h-5 text-dark-300 group-hover:text-dark-100 transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-dark-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold animate-pulse">
                  {cartCount}
                </span>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-dark-400/20 to-dark-500/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
            </Link>

            <div className="relative">
              <button 
                onClick={() => user ? setIsUserMenuOpen(!isUserMenuOpen) : setIsAuthModalOpen(true)}
                className="group relative p-3 rounded-full hover:bg-dark-400/20 transition-all duration-300"
              >
                <User className="w-5 h-5 text-dark-300 group-hover:text-dark-100 transition-colors" />
                <div className="absolute inset-0 bg-gradient-to-r from-dark-400/20 to-dark-500/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
              </button>
              
              {/* User Menu Dropdown */}
              {user && isUserMenuOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-dark-800 rounded-lg shadow-lg border border-dark-600/30 z-50">
                  <div className="p-3 border-b border-dark-600/20">
                    <p className="text-sm font-medium text-dark-100">{user.name}</p>
                    <p className="text-xs text-dark-300">{user.email}</p>
                  </div>
                  <div className="p-2">
                    <Link 
                      to="/dashboard" 
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-dark-200 hover:bg-dark-700/50 rounded-md transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      الملف الشخصي
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-dark-700/50 rounded-md transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      تسجيل الخروج
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center Navigation - Desktop */}
          <div className="hidden md:flex items-center gap-12">
            <Link to="/" className="group relative py-2 text-dark-300 hover:text-dark-100 transition-colors duration-300 font-medium">
              الرئيسية
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-dark-400 to-dark-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link to="/products" className="group relative py-2 text-dark-300 hover:text-dark-100 transition-colors duration-300 font-medium">
              المنتجات
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-dark-400 to-dark-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link to="/categories" className="group relative py-2 text-dark-300 hover:text-dark-100 transition-colors duration-300 font-medium">
              التصنيفات
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-dark-400 to-dark-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link to="/about" className="group relative py-2 text-dark-300 hover:text-dark-100 transition-colors duration-300 font-medium">
              من نحن
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-dark-400 to-dark-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </div>

          {/* Right Brand */}
          <div className="flex items-center">
            <Link to="/" className="group">
              <h1 className="font-english text-3xl font-bold bg-gradient-to-r from-dark-400 via-dark-300 to-dark-400 bg-clip-text text-transparent group-hover:from-dark-500 group-hover:via-dark-400 group-hover:to-dark-500 transition-all duration-500">
                FLEUR
              </h1>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-3 rounded-full hover:bg-dark-400/20 transition-all duration-300"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-dark-300" />
            ) : (
              <Menu className="w-6 h-6 text-dark-300" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
            <div className="absolute left-0 top-0 h-full w-3/4 max-w-xs bg-dark-800 shadow-xl p-5 overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xl font-bold text-dark-100">FLEUR</span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-dark-700/50 text-dark-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <Link 
                  to="/" 
                  className="block py-2 px-3 rounded-md text-dark-300 hover:bg-dark-700/50 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  الرئيسية
                </Link>
                <Link 
                  to="/products" 
                  className="block py-2 px-3 rounded-md text-dark-300 hover:bg-dark-700/50 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  المنتجات
                </Link>
                <Link 
                  to="/categories" 
                  className="block py-2 px-3 rounded-md text-dark-300 hover:bg-dark-700/50 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  التصنيفات
                </Link>
                <Link 
                  to="/about" 
                  className="block py-2 px-3 rounded-md text-dark-300 hover:bg-dark-700/50 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  من نحن
                </Link>
                
                {!user ? (
                  <div className="pt-4 mt-4 border-t border-dark-600/20">
                    <Link 
                      to="/login" 
                      className="block w-full py-2 px-3 bg-gradient-to-r from-dark-500 to-dark-400 text-dark-50 rounded-md text-center font-medium shadow-sm hover:from-dark-600 hover:to-dark-500 transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      تسجيل الدخول
                    </Link>
                    <Link 
                      to="/register" 
                      className="block w-full mt-3 py-2 px-3 border border-dark-500 text-dark-300 rounded-md text-center font-medium hover:bg-dark-700/50 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      إنشاء حساب
                    </Link>
                  </div>
                ) : (
                  <div className="pt-4 mt-4 border-t border-dark-600/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-dark-700/50 flex items-center justify-center text-dark-300">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-dark-200">{user.name}</p>
                        <p className="text-xs text-dark-400">{user.email}</p>
                      </div>
                    </div>
                    
                    <Link 
                      to="/dashboard" 
                      className="flex items-center gap-2 py-2 px-3 rounded-md text-dark-300 hover:bg-dark-700/50 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      الملف الشخصي
                    </Link>
                    
                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 w-full mt-2 py-2 px-3 text-left rounded-md text-red-400 hover:bg-dark-700/50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      تسجيل الخروج
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </nav>
  );
};

export default FleurNavbar;