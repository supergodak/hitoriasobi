import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Tent, Building2, MapPin, Store } from 'lucide-react';
import { CampLog } from '../types/CampLog';
import ImageGallery from './ImageGallery';
import CampLogComments from './comments/CampLogComments';

interface CampLogListProps {
  logs: CampLog[];
  loading?: boolean;
}

const CampLogList: React.FC<CampLogListProps> = ({ logs, loading }) => {
  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'camp': return <Tent className="w-5 h-5" />;
      case 'hotel': return <Building2 className="w-5 h-5" />;
      case 'spot': return <MapPin className="w-5 h-5" />;
      case 'shop': return <Store className="w-5 h-5" />;
      default: return <MapPin className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!logs.length) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
        キャンプログがありません
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {logs.map((log) => (
        <div key={log.id} className="bg-white rounded-lg shadow-md p-6">
          {log.location && (
            <Link
              to={`/locations/${log.location_id}`}
              className="flex items-center text-lg font-medium mb-2 hover:text-green-600"
            >
              {getLocationIcon(log.location.type)}
              <span className="ml-2">{log.location.name}</span>
              {log.location.district && (
                <span className="text-sm text-gray-600 ml-2">
                  （{log.location.district}）
                </span>
              )}
            </Link>
          )}

          <div className="text-sm text-gray-500 mb-4">
            {formatDistanceToNow(new Date(log.created_at), {
              addSuffix: true,
              locale: ja
            })}
          </div>

          {log.content && (
            <p className="text-gray-700 mb-4">{log.content}</p>
          )}

          {log.images && log.images.length > 0 && (
            <div className="mb-4">
              <ImageGallery images={log.images.map(img => img.image_url)} />
            </div>
          )}

          <div className="mt-6 pt-4 border-t">
            <CampLogComments campLogId={log.id} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default CampLogList;