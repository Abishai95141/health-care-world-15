
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, MessageSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const RecentReviewsFeed = () => {
  const { data: recentReviews, isLoading } = useQuery({
    queryKey: ['recent-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('recent_reviews', { limit_count: 10 });
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <Card className="shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-[#10B981]" />
            Recent Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B981]"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-[#10B981]" />
            Recent Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {recentReviews?.map((review, index) => (
              <motion.div
                key={review.review_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium text-gray-900">
                        {review.reviewer_name}
                      </span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm font-medium text-[#10B981] mb-1">
                      {review.product_name}
                    </p>
                    {review.comment && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {review.comment.length > 100 
                          ? `${review.comment.substring(0, 100)}...` 
                          : review.comment}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 ml-4">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
            
            {recentReviews?.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No reviews available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
