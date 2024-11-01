export interface UserProfile {
  id: string;
  username: string;
  email: string;
  preferred_activities: string[];
  bio?: string;
  avatar_url?: string;
  created_at: string;
}

export interface ProfileUpdateInput {
  username?: string;
  preferred_activities?: string[];
  bio?: string;
  avatar_url?: string;
}