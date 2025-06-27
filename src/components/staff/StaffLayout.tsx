
import React, { useState } from 'react';
import { useStaffAuth } from '@/contexts/StaffAuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Plus, 
  Upload, 
  Package, 
  AlertTriangle,
  ShoppingCart,
  LogOut,
  Menu,
  X,
  User,
  Building2,
  FileText,
  Truck,
  Megaphone,
  BarChart3,
  MessageCircle,
  BookOpen
} from 'lucide-react';

interface StaffLayoutProps {
  children: React.ReactNode;
}

const StaffLayout = ({ children }: StaffLayoutProps) => {
  const { user, signOut } = useStaffAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut();
    navigate('/staff/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/staff/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', href: '/staff/analytics', icon: BarChart3 },
    { name: 'Data Assistant', href: '/staff/assistant', icon: MessageCircle },
    { name: 'Add New Product', href: '/staff/products/new', icon: Plus },
    { name: 'Bulk Import (CSV)', href: '/staff/products/import', icon: Upload },
    { name: 'Manage Products', href: '/staff/products', icon: Package },
    { name: 'Inventory Alerts', href: '/staff/inventory', icon: AlertTriangle },
    { name: 'Banner Management', href: '/staff/banners', icon: Building2 },
    { name: 'Advertisements', href: '/staff/advertisements', icon: Megaphone },
    { name: 'Blog Management', href: '/staff/blog', icon: BookOpen },
    { name: 'Order Management', href: '/staff/orders', icon: ShoppingCart },
    { name: 'Purchase Orders', href: '/staff/purchase-orders', icon: Truck },
  ];

  const currentPath = location.pathname;

  const NavigationItems = ({ onItemClick }: { onItemClick?: () => void }) => (
    <ul className="space-y-2">
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = currentPath === item.href || currentPath.startsWith(item.href + '/');
        
        return (
          <li key={item.name}>
            <Link
              to={item.href}
              onClick={onItemClick}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-200 min-h-[48px] group ${
                isActive
                  ? 'bg-[#27AE60] text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-[#27AE60]'
              }`}
            >
              <Icon className={`w-5 h-5 mr-3 flex-shrink-0 transition-transform duration-200 ${
                isActive ? 'scale-110' : 'group-hover:scale-110'
              }`} />
              <span>{item.name}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white shadow-sm border-b relative z-50">
        <div className="px-4 sm:px-6 py-4 flex justify-between items-center">
          {/* Left side - Logo and hamburger */}
          <div className="flex items-center space-x-4">
            {/* Mobile hamburger menu */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-gray-600 hover:text-[#27AE60] hover:bg-gray-100 rounded-xl transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#27AE60] rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-semibold text-[#27AE60]">HealthCareWorld</h1>
                <span className="text-sm text-gray-600 hidden sm:block">Staff Portal</span>
              </div>
            </div>
          </div>

          {/* Right side - User info and logout */}
          <div className="flex items-center space-x-4">
            {/* User info */}
            <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-2xl">
              <div className="w-8 h-8 bg-[#27AE60] rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs text-gray-600 hidden sm:block">Welcome,</span>
                <span className="text-sm text-gray-800 truncate max-w-[120px] sm:max-w-none font-medium">
                  {user?.email}
                </span>
              </div>
            </div>
            
            {/* Logout button */}
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="text-gray-600 hover:text-red-600 hover:border-red-300 border-gray-300 rounded-xl min-h-[44px] px-4 transition-all duration-200"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Log Out</span>
            </Button>
          </div>
        </div>
        
        {/* Mobile subtitle */}
        <div className="px-4 pb-3 sm:hidden">
          <span className="text-sm text-gray-600">Staff Portal</span>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Drawer */}
          <div className="fixed left-0 top-0 bottom-0 w-4/5 max-w-sm bg-white shadow-2xl">
            {/* Drawer header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#27AE60] rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center transition-all duration-200"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Navigation items */}
            <div className="p-6">
              <NavigationItems onItemClick={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <nav className="hidden md:block w-72 bg-white shadow-sm min-h-screen border-r">
          <div className="p-6">
            <NavigationItems />
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 w-full md:w-auto">
          <div className="p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
