
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import { StaffAuthProvider } from "./contexts/StaffAuthContext";
import { BannerProvider } from "./contexts/BannerContext";
import ChatWidget from "./components/ChatWidget";
import ProtectedRoute from "./components/ProtectedRoute";
import StaffProtectedRoute from "./components/staff/StaffProtectedRoute";
import StaffLayout from "./components/staff/StaffLayout";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import CartPage from "./components/CartPage";
import CheckoutPage from "./components/CheckoutPage";
import OrderConfirmation from "./pages/OrderConfirmation";
import StaffLogin from "./pages/staff/StaffLogin";
import StaffDashboard from "./pages/staff/StaffDashboard";
import AddProduct from "./pages/staff/AddProduct";
import ManageProducts from "./pages/staff/ManageProducts";
import EditProduct from "./pages/staff/EditProduct";
import BulkImport from "./pages/staff/BulkImport";
import InventoryAlerts from "./pages/staff/InventoryAlerts";
import BannerManagement from "./pages/staff/BannerManagement";
import ManageOrders from "./pages/staff/ManageOrders";
import ManagePurchaseOrders from "./pages/staff/ManagePurchaseOrders";
import NewPurchaseOrder from "./pages/staff/NewPurchaseOrder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <StaffAuthProvider>
            <BannerProvider>
              <AppProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/products" element={<Shop />} />
                  <Route path="/product/:slug" element={<ProductDetail />} />
                  <Route path="/about-us" element={<AboutUs />} />
                  <Route path="/contact-us" element={<ContactUs />} />
                  <Route path="/login" element={<Auth />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile/wishlist" 
                    element={
                      <ProtectedRoute>
                        <Wishlist />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/cart" 
                    element={
                      <ProtectedRoute>
                        <CartPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/checkout" 
                    element={
                      <ProtectedRoute>
                        <CheckoutPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/order-confirmation" 
                    element={
                      <ProtectedRoute>
                        <OrderConfirmation />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/order-confirmation/:orderId" 
                    element={
                      <ProtectedRoute>
                        <OrderConfirmation />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Staff Routes */}
                  <Route path="/staff/login" element={<StaffLogin />} />
                  <Route 
                    path="/staff/dashboard" 
                    element={
                      <StaffProtectedRoute>
                        <StaffLayout>
                          <StaffDashboard />
                        </StaffLayout>
                      </StaffProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/staff/products/new" 
                    element={
                      <StaffProtectedRoute>
                        <StaffLayout>
                          <AddProduct />
                        </StaffLayout>
                      </StaffProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/staff/products" 
                    element={
                      <StaffProtectedRoute>
                        <StaffLayout>
                          <ManageProducts />
                        </StaffLayout>
                      </StaffProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/staff/products/edit/:id" 
                    element={
                      <StaffProtectedRoute>
                        <StaffLayout>
                          <EditProduct />
                        </StaffLayout>
                      </StaffProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/staff/products/import" 
                    element={
                      <StaffProtectedRoute>
                        <StaffLayout>
                          <BulkImport />
                        </StaffLayout>
                      </StaffProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/staff/inventory" 
                    element={
                      <StaffProtectedRoute>
                        <StaffLayout>
                          <InventoryAlerts />
                        </StaffLayout>
                      </StaffProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/staff/banners" 
                    element={
                      <StaffProtectedRoute>
                        <StaffLayout>
                          <BannerManagement />
                        </StaffLayout>
                      </StaffProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/staff/orders" 
                    element={
                      <StaffProtectedRoute>
                        <StaffLayout>
                          <ManageOrders />
                        </StaffLayout>
                      </StaffProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/staff/purchase-orders" 
                    element={
                      <StaffProtectedRoute>
                        <StaffLayout>
                          <ManagePurchaseOrders />
                        </StaffLayout>
                      </StaffProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/staff/purchase-orders/new" 
                    element={
                      <StaffProtectedRoute>
                        <StaffLayout>
                          <NewPurchaseOrder />
                        </StaffLayout>
                      </StaffProtectedRoute>
                    } 
                  />
                  
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <ChatWidget />
              </AppProvider>
            </BannerProvider>
          </StaffAuthProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
