import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Beer, MessageCircle, Heart, Search } from 'lucide-react';
import { supabase } from '../db/config';

interface IzakayaListProps {
  district: string | null;
}

interface Izakaya {
  id: string;
  name: string;
  smoking_status: string;
  comment_count: number;
  like_count: number;
}

const IzakayaList: React.FC<IzakayaListProps> = ({ district }) => {
  const [izakayas, setIzakayas] = useState<Izakaya[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIzakayas = async () => {
      if (!district) {
        setIzakayas([]);
        return;
      }

      try {
        setLoading(true);
        const { data, error: dbError } = await supabase.rpc('get_district_izakayas', {
          p_district: district
        });

        if (dbError) throw dbError;
        setIzakayas(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching izakayas:', err);
        setError('店舗データの取得に失敗しました');
        setIzakayas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchIzakayas();
  }, [district]);

  const getGoogleSearchUrl = (name: string) => {
    const searchQuery = `${name} ${district}`;
    return `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
  };

  if (!district) {
    return (
      <div className="text-center py-8 text-gray-500">
        地図上のエリアマーカーをクリックすると、そのエリアの酒場一覧が表示されます。
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        {error}
      </div>
    );
  }

  if (izakayas.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {district}に登録されている酒場はありません。
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <Beer className="mr-2" />
        {district}の酒場一覧
      </h2>

      <div className="space-y-4">
        {izakayas.map((izakaya) => (
          <div
            key={izakaya.id}
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <Link
                to={`/stores/${izakaya.id}`}
                className="text-lg font-bold hover:text-red-600 transition-colors"
              >
                {izakaya.name}
              </Link>
              <a
                href={getGoogleSearchUrl(izakaya.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700"
                title="Google で検索"
              >
                <Search className="w-5 h-5" />
              </a>
            </div>

            <div className="mt-2 text-sm text-gray-600">
              {izakaya.smoking_status === 'no_smoking' ? '禁煙' :
               izakaya.smoking_status === 'separated' ? '分煙' :
               izakaya.smoking_status === 'unknown' ? '不明' : '喫煙可'}
            </div>

            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center">
                <MessageCircle className="w-4 h-4 mr-1" />
                {izakaya.comment_count}
              </span>
              <span className="flex items-center">
                <Heart className="w-4 h-4 mr-1" />
                {izakaya.like_count}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IzakayaList;