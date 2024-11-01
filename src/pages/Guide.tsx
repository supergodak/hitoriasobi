import React from 'react';
import { HelpCircle, Map, MessageCircle, Beer, Heart, Search, Navigation2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Guide: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <HelpCircle className="w-8 h-8 mr-2 text-red-600" />
          使い方ガイド
        </h1>
        <img 
          src="https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&w=800&q=80"
          alt="使い方ガイド" 
          className="w-16 h-16 object-cover rounded-full shadow-md"
        />
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-bold text-red-600 border-b-2 border-red-200 pb-2 mb-4">
            <Map className="inline-block mr-2" />
            場所を探す
          </h2>
          <div className="space-y-4">
            <p>地図上で近くの場所を探せます。</p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <span className="font-medium">場所の登録：</span>
                地図上をクリックして新しい場所を登録できます。
              </li>
              <li>
                <span className="font-medium">場所の検索：</span>
                <Navigation2 className="inline-block w-4 h-4 mx-1" />
                ボタンで現在地に移動、
                <Search className="inline-block w-4 h-4 mx-1" />
                ボタンで表示範囲内の場所を検索できます。
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-red-600 border-b-2 border-red-200 pb-2 mb-4">
            <MessageCircle className="inline-block mr-2" />
            隠れ家BAR あい
          </h2>
          <div className="space-y-4">
            <p>AIのバーテンダーとお酒の話ができます。</p>
            <ul className="list-disc list-inside space-y-2">
              <li>お酒やおつまみの相談</li>
              <li>バーでの思い出話</li>
              <li>お酒に関する質問や雑談</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-red-600 border-b-2 border-red-200 pb-2 mb-4">
            <Beer className="inline-block mr-2" />
            みんなの活動
          </h2>
          <div className="space-y-4">
            <p>みんなの活動が見られます。</p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <span className="font-medium">チェックイン：</span>
                <Beer className="inline-block w-4 h-4 mx-1" />
                ボタンで今いる場所を共有できます。
              </li>
              <li>
                <span className="font-medium">いいね：</span>
                <Heart className="inline-block w-4 h-4 mx-1" />
                ボタンで場所にいいねを付けられます。
              </li>
              <li>
                <span className="font-medium">コメント：</span>
                場所ページで感想やおすすめポイントを共有できます。
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-red-600 border-b-2 border-red-200 pb-2 mb-4">
            はじめかた
          </h2>
          <div className="space-y-4">
            <ol className="list-decimal list-inside space-y-2">
              <li>
                <Link to="/register" className="text-red-600 hover:text-red-500">
                  会員登録
                </Link>
                またはGoogleアカウントでログイン
              </li>
              <li>地図で行きたい場所を探す</li>
              <li>チェックインで今いる場所を共有</li>
              <li>コメントやいいねで情報を共有</li>
            </ol>
          </div>
        </section>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            ※ 場所情報は利用者の投稿によるものです。営業時間や設備など、実際の状況と異なる場合があります。
          </p>
        </div>
      </div>
    </div>
  );
};

export default Guide;