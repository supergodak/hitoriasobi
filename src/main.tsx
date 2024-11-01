import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

const DEBUG = import.meta.env.VITE_DEBUG === 'true';

if (DEBUG) {
  console.group('🚀 Application Initialization');
  console.log('Environment:', {
    DEBUG,
    NODE_ENV: import.meta.env.MODE,
    timestamp: new Date().toISOString()
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

if (DEBUG) console.log('✅ Root element found');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <App />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  </React.StrictMode>
);