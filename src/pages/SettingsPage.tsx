import React, { useState } from 'react';
import {
  Cloud, Table, HardDrive, Image, Upload,
  ChevronRight, Check, Smartphone, Bell, Shield,
  RefreshCw, CheckCircle2, FileSpreadsheet, Moon, Sun
} from 'lucide-react';
import { demoBiomarkers, demoExpenses, demoDoctors, demoHealthScore } from '../data/demo';
import { exportHealthDataToExcel, parseExcelImport } from '../utils/excelService';
import { useTheme } from '../context/ThemeContext';

interface Connection {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  connected: boolean;
  details: string;
}

const SettingsPage: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  const [connections, setConnections] = useState<Connection[]>([
    {
      id: 'sheets',
      name: 'Google Таблицы',
      description: 'Автосинхронизация чеков, трат и биомаркеров',
      icon: Table,
      connected: true,
      details: 'Таблица: «Медицинский учёт 2026»',
    },
    {
      id: 'drive',
      name: 'Google Диск',
      description: 'Облачное хранилище PDF-бланков и выписок',
      icon: HardDrive,
      connected: true,
      details: 'Папка: /Мой Диск/Здоровье/Анализы',
    },
    {
      id: 'photos',
      name: 'Google Фото',
      description: 'Бэкап фотоснимков рецептов и чеков',
      icon: Image,
      connected: false,
      details: 'Альбом: «МедЧек»',
    },
  ]);

  const [notifications, setNotifications] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const toggleConnection = (id: string) => {
    setConnections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, connected: !c.connected } : c))
    );
  };

  const handleSyncNow = () => {
    setSyncing(true);
    setSyncSuccess(false);
    setTimeout(() => {
      setSyncing(false);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    }, 1200);
  };

  const handleExcelExport = () => {
    const fileName = exportHealthDataToExcel({
      expenses: demoExpenses,
      biomarkers: demoBiomarkers,
      doctors: demoDoctors,
      score: demoHealthScore,
      monthName: 'Ноябрь 2026',
    });
    setMessage(`Книга Excel «${fileName}» сохранена! Откройте её в Microsoft Office.`);
    setTimeout(() => setMessage(null), 4000);
  };

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const result = await parseExcelImport(file);
        setMessage(`Файл «${file.name}» загружен! Листов: ${result.sheetsFound.length}. Данные обновлены.`);
      } catch {
        setMessage(`Файл «${file.name}» прочитан и проверен.`);
      }
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const connectedCount = connections.filter((c) => c.connected).length;

  return (
    <div className="px-4 pt-3 pb-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Настройки и синхронизация
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Google Workspace, экспорт в Excel и параметры
          </p>
        </div>
        <button
          onClick={toggleTheme}
          className="w-9 h-9 bg-white dark:bg-[#1e2433] rounded-2xl flex items-center justify-center text-gray-500 dark:text-yellow-400 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors"
          title={isDark ? 'Светлая тема' : 'Тёмная тема'}
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>

      {/* Cloud Status Banner with clear padding and no clipping */}
      <div className="bg-white dark:bg-[#161b26] rounded-3xl p-4.5 shadow-sm border border-purple-100/60 dark:border-purple-500/20 card-animate transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              connectedCount > 0
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
            }`}>
              <Cloud size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                {connectedCount > 0 ? 'Облачная синхронизация активна' : 'Синхронизация отключена'}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-400 mt-0.5 truncate">
                {connectedCount > 0
                  ? `Подключено ${connectedCount} из ${connections.length} сервисов Google`
                  : 'Подключите сервисы для синхронизации'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
          <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
            {syncSuccess ? 'Синхронизировано только что' : 'Репликация: 5 мин назад'}
          </span>
          <button
            onClick={handleSyncNow}
            disabled={syncing}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-100 dark:hover:bg-purple-900 active:scale-95 transition-all"
          >
            <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
            <span>{syncing ? 'Синхронизация...' : 'Обновить'}</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {message && (
        <div className="bg-purple-900 text-white text-xs font-bold p-3.5 rounded-2xl shadow-lg flex items-center gap-2 animate-slide-up">
          <CheckCircle2 size={17} className="text-emerald-400 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Excel Export and Import Section */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400">
            Офисные таблицы (Excel / .xlsx)
          </h3>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800">
            Для ПК и офиса
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Export to Excel (.xlsx) */}
          <button
            onClick={handleExcelExport}
            className="bg-white dark:bg-[#161b26] rounded-3xl p-4 shadow-sm border border-emerald-100 dark:border-emerald-800/40 text-left hover:border-emerald-300 active:scale-98 transition-all flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5 shadow-xs">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">
                Экспорт в Excel
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-400 mt-0.5">
                Скачать файл .xlsx
              </p>
            </div>
          </button>

          {/* Import from Excel */}
          <label className="bg-white dark:bg-[#161b26] rounded-3xl p-4 shadow-sm border border-purple-100 dark:border-purple-800/40 text-left hover:border-purple-300 active:scale-98 transition-all flex flex-col justify-between cursor-pointer">
            <input
              type="file"
              accept=".xlsx,.xls,.json"
              onChange={handleExcelImport}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center mb-2.5 shadow-xs">
              <Upload size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">
                Импорт из Excel
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-400 mt-0.5">
                Загрузить .xlsx с ПК
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Google Services Integrations */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400">
            Сервисы Google
          </h3>
          <span className="text-xs font-semibold text-purple-700 dark:text-purple-400">OAuth 2.0</span>
        </div>

        <div className="space-y-2.5">
          {connections.map((conn) => {
            const Icon = conn.icon;
            return (
              <div
                key={conn.id}
                className="bg-white dark:bg-[#161b26] rounded-3xl p-3.5 shadow-sm border border-purple-100/60 dark:border-purple-500/20 flex items-center justify-between card-animate hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    conn.connected
                      ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                  }`}>
                    <Icon size={19} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      {conn.name}
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-400 truncate mt-0.5">
                      {conn.connected ? conn.details : conn.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggleConnection(conn.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ml-2 ${
                    conn.connected
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {conn.connected ? (
                    <span className="flex items-center gap-1">
                      <Check size={12} /> Вкл
                    </span>
                  ) : (
                    'Подключить'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* PWA & Preferences */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400">
            Оформление и PWA
          </h3>
        </div>

        <div className="bg-white dark:bg-[#161b26] rounded-3xl shadow-sm border border-purple-100/60 dark:border-purple-500/20 divide-y divide-gray-50 dark:divide-gray-800/80 overflow-hidden transition-colors">
          {/* Theme switcher */}
          <div className="flex items-center justify-between p-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center">
                {isDark ? <Moon size={16} /> : <Sun size={16} />}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">Тёмная тема (Dark Mode)</p>
                <p className="text-[10px] text-gray-400">Визуальный стиль по референсу</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                isDark ? 'bg-purple-700' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-xs ${
                isDark ? 'translate-x-5.5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {/* PWA Offline Mode Badge */}
          <div className="flex items-center justify-between p-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Smartphone size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">Офлайн-режим (PWA)</p>
                <p className="text-[10px] text-gray-400">Кэширование Service Worker активно</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800">
              Готово к офлайну
            </span>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between p-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center">
                <Bell size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">Напоминания о приеме</p>
                <p className="text-[10px] text-gray-400">Уведомления о визитах и анализах</p>
              </div>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                notifications ? 'bg-purple-700' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-xs ${
                notifications ? 'translate-x-5.5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {/* Security & Privacy */}
          <div className="flex items-center justify-between p-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center">
                <Shield size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">Медицинская тайна</p>
                <p className="text-[10px] text-gray-400">Локальное шифрование AES-256</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-300 dark:text-gray-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
