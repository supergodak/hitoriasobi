import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Activity } from '../../types/Activity';
import { Tent, Building2, MapPin, Store } from 'lucide-react';

interface ActivityTimelineProps {
  activities: Activity[];
  loading?: boolean;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities, loading }) => {
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
          <div key={i} className="bg-gray-100 h-20 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (!activities.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        アクティビティがありません
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {activity.location?.type && getLocationIcon(activity.location.type)}
              <Link
                to={`/locations/${activity.location_id}`}
                className="ml-2 font-medium hover:text-green-600"
              >
                {activity.location?.name}
              </Link>
            </div>
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(activity.created_at), {
                addSuffix: true,
                locale: ja
              })}
            </span>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-600">
              {activity.is_anonymous ? '匿名ユーザー' : activity.user?.username} が
              チェックイン中
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityTimeline;