
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AppProvider } from '@/contexts/AppContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { StaffAuthProvider } from '@/contexts/StaffAuthContext';
import { BannerProvider } from '@/contexts/BannerContext';
import Layout from '@/components/Layout';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Profile from '@/pages/Profile';
import Shop from '@/pages/Shop';
import ProductDetail from '@/pages/ProductDetail';
import CartPage from '@/components/CartPage';
import CheckoutPage from '@/pages/CheckoutPage';
import OrderConfirmation from '@/pages/OrderConfirmation';
import AboutUs from '@/pages/AboutUs';
import ContactUs from '@/pages/ContactUs';
import Wishlist from '@/pages/Wishlist';
import NotFound from '@/pages/NotFound';
import ProtectedRoute from '@/components/ProtectedRoute';
import StaffProtectedRoute from '@/components/staff/StaffProtectedRoute';
import StaffLayout from '@/components/staff/StaffLayout';
import StaffLogin from '@/pages/staff/StaffLogin';
import StaffDashboard from '@/pages/staff/StaffDashboard';
import Analytics from '@/pages/staff/Analytics';
import DataAssistantPage from '@/pages/staff/DataAssistant';
import AddProduct from '@/pages/staff/AddProduct';
import EditProduct from '@/pages/staff/EditProduct';
import ManageProducts from '@/pages/staff/ManageProducts';
import BulkImport from '@/pages/staff/BulkImport';
import InventoryAlerts from '@/pages/staff/InventoryAlerts';
import BannerManagement from '@/pages/staff/BannerManagement';
import AdvertisementManagement from '@/pages/staff/AdvertisementManagement';
import ManageOrders from '@/pages/staff/ManageOrders';
import ManagePurchaseOrders from '@/pages/staff/ManagePurchaseOrders';
import NewPurchaseOrder from '@/pages/staff/NewPurchaseOrder';
import AccountSettings from '@/pages/AccountSettings';
import ChatWidget from '@/components/ChatWidget';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StaffAuthProvider>
          <BannerProvider>
            <AppProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Layout><Index /></Layout>} />
                <Route path="/auth" element={<Layout><Auth /></Layout>} />
                <Route path="/shop" element={<Layout><Shop /></Layout>} />
                <Route path="/product/:slug" element={<Layout><ProductDetail /></Layout>} />
                <Route path="/about-us" element={<Layout><AboutUs /></Layout>} />
                <Route path="/contact-us" element={<Layout><ContactUs /></Layout>} />
                <Route path="/cart" element={<Layout><CartPage /></Layout>} />
                
                {/* Protected routes */}
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Layout><Profile /></Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/checkout" 
                  element={
                    <ProtectedRoute>
                      <Layout><CheckoutPage /></Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/order-confirmation" 
                  element={
                    <ProtectedRoute>
                      <Layout><OrderConfirmation /></Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/wishlist" 
                  element={
                    <ProtectedRoute>
                      <Layout><Wishlist /></Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/account-settings" 
                  element={
                    <ProtectedRoute>
                      <Layout><AccountSettings /></Layout>
                    </ProtectedRoute>
                  } 
                />

                {/* Staff routes */}
                <Route path="/staff/login" element={<StaffLogin />} />
                <Route 
                  path="/staff/dashboard" 
                  element={
                    <StaffProtectedRoute>
                      <StaffLayout><StaffDashboard /></StaffLayout>
                    </StaffProtectedRoute>
                  } 
                />
                <Route 
                  path="/staff/analytics" 
                  element={
                    <StaffProtectedRoute>
                      <StaffLayout><Analytics /></StaffLayout>
                    </StaffProtectedRoute>
                  } 
                />
                <Route 
                  path="/staff/assistant" 
                  element={
                    <StaffProtectedRoute>
                      <StaffLayout><DataAssistantPage /></StaffLayout>
                    </StaffProtectedRoute>
                  } 
                />
                <Route 
                  path="/staff/products/new" 
                  element={
                    <StaffProtectedRoute>
                      <StaffLayout><AddProduct /></StaffLayout>
                    </StaffProtectedRoute>
                  } 
                />
                <Route 
                  path="/staff/products/edit/:id" 
                  element={
                    <StaffProtectedRoute>
                      <StaffLayout><EditProduct /></StaffLayout>
                    </StaffProtectedRoute>
                  } 
                />
                <Route 
                  path="/staff/products" 
                  element={
                    <StaffProtectedRoute>
                      <StaffLayout><ManageProducts /></StaffLayout>
                    </StaffProtectedRoute>
                  } 
                />
                <Route 
                  path="/staff/products/import" 
                  element={
                    <StaffProtectedRoute>
                      <StaffLayout><BulkImport /></StaffLayout>
                    </StaffProtectedRoute>
                  } 
                />
                <Route 
                  path="/staff/inventory" 
                  element={
                    <StaffProtectedRoute>
                      <StaffLayout><InventoryAlerts /></StaffLayout>
                    </StaffProtectedRoute>
                  } 
                />
                <Route 
                  path="/staff/banners" 
                  element={
                    <StaffProtectedRoute>
                      <StaffLayout><BannerManagement /></StaffLayout>
                    </StaffProtectedRoute>
                  } 
                />
                <Route 
                  path="/staff/advertisements" 
                  element={
                    <StaffProtectedRoute>
                      <StaffLayout><AdvertisementManagement /></StaffLayout>
                    </StaffProtectedRoute>
                  } 
                />
                <Route 
                  path="/staff/orders" 
                  element={
                    <StaffProtectedRoute>
                      <StaffLayout><ManageOrders /></StaffLayout>
                    </StaffProtectedRoute>
                  } 
                />
                <Route 
                  path="/staff/purchase-orders" 
                  element={
                    <StaffProtectedRoute>
                      <StaffLayout><ManagePurchaseOrders /></StaffLayout>
                    </StaffProtectedRoute>
                  } 
                />
                <Route 
                  path="/staff/purchase-orders/new" 
                  element={
                    <StaffProtectedRoute>
                      <StaffLayout><NewPurchaseOrder /></StaffLayout>
                    </StaffProtectedRoute>
                  } 
                />

                {/* 404 */}
                <Route path="*" element={<Layout><NotFound /></Layout>} />
              </Routes>
              <ChatWidget />
              <Toaster />
            </AppProvider>
          </BannerProvider>
        </StaffAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
