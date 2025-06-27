
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BlogTableOfContents } from '@/components/blog/BlogTableOfContents';
import { BlogRating } from '@/components/blog/BlogRating';
import { BlogComments } from '@/components/blog/BlogComments';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author_name: string;
  published_at: string;
  featured_image?: string;
  meta_title?: string;
  meta_description?: string;
  category_name?: string;
  category_slug?: string;
  tags?: string[];
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  useEffect(() => {
    if (post) {
      updateSEO();
      incrementViewCount();
      fetchRelatedPosts();
    }
  }, [post]);

  const fetchPost = async () => {
    if (!slug) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          content,
          excerpt,
          author_name,
          published_at,
          featured_image,
          meta_title,
          meta_description,
          blog_categories(name, slug)
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;

      const formattedPost = {
        ...data,
        category_name: data.blog_categories?.name,
        category_slug: data.blog_categories?.slug,
        tags: [] // Implement tags if needed
      };

      setPost(formattedPost);
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('Post not found');
    } finally {
      setLoading(false);
    }
  };

  const updateSEO = () => {
    if (!post) return;

    // Update page title
    document.title = post.meta_title || `${post.title} | HealthCareWorld Blog`;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', post.meta_description || post.excerpt);
    }
  };

  const incrementViewCount = async () => {
    if (!post) return;

    try {
      await supabase
        .from('blog_posts')
        .update({ view_count: supabase.raw('view_count + 1') })
        .eq('id', post.id);
    } catch (error) {
      console.error('Error updating view count:', error);
    }
  };

  const fetchRelatedPosts = async () => {
    if (!post) return;

    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, featured_image, published_at')
        .eq('status', 'published')
        .neq('id', post.id)
        .limit(3)
        .order('published_at', { ascending: false });

      if (error) throw error;
      setRelatedPosts(data || []);
    } catch (error) {
      console.error('Error fetching related posts:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 animate-pulse">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-black mb-4">Post not found</h1>
          <Link to="/blog">
            <Button className="bg-[#27AE60] hover:bg-[#27AE60]/90">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Process content to add IDs to headings for table of contents
  const processedContent = post.content.replace(
    /<h([1-6])([^>]*)>([^<]*)<\/h[1-6]>/gi,
    (match, level, attributes, text) => {
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      return `<h${level}${attributes} id="${id}">${text}</h${level}>`;
    }
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 animate-fade-in">
            <Link to="/" className="hover:text-[#27AE60] transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/blog" className="hover:text-[#27AE60] transition-colors">Blog</Link>
            {post.category_name && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="text-[#27AE60]">{post.category_name}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <article className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in">
              {/* Hero Image */}
              {post.featured_image && (
                <div className="aspect-video overflow-hidden relative">
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              )}

              <div className="p-8">
                {/* Category Badge */}
                {post.category_name && (
                  <Badge className="bg-[#27AE60]/10 text-[#27AE60] hover:bg-[#27AE60]/20 mb-4">
                    {post.category_name}
                  </Badge>
                )}

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-light text-black mb-6 leading-tight">
                  {post.title}
                </h1>

                {/* Meta Info */}
                <div className="flex items-center gap-6 text-gray-600 mb-8 pb-8 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{post.author_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(post.published_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                </div>

                {/* Content */}
                <div 
                  className="prose prose-lg max-w-none prose-headings:text-black prose-p:text-gray-700 prose-a:text-[#27AE60] prose-a:no-underline hover:prose-a:underline prose-strong:text-black prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-blockquote:border-l-[#27AE60] prose-blockquote:bg-gray-50 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-r-lg animate-fade-up"
                  dangerouslySetInnerHTML={{ __html: processedContent }}
                  style={{ animationDelay: '0.2s' }}
                />
              </div>
            </article>

            {/* Rating */}
            <div className="mt-8" style={{ animationDelay: '0.4s' }}>
              <BlogRating postId={post.id} />
            </div>

            {/* Comments */}
            <div className="mt-8" style={{ animationDelay: '0.6s' }}>
              <BlogComments postId={post.id} />
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="mt-12 animate-fade-in" style={{ animationDelay: '0.8s' }}>
                <h2 className="text-2xl font-semibold text-black mb-6">Related Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost, index) => (
                    <Link
                      key={relatedPost.id}
                      to={`/blog/${relatedPost.slug}`}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group animate-fade-in"
                      style={{ animationDelay: `${0.9 + index * 0.1}s` }}
                    >
                      {relatedPost.featured_image && (
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={relatedPost.featured_image}
                            alt={relatedPost.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-black group-hover:text-[#27AE60] transition-colors line-clamp-2 mb-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-8">
              <BlogTableOfContents content={processedContent} />
              
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center animate-fade-in">
                <Link to="/blog">
                  <Button className="bg-[#27AE60] hover:bg-[#27AE60]/90 w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Blog
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
