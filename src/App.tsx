import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Wifi, Battery } from 'lucide-react';
import BottomNav from './components/layout/BottomNav';
import DashboardPage from './pages/DashboardPage';
import AnalysesPage from './pages/AnalysesPage';
import FinancesPage from './pages/FinancesPage';
import SettingsPage from './pages/SettingsPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-[#f8fafc] text-gray-900 relative shadow-2xl mx-auto max-w-[390px] border-x border-purple-100/30">
        {/* iOS-style Status Bar matching healthcare_2.png */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-6 py-2.5 flex items-center justify-between text-xs font-bold text-gray-800 border-b border-gray-100/50">
          <span className="tracking-tight font-black text-[13px]">9:41</span>
          {/* Dynamic Island / speaker notch placeholder */}
          <div className="w-20 h-4 bg-gray-900 rounded-full" />
          <div className="flex items-center gap-1.5 text-gray-800">
            {/* Cellular signal bars */}
            <svg width="15" height="11" viewBox="0 0 17 11" fill="none">
              <rect x="0" y="8" width="2.5" height="3" rx="0.8" fill="currentColor" />
              <rect x="4" y="6" width="2.5" height="5" rx="0.8" fill="currentColor" />
              <rect x="8" y="3.5" width="2.5" height="7.5" rx="0.8" fill="currentColor" />
              <rect x="12" y="0.5" width="2.5" height="10.5" rx="0.8" fill="currentColor" />
            </svg>
            <Wifi size={14} strokeWidth={2.5} />
            <Battery size={16} strokeWidth={2.5} className="rotate-90" />
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto pb-24">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/analyses" element={<AnalysesPage />} />
            <Route path="/finances" element={<FinancesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Native Mobile Bottom Navigation */}
        <BottomNav />
      </div>
    </BrowserRouter>
  );
};

export default App;
