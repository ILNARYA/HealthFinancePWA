import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Wifi, Battery } from 'lucide-react';
import BottomNav from './components/layout/BottomNav';
import DashboardPage from './pages/DashboardPage';
import AnalysesPage from './pages/AnalysesPage';
import FinancesPage from './pages/FinancesPage';
import SettingsPage from './pages/SettingsPage';
import { ThemeProvider } from './context/ThemeContext';
import { FamilyProvider, useFamily } from './context/FamilyContext';
import { PinLockModal } from './components/security/PinLockModal';
import { PinSetupModal } from './components/security/PinSetupModal';
import { AuthPage } from './pages/AuthPage';

const AppContent: React.FC = () => {
  const { isAuthenticated, showPinSetupModal, closePinSetup } = useFamily();

  React.useEffect(() => {
    if ('serviceWorker' in navigator) {
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] dark:bg-[#0b0f19] text-gray-900 dark:text-white relative shadow-2xl mx-auto w-full max-w-[412px] overflow-x-hidden border-x border-purple-100/30 dark:border-purple-900/20 transition-colors">
      {/* iOS-style Status Bar with non-colliding Dynamic Island */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0b0f19]/90 backdrop-blur-md px-4 py-2 flex items-center justify-between text-xs font-bold text-gray-800 dark:text-gray-200 border-b border-gray-100/60 dark:border-gray-800/60 transition-colors w-full">
        <span className="tracking-tight font-black text-[13px] z-10">9:41</span>
        {/* Dynamic Island Pill cleanly centered */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1.5 w-20 h-4 bg-black dark:bg-[#1e2433] rounded-full pointer-events-none" />
        <div className="flex items-center gap-1.5 text-gray-800 dark:text-gray-200 z-10">
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
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24 w-full">
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

      {/* Secure PIN Lock Screen Modal (Triggered when locked) */}
      <PinLockModal />

      {/* PIN Code Setup Modal */}
      <PinSetupModal isOpen={showPinSetupModal} onClose={closePinSetup} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <FamilyProvider>
        <HashRouter>
          <AppContent />
        </HashRouter>
      </FamilyProvider>
    </ThemeProvider>
  );
};

export default App;
