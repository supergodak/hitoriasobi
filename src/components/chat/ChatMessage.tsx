import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChatMessage as ChatMessageType } from '../../types/Chat';

interface ChatMessageProps {
  message: ChatMessageType;
  isOwnMessage: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isOwnMessage }) => {
  return (
    <div
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          isOwnMessage ? 'bg-green-100' : 'bg-white'
        } shadow`}
      >
        {!isOwnMessage && (
          <div className="font-medium text-sm text-gray-700 mb-1">
            {message.user?.username}
          </div>
        )}
        <p className="text-gray-800 break-words">{message.content}</p>
        <div className="text-xs text-gray-500 mt-1">
          {formatDistanceToNow(new Date(message.created_at), {
            addSuffix: true,
            locale: ja
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;