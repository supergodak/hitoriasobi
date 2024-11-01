import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../db/config';
import { Send, Trash2 } from 'lucide-react';
import ImageUpload, { ImageUploadRef } from '../ImageUpload';

const DEBUG = true;

interface CampLogComment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  image_url?: string;
  user?: {
    username: string;
  };
}

interface CampLogCommentsProps {
  campLogId: string;
  onCommentAdded?: () => void;
}

const CampLogComments: React.FC<CampLogCommentsProps> = ({ campLogId, onCommentAdded }) => {
  const [comments, setComments] = useState<CampLogComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const imageUploadRef = useRef<ImageUploadRef>(null);

  useEffect(() => {
    if (DEBUG) console.log('🔄 Setting up comments subscription for camp log:', campLogId);

    const fetchComments = async () => {
      try {
        const { data, error } = await supabase
          .from('camp_log_comments')
          .select(`
            *,
            user:users (username)
          `)
          .eq('camp_log_id', campLogId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (DEBUG) console.log('📥 Received comments:', data?.length);
        setComments(data || []);
      } catch (err) {
        console.error('❌ Error fetching comments:', err);
      }
    };

    // リアルタイム更新のサブスクリプション設定
    const channel = supabase
      .channel(`camp_log_comments:${campLogId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'camp_log_comments',
          filter: `camp_log_id=eq.${campLogId}`
        },
        async (payload) => {
          if (DEBUG) console.log('📨 Received comment change event:', payload);

          if (payload.eventType === 'INSERT') {
            if (DEBUG) console.log('🆕 New comment detected:', payload.new);
            const { data: newComment, error } = await supabase
              .from('camp_log_comments')
              .select(`
                *,
                user:users (username)
              `)
              .eq('id', payload.new.id)
              .single();

            if (error) {
              console.error('❌ Error fetching new comment details:', error);
            } else if (newComment) {
              if (DEBUG) console.log('➕ Adding new comment to state:', newComment);
              setComments(prev => [newComment, ...prev]);
            }
          } else if (payload.eventType === 'DELETE') {
            if (DEBUG) console.log('🗑️ Comment deletion detected:', payload.old.id);
            setComments(prev => prev.filter(comment => comment.id !== payload.old.id));
          }
        }
      )
      .subscribe(status => {
        if (DEBUG) console.log('📡 Comments channel status:', status);
      });

    // 初期データ取得
    fetchComments();

    return () => {
      if (DEBUG) console.log('🔌 Cleaning up comments subscription');
      channel.unsubscribe();
    };
  }, [campLogId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser || !newComment.trim()) return;

    if (DEBUG) console.log('📝 Submitting new comment:', {
      campLogId,
      content: newComment,
      imageUrl,
      userId: currentUser.id
    });

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('camp_log_comments')
        .insert({
          camp_log_id: campLogId,
          user_id: currentUser.id,
          content: newComment.trim(),
          image_url: imageUrl || null
        })
        .select(`
          *,
          user:users (username)
        `)
        .single();

      if (error) {
        console.error('❌ Error submitting comment:', error);
        throw error;
      }

      if (DEBUG) console.log('✅ Comment submitted successfully:', data);

      setNewComment('');
      setImageUrl('');
      if (imageUploadRef.current) {
        imageUploadRef.current.reset();
      }
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (error) {
      console.error('❌ Error adding comment:', error);
      alert('コメントの投稿に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!currentUser) return;

    if (DEBUG) console.log('🗑️ Deleting comment:', commentId);

    try {
      const { error } = await supabase
        .from('camp_log_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', currentUser.id);

      if (error) {
        console.error('❌ Error deleting comment:', error);
        throw error;
      }

      if (DEBUG) console.log('✅ Comment deleted successfully');

    } catch (error) {
      console.error('❌ Error deleting comment:', error);
      alert('コメントの削除に失敗しました');
    }
  };

  return (
    <div className="space-y-4">
      {currentUser && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="コメントを入力..."
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            rows={3}
            disabled={loading}
          />
          <ImageUpload 
            onImageUploaded={setImageUrl}
            ref={imageUploadRef}
          />
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Send className="w-4 h-4 mr-2" />
            投稿
          </button>
        </form>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <span className="font-medium">{comment.user?.username}</span>
              {currentUser?.id === comment.user_id && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="mt-2 text-gray-700">{comment.content}</p>
            {comment.image_url && (
              <img
                src={comment.image_url}
                alt="コメント画像"
                className="mt-2 max-h-48 rounded-lg object-cover"
                loading="lazy"
              />
            )}
            <div className="mt-2 text-sm text-gray-500">
              {new Date(comment.created_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CampLogComments;