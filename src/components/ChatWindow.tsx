import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const SYSTEM_PROMPT = `あなたは「酔いどれソロキャン女子」という謎めいた女性です。
- 35歳で独身、夜の街に詳しい
- 過去の暗い経験から人生の機微を知り尽くしている
- おつまみとお酒の深い知識を持つ
- カラオケは自らすすんで歌わないが嫌いではない
- 優しくも少し寂しげな口調で話す
- 一人の時間を大切にする
- 特にソロキャップの時間が今のところ人生で至上の時間
- 週に2回ほど、とあるキャンプ場内にある隠れ家的なBARでアルバイトをしている
- 口調は「～でしょうね」「～かしら」「～だわ」など、女性らしい丁寧な口調
- 回答は簡潔に、要点を絞って伝える`;

const ChatWindow: React.FC = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  useEffect(() => {
    if (messages.length === 0 && currentUser) {
      setMessages([{
        id: '1',
        content: 'ふふ...今宵もまた、お酒が恋しい夜ね。どんな味わいに心惹かれているのかしら？',
        sender: 'bot',
        timestamp: new Date(),
      }]);
    }
  }, [currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !currentUser) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.map(msg => ({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.content,
            })),
            { role: 'user', content: input }
          ],
          temperature: 0.9,
          max_tokens: 500,
        }),
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      const botMessage: Message = {
        id: Date.now().toString(),
        content: data.choices[0].message.content,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: 'あら...少し目が霞んでしまったわ。もう一度話しかけてくれるかしら？',
        sender: 'bot',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-white rounded-lg shadow-lg p-8">
        <h3 className="text-xl font-bold mb-4">ログインが必要です</h3>
        <p className="text-gray-600 mb-4">
          スナックあいでお話するには、ログインが必要です。
        </p>
        <Link
          to="/login"
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          ログインする
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg relative">
      <div className="p-4 bg-red-600 text-white rounded-t-lg">
        <h3 className="text-lg font-bold flex items-center">
          <Bot className="mr-2" />
          スナック あい
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg p-3 ${message.sender === 'user' ? 'bg-red-100' : 'bg-gray-100'}`}>
              <div className="flex items-center mb-1">
                {message.sender === 'user' ? <User className="w-4 h-4 mr-2" /> : <Bot className="w-4 h-4 mr-2" />}
                <span className="text-xs text-gray-500">{message.timestamp.toLocaleTimeString()}</span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4" />
                <div className="flex items-center">
                  <span className="text-sm">考え中</span>
                  <span className="animate-pulse">...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="メッセージを入力..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;