import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { supabase } from '../../db/config';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  onAvatarUploaded: (url: string) => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatarUrl,
  onAvatarUploaded
}) => {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      onAvatarUploaded(data.publicUrl);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('アバターのアップロードに失敗しました');
    }
  }, [onAvatarUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxSize: 5242880, // 5MB
    multiple: false
  });

  const handleRemoveAvatar = () => {
    onAvatarUploaded('');
  };

  return (
    <div className="space-y-4">
      {currentAvatarUrl ? (
        <div className="relative inline-block">
          <img
            src={currentAvatarUrl}
            alt="アバター"
            className="w-32 h-32 rounded-full object-cover"
          />
          <button
            onClick={handleRemoveAvatar}
            className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-500'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            {isDragActive
              ? 'ドロップしてアップロード'
              : 'クリックまたはドラッグ＆ドロップでアップロード'}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            5MB以下のJPEG、PNG画像
          </p>
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;