
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProductDetailDrawer } from './ProductDetailDrawer';

export const TopRatedProducts = () => {
  const [selectedProduct, setSelectedProduct] = useState<{id: string, name: string} | null>(null);

  const { data: topRated, isLoading: topLoading } = useQuery({
    queryKey: ['top-rated-products'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_top_rated', { limit_count: 5 });
      if (error) throw error;
      return data;
    }
  });

  const { data: lowestRated, isLoading: lowLoading } = useQuery({
    queryKey: ['lowest-rated-products'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_lowest_rated', { limit_count: 5 });
      if (error) throw error;
      return data;
    }
  });

  const ProductList = ({ products, title, icon: Icon, isTop }: any) => (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
          <Icon className={`h-6 w-6 ${isTop ? 'text-green-600' : 'text-red-600'}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {products?.map((product: any, index: number) => (
            <motion.div
              key={product.product_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
              onClick={() => setSelectedProduct({id: product.product_id, name: product.product_name})}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 truncate">
                    {product.product_name}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.round(product.avg_rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {product.avg_rating.toFixed(1)} ({product.review_count} reviews)
                    </span>
                  </div>
                </div>
                <span className={`text-lg font-bold ${
                  isTop ? 'text-green-600' : 'text-red-600'
                }`}>
                  #{index + 1}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {topLoading ? (
            <Card className="shadow-lg rounded-2xl">
              <CardContent className="p-6">
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B981]"></div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <ProductList 
              products={topRated} 
              title="Top Rated Products" 
              icon={TrendingUp} 
              isTop={true}
            />
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {lowLoading ? (
            <Card className="shadow-lg rounded-2xl">
              <CardContent className="p-6">
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B981]"></div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <ProductList 
              products={lowestRated} 
              title="Lowest Rated Products" 
              icon={TrendingDown} 
              isTop={false}
            />
          )}
        </motion.div>
      </div>

      <ProductDetailDrawer
        productId={selectedProduct?.id || null}
        productName={selectedProduct?.name || ''}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
};
