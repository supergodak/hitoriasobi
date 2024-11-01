import React from 'react';
import { Heart } from 'lucide-react';
import { useStoreLikes } from '../hooks/useStoreLikes';
import { useAuth } from '../contexts/AuthContext';

interface LikeButtonProps {
  locationId: string;
}

const LikeButton: React.FC<LikeButtonProps> = ({ locationId }) => {
  const { currentUser } = useAuth();
  const { likeCount, isLiked, loading, toggleLike } = useStoreLikes(
    locationId,
    currentUser?.id
  );

  const handleClick = async () => {
    if (!currentUser) {
      alert('いいねするにはログインが必要です');
      return;
    }
    if (!loading) {
      await toggleLike();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-colors ${
        isLiked
          ? 'text-green-500 hover:text-green-600'
          : 'text-gray-500 hover:text-green-500'
      }`}
    >
      <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
      <span className="text-sm">{likeCount}</span>
    </button>
  );
};

export default LikeButton;