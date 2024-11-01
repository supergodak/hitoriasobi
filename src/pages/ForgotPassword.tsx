import React, { useState } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isOnline = useOnlineStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    if (!isOnline) {
      setError('オフラインモードではパスワードリセットを実行できません。');
      setLoading(false);
      return;
    }

    try {
      // パスワードリセットのロジックをここに実装する
      // 例: await resetPassword(email);
      setMessage('パスワードリセットのメールを送信しました。メールをご確認ください。');
    } catch (error) {
      console.error('Password reset error:', error);
      setError('パスワードリセットに失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">パスワードをお忘れの方</h2>
      {message && <p className="text-green-500 mb-4">{message}</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            メールアドレス
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          disabled={loading || !isOnline}
        >
          {loading ? 'Processing...' : 'パスワードをリセット'}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;