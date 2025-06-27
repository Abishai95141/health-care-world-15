
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { BlogGrid } from '@/components/blog/BlogGrid';
import { BlogFilters } from '@/components/blog/BlogFilters';
import { useBlogPosts, useBlogCategories, useBlogTags } from '@/hooks/useBlog';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const Blog: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [selectedTag, setSelectedTag] = useState<string>();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 12;

  const { data: posts, isLoading } = useBlogPosts({
    category: selectedCategory,
    tag: selectedTag,
    limit: pageSize,
    offset: page * pageSize,
  });

  const { data: categories } = useBlogCategories();
  const { data: tags } = useBlogTags();

  const filteredPosts = posts?.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handlePostClick = (slug: string) => {
    navigate(`/blog/${slug}`);
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#10B981] to-[#059669] text-white py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Health & Wellness Blog
              </h1>
              <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-3xl mx-auto">
                Expert insights, tips, and advice for your health journey
              </p>
              
              {/* Search Bar */}
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 py-3 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          {/* Filters */}
          {categories && tags && (
            <BlogFilters
              categories={categories}
              tags={tags}
              selectedCategory={selectedCategory}
              selectedTag={selectedTag}
              onCategoryChange={setSelectedCategory}
              onTagChange={setSelectedTag}
            />
          )}

          {/* Blog Grid */}
          <BlogGrid
            posts={filteredPosts}
            isLoading={isLoading}
            hasMore={filteredPosts.length === pageSize}
            onLoadMore={handleLoadMore}
            onPostClick={handlePostClick}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Blog;
