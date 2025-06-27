
import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BlogRatingProps {
  postId: string;
  currentRating?: number;
  averageRating?: number;
  totalRatings?: number;
}

export const BlogRating = ({ postId, currentRating = 0, averageRating = 0, totalRatings = 0 }: BlogRatingProps) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(currentRating);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleRatingSubmit = async (rating: number) => {
    if (!user) {
      toast.error('Please sign in to rate this post');
      return;
    }

    if (selectedRating === rating) return;

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('blog_ratings')
        .upsert({
          post_id: postId,
          user_id: user.id,
          rating: rating
        });

      if (error) throw error;

      setSelectedRating(rating);
      toast.success('Thank you for your rating!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-fade-in">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-black mb-2">Rate this article</h3>
        <p className="text-gray-600 mb-4">Help others discover quality content</p>
        
        {/* Star Rating */}
        <div className="flex justify-center gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => handleRatingSubmit(star)}
              disabled={isSubmitting}
              className="p-1 transition-transform duration-200 hover:scale-110 disabled:opacity-50"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoveredRating || selectedRating)
                    ? 'fill-[#27AE60] text-[#27AE60]'
                    : 'text-gray-300'
                } transition-colors duration-200`}
              />
            </button>
          ))}
        </div>

        {/* Rating Summary */}
        <div className="text-sm text-gray-600">
          {averageRating > 0 ? (
            <>
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="w-4 h-4 fill-[#27AE60] text-[#27AE60]" />
                <span className="font-medium text-black">{averageRating.toFixed(1)}</span>
                <span>({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})</span>
              </div>
            </>
          ) : (
            <p>Be the first to rate this article</p>
          )}
        </div>
      </div>
    </div>
  );
};
