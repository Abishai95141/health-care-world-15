
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, User, Star, Eye } from 'lucide-react';
import { BlogPost } from '@/hooks/useBlog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface BlogCardProps {
  post: BlogPost;
  onClick: (slug: string) => void;
  index: number;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post, onClick, index }) => {
  const averageRating = post.rating_count > 0 ? post.rating_sum / post.rating_count : 0;
  const formattedDate = new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="cursor-pointer group"
      onClick={() => onClick(post.slug)}
    >
      <Card className="h-full overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white">
        {post.featured_image && (
          <div className="relative overflow-hidden">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        )}
        
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 mb-2">
            {post.blog_categories && (
              <Badge variant="secondary" className="text-xs">
                {post.blog_categories.name}
              </Badge>
            )}
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              {formattedDate}
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-[#10B981] transition-colors duration-200 line-clamp-2">
            {post.title}
          </h3>
        </CardHeader>
        
        <CardContent className="pt-0">
          {post.excerpt && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {post.excerpt}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {post.author_name}
              </div>
              
              {post.rating_count > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  {averageRating.toFixed(1)}
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {post.view_count}
              </div>
            </div>
          </div>
          
          {post.blog_post_tags && post.blog_post_tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {post.blog_post_tags.slice(0, 3).map((tag) => (
                <Badge key={tag.blog_tags.id} variant="outline" className="text-xs">
                  {tag.blog_tags.name}
                </Badge>
              ))}
              {post.blog_post_tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{post.blog_post_tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
