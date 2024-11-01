import React, { useEffect } from 'react';

interface AdBannerProps {
  adSlot: string;
  format?: 'auto' | 'fluid';
}

const AdBanner: React.FC<AdBannerProps> = ({ adSlot, format = 'auto' }) => {
  useEffect(() => {
    try {
      // AdSenseの自動広告コードを再実行
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, [adSlot]);

  return (
    <div className="my-4">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="YOUR-AD-CLIENT-ID" // ここを実際のクライアントIDに置き換え
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdBanner;