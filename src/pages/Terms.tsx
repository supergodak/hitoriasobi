import React from 'react';
import { Scroll } from 'lucide-react';

const Terms: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Scroll className="w-8 h-8 mr-2 text-red-600" />
          利用規約
        </h1>
        <img 
          src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80"
          alt="利用規約" 
          className="w-16 h-16 object-cover rounded-full shadow-md"
        />
      </div>
      
      <div className="prose prose-red max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-bold text-red-600 border-b-2 border-red-200 pb-2 mb-4">第1条（適用）</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>この利用規約（以下「本規約」といいます。）は、本サービス（以下「当サービス」といいます。）の利用条件を定めるものです。</li>
            <li>当サービスを利用される方（以下「ユーザー」といいます。）は、本規約に同意したものとみなされます。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-bold text-red-600 border-b-2 border-red-200 pb-2 mb-4">第2条（利用登録）</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>当サービスにおいては、登録希望者が本規約に同意の上、定める方法によって利用登録を申請し、当社がこれを承認することで、利用登録が完了するものとします。</li>
            <li>当社は、利用登録の申請者が以下の事由に該当する場合、利用登録の申請を承認しないことがあります。
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li>利用登録の申請に虚偽の事項があった場合</li>
                <li>本規約に違反したことがある者からの申請である場合</li>
                <li>その他、当社が利用登録を適当でないと判断した場合</li>
              </ul>
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-bold text-red-600 border-b-2 border-red-200 pb-2 mb-4">第3条（禁止事項）</h2>
          <p>ユーザーは、当サービスの利用にあたり、以下の行為をしてはなりません。</p>
          <ul className="list-disc list-inside space-y-2 mt-4">
            <li>法令または公序良俗に違反する行為</li>
            <li>犯罪行為に関連する行為</li>
            <li>サーバーやネットワークの機能を破壊したり、妨害したりする行為</li>
            <li>当サービスの運営を妨害する行為</li>
            <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
            <li>他のユーザーに成りすます行為</li>
            <li>当サービスに関連して、反社会的勢力に利益を供与する行為</li>
            <li>その他、当社が不適切と判断する行為</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-red-600 border-b-2 border-red-200 pb-2 mb-4">第4条（広告表示について）</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>当サービスには、第三者による広告が表示される場合があります。ユーザーは、これらの広告の内容について一切の責任を当社が負わないことに同意します。</li>
            <li>当サービス上の広告に関連してユーザーが取引等を行う場合、その取引はユーザーと広告主との間で行われるものとし、当社はその取引に関して一切の責任を負いません。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-bold text-red-600 border-b-2 border-red-200 pb-2 mb-4">第5条（アフィリエイトリンクの利用について）</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>当サービス内には、アフィリエイトリンクを通じて第三者の商品・サービスを紹介することがあります。ユーザーが当サービス内のリンクを経由して第三者のサイトを利用した場合、その利用規約やプライバシーポリシーについては当該第三者の定めるものが適用されます。</li>
            <li>当サービスは、アフィリエイトリンクを通じて紹介する商品やサービスの内容およびそれらの提供者について保証を行うものではありません。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-bold text-red-600 border-b-2 border-red-200 pb-2 mb-4">第6条（利用制限および登録抹消）</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>当社は、ユーザーが以下のいずれかに該当する場合には、事前の通知なく、当該ユーザーに対して当サービスの全部もしくは一部の利用を制限し、またはユーザーとしての登録を抹消することができます。
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li>本規約のいずれかの条項に違反した場合</li>
                <li>その他、当社が当サービスの利用を適当でないと判断した場合</li>
              </ul>
            </li>
            <li>当社は、本条に基づき当社が行った行為によりユーザーに生じた損害について、一切の責任を負いません。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-bold text-red-600 border-b-2 border-red-200 pb-2 mb-4">第7条（退会）</h2>
          <p>ユーザーは、当社の定める退会手続により、当サービスから退会できるものとします。</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-red-600 border-b-2 border-red-200 pb-2 mb-4">第8条（保証の否認および免責事項）</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>当社は、当サービスに事実上または法律上の瑕疵がないこと（安全性、信頼性、正確性、完全性、有用性など）を明示的にも黙示的にも保証しておりません。</li>
            <li>当社は、当サービスに起因してユーザーに生じたあらゆる損害について一切の責任を負いません。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-bold text-red-600 border-b-2 border-red-200 pb-2 mb-4">第9条（サービス内容の変更等）</h2>
          <p>当社は、ユーザーに通知することなく、当サービスの内容を変更し、または提供を中止することができます。</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-red-600 border-b-2 border-red-200 pb-2 mb-4">第10条（利用規約の変更）</h2>
          <p>当社は、必要と判断した場合には、ユーザーに通知することなく、本規約を変更することができるものとします。</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-red-600 border-b-2 border-red-200 pb-2 mb-4">第11条（個人情報の取扱い）</h2>
          <p>当社は、当サービスの利用によって取得する個人情報については、当社「プライバシーポリシー」に従い適切に取り扱うものとします。</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-red-600 border-b-2 border-red-200 pb-2 mb-4">第12条（準拠法・裁判管轄）</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>本規約の解釈にあたっては、日本法を準拠法とします。</li>
            <li>当サービスに関して紛争が生じた場合には、当社の本社所在地を管轄する裁判所を専属的合意管轄とします。</li>
          </ol>
        </section>
      </div>
    </div>
  );
};

export default Terms;