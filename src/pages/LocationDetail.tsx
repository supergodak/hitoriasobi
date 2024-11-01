import React from 'react';
import { useParams } from 'react-router-dom';
import { useLocation } from '../hooks/useLocation';
import { Tent, Building2, MapPin, Store, MessageCircle } from 'lucide-react';
import LikeButton from '../components/LikeButton';
import Comments from '../components/Comments';
import ShareLocation from '../components/activities/ShareLocation';
import WeatherInfo from '../components/weather/WeatherInfo';
import AmenitiesList from '../components/locations/AmenitiesList';
import ChatRoom from '../components/chat/ChatRoom';

const LocationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { location, amenities, loading, error } = useLocation(id!);
  const [showChat, setShowChat] = React.useState(false);

  const getLocationIcon = () => {
    switch (location?.type) {
      case 'camp': return <Tent className="w-6 h-6" />;
      case 'hotel': return <Building2 className="w-6 h-6" />;
      case 'spot': return <MapPin className="w-6 h-6" />;
      case 'shop': return <Store className="w-6 h-6" />;
      default: return <MapPin className="w-6 h-6" />;
    }
  };

  const getLocationTypeName = () => {
    switch (location?.type) {
      case 'camp': return 'キャンプ場';
      case 'hotel': return '宿泊施設';
      case 'spot': return '観光地';
      case 'shop': return 'アウトドアショップ';
      default: return '場所';
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        </div>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          場所情報の取得に失敗しました
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold flex items-center">
              {getLocationIcon()}
              {location.name}
              {location.district && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  （{location.district}）
                </span>
              )}
            </h1>
            <div className="text-sm text-gray-600">
              {getLocationTypeName()}
            </div>
          </div>

          {location.latitude && location.longitude && (
            <div className="mb-4">
              <WeatherInfo
                latitude={location.latitude}
                longitude={location.longitude}
              />
            </div>
          )}

          {amenities && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">設備・サービス</h2>
              <AmenitiesList amenities={amenities} />
            </div>
          )}

          <div className="flex items-center space-x-4 mb-6">
            <LikeButton locationId={location.id} />
            <ShareLocation locationId={location.id} />
            <button
              onClick={() => setShowChat(!showChat)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              チャット
            </button>
          </div>

          {showChat ? (
            <div className="mb-6">
              <ChatRoom locationId={location.id} locationName={location.name} />
            </div>
          ) : (
            <div className="mt-6">
              <Comments locationId={location.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationDetail;