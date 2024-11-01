export interface ChatMessage {
  id: string;
  location_id: string;
  user_id: string;
  content: string;
  mentions: string[];
  expires_at: string;
  created_at: string;
  user?: {
    username: string;
  };
}

export interface Notification {
  id: string;
  user_id: string;
  message_id: string;
  type: 'mention';
  is_read: boolean;
  created_at: string;
  message?: ChatMessage;
}