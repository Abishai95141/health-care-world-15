
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ExpiringProductsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const ExpiringProductsDrawer = ({ open, onClose }: ExpiringProductsDrawerProps) => {
  const { data: expiringProducts, isLoading } = useQuery({
    queryKey: ['expiring-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, expiration_date, stock')
        .eq('is_active', true)
        .not('expiration_date', 'is', null)
        .lte('expiration_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('expiration_date', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: open
  });

  const getDaysUntilExpiry = (expirationDate: string) => {
    const today = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 bg-white shadow-2xl z-50 w-96 overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b bg-orange-500 text-white">
              <h2 className="text-xl font-bold">Products Nearing Expiration</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="hover:bg-white/20 text-white rounded-full p-2"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 overflow-y-auto h-full">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {expiringProducts?.map((product, index) => {
                    const daysLeft = getDaysUntilExpiry(product.expiration_date);
                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                              <Package className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">
                              {product.name}
                            </h3>
                            
                            <div className="flex items-center space-x-1 mt-1">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <p className="text-sm text-gray-500">
                                Expires: {new Date(product.expiration_date).toLocaleDateString()}
                              </p>
                            </div>
                            
                            <div className="flex items-center justify-between mt-2">
                              <span className={`text-sm font-medium ${
                                daysLeft <= 7 ? 'text-red-600' : daysLeft <= 14 ? 'text-orange-600' : 'text-yellow-600'
                              }`}>
                                {daysLeft} days left
                              </span>
                              <span className="text-sm text-gray-500">
                                Stock: {product.stock}
                              </span>
                            </div>
                            
                            <Button 
                              size="sm" 
                              className="mt-2 bg-orange-500 hover:bg-orange-600"
                            >
                              Plan Clearance
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  
                  {expiringProducts?.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No products expiring in the next 30 days
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
