import React, { useState } from 'react';
import {
  Cloud, CloudOff, Table, HardDrive, Image, Download, Upload,
  ChevronRight, Check, Moon, Sun, Smartphone, Bell, Lock, Info,
} from 'lucide-react';

interface Connection {
  id: string;
  name: string;
  description: string;
  icon: React.FC<{ size?: number; className?: string }>;
  connected: boolean;
}

const SettingsPage: React.FC = () => {
  const [connections, setConnections] = useState<Connection[]>([
    {
      id: 'sheets',
      name: 'Google Sheets',
      description: 'Хранение таблицы трат и показателей',
      icon: Table,
      connected: false,
    },
    {
      id: 'drive',
      name: 'Google Drive',
      description: 'Хранение сканов анализов',
      icon: HardDrive,
      connected: false,
    },
    {
      id: 'photos',
      name: 'Google Photos',
      description: 'Бэкап фотографий анализов',
      icon: Image,
      connected: false,
    },
  ]);

  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const toggleConnection = (id: string) => {
    setConnections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, connected: !c.connected } : c))
    );
  };

  const connectedCount = connections.filter((c) => c.connected).length;

  return (
    <div className="px-4 pt-12 pb-4 space-y-4">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-xl font-bold text-gray-900">Настройки</h1>
        <p className="text-xs text-gray-500">Синхронизация и управление данными</p>
      </div>

      {/* Sync Status */}
      <div className={`rounded-2xl p-4 shadow-sm border card-animate ${
        connectedCount > 0
          ? 'bg-green-50 border-green-200'
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center gap-3">
          {connectedCount > 0 ? (
            <Cloud size={24} className="text-green-600" />
          ) : (
            <CloudOff size={24} className="text-gray-400" />
          )}
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {connectedCount > 0
                ? `Подключено ${connectedCount} из ${connections.length} сервисов`
                : 'Нет подключённых сервисов'}
            </p>
            <p className="text-xs text-gray-500">
              {connectedCount > 0 ? 'Данные синхронизируются' : 'Подключите сервисы для синхронизации'}
            </p>
          </div>
        </div>
      </div>

      {/* Google Connections */}
      <h3 className="text-sm font-semibold text-gray-800">Подключения</h3>
      <div className="space-y-2">
        {connections.map((conn) => {
          const Icon = conn.icon;
          return (
            <div
              key={conn.id}
              className="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100 flex items-center gap-3 card-animate"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                conn.connected ? 'bg-purple-100' : 'bg-gray-100'
              }`}>
                <Icon size={20} className={conn.connected ? 'text-purple-600' : 'text-gray-400'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{conn.name}</p>
                <p className="text-[10px] text-gray-400">{conn.description}</p>
              </div>
              <button
                onClick={() => toggleConnection(conn.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  conn.connected
                    ? 'bg-purple-700 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {conn.connected ? (
                  <span className="flex items-center gap-1"><Check size={12} /> Подключено</span>
                ) : (
                  'Подключить'
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Export/Import */}
      <h3 className="text-sm font-semibold text-gray-800">Данные</h3>
      <div className="space-y-2">
        <button className="w-full bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100 flex items-center gap-3 card-animate hover:bg-gray-50 transition-colors">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <Download size={20} className="text-green-600" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-gray-900">Экспорт данных</p>
            <p className="text-[10px] text-gray-400">Скачать все данные в формате JSON</p>
          </div>
          <ChevronRight size={16} className="text-gray-300" />
        </button>

        <button className="w-full bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100 flex items-center gap-3 card-animate hover:bg-gray-50 transition-colors">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Upload size={20} className="text-blue-600" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-gray-900">Импорт данных</p>
            <p className="text-[10px] text-gray-400">Загрузить данные из JSON-файла</p>
          </div>
          <ChevronRight size={16} className="text-gray-300" />
        </button>
      </div>

      {/* Preferences */}
      <h3 className="text-sm font-semibold text-gray-800">Настройки приложения</h3>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50 card-animate">
        {/* Dark Mode */}
        <div className="flex items-center justify-between p-3.5">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon size={18} className="text-purple-600" /> : <Sun size={18} className="text-amber-500" />}
            <span className="text-sm text-gray-900">Тёмная тема</span>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              darkMode ? 'bg-purple-600' : 'bg-gray-200'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${
              darkMode ? 'translate-x-5.5' : 'translate-x-0.5'
            }`} />
          </button>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between p-3.5">
          <div className="flex items-center gap-3">
            <Bell size={18} className="text-purple-600" />
            <span className="text-sm text-gray-900">Уведомления</span>
          </div>
          <button
            onClick={() => setNotifications(!notifications)}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              notifications ? 'bg-purple-600' : 'bg-gray-200'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${
              notifications ? 'translate-x-5.5' : 'translate-x-0.5'
            }`} />
          </button>
        </div>

        {/* Security */}
        <div className="flex items-center justify-between p-3.5">
          <div className="flex items-center gap-3">
            <Lock size={18} className="text-gray-400" />
            <span className="text-sm text-gray-900">Безопасность</span>
          </div>
          <ChevronRight size={16} className="text-gray-300" />
        </div>

        {/* About */}
        <div className="flex items-center justify-between p-3.5">
          <div className="flex items-center gap-3">
            <Info size={18} className="text-gray-400" />
            <span className="text-sm text-gray-900">О приложении</span>
          </div>
          <span className="text-xs text-gray-400">v1.0.0</span>
        </div>
      </div>

      {/* Device Info */}
      <div className="bg-gray-50 rounded-2xl p-4 card-animate">
        <div className="flex items-center gap-2 mb-2">
          <Smartphone size={16} className="text-gray-400" />
          <span className="text-xs font-medium text-gray-500">Информация об устройстве</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400">
          <div>Локальных записей: <span className="text-gray-600 font-medium">8</span></div>
          <div>Анализов загружено: <span className="text-gray-600 font-medium">3</span></div>
          <div>Последний бэкап: <span className="text-gray-600 font-medium">—</span></div>
          <div>Размер данных: <span className="text-gray-600 font-medium">2.4 МБ</span></div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
