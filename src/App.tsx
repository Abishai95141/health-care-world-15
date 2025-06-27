
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { StaffAuthProvider } from "@/contexts/StaffAuthContext";
import { BannerProvider } from "@/contexts/BannerContext";
import { AppProvider } from "@/contexts/AppContext";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import AccountSettings from "./pages/AccountSettings";
import CartPage from "./components/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmation from "./pages/OrderConfirmation";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import Wishlist from "./pages/Wishlist";
import NotFound from "./pages/NotFound";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";

// Staff pages
import StaffLogin from "./pages/staff/StaffLogin";
import StaffDashboard from "./pages/staff/StaffDashboard";
import ManageProducts from "./pages/staff/ManageProducts";
import AddProduct from "./pages/staff/AddProduct";
import EditProduct from "./pages/staff/EditProduct";
import ManageOrders from "./pages/staff/ManageOrders";
import Analytics from "./pages/staff/Analytics";
import BulkImport from "./pages/staff/BulkImport";
import InventoryAlerts from "./pages/staff/InventoryAlerts";
import ManagePurchaseOrders from "./pages/staff/ManagePurchaseOrders";
import NewPurchaseOrder from "./pages/staff/NewPurchaseOrder";
import AdvertisementManagement from "./pages/staff/AdvertisementManagement";
import BannerManagement from "./pages/staff/BannerManagement";
import DataAssistant from "./pages/staff/DataAssistant";
import BlogManagement from "./pages/staff/BlogManagement";

import ProtectedRoute from "./components/ProtectedRoute";
import StaffProtectedRoute from "./components/staff/StaffProtectedRoute";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <AuthProvider>
            <StaffAuthProvider>
              <BannerProvider>
                <Toaster />
                <div className="min-h-screen w-full">
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Index />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/product/:slug" element={<ProductDetail />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/about" element={<AboutUs />} />
                    <Route path="/contact" element={<ContactUs />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<BlogPost />} />
                    
                    {/* Protected routes */}
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/account" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                    <Route path="/order-confirmation" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
                    <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                    
                    {/* Staff routes */}
                    <Route path="/staff/login" element={<StaffLogin />} />
                    <Route path="/staff/dashboard" element={<StaffProtectedRoute><StaffDashboard /></StaffProtectedRoute>} />
                    <Route path="/staff/products" element={<StaffProtectedRoute><ManageProducts /></StaffProtectedRoute>} />
                    <Route path="/staff/products/add" element={<StaffProtectedRoute><AddProduct /></StaffProtectedRoute>} />
                    <Route path="/staff/products/edit/:id" element={<StaffProtectedRoute><EditProduct /></StaffProtectedRoute>} />
                    <Route path="/staff/orders" element={<StaffProtectedRoute><ManageOrders /></StaffProtectedRoute>} />
                    <Route path="/staff/analytics" element={<StaffProtectedRoute><Analytics /></StaffProtectedRoute>} />
                    <Route path="/staff/bulk-import" element={<StaffProtectedRoute><BulkImport /></StaffProtectedRoute>} />
                    <Route path="/staff/inventory-alerts" element={<StaffProtectedRoute><InventoryAlerts /></StaffProtectedRoute>} />
                    <Route path="/staff/purchase-orders" element={<StaffProtectedRoute><ManagePurchaseOrders /></StaffProtectedRoute>} />
                    <Route path="/staff/purchase-orders/new" element={<StaffProtectedRoute><NewPurchaseOrder /></StaffProtectedRoute>} />
                    <Route path="/staff/advertisements" element={<StaffProtectedRoute><AdvertisementManagement /></StaffProtectedRoute>} />
                    <Route path="/staff/banners" element={<StaffProtectedRoute><BannerManagement /></StaffProtectedRoute>} />
                    <Route path="/staff/data-assistant" element={<StaffProtectedRoute><DataAssistant /></StaffProtectedRoute>} />
                    <Route path="/staff/blog" element={<StaffProtectedRoute><BlogManagement /></StaffProtectedRoute>} />
                    
                    {/* 404 route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </BannerProvider>
            </StaffAuthProvider>
          </AuthProvider>
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
