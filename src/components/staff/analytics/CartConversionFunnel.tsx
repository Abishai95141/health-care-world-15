
import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const CartConversionFunnel = () => {
  const { data: funnelData, isLoading } = useQuery({
    queryKey: ['cart-conversion-funnel'],
    queryFn: async () => {
      // Get unique users at each stage
      const [cartRes, checkoutRes, paymentRes] = await Promise.all([
        supabase.from('cart_items').select('user_id'),
        supabase.from('orders').select('user_id').eq('status', 'pending'),
        supabase.from('orders').select('user_id').eq('payment_status', 'paid')
      ]);

      // Create sets to count unique users
      const cartUsers = new Set(cartRes.data?.map(item => item.user_id) || []);
      const checkoutUsers = new Set(checkoutRes.data?.map(item => item.user_id) || []);
      const paymentUsers = new Set(paymentRes.data?.map(item => item.user_id) || []);

      const cartCount = cartUsers.size;
      const checkoutCount = checkoutUsers.size;
      const paymentCount = paymentUsers.size;

      return [
        {
          stage: 'Cart',
          count: cartCount,
          percentage: 100,
          dropOff: 0
        },
        {
          stage: 'Checkout',
          count: checkoutCount,
          percentage: cartCount > 0 ? (checkoutCount / cartCount) * 100 : 0,
          dropOff: cartCount > 0 ? ((cartCount - checkoutCount) / cartCount) * 100 : 0
        },
        {
          stage: 'Payment',
          count: paymentCount,
          percentage: cartCount > 0 ? (paymentCount / cartCount) * 100 : 0,
          dropOff: checkoutCount > 0 ? ((checkoutCount - paymentCount) / checkoutCount) * 100 : 0
        }
      ];
    }
  });

  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {funnelData?.map((stage, index) => (
        <motion.div
          key={stage.stage}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: index * 0.2 }}
          className="group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-900">{stage.stage}</span>
            <div className="text-right">
              <span className="text-lg font-bold text-gray-900">{stage.count}</span>
              <span className="text-sm text-gray-500 ml-2">
                ({stage.percentage.toFixed(1)}%)
              </span>
            </div>
          </div>
          
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-8">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stage.percentage}%` }}
                transition={{ duration: 1, delay: index * 0.3 }}
                className={`h-8 rounded-full transition-all duration-200 ${
                  index === 0 ? 'bg-[#10B981]' : 
                  index === 1 ? 'bg-blue-500' : 'bg-purple-500'
                }`}
              />
            </div>
            
            {stage.dropOff > 0 && (
              <div className="absolute top-10 left-0 text-xs text-red-500">
                Drop-off: {stage.dropOff.toFixed(1)}%
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};
