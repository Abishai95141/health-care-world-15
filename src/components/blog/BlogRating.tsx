
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAddBlogRating } from '@/hooks/useBlog';
import { toast } from 'sonner';

interface BlogRatingProps {
  postId: string;
  currentRating?: number;
  averageRating: number;
  totalRatings: number;
}

export const BlogRating: React.FC<BlogRatingProps> = ({
  postId,
  currentRating,
  averageRating,
  totalRatings,
}) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(currentRating || 0);
  const addRating = useAddBlogRating();

  const handleRatingClick = async (rating: number) => {
    try {
      setSelectedRating(rating);
      await addRating.mutateAsync({ postId, rating });
      toast.success('Thank you for your rating!');
    } catch (error) {
      toast.error('Please sign in to rate this post');
      setSelectedRating(currentRating || 0);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 rounded-lg shadow-sm border"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate this article</h3>
      
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRatingClick(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1 transition-transform hover:scale-110"
              disabled={addRating.isPending}
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  star <= (hoveredRating || selectedRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        
        <div className="text-sm text-gray-600">
          {selectedRating > 0 && (
            <span className="font-medium">
              Your rating: {selectedRating}/5
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{averageRating.toFixed(1)}</span>
        </div>
        <span>({totalRatings} rating{totalRatings !== 1 ? 's' : ''})</span>
      </div>
    </motion.div>
  );
};
