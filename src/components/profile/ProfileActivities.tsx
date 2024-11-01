import React from 'react';
import { Activity } from '../../types/Activity';
import ActivityTimeline from '../activities/ActivityTimeline';

interface ProfileActivitiesProps {
  userId: string;
  activities: Activity[];
  loading?: boolean;
}

const ProfileActivities: React.FC<ProfileActivitiesProps> = ({
  userId,
  activities,
  loading
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">アクティビティ履歴</h2>
      <ActivityTimeline
        activities={activities}
        loading={loading}
      />
    </div>
  );
};

export default ProfileActivities;