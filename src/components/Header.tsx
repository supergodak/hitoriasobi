import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, User, HelpCircle, Map, Wine } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './notifications/NotificationBell';

const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();

  return (
    <header className="bg-green-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold flex items-center">
            <Map className="mr-2" />
            ひとりあそび研究所
          </Link>
          <nav>
            <ul className="flex space-x-4 items-center">
              <li>
                <Link to="/guide" className="hover:text-green-200">
                  <HelpCircle className="inline-block mr-1" />
                  使い方
                </Link>
              </li>
              {currentUser ? (
                <>
                  <li>
                    <Link to="/map" className="hover:text-green-200">
                      <Map className="inline-block mr-1" />
                      マップ
                    </Link>
                  </li>
                  <li>
                    <Link to="/chat" className="hover:text-green-200">
                      <Wine className="inline-block mr-1" />
                      BAR あい
                    </Link>
                  </li>
                  <li>
                    <NotificationBell />
                  </li>
                  <li>
                    <Link to="/profile" className="hover:text-green-200">
                      <User className="inline-block mr-1" />
                      マイページ
                    </Link>
                  </li>
                  <li>
                    <button 
                      onClick={() => logout()}
                      className="flex items-center hover:text-green-200"
                    >
                      <LogOut className="inline-block mr-1" />
                      ログアウト
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Link to="/login" className="hover:text-green-200">
                    ログイン
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;