
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author_name: string;
  published_at: string;
  featured_image?: string;
  category_name?: string;
  tags?: string[];
}

interface BlogCardProps {
  post: BlogPost;
  index: number;
}

export const BlogCard = ({ post, index }: BlogCardProps) => {
  return (
    <div 
      className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden animate-fade-in hover:scale-105"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <Link to={`/blog/${post.slug}`} className="block">
        {post.featured_image && (
          <div className="aspect-video overflow-hidden">
            <img 
              src={post.featured_image} 
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
        )}
        
        <div className="p-6">
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{post.author_name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(post.published_at).toLocaleDateString()}</span>
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-black mb-3 group-hover:text-[#27AE60] transition-colors line-clamp-2">
            {post.title}
          </h3>
          
          <p className="text-gray-700 mb-4 line-clamp-3">
            {post.excerpt}
          </p>
          
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 3).map((tag, tagIndex) => (
                <Badge 
                  key={tagIndex} 
                  variant="secondary" 
                  className="bg-[#27AE60]/10 text-[#27AE60] hover:bg-[#27AE60]/20 transition-colors"
                >
                  {tag}
                </Badge>
              ))}
              {post.tags.length > 3 && (
                <Badge variant="outline" className="text-gray-500">
                  +{post.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};
