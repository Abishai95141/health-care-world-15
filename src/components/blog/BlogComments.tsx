
import React, { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
  status: string;
}

interface BlogCommentsProps {
  postId: string;
  comments?: Comment[];
}

export const BlogComments = ({ postId, comments = [] }: BlogCommentsProps) => {
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    if (!user && (!authorName.trim() || !authorEmail.trim())) {
      toast.error('Please fill in your name and email');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('blog_comments')
        .insert({
          post_id: postId,
          user_id: user?.id || null,
          author_name: user ? user.email?.split('@')[0] || 'Anonymous' : authorName,
          author_email: user ? user.email : authorEmail,
          content: newComment,
          status: 'pending'
        });

      if (error) throw error;

      setNewComment('');
      if (!user) {
        setAuthorName('');
        setAuthorEmail('');
      }
      
      toast.success('Comment submitted! It will appear after moderation.');
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Failed to submit comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const approvedComments = comments.filter(comment => comment.status === 'approved');

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-[#27AE60]" />
        <h3 className="text-lg font-semibold text-black">
          Comments ({approvedComments.length})
        </h3>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-black mb-4">Leave a comment</h4>
        
        {!user && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              placeholder="Your name"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              required
            />
            <Input
              type="email"
              placeholder="Your email"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              required
            />
          </div>
        )}
        
        <Textarea
          placeholder="Share your thoughts..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="mb-4"
          rows={4}
          required
        />
        
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-[#27AE60] hover:bg-[#27AE60]/90 text-white"
        >
          {isSubmitting ? (
            'Submitting...'
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Submit Comment
            </>
          )}
        </Button>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {approvedComments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          approvedComments.map((comment) => (
            <div key={comment.id} className="border-l-2 border-[#27AE60] pl-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-[#27AE60] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {comment.author_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-black">{comment.author_name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 pl-10">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
