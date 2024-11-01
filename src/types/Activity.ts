export interface Activity {
  id: string;
  location_id: string;
  user_id: string;
  activity_type: ActivityType;
  is_anonymous: boolean;
  expires_at: string;
  created_at: string;
  location?: Location;
  user?: {
    username: string;
  };
}

export type ActivityType = 'camp' | 'travel' | 'other';

export interface ActivityInput {
  location_id: string;
  activity_type: ActivityType;
  is_anonymous: boolean;
}