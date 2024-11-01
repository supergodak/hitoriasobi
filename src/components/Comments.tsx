import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../db/config';
import { Send, Trash2 } from 'lucide-react';
import ImageUpload, { ImageUploadRef } from './ImageUpload';

const DEBUG = true;

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  users: {
    username: string;
  };
  image_url?: string;
}

interface CommentsProps {
  locationId: string;
}

const Comments: React.FC<CommentsProps> = ({ locationId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const imageUploadRef = useRef<ImageUploadRef>(null);

  const fetchComments = async () => {
    if (DEBUG) console.log('🔄 Fetching comments for location:', locationId);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          users:user_id (username)
        `)
        .eq('location_id', locationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (DEBUG) console.log('📥 Received comments:', data?.length);
      setComments(data || []);
    } catch (err) {
      console.error('❌ Error fetching comments:', err);
    }
  };

  useEffect(() => {
    if (DEBUG) console.log('🔌 Setting up comments subscription for location:', locationId);
    fetchComments();

    const channel = supabase
      .channel('comments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `location_id=eq.${locationId}`
        },
        (payload) => {
          if (DEBUG) console.log('📨 Received comments change event:', payload);
          if (payload.eventType === 'INSERT') {
            const newComment = payload.new as Comment;
            if (DEBUG) console.log('➕ Adding new comment:', newComment);
            setComments(prev => [newComment, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            if (DEBUG) console.log('➖ Removing comment:', payload.old.id);
            setComments(prev => prev.filter(comment => comment.id !== payload.old.id));
          }
        }
      )
      .subscribe(status => {
        if (DEBUG) console.log('📡 Comments channel status:', status);
      });

    return () => {
      if (DEBUG) console.log('🔌 Cleaning up comments subscription');
      channel.unsubscribe();
    };
  }, [locationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newComment.trim()) return;

    if (DEBUG) console.log('📤 Submitting comment:', { content: newComment, imageUrl });
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .insert({
          location_id: locationId,
          user_id: currentUser.id,
          content: newComment.trim(),
          image_url: imageUrl || null
        })
        .select(`
          *,
          users:user_id (username)
        `)
        .single();

      if (error) throw error;
      if (DEBUG) console.log('✅ Comment submitted successfully');

      setNewComment('');
      setImageUrl('');
      if (imageUploadRef.current) {
        imageUploadRef.current.reset();
      }
    } catch (error) {
      console.error('❌ Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!currentUser) return;

    if (DEBUG) console.log('🗑️ Deleting comment:', commentId);
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', currentUser.id);

      if (error) throw error;
      if (DEBUG) console.log('✅ Comment deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting comment:', error);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">コメント</h2>
      
      {currentUser && (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="space-y-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="コメントを入力..."
              rows={3}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              disabled={loading}
            />
            <ImageUpload 
              onImageUploaded={setImageUrl}
              ref={imageUploadRef}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !newComment.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-medium">@{comment.users.username}</span>
                <span className="text-xs text-gray-500 ml-2">
                  {new Date(comment.created_at).toLocaleString()}
                </span>
              </div>
              {currentUser?.id === comment.user_id && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-gray-400 hover:text-red-500"
                  title="削除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="mt-2 text-gray-700 whitespace-pre-wrap">{comment.content}</p>
            {comment.image_url && (
              <img
                src={comment.image_url}
                alt="コメント画像"
                className="mt-2 rounded-lg max-h-60 object-cover"
                loading="lazy"
              />
            )}
          </div>
        ))}
      </div>

      {!currentUser && (
        <p className="text-sm text-gray-500 mt-4">
          コメントを投稿するには、ログインしてください。
        </p>
      )}
    </div>
  );
};

export default Comments;