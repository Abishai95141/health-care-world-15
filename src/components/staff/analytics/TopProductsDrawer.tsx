
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Trophy, Medal, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProductDetailDrawer } from './ProductDetailDrawer';

interface TopProductsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const TopProductsDrawer = ({ open, onClose }: TopProductsDrawerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<{id: string, name: string} | null>(null);

  const { data: allTopProducts, isLoading } = useQuery({
    queryKey: ['top-products-full'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_top_products', { limit_count: 20 });
      if (error) throw error;
      
      return data?.map((item, index) => ({
        id: item.product_id,
        name: item.product_name,
        totalQuantity: item.total_quantity,
        totalRevenue: item.total_revenue,
        rank: index + 1,
        imageUrl: '/placeholder.svg'
      })) || [];
    },
    enabled: open
  });

  const filteredProducts = allTopProducts?.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="font-bold text-gray-600">#{rank}</span>;
  };

  const handleProductClick = (productId: string, productName: string) => {
    setSelectedProduct({ id: productId, name: productName });
  };

  const handleCloseProductDetail = () => {
    setSelectedProduct(null);
  };

  return (
    <>
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
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[80vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">Top 20 Products</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="hover:bg-gray-100 rounded-full p-2"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Search */}
              <div className="p-6 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 rounded-xl"
                  />
                </div>
              </div>

              {/* Products List */}
              <div className="p-6 overflow-y-auto max-h-96">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B981]"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                        onClick={() => handleProductClick(product.id, product.name)}
                        role="button"
                        tabIndex={0}
                        aria-label={`View details for ${product.name}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleProductClick(product.id, product.name);
                          }
                        }}
                      >
                        {/* Rank */}
                        <div className="flex-shrink-0 w-12 flex items-center justify-center">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            {getRankIcon(product.rank)}
                          </motion.div>
                        </div>

                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Revenue: ₹{product.totalRevenue.toLocaleString()}
                          </p>
                        </div>

                        {/* Sales Badge */}
                        <Badge 
                          variant="secondary"
                          className="bg-[#10B981] text-white hover:bg-[#065F46] flex-shrink-0"
                        >
                          {product.totalQuantity} sold
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ProductDetailDrawer
        productId={selectedProduct?.id || null}
        productName={selectedProduct?.name || ''}
        onClose={handleCloseProductDetail}
      />
    </>
  );
};
