import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tent, Building2, MapPin, Store, Search } from 'lucide-react';
import { useTrendingLocations } from '../hooks/useTrendingLocations';

const TrendingStores: React.FC = () => {
  const { locations, loading, error, hasMore, loadMore } = useTrendingLocations();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.5 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [locations.length, hasMore, loading]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
        {error}
      </div>
    );
  }

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'camp': return <Tent className="w-5 h-5" />;
      case 'hotel': return <Building2 className="w-5 h-5" />;
      case 'spot': return <MapPin className="w-5 h-5" />;
      case 'shop': return <Store className="w-5 h-5" />;
      default: return <MapPin className="w-5 h-5" />;
    }
  };

  const getLocationTypeName = (type: string) => {
    switch (type) {
      case 'camp': return 'キャンプ場';
      case 'hotel': return '宿泊施設';
      case 'spot': return '観光地';
      case 'shop': return 'アウトドアショップ';
      default: return '場所';
    }
  };

  const getGoogleSearchUrl = (name: string, district?: string) => {
    const searchQuery = district ? `${name} ${district}` : name;
    return `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold flex items-center">
        <MapPin className="mr-2" />
        人気のスポット
      </h2>

      <div className="grid gap-4">
        {locations.map((location) => (
          <div
            key={location.id}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <Link
                  to={`/locations/${location.id}`}
                  className="text-lg font-bold hover:text-green-600 transition-colors flex items-center"
                >
                  {getLocationIcon(location.type)}
                  <span className="ml-2">{location.name}</span>
                </Link>
                <div className="text-sm text-gray-600 mt-1">
                  {getLocationTypeName(location.type)}
                  {location.district && (
                    <span className="ml-2">（{location.district}）</span>
                  )}
                </div>
              </div>
              <a
                href={getGoogleSearchUrl(location.name, location.district)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700"
                title="Google で検索"
              >
                <Search className="w-5 h-5" />
              </a>
            </div>

            {location.amenities && (
              <div className="mt-2 flex flex-wrap gap-2">
                {location.amenities.has_shower && (
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                    シャワー
                  </span>
                )}
                {location.amenities.has_power && (
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                    電源
                  </span>
                )}
                {location.amenities.has_parking && (
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                    駐車場
                  </span>
                )}
                {location.amenities.is_pet_friendly && (
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                    ペット可
                  </span>
                )}
                {location.amenities.has_wifi && (
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                    Wi-Fi
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
              <span className="flex items-center">
                アクティビティ {location.activity_count}件
              </span>
              <span className="flex items-center">
                いいね {location.like_count}件
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-center py-4">
            読み込み中...
          </div>
        )}

        {hasMore && <div ref={loadMoreRef} />}
      </div>
    </div>
  );
};

export default TrendingStores;