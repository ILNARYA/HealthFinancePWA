import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileSearch, Wallet, Settings2 } from 'lucide-react';

const tabs = [
  { path: '/', label: 'Дашборд', icon: LayoutDashboard },
  { path: '/analyses', label: 'Анализы', icon: FileSearch },
  { path: '/finances', label: 'Финансы', icon: Wallet },
  { path: '/settings', label: 'Настройки', icon: Settings2 },
];

const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[412px] bg-white/95 dark:bg-[#161b26]/95 backdrop-blur-xl border-t border-purple-100/80 dark:border-purple-900/40 z-40 transition-colors">
      <div className="flex items-center justify-around pt-2 pb-1 px-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 min-w-[70px] ${
                isActive
                  ? 'text-purple-700 dark:text-purple-400 font-bold'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${
                isActive ? 'bg-purple-100/80 dark:bg-purple-950/80 scale-105' : ''
              }`}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
      {/* iOS Home Indicator */}
      <div className="w-32 h-1 bg-gray-300/80 dark:bg-gray-700 rounded-full mx-auto mb-1.5" />
    </nav>
  );
};

export default BottomNav;
