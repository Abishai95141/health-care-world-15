
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProductDetailDrawerProps {
  productId: string | null;
  onClose: () => void;
}

export const ProductDetailDrawer = ({ productId, onClose }: ProductDetailDrawerProps) => {
  const { data: productDetails, isLoading } = useQuery({
    queryKey: ['product-details', productId],
    queryFn: async () => {
      if (!productId) return null;

      const [productRes, reviewsRes] = await Promise.all([
        supabase.from('products').select('*').eq('id', productId).single(),
        supabase.from('product_reviews')
          .select('*')
          .eq('product_id', productId)
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      if (productRes.error) throw productRes.error;
      if (reviewsRes.error) throw reviewsRes.error;

      const avgRating = reviewsRes.data?.length ? 
        reviewsRes.data.reduce((sum, review) => sum + review.rating, 0) / reviewsRes.data.length : 0;

      return {
        product: productRes.data,
        reviews: reviewsRes.data,
        avgRating
      };
    },
    enabled: !!productId
  });

  return (
    <AnimatePresence>
      {productId && (
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
            <div className="flex items-center justify-between p-6 border-b bg-[#10B981] text-white">
              <h2 className="text-xl font-bold">Product Details</h2>
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
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B981]"></div>
                </div>
              ) : productDetails ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {productDetails.product.name}
                    </h3>
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.round(productDetails.avgRating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {productDetails.avgRating.toFixed(1)} ({productDetails.reviews.length} reviews)
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Recent Reviews</h4>
                    <div className="space-y-3">
                      {productDetails.reviews?.map((review, index) => (
                        <motion.div
                          key={review.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">
                              {review.reviewer_name}
                            </span>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < review.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-gray-600">{review.comment}</p>
                          )}
                          <span className="text-xs text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Product not found
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
