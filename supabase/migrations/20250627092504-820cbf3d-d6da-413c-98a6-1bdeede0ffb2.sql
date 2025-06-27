
-- Create categories table for blog organization
CREATE TABLE public.blog_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tags table for flexible content tagging
CREATE TABLE public.blog_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blog posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  meta_title TEXT,
  meta_description TEXT,
  author_name TEXT NOT NULL DEFAULT 'Admin',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'disabled')),
  category_id UUID REFERENCES public.blog_categories(id),
  published_at TIMESTAMP WITH TIME ZONE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER NOT NULL DEFAULT 0,
  rating_sum INTEGER NOT NULL DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create junction table for post-tag relationships
CREATE TABLE public.blog_post_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.blog_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, tag_id)
);

-- Create blog comments table
CREATE TABLE public.blog_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  author_name TEXT NOT NULL,
  author_email TEXT,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blog ratings table for user ratings
CREATE TABLE public.blog_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS on all blog tables
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to published content
CREATE POLICY "Anyone can view published blog categories" ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view blog tags" ON public.blog_tags FOR SELECT USING (true);
CREATE POLICY "Anyone can view published blog posts" ON public.blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Anyone can view post-tag relationships" ON public.blog_post_tags FOR SELECT USING (true);
CREATE POLICY "Anyone can view approved comments" ON public.blog_comments FOR SELECT USING (status = 'approved');

-- Policies for authenticated users to rate and comment
CREATE POLICY "Authenticated users can insert ratings" ON public.blog_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can update their ratings" ON public.blog_ratings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view ratings" ON public.blog_ratings FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert comments" ON public.blog_comments FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can update their comments" ON public.blog_comments FOR UPDATE USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_blog_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER handle_blog_categories_updated_at
  BEFORE UPDATE ON public.blog_categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_blog_updated_at();

CREATE TRIGGER handle_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_blog_updated_at();

CREATE TRIGGER handle_blog_comments_updated_at
  BEFORE UPDATE ON public.blog_comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_blog_updated_at();

CREATE TRIGGER handle_blog_ratings_updated_at
  BEFORE UPDATE ON public.blog_ratings
  FOR EACH ROW EXECUTE FUNCTION public.handle_blog_updated_at();

-- Create function to update post ratings
CREATE OR REPLACE FUNCTION public.update_blog_post_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.blog_posts 
    SET 
      rating_sum = rating_sum + NEW.rating,
      rating_count = rating_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.blog_posts 
    SET 
      rating_sum = rating_sum - OLD.rating + NEW.rating
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.blog_posts 
    SET 
      rating_sum = rating_sum - OLD.rating,
      rating_count = rating_count - 1
    WHERE id = OLD.post_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Add trigger to update post ratings
CREATE TRIGGER update_blog_post_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.blog_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_blog_post_rating();

-- Insert some default categories
INSERT INTO public.blog_categories (name, slug, description) VALUES
('Health Tips', 'health-tips', 'General health and wellness advice'),
('Medications', 'medications', 'Information about medicines and treatments'),
('Wellness', 'wellness', 'Mental and physical wellness topics'),
('Nutrition', 'nutrition', 'Diet and nutrition guidance'),
('Prevention', 'prevention', 'Disease prevention and healthy living');

-- Insert some default tags
INSERT INTO public.blog_tags (name, slug) VALUES
('pharmacy', 'pharmacy'),
('health', 'health'),
('wellness', 'wellness'),
('medicine', 'medicine'),
('nutrition', 'nutrition'),
('fitness', 'fitness'),
('mental-health', 'mental-health'),
('chronic-disease', 'chronic-disease'),
('prevention', 'prevention'),
('lifestyle', 'lifestyle');
