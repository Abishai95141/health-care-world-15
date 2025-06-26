
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface RatingsModalProps {
  open: boolean;
  onClose: () => void;
}

export const RatingsModal = ({ open, onClose }: RatingsModalProps) => {
  const { data: ratingsData, isLoading } = useQuery({
    queryKey: ['ratings-breakdown'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('rating');

      if (error) throw error;

      const breakdown = [1, 2, 3, 4, 5].map(rating => ({
        rating,
        count: data.filter(review => review.rating === rating).length
      }));

      const total = data.length;
      const avgRating = total ? data.reduce((sum, review) => sum + review.rating, 0) / total : 0;

      return { breakdown, total, avgRating };
    },
    enabled: open
  });

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
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Rating Distribution</h2>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B981]"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#10B981]">
                      {ratingsData?.avgRating.toFixed(1)}
                    </div>
                    <div className="flex justify-center items-center space-x-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.round(ratingsData?.avgRating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 mt-1">
                      Based on {ratingsData?.total} reviews
                    </p>
                  </div>

                  <div className="space-y-3">
                    {ratingsData?.breakdown.reverse().map((item) => {
                      const percentage = ratingsData.total > 0 ? (item.count / ratingsData.total) * 100 : 0;
                      return (
                        <div key={item.rating} className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1 w-12">
                            <span className="text-sm font-medium">{item.rating}</span>
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.6, delay: (5 - item.rating) * 0.1 }}
                              className="bg-[#10B981] h-2 rounded-full"
                            />
                          </div>
                          <div className="text-sm text-gray-600 w-12">
                            {item.count}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
