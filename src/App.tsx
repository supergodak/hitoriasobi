import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import MapPage from './pages/MapPage';
import LocationDetail from './pages/LocationDetail';
import TrendingPage from './pages/TrendingPage';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Guide from './pages/Guide';
import Profile from './pages/Profile';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';
import OfflineAlert from './components/OfflineAlert';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <div 
          className="fixed inset-0 pointer-events-none z-0 opacity-10"
          style={{
            backgroundImage: 'url(/sake-pattern.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        <OfflineAlert />
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/locations/:id" element={<LocationDetail />} />
            <Route path="/trending" element={<TrendingPage />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/guide" element={<Guide />} />
            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } 
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
};

export default App;