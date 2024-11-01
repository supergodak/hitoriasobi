import React, { useState, useEffect, useCallback } from 'react';
import { User, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../db/config';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface UserProfile {
  id: string;
  username: string;
  email: string | null;
  created_at: string;
}

const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editProfile, setEditProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (currentUser) {
      loadProfile();
    }
  }, [currentUser]);

  const loadProfile = async () => {
    if (currentUser) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            console.log('User profile not found, creating a new one');
            await createNewProfile();
          } else {
            throw error;
          }
        } else if (data) {
          const userProfile: UserProfile = {
            id: data.id,
            username: data.username,
            email: data.email,
            created_at: data.created_at
          };
          setProfile(userProfile);
          setEditProfile(userProfile);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setError('プロフィールの読み込みに失敗しました。');
      }
    }
  };

  const createNewProfile = async () => {
    if (currentUser) {
      try {
        const newProfile: UserProfile = {
          id: currentUser.id,
          username: currentUser.email?.split('@')[0] || 'user',
          email: currentUser.email || null,
          created_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('users')
          .insert([newProfile]);

        if (error) throw error;

        setProfile(newProfile);
        setEditProfile(newProfile);
      } catch (error) {
        console.error('Error creating new profile:', error);
        setError('新しいプロフィールの作成に失敗しました。');
      }
    }
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (editProfile) {
      setEditProfile(prev => prev ? { ...prev, [e.target.name]: e.target.value } : null);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editProfile && currentUser) {
      try {
        setLoading(true);
        const { error } = await supabase
          .from('users')
          .update({ username: editProfile.username })
          .eq('id', currentUser.id);

        if (error) throw error;
        setProfile(editProfile);
        setIsEditing(false);
        setError(null);
      } catch (err) {
        console.error('Error updating profile:', err);
        setError('プロフィールの更新に失敗しました。もう一度お試しください。');
      } finally {
        setLoading(false);
      }
    }
  };

  const startEditing = useCallback(() => {
    setEditProfile(profile);
    setIsEditing(true);
  }, [profile]);

  const cancelEditing = useCallback(() => {
    setEditProfile(profile);
    setIsEditing(false);
  }, [profile]);

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold mb-4">プロフィール</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-4 sm:px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
            <User className="inline-block mr-2" />
            ユーザー名
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="username"
            type="text"
            name="username"
            value={isEditing ? editProfile?.username || '' : profile.username || ''}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            <User className="inline-block mr-2" />
            メールアドレス
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            type="email"
            value={profile.email || ''}
            disabled
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="joinDate">
            <Calendar className="inline-block mr-2" />
            登録日
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="joinDate"
            type="text"
            value={profile.created_at ? new Date(profile.created_at).toLocaleDateString() : ''}
            disabled
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between">
          {isEditing ? (
            <>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-2 sm:mb-0 w-full sm:w-auto"
                type="submit"
                disabled={loading || !isOnline}
              >
                {loading ? '更新中...' : '保存'}
              </button>
              <button
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full sm:w-auto"
                type="button"
                onClick={cancelEditing}
              >
                キャンセル
              </button>
            </>
          ) : (
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full sm:w-auto"
              type="button"
              onClick={startEditing}
            >
              編集
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default Profile;