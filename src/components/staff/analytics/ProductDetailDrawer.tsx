
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, DollarSign, ShoppingCart, Star, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProductDetailDrawerProps {
  productId: string | null;
  productName: string;
  onClose: () => void;
}

export const ProductDetailDrawer = ({ productId, productName, onClose }: ProductDetailDrawerProps) => {
  const { data: productDetails, isLoading } = useQuery({
    queryKey: ['product-details', productId],
    queryFn: async () => {
      if (!productId) return null;

      const [productRes, reviewsRes, ordersRes, cartRes] = await Promise.all([
        supabase.from('products').select('*').eq('id', productId).single(),
        supabase.from('product_reviews').select('*').eq('product_id', productId).order('created_at', { ascending: false }).limit(5),
        supabase.from('order_items').select('quantity, total_price, created_at, orders!inner(status)').eq('product_id', productId),
        supabase.from('cart_items').select('quantity').eq('product_id', productId)
      ]);

      const product = productRes.data;
      if (!product) return null;

      const reviews = reviewsRes.data || [];
      const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
      
      const allOrders = ordersRes.data || [];
      const totalRevenue = allOrders.reduce((sum, item) => sum + (item.total_price || 0), 0);
      const pendingOrdersCount = allOrders.filter(item => item.orders.status === 'pending').length;
      
      const cartItems = cartRes.data || [];
      const inCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

      // Generate sales trend data (last 30 days)
      const salesTrend = [];
      const stockTrend = [];
      const today = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dailySales = allOrders
          .filter(item => item.created_at.startsWith(dateStr) && item.orders.status === 'confirmed')
          .reduce((sum, item) => sum + item.quantity, 0);
        
        salesTrend.push({
          date: dateStr,
          sales: dailySales,
          formattedDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        });

        // Mock stock trend (in real app, you'd have historical stock data)
        stockTrend.push({
          date: dateStr,
          stock: Math.max(0, product.stock + Math.floor(Math.random() * 20) - 10),
          formattedDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        });
      }

      return {
        product,
        reviews,
        avgRating,
        totalRevenue,
        pendingOrdersCount,
        inCartCount,
        salesTrend,
        stockTrend
      };
    },
    enabled: !!productId
  });

  if (!productId) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex justify-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
          className="bg-white h-full w-full max-w-2xl shadow-2xl overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981]"></div>
            </div>
          ) : productDetails ? (
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{productName}</h2>
                    <p className="text-gray-600">{productDetails.product.category}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close product details"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Package className="h-5 w-5 text-[#10B981]" />
                        <div>
                          <p className="text-sm text-gray-600">Stock Level</p>
                          <p className="text-xl font-bold">{productDetails.product.stock}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-5 w-5 text-[#10B981]" />
                        <div>
                          <p className="text-sm text-gray-600">Stock Value</p>
                          <p className="text-xl font-bold">₹{(productDetails.product.stock * productDetails.product.price).toLocaleString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-[#10B981]" />
                        <div>
                          <p className="text-sm text-gray-600">Total Revenue</p>
                          <p className="text-xl font-bold">₹{productDetails.totalRevenue.toLocaleString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <ShoppingCart className="h-5 w-5 text-[#10B981]" />
                        <div>
                          <p className="text-sm text-gray-600">Pending Orders</p>
                          <p className="text-xl font-bold">{productDetails.pendingOrdersCount}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Package className="h-5 w-5 text-[#10B981]" />
                        <div>
                          <p className="text-sm text-gray-600">In Cart</p>
                          <p className="text-xl font-bold">{productDetails.inCartCount}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="text-sm text-gray-600">Avg Rating</p>
                          <p className="text-xl font-bold">{productDetails.avgRating.toFixed(1)}★ ({productDetails.reviews.length})</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Sales Trend (30 days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={productDetails.salesTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="formattedDate" 
                            fontSize={12}
                            tick={{ fill: '#666' }}
                          />
                          <YAxis fontSize={12} tick={{ fill: '#666' }} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#fff', 
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="sales" 
                            stroke="#10B981" 
                            strokeWidth={2}
                            dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Stock Trend (30 days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={productDetails.stockTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="formattedDate" 
                            fontSize={12}
                            tick={{ fill: '#666' }}
                          />
                          <YAxis fontSize={12} tick={{ fill: '#666' }} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#fff', 
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px'
                            }}
                          />
                          <Bar dataKey="stock" fill="#10B981" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Recent Reviews */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {productDetails.reviews.length > 0 ? (
                      <div className="space-y-4 max-h-80 overflow-y-auto">
                        {productDetails.reviews.map((review, index) => (
                          <div key={review.id} className="border-b pb-4 last:border-b-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">{review.reviewer_name}</span>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating
                                          ? 'text-yellow-400 fill-current'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            {review.comment && (
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {review.comment}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No reviews yet</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Product not found</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
