import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import DashboardView from './components/views/DashboardView';
import PredictWaitView from './components/views/PredictWaitView';
import FutureForecastView from './components/views/FutureForecastView';
import RecommendationsView from './components/views/RecommendationsView';
import QueueAnalyticsView from './components/views/QueueAnalyticsView';
import AdminView from './components/views/AdminView';
import { checkBackendHealth } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('Central Service Hub - Desk A');
  const [backendOnline, setBackendOnline] = useState(true);
  const [lastPrediction, setLastPrediction] = useState({
    people_waiting: 23,
    predicted_waiting_time: 47,
    active_counters: 2,
    congestion: { level: 'High', color: '#ef4444' }
  });

  // Dark/Light Theme state with localStorage persistence
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('queueai_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('queueai_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Monitor backend connection health
  useEffect(() => {
    async function verify() {
      const isUp = await checkBackendHealth();
      setBackendOnline(isUp);
    }
    verify();
    const interval = setInterval(verify, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-layout">
      {/* SaaS Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Container */}
      <div className="main-wrapper">
        {/* Topbar */}
        <Topbar
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          theme={theme}
          onToggleTheme={toggleTheme}
          backendOnline={backendOnline}
          currentLocation={currentLocation}
          onChangeLocation={setCurrentLocation}
        />

        {/* Page Content View Router */}
        <main className="page-content">
          {activeTab === 'dashboard' && (
            <DashboardView 
              onNavigate={setActiveTab} 
              currentPrediction={lastPrediction} 
            />
          )}

          {activeTab === 'predict' && (
            <PredictWaitView 
              onPredictionUpdated={setLastPrediction} 
              onNavigate={setActiveTab} 
            />
          )}

          {activeTab === 'forecast' && (
            <FutureForecastView 
              onNavigate={setActiveTab} 
            />
          )}

          {activeTab === 'analytics' && (
            <QueueAnalyticsView />
          )}

          {activeTab === 'recommendations' && (
            <RecommendationsView 
              onNavigate={setActiveTab} 
            />
          )}

          {activeTab === 'admin' && (
            <AdminView />
          )}
        </main>
      </div>
    </div>
  );
}
