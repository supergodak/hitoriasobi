import React from 'react';
import ChatWindow from '../components/ChatWindow';

const Chat: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">隠れ家BAR あい</h2>
      <ChatWindow />
    </div>
  );
};

export default Chat;