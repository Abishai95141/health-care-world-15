
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Eye, Share2, Clock } from 'lucide-react';
import Layout from '@/components/Layout';
import { useBlogPost, useBlogPosts } from '@/hooks/useBlog';
import { BlogRating } from '@/components/blog/BlogRating';
import { BlogComments } from '@/components/blog/BlogComments';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { BlogCard } from '@/components/blog/BlogCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const { data: post, isLoading, error } = useBlogPost(slug!);
  const { data: relatedPosts } = useBlogPosts({ 
    category: post?.blog_categories?.slug,
    limit: 3 
  });

  const averageRating = post && post.rating_count > 0 
    ? post.rating_sum / post.rating_count 
    : 0;

  const readingTime = post 
    ? Math.ceil(post.content.split(' ').length / 200)
    : 0;

  useEffect(() => {
    if (post) {
      // Set page title and meta tags
      document.title = post.meta_title || post.title;
      
      // Add meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', post.meta_description || post.excerpt || '');
      }
    }
  }, [post]);

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt || '',
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
        toast.success('URL copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('URL copied to clipboard!');
    }
  };

  const renderContent = (content: string) => {
    // Simple markdown-like rendering
    return content
      .split('\n')
      .map((paragraph, index) => {
        if (paragraph.startsWith('# ')) {
          const id = paragraph.slice(2).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          return (
            <h1 key={index} id={id} className="text-3xl font-bold text-gray-900 mb-6 mt-8 first:mt-0">
              {paragraph.slice(2)}
            </h1>
          );
        }
        if (paragraph.startsWith('## ')) {
          const id = paragraph.slice(3).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          return (
            <h2 key={index} id={id} className="text-2xl font-semibold text-gray-900 mb-4 mt-6">
              {paragraph.slice(3)}
            </h2>
          );
        }
        if (paragraph.startsWith('### ')) {
          const id = paragraph.slice(4).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          return (
            <h3 key={index} id={id} className="text-xl font-semibold text-gray-900 mb-3 mt-5">
              {paragraph.slice(4)}
            </h3>
          );
        }
        if (paragraph.trim() === '') {
          return <br key={index} />;
        }
        return (
          <p key={index} className="text-gray-700 leading-relaxed mb-4">
            {paragraph}
          </p>
        );
      });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
            <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/blog')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const relatedPostsFiltered = relatedPosts?.filter(p => p.id !== post.id).slice(0, 3) || [];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/blog')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <article>
                {/* Hero Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="bg-white rounded-lg shadow-sm border overflow-hidden mb-8"
                >
                  {post.featured_image && (
                    <div className="relative h-64 md:h-96 overflow-hidden">
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                  )}
                  
                  <div className="p-6 md:p-8">
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      {post.blog_categories && (
                        <Badge variant="secondary" className="text-sm">
                          {post.blog_categories.name}
                        </Badge>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {post.author_name}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {readingTime} min read
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {post.view_count} views
                        </div>
                      </div>
                    </div>
                    
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                      {post.title}
                    </h1>
                    
                    {post.excerpt && (
                      <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {post.blog_post_tags?.map((tag) => (
                          <Badge key={tag.blog_tags.id} variant="outline" className="text-sm">
                            {tag.blog_tags.name}
                          </Badge>
                        ))}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShare}
                        className="flex items-center gap-2"
                      >
                        <Share2 className="w-4 h-4" />
                        Share
                      </Button>
                    </div>
                  </div>
                </motion.div>

                {/* Article Content */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="bg-white rounded-lg shadow-sm border p-6 md:p-8 mb-8"
                >
                  <div className="prose prose-lg max-w-none">
                    {renderContent(post.content)}
                  </div>
                </motion.div>

                {/* Rating Section */}
                <BlogRating
                  postId={post.id}
                  averageRating={averageRating}
                  totalRatings={post.rating_count}
                />

                <Separator className="my-8" />

                {/* Comments Section */}
                <BlogComments postId={post.id} />
              </article>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <TableOfContents content={post.content} />
              
              {/* Related Posts */}
              {relatedPostsFiltered.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-white p-6 rounded-lg shadow-sm border"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Related Articles
                  </h3>
                  <div className="space-y-4">
                    {relatedPostsFiltered.map((relatedPost) => (
                      <div
                        key={relatedPost.id}
                        onClick={() => navigate(`/blog/${relatedPost.slug}`)}
                        className="cursor-pointer group"
                      >
                        <div className="flex gap-3">
                          {relatedPost.featured_image && (
                            <img
                              src={relatedPost.featured_image}
                              alt={relatedPost.title}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 group-hover:text-[#10B981] transition-colors line-clamp-2 text-sm">
                              {relatedPost.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(relatedPost.published_at || relatedPost.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BlogPost;
