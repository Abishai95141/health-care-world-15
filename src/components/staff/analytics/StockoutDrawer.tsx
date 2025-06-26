
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface StockoutDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const StockoutDrawer = ({ open, onClose }: StockoutDrawerProps) => {
  const { data: lowStockItems, isLoading } = useQuery({
    queryKey: ['low-stock-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, stock, category, price')
        .lte('stock', 10)
        .eq('is_active', true)
        .order('stock', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: open
  });

  const handleReorder = (productId: string, productName: string) => {
    console.log(`Reordering ${productName} (ID: ${productId})`);
    // Implement reorder logic here
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl z-50 max-h-96 overflow-hidden rounded-t-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b bg-red-50">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-6 w-6 text-red-500" />
                <h2 className="text-xl font-bold text-red-700">Low Stock Items</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="hover:bg-red-100 text-red-600 rounded-full p-2"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 overflow-y-auto max-h-80">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {lowStockItems?.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <Package className="h-5 w-5 text-red-500" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Category: {item.category}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className={`text-sm font-medium ${
                              item.stock === 0 ? 'text-red-500' : 'text-orange-500'
                            }`}>
                              Stock: {item.stock}
                            </span>
                            <span className="text-sm text-gray-500">
                              Price: ₹{item.price}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={() => handleReorder(item.id, item.name)}
                        className="bg-[#10B981] hover:bg-[#059669] text-white"
                      >
                        Reorder
                      </Button>
                    </motion.div>
                  ))}
                  
                  {lowStockItems?.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No low stock items found
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
