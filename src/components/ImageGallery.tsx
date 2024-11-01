import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../db/config';

interface ImageGalleryProps {
  images: string[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  if (images.length === 0) return null;

  const getGridClass = () => {
    switch (images.length) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-2 md:grid-cols-3';
      case 4: return 'grid-cols-2';
      default: return 'grid-cols-2 md:grid-cols-3';
    }
  };

  const handleImageError = async (image: string) => {
    console.error(`Error loading image: ${image}`);
    try {
      // 画像URLを再取得
      const { data } = supabase.storage
        .from('drink-log-images')
        .getPublicUrl(image.split('/').pop() || '');
      
      if (data?.publicUrl) {
        // 新しいURLで画像を再読み込み
        const img = new Image();
        img.src = data.publicUrl;
        img.onload = () => {
          setImageErrors(prev => ({ ...prev, [image]: false }));
        };
        img.onerror = () => {
          setImageErrors(prev => ({ ...prev, [image]: true }));
        };
      } else {
        setImageErrors(prev => ({ ...prev, [image]: true }));
      }
    } catch (error) {
      console.error('Error refreshing image URL:', error);
      setImageErrors(prev => ({ ...prev, [image]: true }));
    }
  };

  const getValidImageUrl = (url: string): string => {
    try {
      const fileName = url.split('/').pop();
      if (!fileName) return url;

      const { data } = supabase.storage
        .from('drink-log-images')
        .getPublicUrl(fileName);

      return data?.publicUrl || url;
    } catch (error) {
      console.error('Error getting valid image URL:', error);
      return url;
    }
  };

  return (
    <>
      <div className={`grid ${getGridClass()} gap-2 mt-4`}>
        {images.map((image, index) => {
          const validUrl = getValidImageUrl(image);
          return (
            <div
              key={index}
              className={`${
                images.length === 1 ? 'col-span-1' :
                images.length === 3 && index === 0 ? 'col-span-2 md:col-span-1' :
                images.length === 4 && index >= 2 ? 'col-span-1' :
                'col-span-1'
              } aspect-w-1 aspect-h-1 cursor-pointer`}
              onClick={() => setSelectedImage(validUrl)}
            >
              {imageErrors[image] ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-lg">
                  <span className="text-sm text-gray-500">画像を読み込めません</span>
                </div>
              ) : (
                <img
                  src={validUrl}
                  alt={`投稿画像 ${index + 1}`}
                  className="object-cover w-full h-full rounded-lg"
                  onError={() => handleImageError(image)}
                  loading="lazy"
                />
              )}
            </div>
          );
        })}
      </div>
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-3xl max-h-full">
            <img
              src={selectedImage}
              alt="拡大画像"
              className="max-w-full max-h-[90vh] object-contain"
              onError={() => handleImageError(selectedImage)}
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white bg-red-500 rounded-full p-2"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;