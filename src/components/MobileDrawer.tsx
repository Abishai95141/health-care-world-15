
import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, ShoppingCart, User, HelpCircle, Home, Store, Tag, Info, Phone } from 'lucide-react';
import { Drawer, DrawerContent } from '@/components/ui/drawer';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  cartItemCount: number;
  categories: string[];
  onNavigate: (path: string) => void;
  onHelp: () => void;
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  user,
  cartItemCount,
  categories,
  onNavigate,
  onHelp
}) => {
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Store, label: 'Shop', path: '/shop' },
    { icon: Info, label: 'About Us', path: '/about-us' },
    { icon: Phone, label: 'Contact Us', path: '/contact-us' },
  ];

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="h-[85vh]">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold text-black">HealthCareWorld</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <nav className="space-y-2">
              {/* Main Menu Items */}
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => onNavigate(item.path)}
                  className="flex items-center w-full p-3 text-left hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <item.icon className="h-5 w-5 mr-3 text-gray-600" />
                  <span className="text-gray-900">{item.label}</span>
                </button>
              ))}

              {/* Categories Dropdown */}
              <div>
                <button
                  onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
                  className="flex items-center justify-between w-full p-3 text-left hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <Tag className="h-5 w-5 mr-3 text-gray-600" />
                    <span className="text-gray-900">Categories</span>
                  </div>
                  {isCategoriesExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-600" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  )}
                </button>
                
                {isCategoriesExpanded && (
                  <div className="ml-8 mt-2 space-y-1">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => onNavigate('/shop')}
                        className="block w-full text-left p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 my-4"></div>

              {/* User Actions */}
              <button
                onClick={() => onNavigate('/cart')}
                className="flex items-center justify-between w-full p-3 text-left hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-3 text-gray-600" />
                  <span className="text-gray-900">Cart</span>
                </div>
                {cartItemCount > 0 && (
                  <span className="bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => onNavigate(user ? '/profile' : '/auth')}
                className="flex items-center w-full p-3 text-left hover:bg-gray-100 rounded-lg transition-colors"
              >
                <User className="h-5 w-5 mr-3 text-gray-600" />
                <span className="text-gray-900">
                  {user ? 'Profile' : 'Sign In / Sign Up'}
                </span>
              </button>

              <button
                onClick={onHelp}
                className="flex items-center w-full p-3 text-left hover:bg-gray-100 rounded-lg transition-colors"
              >
                <HelpCircle className="h-5 w-5 mr-3 text-gray-600" />
                <span className="text-gray-900">Help & Support</span>
              </button>

              {/* Browse without signing in */}
              {!user && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800 mb-2">
                    You can browse our store without signing in!
                  </p>
                  <button
                    onClick={() => onNavigate('/shop')}
                    className="text-sm text-green-600 hover:text-green-700 underline"
                  >
                    View Store
                  </button>
                </div>
              )}

              {/* User info */}
              {user && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Signed in as:
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {user.email}
                  </p>
                </div>
              )}
            </nav>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileDrawer;
