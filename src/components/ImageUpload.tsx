import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Upload, X } from 'lucide-react';
import { supabase } from '../db/config';

const IMAGE_CONFIG = {
  MAX_SIZE: 600,
  QUALITY: 0.9,
  MAX_FILE_SIZE: 2 * 1024 * 1024,
  MIME_TYPES: ['image/jpeg', 'image/png']
};

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
}

export interface ImageUploadRef {
  reset: () => void;
}

const ImageUpload = forwardRef<ImageUploadRef, ImageUploadProps>(({ onImageUploaded }, ref) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const reset = () => {
    setPreview(null);
    setUploading(false);
    onImageUploaded('');
  };

  useImperativeHandle(ref, () => ({
    reset
  }));

  const processImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        const size = Math.min(width, height);
        const x = (width - size) / 2;
        const y = (height - size) / 2;

        canvas.width = IMAGE_CONFIG.MAX_SIZE;
        canvas.height = IMAGE_CONFIG.MAX_SIZE;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(
          img,
          x, y, size, size,
          0, 0, IMAGE_CONFIG.MAX_SIZE, IMAGE_CONFIG.MAX_SIZE
        );

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }
            resolve(new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            }));
          },
          'image/jpeg',
          IMAGE_CONFIG.QUALITY
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (!IMAGE_CONFIG.MIME_TYPES.includes(file.type)) {
        throw new Error('Unsupported file type');
      }

      if (file.size > IMAGE_CONFIG.MAX_FILE_SIZE) {
        throw new Error('File too large');
      }

      setUploading(true);
      const processedFile = await processImage(file);
      
      const timestamp = Date.now();
      const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.jpg`;

      const { data, error } = await supabase.storage
        .from('comment-images')
        .upload(fileName, processedFile, {
          contentType: 'image/jpeg'
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('comment-images')
        .getPublicUrl(data.path);

      setPreview(urlData.publicUrl);
      onImageUploaded(urlData.publicUrl);
    } catch (error) {
      console.error('Upload error:', error);
      alert('画像のアップロードに失敗しました');
      reset();
    } finally {
      setUploading(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  return (
    <div className="mt-2">
      {!preview ? (
        <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
          <div className="flex flex-col items-center">
            <Upload className={`w-6 h-6 ${uploading ? 'text-gray-300' : 'text-gray-400'}`} />
            <span className="mt-1 text-sm text-gray-500">
              {uploading ? 'アップロード中...' : '画像を追加'}
            </span>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/jpeg,image/png"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      ) : (
        <div className="relative">
          <img
            src={preview}
            alt="プレビュー"
            className="w-full h-40 object-cover rounded-lg"
          />
          <button
            onClick={reset}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
});

export default ImageUpload;