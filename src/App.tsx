import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
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
