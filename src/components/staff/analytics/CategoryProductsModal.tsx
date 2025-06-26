
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CategoryProductsModalProps {
  category: string | null;
  onClose: () => void;
}

export const CategoryProductsModal = ({ category, onClose }: CategoryProductsModalProps) => {
  const { data: topProducts, isLoading } = useQuery({
    queryKey: ['category-top-products', category],
    queryFn: async () => {
      if (!category) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          order_items!inner(quantity, total_price)
        `)
        .eq('category', category)
        .limit(3);

      if (error) throw error;

      // Calculate total sales for each product
      const productsWithSales = data.map(product => {
        const totalQuantity = product.order_items.reduce((sum: number, item: any) => sum + item.quantity, 0);
        const totalRevenue = product.order_items.reduce((sum: number, item: any) => sum + item.total_price, 0);
        
        return {
          id: product.id,
          name: product.name,
          price: product.price,
          totalQuantity,
          totalRevenue
        };
      });

      // Sort by total quantity sold
      return productsWithSales
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .slice(0, 3);
    },
    enabled: !!category
  });

  return (
    <AnimatePresence>
      {category && (
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

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-96 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b bg-[#10B981] text-white">
                <h2 className="text-xl font-bold">Top Products in {category}</h2>
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
              <div className="p-6">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B981]"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topProducts?.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            #{index + 1} {product.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            ₹{product.price} • {product.totalQuantity} sold
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-[#10B981]">
                            ₹{product.totalRevenue.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">Revenue</p>
                        </div>
                      </motion.div>
                    ))}
                    
                    {topProducts?.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No products found in this category
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
