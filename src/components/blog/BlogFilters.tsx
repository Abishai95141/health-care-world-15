
import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BlogCategory, BlogTag } from '@/hooks/useBlog';
import { X } from 'lucide-react';

interface BlogFiltersProps {
  categories: BlogCategory[];
  tags: BlogTag[];
  selectedCategory?: string;
  selectedTag?: string;
  onCategoryChange: (category?: string) => void;
  onTagChange: (tag?: string) => void;
}

export const BlogFilters: React.FC<BlogFiltersProps> = ({
  categories,
  tags,
  selectedCategory,
  selectedTag,
  onCategoryChange,
  onTagChange,
}) => {
  const hasActiveFilters = selectedCategory || selectedTag;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 rounded-lg shadow-sm border mb-8"
    >
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filter Posts</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onCategoryChange(undefined);
              onTagChange(undefined);
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Categories</h4>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant={selectedCategory === category.slug ? "default" : "outline"}
                className="cursor-pointer hover:bg-[#10B981] hover:text-white transition-colors"
                onClick={() => onCategoryChange(
                  selectedCategory === category.slug ? undefined : category.slug
                )}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 10).map((tag) => (
              <Badge
                key={tag.id}
                variant={selectedTag === tag.slug ? "default" : "outline"}
                className="cursor-pointer hover:bg-[#10B981] hover:text-white transition-colors"
                onClick={() => onTagChange(
                  selectedTag === tag.slug ? undefined : tag.slug
                )}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
