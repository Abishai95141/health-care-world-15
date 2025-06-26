
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TopProductsDrawer } from './TopProductsDrawer';
import { ProductDetailDrawer } from './ProductDetailDrawer';

export const TopProductsSection = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedProductName, setSelectedProductName] = useState('');

  const { data: topProducts, isLoading } = useQuery({
    queryKey: ['top-products-preview'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_top_products', { limit_count: 5 });
      if (error) throw error;
      
      return data?.map(item => ({
        id: item.product_id,
        name: item.product_name,
        totalQuantity: item.total_quantity,
        totalRevenue: item.total_revenue,
        imageUrl: '/placeholder.svg' // Default placeholder
      })) || [];
    }
  });

  const handleProductClick = (productId: string, productName: string) => {
    setSelectedProductId(productId);
    setSelectedProductName(productName);
  };

  const handleCloseProductDetail = () => {
    setSelectedProductId(null);
    setSelectedProductName('');
  };

  if (isLoading) {
    return (
      <div className="h-60 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981]"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {topProducts?.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card 
                className="shadow-md hover:shadow-lg transition-all duration-200 rounded-xl cursor-pointer"
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
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                        {product.name}
                      </h3>
                      
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="secondary" 
                          className="bg-[#10B981] text-white hover:bg-[#065F46]"
                        >
                          {product.totalQuantity} sold
                        </Badge>
                        <span className="text-xs text-gray-500">
                          #{index + 1}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            onClick={() => setIsDrawerOpen(true)}
            className="bg-[#10B981] hover:bg-[#065F46] text-white px-6 py-3 rounded-xl transition-all duration-200"
          >
            View Full Ranking
          </Button>
        </div>
      </div>

      <TopProductsDrawer 
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      <ProductDetailDrawer
        productId={selectedProductId}
        productName={selectedProductName}
        onClose={handleCloseProductDetail}
      />
    </>
  );
};
