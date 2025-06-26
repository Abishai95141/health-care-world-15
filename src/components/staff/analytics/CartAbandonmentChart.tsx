
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const CartAbandonmentChart = () => {
  const { data: abandonmentData, isLoading } = useQuery({
    queryKey: ['cart-abandonment'],
    queryFn: async () => {
      const [cartRes, orderRes] = await Promise.all([
        supabase.from('cart_items').select('created_at, user_id'),
        supabase.from('orders').select('created_at, user_id').eq('status', 'confirmed')
      ]);

      // Group by date for the last 30 days
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const chartData = last30Days.map(date => {
        const cartItems = cartRes.data?.filter(item => 
          item.created_at.startsWith(date)
        ).length || 0;
        
        const orders = orderRes.data?.filter(order => 
          order.created_at.startsWith(date)
        ).length || 0;

        const abandonmentRate = cartItems > 0 ? ((cartItems - orders) / cartItems) * 100 : 0;

        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          cartItems,
          orders,
          abandonmentRate: Math.max(0, abandonmentRate)
        };
      });

      const totalCarts = cartRes.data?.length || 0;
      const totalOrders = orderRes.data?.length || 0;
      const overallAbandonmentRate = totalCarts > 0 ? ((totalCarts - totalOrders) / totalCarts) * 100 : 0;

      return { chartData, overallAbandonmentRate };
    }
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-blue-600">Cart Items: {data.cartItems}</p>
          <p className="text-green-600">Orders: {data.orders}</p>
          <p className="text-red-600">Abandonment: {data.abandonmentRate.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
            <ShoppingCart className="h-6 w-6 text-[#10B981]" />
            Cart Abandonment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981]"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
            <ShoppingCart className="h-6 w-6 text-[#10B981]" />
            Cart Abandonment Analysis
            <span className="ml-auto text-sm font-normal text-red-600">
              {abandonmentData?.overallAbandonmentRate.toFixed(1)}% overall abandonment
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={abandonmentData?.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="cartItems" fill="#3B82F6" name="Cart Items" />
              <Bar dataKey="orders" fill="#10B981" name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};
