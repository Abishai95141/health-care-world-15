
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBlogComments, useAddBlogComment } from '@/hooks/useBlog';
import { toast } from 'sonner';

interface BlogCommentsProps {
  postId: string;
}

export const BlogComments: React.FC<BlogCommentsProps> = ({ postId }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    authorName: '',
    authorEmail: '',
    content: '',
  });

  const { data: comments, isLoading } = useBlogComments(postId);
  const addComment = useAddBlogComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.authorName.trim() || !formData.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await addComment.mutateAsync({
        postId,
        authorName: formData.authorName,
        authorEmail: formData.authorEmail,
        content: formData.content,
      });
      
      toast.success('Comment submitted! It will be reviewed before appearing.');
      setFormData({ authorName: '', authorEmail: '', content: '' });
      setIsFormOpen(false);
    } catch (error) {
      toast.error('Failed to submit comment');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 rounded-lg shadow-sm border"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Comments ({comments?.length || 0})
        </h3>
        
        <Button
          onClick={() => setIsFormOpen(!isFormOpen)}
          variant="outline"
          size="sm"
        >
          {isFormOpen ? 'Cancel' : 'Add Comment'}
        </Button>
      </div>

      {/* Comment Form */}
      {isFormOpen && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          onSubmit={handleSubmit}
          className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="authorName">Name *</Label>
              <Input
                id="authorName"
                value={formData.authorName}
                onChange={(e) => setFormData(prev => ({ ...prev, authorName: e.target.value }))}
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <Label htmlFor="authorEmail">Email (optional)</Label>
              <Input
                id="authorEmail"
                type="email"
                value={formData.authorEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, authorEmail: e.target.value }))}
                placeholder="your.email@example.com"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="content">Comment *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Share your thoughts..."
              rows={4}
              required
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={addComment.isPending}
              className="bg-[#10B981] hover:bg-[#059669]"
            >
              {addComment.isPending ? 'Submitting...' : 'Submit Comment'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFormOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </motion.form>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments?.map((comment, index) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-900">{comment.author_name}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Calendar className="w-3 h-3" />
                {new Date(comment.created_at).toLocaleDateString()}
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">{comment.content}</p>
          </motion.div>
        ))}
        
        {(!comments || comments.length === 0) && (
          <p className="text-gray-500 text-center py-8">
            No comments yet. Be the first to share your thoughts!
          </p>
        )}
      </div>
    </motion.div>
  );
};
