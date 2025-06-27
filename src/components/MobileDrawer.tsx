
import React from 'react';
import { X, Home, ShoppingBag, User, ShoppingCart, Heart, BookOpen, Phone, Info, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  cartItemCount: number;
  categories: string[];
  onNavigate: (path: string) => void;
  onHelp: () => void;
}

const MobileDrawer = ({ isOpen, onClose, user, cartItemCount, categories, onNavigate, onHelp }: MobileDrawerProps) => {
  if (!isOpen) return null;

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: ShoppingBag, label: 'Shop', path: '/shop' },
    { icon: BookOpen, label: 'Blog', path: '/blog' },
    { icon: Info, label: 'About Us', path: '/about-us' },
    { icon: Phone, label: 'Contact Us', path: '/contact-us' },
  ];

  const userItems = user ? [
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Heart, label: 'Wishlist', path: '/wishlist' },
  ] : [];

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed left-0 top-0 bottom-0 w-4/5 max-w-sm bg-white shadow-2xl transform transition-transform">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-black">HealthCareWorld</h2>
            <p className="text-sm text-gray-600">Your Health, Our Priority</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Cart Summary */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <button
            onClick={() => onNavigate('/cart')}
            className="flex items-center justify-between w-full p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#27AE60]/10 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-[#27AE60]" />
              </div>
              <span className="font-medium text-black">Shopping Cart</span>
            </div>
            {cartItemCount > 0 && (
              <Badge className="bg-[#27AE60] text-white">
                {cartItemCount}
              </Badge>
            )}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
              Navigation
            </h3>
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => onNavigate(item.path)}
                    className="flex items-center gap-3 w-full p-3 text-left text-gray-700 hover:bg-gray-50 hover:text-[#27AE60] rounded-lg transition-colors"
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Categories */}
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
              Categories
            </h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => onNavigate('/shop')}
                  className="block w-full text-left p-2 text-sm text-gray-600 hover:text-[#27AE60] hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* User Section */}
          {user && (
            <div className="p-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Account
              </h3>
              <nav className="space-y-2">
                {userItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => onNavigate(item.path)}
                      className="flex items-center gap-3 w-full p-3 text-left text-gray-700 hover:bg-gray-50 hover:text-[#27AE60] rounded-lg transition-colors"
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          {!user ? (
            <Button
              onClick={() => onNavigate('/auth')}
              className="w-full bg-[#27AE60] hover:bg-[#27AE60]/90 text-white"
            >
              Sign In
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-8 h-8 bg-[#27AE60] rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="truncate">{user.email}</span>
              </div>
            </div>
          )}
          
          <button
            onClick={onHelp}
            className="flex items-center gap-2 w-full mt-3 p-2 text-sm text-gray-600 hover:text-[#27AE60] transition-colors"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Help & Support</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileDrawer;
