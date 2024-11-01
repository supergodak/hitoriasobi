export interface CampLog {
  id: string;
  user_id: string;
  location_id: string;
  content?: string;
  created_at: string;
  updated_at: string;
  location?: {
    name: string;
    type: string;
    district?: string;
  };
  user?: {
    username: string;
  };
  images?: CampLogImage[];
  comments?: CampLogComment[];
}

export interface CampLogImage {
  id: string;
  camp_log_id: string;
  image_url: string;
  created_by: string;
  created_at: string;
}

export interface CampLogComment {
  id: string;
  camp_log_id: string;
  user_id: string;
  content?: string;
  image_url?: string;
  created_at: string;
  user?: {
    username: string;
  };
}