import React, { useState, useRef, useEffect } from 'react';
import { Send, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocationChat } from '../../hooks/useLocationChat';
import UserMentionInput from './UserMentionInput';
import ChatMessage from './ChatMessage';

const DEBUG = true;

const ChatRoom: React.FC<{ locationId: string; locationName: string }> = ({ 
  locationId, 
  locationName 
}) => {
  const { currentUser } = useAuth();
  const { messages, loading, sendMessage } = useLocationChat(locationId);
  const [content, setContent] = useState('');
  const [mentions, setMentions] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (DEBUG) console.log('📜 Messages updated:', messages.length);
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (DEBUG) console.log('⬇️ Scrolling to bottom');
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !content.trim() || isSending) return;

    if (DEBUG) console.log('🚀 Submitting message:', content);
    try {
      setIsSending(true);
      await sendMessage(content.trim(), mentions);
      if (DEBUG) console.log('✅ Message submitted successfully');
      setContent('');
      setMentions([]);
    } catch (error) {
      console.error('❌ Error submitting message:', error);
      alert('メッセージの送信に失敗しました');
    } finally {
      setIsSending(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="p-4 text-center text-gray-500">
        チャットに参加するにはログインが必要です
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-gray-50 rounded-lg shadow-lg">
      <div className="bg-green-600 text-white px-4 py-3 rounded-t-lg">
        <h2 className="text-lg font-bold">{locationName}のチャットルーム</h2>
        <p className="text-sm opacity-75">メッセージは4時間後に自動的に削除されます</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center text-gray-500">読み込み中...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500">
            まだメッセージはありません
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isOwnMessage={message.user_id === currentUser.id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-white rounded-b-lg border-t">
        <UserMentionInput
          value={content}
          onChange={setContent}
          onMentionsChange={setMentions}
          placeholder="メッセージを入力..."
          disabled={isSending}
        />
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center text-sm text-gray-500">
            <User className="w-4 h-4 mr-1" />
            <span>@で他のユーザーにメンション</span>
          </div>
          <button
            type="submit"
            disabled={isSending || !content.trim()}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Send className="w-4 h-4 mr-2" />
            送信
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatRoom;