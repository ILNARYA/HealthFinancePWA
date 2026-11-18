import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import HealthIndex from '../components/dashboard/HealthIndex';
import BiomarkerCard from '../components/dashboard/BiomarkerCard';
import SpendingSummary from '../components/dashboard/SpendingSummary';
import { monthsData, demoHealthTrend } from '../data/demo';
import { Activity, Sparkles, Moon, Sun, BarChart3, Lock, Users, EyeOff, Bot, FileUp, Receipt } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useFamily } from '../context/FamilyContext';
import { FamilySwitcherModal } from '../components/family/FamilySwitcherModal';
import { AiDoctorModal } from '../components/ai/AiDoctorModal';
import { ReceiptScannerModal } from '../components/finances/ReceiptScannerModal';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMonthId, setSelectedMonthId] = useState<string>('nov2026');
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showReceiptScanner, setShowReceiptScanner] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { activeMember, lockApp, isDemoMode, privacyMode, setPrivacyMode, viewScope, setViewScope } = useFamily();

  const isNewUser = !isDemoMode && activeMember.analysesCount === 0;

  const currentMonth = monthsData.find((m) => m.id === selectedMonthId) || monthsData[0];

  const monthPrefixes: Record<string, string> = {
    nov2026: '2026-11',
    oct2026: '2026-10',
    sep2026: '2026-09',
  };

  const currentMonthExpenses = React.useMemo(() => {
    let list: any[] = [];
    if (!isDemoMode) {
      try {
        const saved = localStorage.getItem('app-expenses-list');
        if (saved !== null) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const prefix = monthPrefixes[selectedMonthId] || '2026-11';
            list = parsed
              .filter((e: any) => !['e1','e2','e3','e4','e5','e6','e7','oe1','oe2','oe3','oe4','oe5','oe6','oe7','se1','se2','se3','se4','se5'].includes(e.id))
              .filter((e: any) => e.date?.startsWith(prefix));
          }
        }
      } catch {}
    } else {
      list = currentMonth.expenses;
    }

    if (viewScope === 'personal' && activeMember) {
      return list.filter((e: any) => !e.memberId || e.memberId === activeMember.id || e.memberName === activeMember.name);
    }
    return list;
  }, [isDemoMode, selectedMonthId, currentMonth.expenses, viewScope, activeMember]);

  const handleSaveScannedExpense = (exp: any) => {
    try {
      const saved = localStorage.getItem('app-expenses-list');
      const list = saved ? JSON.parse(saved) : [];
      const updated = [exp, ...list];
      localStorage.setItem('app-expenses-list', JSON.stringify(updated));
    } catch {}
    setShowReceiptScanner(false);
  };

  return (
    <div className="px-4 pt-3 pb-6 flex flex-col gap-4 w-full">
      {/* Top Header with Family Profile Switcher and Security Lock */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFamilyModal(true)}
          className="flex items-center gap-2.5 text-left group p-1 pr-2 rounded-2xl hover:bg-gray-100/70 dark:hover:bg-gray-800/60 transition-all min-w-0 flex-1 mr-1"
          title="Нажмите, чтобы открыть Семейный кабинет"
        >
          <div
            className="w-10 h-10 rounded-2xl text-white flex items-center justify-center font-black text-sm shadow-md flex-shrink-0"
            style={{ backgroundColor: activeMember.color }}
          >
            {activeMember.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
              Привет, {activeMember.name || 'Пользователь'}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-gray-400 dark:text-gray-400 font-medium flex-shrink-0">
                {activeMember.roleLabel}
              </span>
              {isNewUser ? (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[9px] font-bold border border-purple-200 dark:border-purple-800 flex-shrink-0">
                  Новый профиль
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold border border-emerald-200 dark:border-emerald-800 flex-shrink-0">
                  <Sparkles size={8} /> Норма
                </span>
              )}
            </div>
          </div>
        </button>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* View Scope Switcher: Личный vs Семейный */}
          <div className="flex items-center bg-gray-100/90 dark:bg-[#1e2433] p-0.5 rounded-xl border border-gray-200/50 dark:border-gray-800">
            <button
              onClick={() => setViewScope('personal')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                viewScope === 'personal'
                  ? 'bg-white dark:bg-[#2b3347] text-purple-700 dark:text-purple-300 shadow-xs'
                  : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
              title="Режим: Только мои личные расходы и анализы"
            >
              Мой
            </button>
            <button
              onClick={() => setViewScope('family')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                viewScope === 'family'
                  ? 'bg-white dark:bg-[#2b3347] text-purple-700 dark:text-purple-300 shadow-xs'
                  : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
              title="Режим: Общий семейный бюджет всей семьи"
            >
              Семья
            </button>
          </div>

          {/* Privacy Mode Quick Toggle Pill */}
          {privacyMode && (
            <button
              onClick={() => setPrivacyMode(false)}
              className="w-8 h-8 bg-purple-100 dark:bg-purple-950/80 rounded-xl flex items-center justify-center text-purple-700 dark:text-purple-300 shadow-xs border border-purple-300 dark:border-purple-800 transition-colors"
              title="Приватный режим включен. Нажмите, чтобы отключить"
            >
              <EyeOff size={15} />
            </button>
          )}

          {/* Quick Lock Button */}
          <button
            onClick={lockApp}
            className="w-8 h-8 bg-white dark:bg-[#1e2433] rounded-xl flex items-center justify-center text-gray-500 hover:text-purple-600 dark:text-gray-400 shadow-xs border border-gray-100 dark:border-gray-800 transition-colors"
            title="Заблокировать экран (PIN-код)"
          >
            <Lock size={15} />
          </button>
          {/* Dark Mode Quick Toggle */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 bg-white dark:bg-[#1e2433] rounded-xl flex items-center justify-center text-gray-500 dark:text-yellow-400 shadow-xs border border-gray-100 dark:border-gray-800 transition-colors"
            title={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>

      {/* Quick Access Action Hub */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => navigate('/analyses')}
          className="p-2.5 rounded-2xl bg-white dark:bg-[#161b26] border border-purple-100/60 dark:border-purple-500/20 shadow-xs flex flex-col items-center justify-center gap-1 active:scale-95 transition-all hover:border-purple-300 group"
          title="Загрузить лабораторный бланк (PDF / фото)"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center group-hover:scale-105 transition-transform">
            <FileUp size={16} />
          </div>
          <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">+ Анализ</span>
        </button>

        <button
          onClick={() => setShowReceiptScanner(true)}
          className="p-2.5 rounded-2xl bg-white dark:bg-[#161b26] border border-purple-100/60 dark:border-purple-500/20 shadow-xs flex flex-col items-center justify-center gap-1 active:scale-95 transition-all hover:border-purple-300 group"
          title="Сканировать или внести чек расхода"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Receipt size={16} />
          </div>
          <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">+ Чек</span>
        </button>

        <button
          onClick={() => setShowAiModal(true)}
          className="p-2.5 rounded-2xl bg-white dark:bg-[#161b26] border border-purple-100/60 dark:border-purple-500/20 shadow-xs flex flex-col items-center justify-center gap-1 active:scale-95 transition-all hover:border-purple-300 group"
          title="Консультация с ИИ-Врачом"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Bot size={16} />
          </div>
          <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">ИИ-Врач</span>
        </button>

        <button
          onClick={() => setShowFamilyModal(true)}
          className="p-2.5 rounded-2xl bg-white dark:bg-[#161b26] border border-purple-100/60 dark:border-purple-500/20 shadow-xs flex flex-col items-center justify-center gap-1 active:scale-95 transition-all hover:border-purple-300 group"
          title="Семейный профиль и роли"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Users size={16} />
          </div>
          <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">Семья</span>
        </button>
      </div>

      {/* Primary Visual Zone: Compact Health Radar with deep-link to detailed charts */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400">
              Оценка показателей здоровья
            </span>
            {isNewUser && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Ориентир норм
              </span>
            )}
          </div>

          <button
            onClick={() => navigate('/analyses?tab=charts')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80 transition-all active:scale-95 shadow-2xs"
            title="Открыть все графики и диапазоны на странице Анализы"
          >
            <BarChart3 size={12} />
            <span>Графика и свечи →</span>
          </button>
        </div>

        {isNewUser && (
          <div className="bg-purple-50/80 dark:bg-purple-950/40 p-2.5 rounded-2xl border border-purple-100 dark:border-purple-900/40 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse flex-shrink-0" />
              <p className="text-[11px] text-purple-900 dark:text-purple-200 font-medium leading-tight">
                Ориентир клинических норм. Загрузите PDF-бланк для расчёта.
              </p>
            </div>
            <button
              onClick={() => navigate('/analyses')}
              className="px-2.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-[10px] font-bold flex-shrink-0 transition-colors shadow-xs"
            >
              + Анализ
            </button>
          </div>
        )}

        {/* Compact Health Radar Widget */}
        <HealthIndex
          score={currentMonth.score}
          selectedMonthId={selectedMonthId}
          onMonthChange={setSelectedMonthId}
          availableMonths={monthsData.map((m) => ({ id: m.id, label: m.label }))}
          isEmpty={isNewUser}
        />
      </div>

      {/* Monthly Medical Finance Card */}
      <SpendingSummary
        expenses={currentMonthExpenses}
        monthLabel={currentMonth.label}
      />

      {/* Key Biomarkers of the selected month */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400">
              Показатели анализов крови ({currentMonth.label})
            </h3>
            <p className="text-[11px] text-gray-400 dark:text-gray-400">
              {isNewUser ? 'Ожидание первого медицинского бланка' : currentMonth.notes}
            </p>
          </div>
          {!isNewUser && (
            <span className="text-xs font-semibold text-purple-700 dark:text-purple-400">
              {currentMonth.biomarkers.length} пок.
            </span>
          )}
        </div>

        {isNewUser ? (
          <div className="bg-purple-50/40 dark:bg-[#161b26]/50 rounded-3xl p-5 border border-dashed border-purple-200 dark:border-purple-800/60 text-center">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-[260px] mx-auto">
              Биомаркеры появятся здесь после расшифровки вашего первого бланка анализов
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {currentMonth.biomarkers.map((bio) => (
              <BiomarkerCard key={bio.id} biomarker={bio} />
            ))}
          </div>
        )}
      </div>

      {/* 6-Month Trend Line Chart (Only shown when historical data exists) */}
      {!isNewUser && (
        <div className="bg-white dark:bg-[#161b26] rounded-3xl p-5 shadow-sm border border-purple-100/60 dark:border-purple-500/20 card-animate transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                Динамика индекса здоровья
              </h3>
              <p className="text-[11px] text-gray-400 dark:text-gray-400">За последние 6 месяцев (+8.8 п.)</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-700 dark:text-purple-400">
              <Activity size={18} />
            </div>
          </div>

          <div className="h-[140px] w-full overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={demoHealthTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-gray-800" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[76, 92]}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip
                  contentStyle={{
                    background: '#0f172a',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    padding: '6px 12px',
                  }}
                  formatter={(value: any) => [
                    typeof value === 'number' ? value.toFixed(1) : String(value ?? ''),
                    'Индекс',
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#7c3aed"
                  strokeWidth={3}
                  dot={{ fill: '#7c3aed', r: 4, strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 6, fill: '#7c3aed', stroke: '#ffffff', strokeWidth: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {/* Family Cabinet Switcher Modal */}
      <FamilySwitcherModal
        isOpen={showFamilyModal}
        onClose={() => setShowFamilyModal(false)}
      />

      {/* AI Doctor Modal */}
      <AiDoctorModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
      />

      {/* Quick Receipt Scanner Modal */}
      <ReceiptScannerModal
        isOpen={showReceiptScanner}
        onClose={() => setShowReceiptScanner(false)}
        onSaveExpense={handleSaveScannedExpense}
      />
    </div>
  );
};

export default DashboardPage;
