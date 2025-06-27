
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BlogCard } from './BlogCard';
import { BlogPost } from '@/hooks/useBlog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface BlogGridProps {
  posts: BlogPost[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onPostClick: (slug: string) => void;
}

export const BlogGrid: React.FC<BlogGridProps> = ({
  posts,
  isLoading,
  hasMore,
  onLoadMore,
  onPostClick,
}) => {
  return (
    <div className="space-y-8">
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {posts.map((post, index) => (
          <BlogCard
            key={post.id}
            post={post}
            onClick={onPostClick}
            index={index}
          />
        ))}
      </motion.div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-[#10B981]" />
        </div>
      )}

      {hasMore && !isLoading && (
        <div className="flex justify-center py-8">
          <Button
            onClick={onLoadMore}
            variant="outline"
            size="lg"
            className="px-8"
          >
            Load More Posts
          </Button>
        </div>
      )}

      {!isLoading && posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No blog posts found.</p>
        </div>
      )}
    </div>
  );
};
