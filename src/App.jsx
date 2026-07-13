import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';

// Lazy load the pages
const Portfolio = React.lazy(() => import('./pages/Portfolio'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));

const App = () => {
  return (
    <div className="app-container">
      <Navigation />
      <main className="main-content">
        <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/portfolio" replace />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

export default App;
