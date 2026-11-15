import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import BottomNav from './components/layout/BottomNav';
import DashboardPage from './pages/DashboardPage';
import AnalysesPage from './pages/AnalysesPage';
import FinancesPage from './pages/FinancesPage';
import SettingsPage from './pages/SettingsPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-white relative overflow-hidden">
        <main className="flex-1 overflow-y-auto pb-20">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/analyses" element={<AnalysesPage />} />
            <Route path="/finances" element={<FinancesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
};

export default App;
