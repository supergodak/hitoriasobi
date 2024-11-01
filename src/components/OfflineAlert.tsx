import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { AlertTriangle } from 'lucide-react';

const OfflineAlert: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-100 border-b border-yellow-200 px-4 py-3" role="alert">
      <div className="flex items-center justify-center">
        <AlertTriangle className="text-yellow-600 mr-2" size={20} />
        <p className="font-medium text-yellow-700">
          オフラインモードです。一部の機能が制限されています。
        </p>
      </div>
    </div>
  );
};

export default OfflineAlert;