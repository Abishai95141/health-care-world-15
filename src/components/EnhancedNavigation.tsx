
import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Search, Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/useCart';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileDrawer from '@/components/MobileDrawer';

const EnhancedNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { totalItems } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [cartPulse, setCartPulse] = useState(false);
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  // Track scroll position for navbar animation
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Pulse cart when items change
  useEffect(() => {
    if (totalItems > 0) {
      setCartPulse(true);
      const timer = setTimeout(() => setCartPulse(false), 600);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = (e.target as HTMLFormElement).search.value;
    if (query) {
      navigate('/shop');
    }
  };

  const isProfilePage = location.pathname === '/profile';
  const categories = ['Prescription', 'OTC & Wellness', 'Vitamins & Supplements', 'Medical Devices'];

  return (
    <>
      <header className={`
        fixed top-0 w-full z-50 transition-all duration-300 ease-out
        ${isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg h-14' 
          : 'bg-white border-b border-gray-100 h-16'
        }
      `}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className={`
            flex justify-between items-center transition-all duration-300
            ${isScrolled ? 'h-14' : 'h-16'}
          `}>
            {/* Mobile Hamburger Menu */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileDrawerOpen(true)}
                className="p-3 text-black hover:text-gray-600 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-black/10 rounded-xl transition-all duration-200"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>

            {/* Logo with improved spacing */}
            <div className="flex items-center mr-8">
              <button
                onClick={() => navigate('/')}
                className={`
                  font-light text-black hover:text-gray-700 transition-all duration-200 tracking-tight
                  ${isScrolled ? 'text-xl' : 'text-2xl'}
                `}
              >
                HealthCareWorld
              </button>
            </div>

            {/* Desktop Navigation Links with improved spacing */}
            <nav className="hidden md:flex space-x-12 flex-1">
              {[
                { path: '/', label: 'Home' },
                { path: '/shop', label: 'Shop' },
                { path: '/about-us', label: 'About' },
                { path: '/contact-us', label: 'Contact' }
              ].map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`
                    relative px-3 py-2 text-sm font-medium transition-all duration-300
                    text-black/70 hover:text-black
                    after:content-[''] after:absolute after:w-full after:h-0.5 after:bg-black
                    after:left-0 after:bottom-0 after:scale-x-0 after:origin-left
                    after:transition-transform after:duration-300
                    hover:after:scale-x-100
                    ${location.pathname === item.path ? 'text-black after:scale-x-100' : ''}
                  `}
                >
                  {item.label}
                </button>
              ))}
              
              {/* Categories Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsCategoriesDropdownOpen(!isCategoriesDropdownOpen)}
                  className="relative flex items-center px-3 py-2 text-sm font-medium text-black/70 hover:text-black transition-all duration-300
                            after:content-[''] after:absolute after:w-full after:h-0.5 after:bg-black
                            after:left-0 after:bottom-0 after:scale-x-0 after:origin-left
                            after:transition-transform after:duration-300
                            hover:after:scale-x-100"
                >
                  Categories
                  <ChevronDown className={`ml-2 h-4 w-4 transition-transform duration-200 ${isCategoriesDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isCategoriesDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-10 animate-fade-in overflow-hidden">
                    {categories.map((category, index) => (
                      <button
                        key={category}
                        onClick={() => {
                          navigate('/shop');
                          setIsCategoriesDropdownOpen(false);
                        }}
                        className="block w-full text-left px-6 py-3 text-sm text-black/70 hover:bg-gray-50 hover:text-black transition-all duration-200 border-b border-gray-50 last:border-0"
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Search Bar - Desktop with improved styling */}
            <div className="hidden sm:flex flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
                <Input 
                  name="search"
                  placeholder="Search medicines, brands..." 
                  className={`
                    pl-12 pr-4 py-3 w-full bg-gray-50 border-0 rounded-full 
                    focus:ring-2 focus:ring-black/10 focus:bg-white
                    transition-all duration-300 ease-out text-sm
                    ${isSearchFocused ? 'scale-105 shadow-lg' : ''}
                  `}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black/40 h-5 w-5" />
              </form>
            </div>
            
            {/* Right side actions with improved spacing */}
            <div className="flex items-center space-x-4">
              {/* Cart */}
              <button
                onClick={() => navigate('/cart')}
                className={`
                  relative p-3 text-black hover:text-black/70 hover:scale-110
                  focus:outline-none focus:ring-2 focus:ring-black/10 rounded-xl 
                  transition-all duration-200
                  ${cartPulse ? 'animate-pulse' : ''}
                `}
              >
                <ShoppingCart className="h-6 w-6" />
                {totalItems > 0 && (
                  <span className={`
                    absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 
                    flex items-center justify-center transition-all duration-200 font-medium
                    ${cartPulse ? 'animate-bounce scale-125' : ''}
                  `}>
                    {totalItems}
                  </span>
                )}
              </button>

              {/* User menu */}
              {user ? (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => navigate('/profile')}
                    className="p-3 text-black hover:text-black/70 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-black/10 rounded-xl transition-all duration-200"
                  >
                    <User className="h-6 w-6" />
                  </button>
                  {isProfilePage && (
                    <button
                      onClick={() => navigate('/')}
                      className="p-3 text-black hover:text-red-600 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500/20 rounded-xl transition-all duration-200"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  )}
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    size="sm"
                    className="hover:scale-105 hover:bg-gray-50 border-gray-200 transition-all duration-200 hidden sm:block px-6 py-2 rounded-full"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => navigate('/auth')}
                  className="bg-black hover:bg-gray-800 hover:scale-105 transition-all duration-200 hidden sm:block px-6 py-2 rounded-full"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar - Updated styling */}
        <div className="sm:hidden border-t border-gray-100 p-4 bg-white z-40 relative">
          <form onSubmit={handleSearch} className="relative">
            <Input 
              name="search"
              placeholder="Search medicines, brands..." 
              className="pl-12 pr-4 py-3 w-full bg-gray-50 border-0 rounded-full focus:ring-2 focus:ring-black/10 focus:bg-white"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black/40 h-5 w-5" />
          </form>
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileDrawer 
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        user={user}
        cartItemCount={totalItems}
        categories={categories}
        onNavigate={(path) => {
          navigate(path);
          setIsMobileDrawerOpen(false);
        }}
        onHelp={() => {
          setIsMobileDrawerOpen(false);
        }}
      />
    </>
  );
};

export default EnhancedNavigation;
