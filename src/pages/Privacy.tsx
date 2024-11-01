import React from 'react';
import { Shield } from 'lucide-react';

const Privacy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Shield className="w-8 h-8 mr-2 text-red-600" />
          プライバシーポリシー
        </h1>
        <img 
          src="https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=800&q=80"
          alt="プライバシーポリシー" 
          className="w-16 h-16 object-cover rounded-full shadow-md"
        />
      </div>
      
      <div className="prose prose-red max-w-none">
        <h2>1. 個人情報の収集</h2>
        <p>
          当サービスは、以下の個人情報を収集する場合があります：
        </p>
        <ul>
          <li>氏名</li>
          <li>メールアドレス</li>
          <li>プロフィール情報</li>
          <li>利用ログ等の情報</li>
        </ul>

        <h2>2. 個人情報の利用目的</h2>
        <p>
          収集した個人情報は、以下の目的で利用します：
        </p>
        <ul>
          <li>本サービスの提供・運営のため</li>
          <li>ユーザーサポートのため</li>
          <li>サービスの改善のため</li>
          <li>不正利用の防止のため</li>
        </ul>

        <h2>3. 個人情報の管理</h2>
        <p>
          当サービスは、個人情報の漏洩、滅失、き損の防止その他の個人情報の安全管理のために必要かつ適切な措置を講じます。
        </p>

        <h2>4. 個人情報の第三者提供</h2>
        <p>
          当サービスは、以下の場合を除き、個人情報を第三者に提供することはありません：
        </p>
        <ul>
          <li>ユーザーの同意がある場合</li>
          <li>法令に基づく場合</li>
          <li>人の生命、身体または財産の保護のために必要がある場合</li>
        </ul>

        <h2>5. プライバシーポリシーの変更</h2>
        <p>
          当サービスは、必要に応じて、本ポリシーを変更することがあります。
          変更後のプライバシーポリシーは、本ウェブサイトに掲載したときから効力を生じるものとします。
        </p>

        <h2>6. お問い合わせ</h2>
        <p>
          本ポリシーに関するお問い合わせは、当サービスの問い合わせフォームよりお願いいたします。
        </p>
      </div>
    </div>
  );
};

export default Privacy;