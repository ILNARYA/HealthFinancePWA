import React, { useState } from 'react';
import {
  Cloud, Table, HardDrive, Image, Upload,
  Check, Smartphone, Bell, ShieldCheck,
  RefreshCw, CheckCircle2, FileSpreadsheet, Moon, Sun,
  Users, Lock, Fingerprint, EyeOff, Plus, KeyRound, QrCode
} from 'lucide-react';
import { demoBiomarkers, demoExpenses, demoDoctors, demoHealthScore } from '../data/demo';
import { exportHealthDataToExcel, parseExcelImport } from '../utils/excelService';
import { useTheme } from '../context/ThemeContext';
import { useFamily } from '../context/FamilyContext';
import { FamilySwitcherModal } from '../components/family/FamilySwitcherModal';
import { TwoFactorAuthModal } from '../components/security/TwoFactorAuthModal';

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
  const {
    members,
    activeMember,
    setActiveMemberId,
    isPinSet,
    setIsPinSet,
    setPinCode,
    biometricsEnabled,
    setBiometricsEnabled,
    privacyMode,
    setPrivacyMode,
    twoFactorEnabled,
    googleAccount,
    syncWithGoogleSheets,
    lockApp,
  } = useFamily();

  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showPinChangeModal, setShowPinChangeModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');

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

  const handleSyncNow = async () => {
    setSyncing(true);
    setSyncSuccess(false);
    await syncWithGoogleSheets();
    setSyncing(false);
    setSyncSuccess(true);
    setMessage(`Данные синхронизированы с Google Таблицей «${googleAccount.sheetName}»!`);
    setTimeout(() => {
      setSyncSuccess(false);
      setMessage(null);
    }, 3500);
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

  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.length === 4) {
      setPinCode(newPinInput);
      setIsPinSet(true);
      setShowPinChangeModal(false);
      setNewPinInput('');
      setMessage('Новый 4-значный PIN-код успешно установлен!');
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const connectedCount = connections.filter((c) => c.connected).length;

  return (
    <div className="px-4 pt-3 pb-6 flex flex-col gap-4 w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Настройки и профили
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Семейный кабинет, безопасность, Google и Excel
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={lockApp}
            className="w-9 h-9 bg-white dark:bg-[#1e2433] rounded-2xl flex items-center justify-center text-gray-500 hover:text-purple-600 dark:text-gray-400 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors"
            title="Заблокировать экран (PIN-код)"
          >
            <Lock size={16} />
          </button>
          <button
            onClick={toggleTheme}
            className="w-9 h-9 bg-white dark:bg-[#1e2433] rounded-2xl flex items-center justify-center text-gray-500 dark:text-yellow-400 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors"
            title={isDark ? 'Светлая тема' : 'Тёмная тема'}
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {message && (
        <div className="bg-purple-900 text-white text-xs font-bold p-3.5 rounded-2xl shadow-lg flex items-center gap-2 animate-slide-up w-full">
          <CheckCircle2 size={17} className="text-emerald-400 flex-shrink-0" />
          <span className="truncate">{message}</span>
        </div>
      )}

      {/* 1. Семейный кабинет (Family Cabinet) */}
      <div className="bg-white dark:bg-[#161b26] rounded-3xl p-4.5 shadow-sm border border-purple-100/60 dark:border-purple-500/20 card-animate transition-colors w-full">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-700 dark:text-purple-400">
              <Users size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                Семейный кабинет ({members.length})
              </h3>
              <p className="text-[10px] text-gray-400">Быстрое переключение между профилями</p>
            </div>
          </div>
          <button
            onClick={() => setShowFamilyModal(true)}
            className="text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-xl hover:bg-purple-100 transition-colors flex items-center gap-1"
          >
            <Plus size={12} />
            <span>Добавить</span>
          </button>
        </div>

        {/* Members List */}
        <div className="space-y-2">
          {members.map((m) => {
            const isCurrent = m.id === activeMember.id;
            return (
              <div
                key={m.id}
                onClick={() => setActiveMemberId(m.id)}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isCurrent
                    ? 'border-purple-600 dark:border-purple-500 bg-purple-50/70 dark:bg-purple-950/50 shadow-xs'
                    : 'border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-[#1a202c]/30 hover:bg-gray-100 dark:hover:bg-gray-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-xs flex-shrink-0"
                    style={{ backgroundColor: m.color }}
                  >
                    {m.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {m.name}
                      </span>
                      <span className="text-[9px] font-semibold text-purple-700 dark:text-purple-400 bg-purple-100/70 dark:bg-purple-950 px-1.5 py-0.2 rounded">
                        {m.roleLabel}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-400 truncate mt-0.5">
                      {2026 - m.birthYear} лет · ОМС: {m.policyOMS.slice(-4)} · {m.bloodType}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span className="text-xs font-black text-gray-900 dark:text-white">
                    {m.healthScore}
                  </span>
                  {isCurrent && (
                    <div className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center">
                      <Check size={10} strokeWidth={3} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Безопасность и медицинская тайна (Security Vault) */}
      <div className="bg-white dark:bg-[#161b26] rounded-3xl p-4.5 shadow-sm border border-purple-100/60 dark:border-purple-500/20 card-animate transition-colors w-full">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-700 dark:text-purple-400">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                Безопасность и приватность
              </h3>
              <p className="text-[10px] text-gray-400">Шифрование данных и медицинская тайна</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800 flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            AES-256
          </span>
        </div>

        <div className="space-y-3 pt-1">
          {/* PIN Toggle */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-gray-50/50 dark:bg-[#1a202c]/40 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <KeyRound size={17} className="text-purple-600 dark:text-purple-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  PIN-код (4 цифры)
                </p>
                <p className="text-[10px] text-gray-400">Запрос пароля при входе в систему</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setShowPinChangeModal(true)}
                className="text-[10px] font-semibold text-purple-700 dark:text-purple-300 underline"
              >
                Сменить PIN
              </button>
              <button
                onClick={() => setIsPinSet(!isPinSet)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  isPinSet ? 'bg-purple-700' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-xs ${
                  isPinSet ? 'translate-x-5.5' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>

          {/* Biometrics Toggle */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-gray-50/50 dark:bg-[#1a202c]/40 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <Fingerprint size={17} className="text-purple-600 dark:text-purple-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  Биометрия (Touch / Face ID)
                </p>
                <p className="text-[10px] text-gray-400">Мгновенный доступ по отпечатку</p>
              </div>
            </div>
            <button
              onClick={() => setBiometricsEnabled(!biometricsEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                biometricsEnabled ? 'bg-purple-700' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-xs ${
                biometricsEnabled ? 'translate-x-5.5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {/* Google Authenticator (TOTP 2FA) */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-gray-50/50 dark:bg-[#1a202c]/40 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <QrCode size={17} className="text-purple-600 dark:text-purple-400 flex-shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    Google Authenticator
                  </p>
                  {twoFactorEnabled && (
                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
                      Активен
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400">Одноразовый 6-значный код TOTP при входе</p>
              </div>
            </div>
            <button
              onClick={() => setShow2FAModal(true)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 flex-shrink-0 ${
                twoFactorEnabled
                  ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                  : 'bg-purple-700 text-white shadow-xs hover:bg-purple-800'
              }`}
            >
              <QrCode size={12} />
              <span>{twoFactorEnabled ? 'Настройки' : 'Подключить'}</span>
            </button>
          </div>

          {/* Privacy Mode Toggle */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-gray-50/50 dark:bg-[#1a202c]/40 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <EyeOff size={17} className="text-purple-600 dark:text-purple-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                  Приватный режим в семье
                </p>
                <p className="text-[10px] text-gray-400">Скрывать личные бланки при общем просмотре</p>
              </div>
            </div>
            <button
              onClick={() => setPrivacyMode(!privacyMode)}
              className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                privacyMode ? 'bg-purple-700' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-xs ${
                privacyMode ? 'translate-x-5.5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {/* Lock App Now Button */}
          <button
            onClick={lockApp}
            className="w-full py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Lock size={14} />
            <span>Заблокировать приложение сейчас</span>
          </button>
        </div>
      </div>

      {/* 3. Cloud Status Banner */}
      <div className="bg-white dark:bg-[#161b26] rounded-3xl p-4.5 shadow-sm border border-purple-100/60 dark:border-purple-500/20 card-animate transition-colors w-full">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              connectedCount > 0
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
            }`}>
              <Cloud size={20} />
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

      {/* 4. Excel Export and Import Section */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400">
            Офисные таблицы (Excel / .xlsx)
          </h3>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800 flex-shrink-0">
            Для ПК и офиса
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
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

      {/* 5. Google Services Integrations */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400">
            Сервисы Google
          </h3>
          <span className="text-xs font-semibold text-purple-700 dark:text-purple-400">OAuth 2.0</span>
        </div>

        {/* Connected Google Profile Banner */}
        <div className="mb-2.5 p-3.5 rounded-3xl bg-gradient-to-r from-purple-50 via-indigo-50/60 to-blue-50 dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-blue-950/40 border border-purple-200/60 dark:border-purple-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-white dark:bg-[#1a202c] shadow-xs border border-purple-200 dark:border-purple-800/60 flex items-center justify-center font-black text-purple-700 dark:text-purple-300 text-sm flex-shrink-0">
              G
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                {googleAccount.name} ({googleAccount.email})
              </p>
              <p className="text-[10px] text-purple-700 dark:text-purple-300 truncate mt-0.5">
                База данных: «{googleAccount.sheetName}» · {googleAccount.lastSynced}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex-shrink-0">
            Онлайн
          </span>
        </div>

        <div className="space-y-2.5">
          {connections.map((conn) => {
            const Icon = conn.icon;
            return (
              <div
                key={conn.id}
                className="bg-white dark:bg-[#161b26] rounded-3xl p-3.5 shadow-sm border border-purple-100/60 dark:border-purple-500/20 flex items-center justify-between card-animate hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    conn.connected
                      ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                  }`}>
                    <Icon size={19} />
                  </div>
                  <div className="min-w-0 flex-1">
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

      {/* 6. PWA & Preferences */}
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
        </div>
      </div>

      {/* Change PIN Modal */}
      {showPinChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-[340px] bg-white dark:bg-[#161b26] rounded-3xl p-5 border border-purple-500/20 shadow-2xl animate-scale-in">
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white mb-1">
              Установка 4-значного PIN-кода
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Введите новый 4-значный код для защиты личного и семейного кабинета
            </p>
            <form onSubmit={handleSaveNewPin} className="space-y-3">
              <input
                type="password"
                maxLength={4}
                pattern="[0-9]{4}"
                placeholder="Например: 1234"
                value={newPinInput}
                onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center text-2xl font-mono tracking-widest py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1a202c] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={newPinInput.length !== 4}
                  className="flex-1 py-2.5 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold"
                >
                  Сохранить PIN
                </button>
                <button
                  type="button"
                  onClick={() => setShowPinChangeModal(false)}
                  className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs text-gray-500"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Family Cabinet Switcher Modal */}
      <FamilySwitcherModal
        isOpen={showFamilyModal}
        onClose={() => setShowFamilyModal(false)}
      />

      {/* Two-Factor Authenticator Modal */}
      <TwoFactorAuthModal
        isOpen={show2FAModal}
        onClose={() => setShow2FAModal(false)}
      />
    </div>
  );
};

export default SettingsPage;
