
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ReturningCustomersDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const ReturningCustomersDrawer = ({ open, onClose }: ReturningCustomersDrawerProps) => {
  const { data: returningCustomers, isLoading } = useQuery({
    queryKey: ['returning-customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          user_id,
          profiles!inner(full_name, email)
        `)
        .eq('status', 'confirmed');

      if (error) throw error;

      // Group by user and count orders
      const userOrderCounts = data.reduce((acc: any, order: any) => {
        const userId = order.user_id;
        if (!acc[userId]) {
          acc[userId] = {
            userId,
            name: order.profiles?.full_name || 'Unknown User',
            email: order.profiles?.email || 'No email',
            orderCount: 0
          };
        }
        acc[userId].orderCount++;
        return acc;
      }, {});

      // Filter only returning customers (more than 1 order)
      return Object.values(userOrderCounts)
        .filter((customer: any) => customer.orderCount > 1)
        .sort((a: any, b: any) => b.orderCount - a.orderCount);
    },
    enabled: open
  });

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 bg-white shadow-2xl z-50 w-96 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-[#10B981] text-white">
              <h2 className="text-xl font-bold">Returning Customers</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="hover:bg-white/20 text-white rounded-full p-2"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto h-full">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B981]"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {returningCustomers?.map((customer: any, index: number) => (
                    <motion.div
                      key={customer.userId}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-[#10B981] rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {customer.name}
                          </h3>
                          
                          <div className="flex items-center space-x-1 mt-1">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <p className="text-sm text-gray-500 truncate">
                              {customer.email}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-1 mt-2">
                            <ShoppingBag className="h-4 w-4 text-[#10B981]" />
                            <span className="text-sm font-medium text-[#10B981]">
                              {customer.orderCount} orders
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {returningCustomers?.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No returning customers found
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
