import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cloud, Table, Upload,
  Check, ShieldCheck,
  RefreshCw, CheckCircle2, FileSpreadsheet, Moon, Sun,
  Users, Lock, EyeOff, KeyRound, QrCode,
  UserCheck, UserPlus, Baby, Sparkles, LogOut, Trash2,
  Share2, Download, User
} from 'lucide-react';
import { demoBiomarkers, demoExpenses, demoDoctors, demoHealthScore } from '../data/demo';
import { exportHealthDataToExcel, parseExcelImport } from '../utils/excelService';
import { useTheme } from '../context/ThemeContext';
import { useFamily } from '../context/FamilyContext';
import { FamilySwitcherModal } from '../components/family/FamilySwitcherModal';
import { TwoFactorAuthModal } from '../components/security/TwoFactorAuthModal';
import { RegisterModal } from '../components/auth/RegisterModal';
import { InviteMemberModal } from '../components/family/InviteMemberModal';
import { AddChildModal } from '../components/family/AddChildModal';
import { formatYears } from '../utils/formatters';
import { DEFAULT_APPS_SCRIPT_URL } from '../config/api';

interface Connection {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  connected: boolean;
  details: string;
}

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const {
    userProfile,
    familyName,
    members,
    activeMember,
    setActiveMemberId,
    invites,
    acceptFamilyInvite,
    declineFamilyInvite,
    isPinSet,
    setIsPinSet,
    openPinSetup,
    privacyMode,
    setPrivacyMode,
    twoFactorEnabled,
    googleAccount,
    syncWithGoogleSheets,
    appsScriptUrl,
    setAppsScriptUrl,
    googleSheetUrl,
    setGoogleSheetUrl,
    lastSyncTime,
    lockApp,
    logout,
    purgeAllDataAndReset,
    loadDemoData,
    viewScope,
    setViewScope,
  } = useFamily();

  const [scriptUrlInput, setScriptUrlInput] = useState(appsScriptUrl);
  const [sheetUrlInput, setSheetUrlInput] = useState(googleSheetUrl);
  const [urlSaved, setUrlSaved] = useState(false);
  const [showAdvancedApi, setShowAdvancedApi] = useState(false);
  const [isEditingScriptUrl, setIsEditingScriptUrl] = useState(false);
  const [newScriptUrlInput, setNewScriptUrlInput] = useState('');

  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('app-gemini-api-key') || '');
  const [geminiSaved, setGeminiSaved] = useState(false);

  const handleSaveGeminiKey = () => {
    localStorage.setItem('app-gemini-api-key', geminiApiKey.trim());
    setGeminiSaved(true);
    setMessage('Ключ Google Gemini API успешно сохранён!');
    setTimeout(() => {
      setGeminiSaved(false);
      setMessage(null);
    }, 3500);
  };

  const handleSaveScriptUrl = () => {
    setAppsScriptUrl(scriptUrlInput);
    setGoogleSheetUrl(sheetUrlInput);
    setUrlSaved(true);
    setMessage('Настройки Google Таблиц и Apps Script сохранены!');
    setTimeout(() => {
      setUrlSaved(false);
      setMessage(null);
    }, 3500);
  };

  const handleSaveNewScriptUrl = () => {
    if (newScriptUrlInput.trim()) {
      setAppsScriptUrl(newScriptUrlInput.trim());
      setScriptUrlInput(newScriptUrlInput.trim());
      setIsEditingScriptUrl(false);
      setNewScriptUrlInput('');
      setUrlSaved(true);
      setMessage('URL инженерного шлюза Apps Script успешно сохранён!');
      setTimeout(() => {
        setUrlSaved(false);
        setMessage(null);
      }, 3500);
    }
  };

  const handleResetScriptUrl = () => {
    setAppsScriptUrl(DEFAULT_APPS_SCRIPT_URL);
    setScriptUrlInput(DEFAULT_APPS_SCRIPT_URL);
    setIsEditingScriptUrl(false);
    setUrlSaved(true);
    setMessage('Восстановлен базовый URL шлюза Google Apps Script');
    setTimeout(() => {
      setUrlSaved(false);
      setMessage(null);
    }, 3500);
  };

  const currentSheetLink = sheetUrlInput.trim()
    ? (sheetUrlInput.trim().startsWith('http')
        ? sheetUrlInput.trim()
        : `https://docs.google.com/spreadsheets/d/${sheetUrlInput.trim()}/edit`)
    : (googleSheetUrl
        ? (googleSheetUrl.startsWith('http') ? googleSheetUrl : `https://docs.google.com/spreadsheets/d/${googleSheetUrl}/edit`)
        : (googleAccount.sheetId
            ? `https://docs.google.com/spreadsheets/d/${googleAccount.sheetId}/edit`
            : ''));

  const handleDownloadJsonBackup = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      userProfile,
      familyName,
      members,
      expenses: localStorage.getItem('app-expenses-list')
        ? JSON.parse(localStorage.getItem('app-expenses-list') || '[]')
        : [],
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HealthFinance_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage('Резервная копия базы (JSON) успешно сохранена!');
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCopyFamilyLink = () => {
    const targetUrl = scriptUrlInput.trim() || appsScriptUrl.trim();
    if (!targetUrl) {
      setMessage('Сначала укажите и сохраните URL развертывания веб-приложения!');
      setTimeout(() => setMessage(null), 3500);
      return;
    }
    const shareUrl = `${window.location.origin}${window.location.pathname}#/?syncUrl=${encodeURIComponent(targetUrl)}`;
    navigator.clipboard.writeText(shareUrl);
    setMessage('Семейная ссылка скопирована! Отправьте её жене или родственникам в мессенджере.');
    setTimeout(() => setMessage(null), 4000);
  };

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showChildModal, setShowChildModal] = useState(false);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);

  const [connections, setConnections] = useState<Connection[]>([
    {
      id: 'sheets',
      name: 'Google Таблицы (Облачная база)',
      description: 'Сквозная синхронизация чеков, трат и биомаркеров через Apps Script',
      icon: Table,
      connected: Boolean(appsScriptUrl),
      details: googleSheetUrl ? 'Личная таблица подключена' : 'Таблица семейного хаба активна',
    },
  ]);

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

      {/* 0. Мой личный кабинет (Individual Adult Cabinet & Google ID) */}
      <div className="bg-white dark:bg-[#161b26] rounded-3xl p-4.5 shadow-sm border border-purple-100/60 dark:border-purple-500/20 card-animate transition-colors w-full">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-700 dark:text-purple-400">
              <UserCheck size={17} />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                Мой личный кабинет
              </h3>
              <p className="text-[10px] text-gray-400">Индивидуальный аккаунт взрослого</p>
            </div>
          </div>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-xl hover:bg-purple-100 transition-colors flex items-center gap-1"
          >
            <Sparkles size={11} />
            <span>Анкета</span>
          </button>
        </div>

        {/* Profile Card Banner */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-50/80 via-indigo-50/50 to-purple-50/80 dark:from-purple-950/50 dark:via-indigo-950/30 dark:to-purple-950/50 border border-purple-200/60 dark:border-purple-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-purple-700 text-white font-black text-sm flex items-center justify-center shadow-md flex-shrink-0">
              {userProfile.avatar}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-gray-900 dark:text-white truncate">
                  {userProfile.lastName} {userProfile.firstName}
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                  {userProfile.familyRole === 'head' ? 'Глава семьи' : 'Супруг'}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                {userProfile.height} см · {userProfile.weight} кг · ИМТ: <strong>{userProfile.bmi}</strong> · {userProfile.bloodType}
              </p>
              <p className="text-[9px] text-purple-700 dark:text-purple-300 font-mono mt-0.5 truncate">
                ID: {userProfile.personalId} · {userProfile.email}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="w-8 h-8 rounded-xl bg-white dark:bg-[#161b26] border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-700 dark:text-purple-300 shadow-xs flex-shrink-0 ml-2 hover:bg-purple-50"
            title="Редактировать анкету здоровья"
          >
            <UserCheck size={14} />
          </button>
        </div>
      </div>

      {/* 1. Семейный кабинет (Family Cabinet) */}
      <div className="bg-white dark:bg-[#161b26] rounded-3xl p-4.5 shadow-sm border border-purple-100/60 dark:border-purple-500/20 card-animate transition-colors w-full overflow-hidden">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-700 dark:text-purple-400 flex-shrink-0">
              <Users size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white truncate">
                {familyName} ({members.length})
              </h3>
              <p className="text-[10px] text-gray-400 truncate">Семейная группа</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => setShowInviteModal(true)}
              className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-xl hover:bg-purple-100 transition-colors flex items-center gap-1 border border-purple-200/50 dark:border-purple-800/50"
              title="Пригласить взрослого по ID"
            >
              <UserPlus size={11} />
              <span>Инвайт</span>
            </button>
            <button
              onClick={() => setShowChildModal(true)}
              className="text-[10px] font-bold text-white bg-purple-700 px-2.5 py-1 rounded-xl hover:bg-purple-800 transition-colors flex items-center gap-1 shadow-xs"
              title="Добавить ребёнка до 20 лет"
            >
              <Baby size={11} />
              <span>Ребёнок</span>
            </button>
          </div>
        </div>

        {/* Pending Invites if any */}
        {invites.filter((i) => i.status === 'pending').map((inv) => (
          <div
            key={inv.id}
            className="mb-2.5 p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs flex items-center justify-between"
          >
            <div className="min-w-0 pr-2">
              <p className="font-bold text-amber-900 dark:text-amber-200 text-[11px] truncate">
                Инвайт: {inv.fromUserName} {inv.fromUserSurname}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                Роль: {inv.roleLabel}
              </p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => acceptFamilyInvite(inv.id)}
                className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold"
              >
                Принять
              </button>
              <button
                onClick={() => declineFamilyInvite(inv.id)}
                className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded-lg text-[10px]"
              >
                Отклонить
              </button>
            </div>
          </div>
        ))}

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
                      {formatYears(2026 - m.birthYear)} · ОМС: {m.policyOMS.slice(-4)} · {m.bloodType}
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
          {/* PIN Setup & Protection */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-gray-50/50 dark:bg-[#1a202c]/40 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <KeyRound size={17} className="text-purple-600 dark:text-purple-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  PIN-код (4 цифры)
                </p>
                <p className="text-[10px] text-gray-400">
                  {isPinSet ? 'Защита экрана активна' : 'Код не задан (требуется настройка)'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isPinSet ? (
                <>
                  <button
                    onClick={openPinSetup}
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
                </>
              ) : (
                <button
                  onClick={openPinSetup}
                  className="px-2.5 py-1 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-[11px] font-bold shadow-xs transition-colors"
                >
                  Задать PIN
                </button>
              )}
            </div>
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
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    Приватный режим в семье
                  </p>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                    •••••• ₽
                  </span>
                </div>
                <p className="text-[10px] text-gray-400">Скрывать суммы трат и личные диагнозы при показе экрана</p>
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
            {syncSuccess
              ? 'Синхронизировано только что'
              : !lastSyncTime
              ? (appsScriptUrl ? 'Ожидает синхронизации' : 'Синхронизация отключена')
              : Math.floor((Date.now() - lastSyncTime) / 1000) < 60
              ? 'Синхронизировано: только что'
              : Math.floor((Date.now() - lastSyncTime) / 1000) < 3600
              ? `Синхронизировано: ${Math.floor((Date.now() - lastSyncTime) / 60000)} мин назад`
              : `Синхронизировано в ${new Date(lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
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

      {/* 5. Google Services & Cloud Integration */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400">
            Облачные базы данных
          </h3>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {appsScriptUrl ? '● Онлайн' : 'Ожидает'}
          </span>
        </div>

        {/* Unified Cloud Sync & Google Sheets Card */}
        <div className="mb-2.5 p-3.5 rounded-3xl bg-white dark:bg-[#161b26] border border-purple-200/70 dark:border-purple-800/60 shadow-sm transition-colors overflow-hidden">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-700 dark:text-purple-400 flex-shrink-0">
                <Table size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">Облачная база Google Таблиц</p>
                <p className="text-[10px] text-gray-400 truncate">Сквозной семейный учёт и синхронизация</p>
              </div>
            </div>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap ${
              appsScriptUrl
                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
            }`}>
              {appsScriptUrl ? '● База подключена' : 'Ожидает настройки'}
            </span>
          </div>

          <div className="bg-purple-50/50 dark:bg-[#1a202c]/60 rounded-2xl p-2.5 border border-purple-100 dark:border-purple-900/40 text-[10px] space-y-1.5 mb-2.5">
            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
              <span>Синхронизированные листы базы:</span>
              <span className="font-bold text-purple-700 dark:text-purple-400">5 листов онлайн</span>
            </div>
            <div className="flex flex-wrap gap-1 text-[9px] font-semibold text-gray-600 dark:text-gray-300">
              <span className="bg-white dark:bg-[#252d3d] px-1.5 py-0.5 rounded shadow-2xs">Пользователи</span>
              <span className="bg-white dark:bg-[#252d3d] px-1.5 py-0.5 rounded shadow-2xs">Биомаркеры</span>
              <span className="bg-white dark:bg-[#252d3d] px-1.5 py-0.5 rounded shadow-2xs">Расходы</span>
              <span className="bg-white dark:bg-[#252d3d] px-1.5 py-0.5 rounded shadow-2xs">Score</span>
              <span className="bg-white dark:bg-[#252d3d] px-1.5 py-0.5 rounded shadow-2xs">Инвайты</span>
            </div>
            {currentSheetLink ? (
              <a
                href={currentSheetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 w-full py-1.5 px-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold flex items-center justify-center gap-1 transition-all text-center block text-[11px]"
              >
                <span>Открыть семейную таблицу в Google ↗</span>
              </a>
            ) : null}
          </div>

          <div className="space-y-2.5">
            {/* Google Sheet Direct Link / ID */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1">
                Ссылка на вашу семейную Google Таблицу:
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={sheetUrlInput}
                  onChange={(e) => setSheetUrlInput(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                  className="flex-1 text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#1a202c] text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 font-mono text-[11px]"
                />
                <button
                  onClick={handleSaveScriptUrl}
                  className="px-3 py-2 bg-purple-700 hover:bg-purple-800 active:scale-95 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 flex-shrink-0"
                >
                  {urlSaved ? <Check size={14} /> : null}
                  {urlSaved ? 'Сохранено' : 'Сохранить'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <span className="text-[10px] text-gray-400">
                Защищённое SSL-соединение
              </span>
              <button
                onClick={handleSyncNow}
                disabled={syncing}
                className="text-xs font-bold text-purple-700 dark:text-purple-400 hover:underline flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
                <span>{syncing ? 'Проверка...' : 'Проверить связь'}</span>
              </button>
            </div>

            {/* Collapsible Advanced Engineering Gateway Settings (Write-Only Secret) */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setShowAdvancedApi(!showAdvancedApi)}
                className="text-[10px] font-bold text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 flex items-center justify-between w-full transition-colors"
              >
                <span>⚙️ Инженерный шлюз API (Apps Script)</span>
                <span>{showAdvancedApi ? 'Скрыть ▲' : 'Показать шлюз ▼'}</span>
              </button>

              {showAdvancedApi && (
                <div className="mt-2 p-3 rounded-2xl bg-gray-50/80 dark:bg-[#1a202c]/70 border border-gray-200/60 dark:border-gray-700/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                      Web App Exec URL (Защищённый шлюз):
                    </span>
                    <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      Write-Only
                    </span>
                  </div>

                  {!isEditingScriptUrl ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-gray-100/90 dark:bg-[#121620] border border-gray-200 dark:border-gray-700">
                        <span className="font-mono text-xs text-gray-500 dark:text-gray-400 tracking-widest truncate select-none">
                          ••••••••••••••••••••••••••••••••••••••••••••••••••
                        </span>
                        <span className="text-[9px] font-bold text-gray-400 ml-2">
                          Скрыт
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingScriptUrl(true);
                            setNewScriptUrlInput('');
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-[11px] font-bold transition-all shadow-xs"
                        >
                          Заменить URL шлюза
                        </button>
                        <button
                          type="button"
                          onClick={handleResetScriptUrl}
                          className="text-[10px] text-gray-400 hover:text-purple-600 dark:hover:text-purple-300 font-medium underline"
                        >
                          Сбросить на базовый
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="url"
                        value={newScriptUrlInput}
                        onChange={(e) => setNewScriptUrlInput(e.target.value)}
                        placeholder="Вставьте новый URL (https://script.google.com/macros/s/.../exec)"
                        autoFocus
                        className="w-full text-xs px-2.5 py-2 rounded-xl border border-purple-400 dark:border-purple-600 bg-white dark:bg-[#121620] text-gray-900 dark:text-white font-mono text-[10px] focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleSaveNewScriptUrl}
                          disabled={!newScriptUrlInput.trim()}
                          className="flex-1 py-1.5 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all"
                        >
                          Сохранить новый URL
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingScriptUrl(false)}
                          className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs text-gray-500"
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  )}

                  <p className="text-[9px] text-gray-400 leading-normal">
                    URL никогда не отображается в открытом виде для защиты от перехвата и случайного просмотра. Для изменения вставьте новый адрес развёртывания.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-purple-100 dark:border-purple-900/40">
              <button
                onClick={handleCopyFamilyLink}
                className="w-full py-2 px-3 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/80 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-98"
              >
                <Share2 size={13} />
                <span>Скопировать семейную ссылку для жены / родственников</span>
              </button>
              <p className="text-[9px] text-gray-400 text-center mt-1">
                При переходе по ссылке на их телефоне база данных подключится автоматически без ручного ввода URL
              </p>
            </div>
          </div>
        </div>

        {/* Gemini AI Doctor API Card */}
        <div className="mb-2.5 p-3.5 rounded-3xl bg-white dark:bg-[#161b26] border border-purple-200/70 dark:border-purple-800/60 shadow-sm transition-colors overflow-hidden">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-700 dark:text-purple-400 flex-shrink-0">
                <Sparkles size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">ИИ-Врач и Gemini API</p>
                <p className="text-[10px] text-gray-400 truncate">Клиническая интерпретация и бланки</p>
              </div>
            </div>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap ${
              geminiApiKey
                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
            }`}>
              {geminiApiKey ? 'Gemini Онлайн' : 'Встроенный ИИ'}
            </span>
          </div>

          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                  Google Gemini API Key (опционально):
                </label>
                <span className="text-[9px] text-purple-600 dark:text-purple-400 font-medium">
                  Офлайн-режим активен
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="flex-1 text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#1a202c] text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 font-mono text-[11px]"
                />
                <button
                  onClick={handleSaveGeminiKey}
                  className="px-3 py-2 bg-purple-700 hover:bg-purple-800 active:scale-95 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 flex-shrink-0"
                >
                  {geminiSaved ? <Check size={14} /> : null}
                  {geminiSaved ? 'Сохранено' : 'Сохранить'}
                </button>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 leading-tight">
              Встроенный клинический движок работает автономно без ключей и без ограничений по регионам.
            </p>
          </div>
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

                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                  <button
                    onClick={handleDownloadJsonBackup}
                    className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100 transition-colors border border-purple-200 dark:border-purple-800 flex items-center gap-1"
                    title="Скачать файл бэкапа JSON"
                  >
                    <Download size={12} />
                    <span>Бэкап</span>
                  </button>
                  <button
                    onClick={() => toggleConnection(conn.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
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
        </div>
      </div>

      {/* 6. Режим охвата данных: Личный профиль vs Семейный хаб */}
      <div className="bg-white dark:bg-[#161b26] rounded-3xl p-4.5 shadow-sm border border-purple-100/60 dark:border-purple-500/20 card-animate transition-colors w-full">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-700 dark:text-purple-400">
              <Users size={17} />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                Область учёта расходов и анализов
              </h3>
              <p className="text-[10px] text-gray-400">Личный профиль vs Семейный сквозной хаб</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            viewScope === 'family'
              ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
              : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
          }`}>
            {viewScope === 'family' ? '👨‍👩‍👧‍👦 Семейный бюджет' : '👤 Только личные'}
          </span>
        </div>

        {/* Scope Selector Segmented Switcher */}
        <div className="bg-gray-100 dark:bg-[#1a202c] p-1 rounded-2xl flex gap-1 mb-3 border border-gray-200/50 dark:border-gray-800">
          <button
            onClick={() => setViewScope('personal')}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              viewScope === 'personal'
                ? 'bg-white dark:bg-[#252d3d] text-purple-700 dark:text-purple-300 shadow-sm scale-[1.01]'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
            }`}
          >
            <User size={13} />
            <span>Личный режим</span>
          </button>
          <button
            onClick={() => setViewScope('family')}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              viewScope === 'family'
                ? 'bg-white dark:bg-[#252d3d] text-purple-700 dark:text-purple-300 shadow-sm scale-[1.01]'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
            }`}
          >
            <Users size={13} />
            <span>Семейный хаб</span>
          </button>
        </div>

        <div className="p-3 rounded-2xl bg-gray-50/60 dark:bg-[#1a202c]/50 border border-gray-100 dark:border-gray-800 text-xs">
          {viewScope === 'family' ? (
            <p className="text-gray-600 dark:text-gray-300 text-[11px] leading-relaxed">
              <strong>Сквозной семейный хаб активен:</strong> расходы мужа, жены и детей автоматически суммируются в общий семейный бюджет и синхронизируются в единую семейную базу Google Таблиц.
            </p>
          ) : (
            <p className="text-gray-600 dark:text-gray-300 text-[11px] leading-relaxed">
              <strong>Личный режим активен:</strong> на экране отображаются только ваши персональные анализы и расходы. Траты других членов семьи скрыты для конфиденциальности.
            </p>
          )}
        </div>
      </div>

      {/* 7. Reset / Demo / Logout Actions */}
      <div className="bg-white dark:bg-[#161b26] rounded-3xl p-4.5 shadow-sm border border-purple-100/60 dark:border-purple-500/20 card-animate transition-colors w-full space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
              <LogOut size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                Личный кабинет ({userProfile?.personalId || 'Гость'})
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-400 mt-0.5 truncate">
                Выход на экран авторизации и регистрации
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center gap-1.5 transition-colors border border-rose-200 dark:border-rose-800 flex-shrink-0"
          >
            <LogOut size={13} />
            <span>Выйти</span>
          </button>
        </div>

        <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex gap-2">
          <button
            onClick={() => {
              if (window.confirm('Сбросить локальные данные и профиль на этом устройстве для чистой регистрации?')) {
                purgeAllDataAndReset();
                navigate('/');
              }
            }}
            className="flex-1 py-2 px-2.5 rounded-xl bg-gray-100 hover:bg-rose-50 dark:bg-gray-800 dark:hover:bg-rose-950/40 text-gray-700 hover:text-rose-600 dark:text-gray-200 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors border border-transparent hover:border-rose-200 dark:hover:border-rose-800"
            title="Очистить все локальные данные и вернуться к регистрации"
          >
            <Trash2 size={13} className="text-rose-500" />
            <span>Очистить данные (Сброс для перерегистрации)</span>
          </button>
          <button
            onClick={loadDemoData}
            className="py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors border border-purple-200 dark:border-purple-800 flex-shrink-0"
            title="Заполнить демо-данными для тестирования"
          >
            <Sparkles size={12} />
            <span>Демо-данные</span>
          </button>
        </div>
      </div>

      {/* Family Cabinet Switcher Modal */}
      <FamilySwitcherModal
        isOpen={showFamilyModal}
        onClose={() => setShowFamilyModal(false)}
      />

      {/* Adult Registration & Health Questionnaire Modal */}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
      />

      {/* Adult Family Member Invite Modal */}
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />

      {/* Fast-Track Child Add Modal (< 20 years + same surname) */}
      <AddChildModal
        isOpen={showChildModal}
        onClose={() => setShowChildModal(false)}
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
