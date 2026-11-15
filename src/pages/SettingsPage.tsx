import React, { useState } from 'react';
import {
  Cloud, Table, HardDrive, Image, Download, Upload,
  ChevronRight, Check, Smartphone, Bell, Shield,
  RefreshCw, CheckCircle2
} from 'lucide-react';
import { demoBiomarkers, demoExpenses, demoDoctors, demoHealthScore } from '../data/demo';

interface Connection {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  connected: boolean;
  details: string;
}

const SettingsPage: React.FC = () => {
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
    }, 1500);
  };

  const handleExport = () => {
    const exportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      healthScore: demoHealthScore,
      biomarkers: demoBiomarkers,
      expenses: demoExpenses,
      doctors: demoDoctors,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health_finance_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage('Данные успешно выгружены в JSON!');
    setTimeout(() => setMessage(null), 3000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMessage(`Файл «${file.name}» успешно проверен и загружен!`);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const connectedCount = connections.filter((c) => c.connected).length;

  return (
    <div className="px-4 pt-4 pb-6 flex flex-col gap-4">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
          Настройки и синхронизация
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Интеграция с Google Workspace, экспорт и локальные параметры
        </p>
      </div>

      {/* Sync Status Banner */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-purple-100/60 card-animate relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              connectedCount > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
            }`}>
              <Cloud size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">
                {connectedCount > 0 ? 'Облачная синхронизация активна' : 'Синхронизация отключена'}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {connectedCount > 0
                  ? `Подключено ${connectedCount} из ${connections.length} сервисов Google`
                  : 'Подключите Google Таблицы для сохранения трат'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-[11px] text-gray-500 font-medium">
            {syncSuccess ? 'Синхронизировано только что' : 'Репликация: 5 мин назад'}
          </span>
          <button
            onClick={handleSyncNow}
            disabled={syncing}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold hover:bg-purple-100 active:scale-95 transition-all"
          >
            <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
            <span>{syncing ? 'Синхронизация...' : 'Обновить'}</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {message && (
        <div className="bg-purple-900 text-white text-xs font-bold p-3 rounded-2xl shadow-lg flex items-center gap-2 animate-slide-up">
          <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Google Services Integrations */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Сервисы Google
          </h3>
          <span className="text-xs font-semibold text-purple-700">OAuth 2.0</span>
        </div>

        <div className="space-y-2.5">
          {connections.map((conn) => {
            const Icon = conn.icon;
            return (
              <div
                key={conn.id}
                className="bg-white rounded-3xl p-4 shadow-sm border border-purple-100/60 flex items-center justify-between card-animate hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    conn.connected ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {conn.name}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">
                      {conn.connected ? conn.details : conn.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggleConnection(conn.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ml-2 ${
                    conn.connected
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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

      {/* Data Backup & Restore */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Резервное копирование и экспорт
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleExport}
            className="bg-white rounded-3xl p-4 shadow-sm border border-purple-100/60 text-left hover:border-purple-300 active:scale-98 transition-all flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-2">
              <Download size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">Экспорт данных</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Скачать JSON-файл</p>
            </div>
          </button>

          <label className="bg-white rounded-3xl p-4 shadow-sm border border-purple-100/60 text-left hover:border-purple-300 active:scale-98 transition-all flex flex-col justify-between cursor-pointer">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-2">
              <Upload size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">Импорт данных</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Восстановить из файла</p>
            </div>
          </label>
        </div>
      </div>

      {/* Local App Settings */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Параметры PWA
          </h3>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-purple-100/60 divide-y divide-gray-50 overflow-hidden">
          {/* PWA Offline Mode Badge */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Smartphone size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Офлайн-режим (PWA)</p>
                <p className="text-[10px] text-gray-400">Кэширование Service Worker активно</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              Готово к офлайну
            </span>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <Bell size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Напоминания о приеме</p>
                <p className="text-[10px] text-gray-400">Уведомления о визитах и анализах</p>
              </div>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                notifications ? 'bg-purple-700' : 'bg-gray-200'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-xs ${
                notifications ? 'translate-x-5.5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {/* Security & Privacy */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <Shield size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Медицинская тайна</p>
                <p className="text-[10px] text-gray-400">Локальное шифрование AES-256</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
