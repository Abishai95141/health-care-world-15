
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SalesDetailPanelProps {
  date: string;
  onClose: () => void;
}

export const SalesDetailPanel = ({ date, onClose }: SalesDetailPanelProps) => {
  const { data: dayDetails, isLoading } = useQuery({
    queryKey: ['sales-detail', date],
    queryFn: async () => {
      // Convert date string to proper date format for query
      const queryDate = new Date(date).toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          created_at,
          order_items(quantity, unit_price, products(name))
        `)
        .eq('status', 'confirmed')
        .gte('created_at', `${queryDate}T00:00:00`)
        .lt('created_at', `${queryDate}T23:59:59`);

      if (error) throw error;

      const totalRevenue = data.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const totalOrders = data.length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      // Get top products for this day
      const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
      
      data.forEach(order => {
        order.order_items.forEach((item: any) => {
          const productName = item.products?.name || 'Unknown Product';
          if (!productSales[productName]) {
            productSales[productName] = { name: productName, quantity: 0, revenue: 0 };
          }
          productSales[productName].quantity += item.quantity;
          productSales[productName].revenue += item.unit_price * item.quantity;
        });
      });

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      return {
        date,
        totalRevenue,
        totalOrders,
        avgOrderValue,
        topProducts,
        orders: data
      };
    }
  });

  return (
    <AnimatePresence>
      {date && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="overflow-hidden"
        >
          <Card className="shadow-lg rounded-2xl border-l-4 border-l-[#10B981] mt-6">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-6 w-6 text-[#10B981]" />
                  <h3 className="text-xl font-bold text-gray-900">
                    Sales Details for {date}
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="hover:bg-gray-100 rounded-full p-2"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B981]"></div>
                </div>
              ) : dayDetails ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Summary Stats */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 text-lg">Daily Summary</h4>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl">
                        <DollarSign className="h-8 w-8 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-600">Total Revenue</p>
                          <p className="text-lg font-bold text-gray-900">
                            ₹{dayDetails.totalRevenue.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl">
                        <ShoppingCart className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">Total Orders</p>
                          <p className="text-lg font-bold text-gray-900">
                            {dayDetails.totalOrders}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-xl">
                        <TrendingUp className="h-8 w-8 text-purple-600" />
                        <div>
                          <p className="text-sm text-gray-600">Avg Order Value</p>
                          <p className="text-lg font-bold text-gray-900">
                            ₹{dayDetails.avgOrderValue.toFixed(0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top Products */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 text-lg">Top Products</h4>
                    
                    <div className="space-y-3">
                      {dayDetails.topProducts.map((product, index) => (
                        <motion.div
                          key={product.name}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {product.quantity} units sold
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-[#10B981] text-sm">
                              ₹{product.revenue.toLocaleString()}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                      
                      {dayDetails.topProducts.length === 0 && (
                        <p className="text-gray-500 text-center py-4">
                          No products sold on this day
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No data available for this date
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
