import React from 'react';
import { Link } from 'react-router-dom';
import { Map, Wine, Tent } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCampLogs } from '../hooks/useCampLogs';
import CampLogList from '../components/CampLogList';

const DEBUG = true;

const Home: React.FC = () => {
  if (DEBUG) console.log('🏠 Home page rendering');
  const { currentUser } = useAuth();
  const { logs, loading } = useCampLogs(currentUser?.id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/map"
            className="flex items-center justify-center p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Map className="mr-2" />
            マップ
          </Link>
          
          <Link
            to="/chat"
            className="flex items-center justify-center p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Wine className="mr-2" />
            BAR あい
          </Link>
          
          <Link
            to="/camp-logs"
            className="flex items-center justify-center p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Tent className="mr-2" />
            みんなのキャンプ
          </Link>
        </div>

        {currentUser && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Tent className="mr-2" />
              自分のキャンプログ
            </h2>
            <CampLogList logs={logs} loading={loading} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;