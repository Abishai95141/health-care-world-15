
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type BlogPost = Tables<'blog_posts'> & {
  blog_categories: Tables<'blog_categories'> | null;
  blog_post_tags: Array<{
    blog_tags: Tables<'blog_tags'>;
  }>;
};

export type BlogComment = Tables<'blog_comments'>;
export type BlogCategory = Tables<'blog_categories'>;
export type BlogTag = Tables<'blog_tags'>;

export const useBlogPosts = (filters?: {
  category?: string;
  tag?: string;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: ['blog-posts', filters],
    queryFn: async () => {
      let query = supabase
        .from('blog_posts')
        .select(`
          *,
          blog_categories!inner(*),
          blog_post_tags!inner(
            blog_tags(*)
          )
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('blog_categories.slug', filters.category);
      }

      if (filters?.tag) {
        query = query.eq('blog_post_tags.blog_tags.slug', filters.tag);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as BlogPost[];
    },
  });
};

export const useBlogPost = (slug: string) => {
  return useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          blog_categories(*),
          blog_post_tags(
            blog_tags(*)
          )
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;

      // Increment view count
      await supabase
        .from('blog_posts')
        .update({ view_count: data.view_count + 1 })
        .eq('id', data.id);

      return data as BlogPost;
    },
  });
};

export const useBlogComments = (postId: string) => {
  return useQuery({
    queryKey: ['blog-comments', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_comments')
        .select('*')
        .eq('post_id', postId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BlogComment[];
    },
  });
};

export const useBlogCategories = () => {
  return useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as BlogCategory[];
    },
  });
};

export const useBlogTags = () => {
  return useQuery({
    queryKey: ['blog-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_tags')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as BlogTag[];
    },
  });
};

export const useAddBlogRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, rating }: { postId: string; rating: number }) => {
      const { data, error } = await supabase
        .from('blog_ratings')
        .upsert({
          post_id: postId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          rating,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
  });
};

export const useAddBlogComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      authorName,
      authorEmail,
      content,
      rating,
    }: {
      postId: string;
      authorName: string;
      authorEmail?: string;
      content: string;
      rating?: number;
    }) => {
      const { data, error } = await supabase
        .from('blog_comments')
        .insert({
          post_id: postId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          author_name: authorName,
          author_email: authorEmail,
          content,
          rating,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['blog-comments', variables.postId] });
    },
  });
};
