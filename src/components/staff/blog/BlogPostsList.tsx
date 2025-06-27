
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, Eye, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BlogPost {
  id: string;
  title: string;
  author_name: string;
  status: string;
  published_at: string | null;
  created_at: string;
  view_count: number;
  category_name?: string;
}

const BlogPostsList = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);

  useEffect(() => {
    fetchPosts();
  }, [searchQuery, statusFilter]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          author_name,
          status,
          published_at,
          created_at,
          view_count,
          blog_categories(name)
        `)
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedPosts = data?.map(post => ({
        ...post,
        category_name: post.blog_categories?.name
      })) || [];

      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(posts.filter(post => post.id !== postId));
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedPosts.length === 0) {
      toast.error('Please select posts to perform bulk action');
      return;
    }

    try {
      let updateData: any = {};
      
      switch (action) {
        case 'publish':
          updateData = { status: 'published', published_at: new Date().toISOString() };
          break;
        case 'draft':
          updateData = { status: 'draft', published_at: null };
          break;
        case 'delete':
          if (!confirm(`Are you sure you want to delete ${selectedPosts.length} posts?`)) return;
          
          const { error: deleteError } = await supabase
            .from('blog_posts')
            .delete()
            .in('id', selectedPosts);

          if (deleteError) throw deleteError;
          
          setPosts(posts.filter(post => !selectedPosts.includes(post.id)));
          setSelectedPosts([]);
          toast.success(`${selectedPosts.length} posts deleted successfully`);
          return;
      }

      const { error } = await supabase
        .from('blog_posts')
        .update(updateData)
        .in('id', selectedPosts);

      if (error) throw error;

      fetchPosts();
      setSelectedPosts([]);
      toast.success(`${selectedPosts.length} posts updated successfully`);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error('Failed to perform bulk action');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { variant: 'default', className: 'bg-green-100 text-green-800' },
      draft: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800' },
      scheduled: { variant: 'outline', className: 'bg-blue-100 text-blue-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <Badge variant={config.variant as any} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-black">Blog Posts</h2>
          <p className="text-gray-600">Manage your blog content</p>
        </div>
        <Link to="/staff/blog/new">
          <Button className="bg-[#27AE60] hover:bg-[#27AE60]/90">
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedPosts.length > 0 && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-[#27AE60]/10 rounded-lg">
            <span className="text-sm text-gray-700">{selectedPosts.length} posts selected</span>
            <Button size="sm" onClick={() => handleBulkAction('publish')}>
              Publish
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkAction('draft')}>
              Draft
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')}>
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#27AE60] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading posts...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedPosts.length === posts.length && posts.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPosts(posts.map(post => post.id));
                      } else {
                        setSelectedPosts([]);
                      }
                    }}
                    className="rounded"
                  />
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id} className="hover:bg-gray-50">
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedPosts.includes(post.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPosts([...selectedPosts, post.id]);
                        } else {
                          setSelectedPosts(selectedPosts.filter(id => id !== post.id));
                        }
                      }}
                      className="rounded"
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-black line-clamp-1">{post.title}</div>
                      <div className="text-sm text-gray-500">
                        Created {new Date(post.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-700">{post.author_name}</TableCell>
                  <TableCell>
                    {post.category_name && (
                      <Badge variant="outline" className="text-xs">
                        {post.category_name}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(post.status)}</TableCell>
                  <TableCell>
                    {post.published_at ? (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.published_at).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-gray-400">Not published</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Eye className="w-3 h-3" />
                      {post.view_count || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link to={`/staff/blog/edit/${post.id}`}>
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeletePost(post.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {!loading && posts.length === 0 && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-black mb-2">No posts found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first blog post.</p>
            <Link to="/staff/blog/new">
              <Button className="bg-[#27AE60] hover:bg-[#27AE60]/90">
                <Plus className="w-4 h-4 mr-2" />
                Create First Post
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPostsList;
