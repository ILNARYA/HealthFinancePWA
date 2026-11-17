import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector,
} from 'recharts';
import {
  Plus, Stethoscope, TestTube, Pill, HeartPulse, X,
  Trash2, Wallet, Moon, Sun, Filter, Lock, Users, Camera, EyeOff
} from 'lucide-react';
import { monthsData, demoDoctors, categoryLabels, categoryColors, allDemoExpenses } from '../data/demo';
import type { Expense } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useFamily } from '../context/FamilyContext';
import { FamilySwitcherModal } from '../components/family/FamilySwitcherModal';
import { ReceiptScannerModal } from '../components/finances/ReceiptScannerModal';

const categoryIcons: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  doctor: Stethoscope,
  analysis: TestTube,
  medicine: Pill,
  procedure: HeartPulse,
};

const monthPrefixes: Record<string, string> = {
  nov2026: '2026-11',
  oct2026: '2026-10',
  sep2026: '2026-09',
};

const FinancesPage: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { activeMember, lockApp, isDemoMode, privacyMode, setPrivacyMode } = useFamily();
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showReceiptScanner, setShowReceiptScanner] = useState(false);

  // Combine expenses across all months for state
  const [selectedMonth, setSelectedMonth] = useState<string>('nov2026');
  const [allExpenses, setAllExpenses] = useState<Expense[]>(() => {
    const isDemo = localStorage.getItem('app-is-demo') === 'true';
    const saved = localStorage.getItem('app-expenses-list');
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return isDemo ? allDemoExpenses : [];
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: 'doctor' as Expense['category'],
    title: '',
    amount: '',
    doctor: '',
    specialty: '',
  });

  const handleMonthChange = (monthId: string) => {
    setSelectedMonth(monthId);
    setSelectedCategory('all');
  };

  useEffect(() => {
    localStorage.setItem('app-expenses-list', JSON.stringify(allExpenses));
  }, [allExpenses]);

  const activePrefix = monthPrefixes[selectedMonth] || '2026-11';
  const expenses = allExpenses.filter((e) => e.date ? e.date.startsWith(activePrefix) : true);

  const filteredExpenses = selectedCategory === 'all'
    ? expenses
    : expenses.filter((e) => e.category === selectedCategory);

  const totalAmount = expenses.reduce((s, e) => s + e.amount, 0);

  // Pie chart data
  const categoryTotals = Object.keys(categoryLabels).map((cat) => {
    const val = expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0);
    const pct = totalAmount > 0 ? Math.round((val / totalAmount) * 100) : 0;
    return {
      key: cat,
      name: categoryLabels[cat],
      value: val,
      percentage: pct,
      color: categoryColors[cat],
    };
  }).filter((c) => c.value > 0);

  const activeCategoryObj = categoryTotals.find((c) => c.key === selectedCategory);

  const doctorsList = React.useMemo(() => {
    if (!isDemoMode) {
      const map = new Map<string, { id: string; name: string; specialty: string; visits: number; totalSpent: number; lastVisit: string; avatar: string }>();
      allExpenses.forEach((exp) => {
        if (exp.doctor) {
          const existing = map.get(exp.doctor) || {
            id: exp.doctor,
            name: exp.doctor,
            specialty: exp.specialty || 'Врач-специалист',
            visits: 0,
            totalSpent: 0,
            lastVisit: exp.date || '',
            avatar: '👨‍⚕️',
          };
          existing.visits += 1;
          existing.totalSpent += exp.amount;
          if (exp.date && exp.date > existing.lastVisit) {
            existing.lastVisit = exp.date;
          }
          map.set(exp.doctor, existing);
        }
      });
      return Array.from(map.values());
    }
    return demoDoctors;
  }, [isDemoMode, allExpenses]);

  // Custom shape that handles active sector pop-out (radial expansion + elevation glow)
  // Completely eliminates clipping or awkward stroke overlaps.
  const renderSectorShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props;
    const isSelected = selectedCategory === payload?.key;
    const isDimmed = selectedCategory !== 'all' && !isSelected;

    return (
      <g className="outline-none focus:outline-none">
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={isSelected ? innerRadius - 3 : innerRadius}
          outerRadius={isSelected ? outerRadius + 7 : outerRadius}
          cornerRadius={4}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={isDimmed ? 0.35 : 1}
          style={{
            filter: isSelected ? 'drop-shadow(0 6px 14px rgba(124, 58, 237, 0.45))' : 'none',
            outline: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        />
      </g>
    );
  };

  const handlePieClick = (data: any) => {
    const key = data?.payload?.key || data?.key;
    if (key) {
      setSelectedCategory(selectedCategory === key ? 'all' : key);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return;
    const nowIso = new Date().toISOString().split('T')[0];
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      category: formData.category,
      title: formData.title,
      amount: Number(formData.amount),
      date: nowIso,
      doctor: formData.doctor || undefined,
      specialty: formData.specialty || undefined,
    };
    setAllExpenses((prev) => [newExpense, ...prev]);
    if (nowIso.startsWith('2026-11')) setSelectedMonth('nov2026');
    else if (nowIso.startsWith('2026-10')) setSelectedMonth('oct2026');
    else if (nowIso.startsWith('2026-09')) setSelectedMonth('sep2026');

    setFormData({ category: 'doctor', title: '', amount: '', doctor: '', specialty: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setAllExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const currentMonthObj = monthsData.find((m) => m.id === selectedMonth) || monthsData[0];

  return (
    <div className="px-4 pt-3 pb-6 flex flex-col gap-4">
      {/* Header with Family Member & Security Lock */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => setShowFamilyModal(true)}
            className="flex items-center gap-2 p-1 pr-2.5 rounded-2xl bg-white dark:bg-[#1e2433] border border-purple-100 dark:border-purple-900/50 shadow-xs hover:border-purple-300 transition-all text-left group"
            title="Переключить профиль члена семьи"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-xs shadow-xs"
              style={{ backgroundColor: activeMember.color }}
            >
              {activeMember.avatar}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-black text-gray-900 dark:text-white truncate">
                  {activeMember.name}
                </span>
                <Users size={11} className="text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-[10px] text-gray-400 dark:text-gray-400 block truncate">
                {activeMember.roleLabel}
              </span>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {privacyMode && (
            <button
              onClick={() => setPrivacyMode(false)}
              className="w-9 h-9 bg-purple-100 dark:bg-purple-950/80 rounded-2xl flex items-center justify-center text-purple-700 dark:text-purple-300 shadow-xs border border-purple-300 dark:border-purple-800 transition-colors"
              title="Приватный режим включен. Нажмите, чтобы отключить"
            >
              <EyeOff size={16} />
            </button>
          )}
          <button
            onClick={() => setShowReceiptScanner(true)}
            className="w-9 h-9 bg-purple-100/90 dark:bg-purple-950/90 hover:bg-purple-200 text-purple-700 dark:text-purple-300 rounded-2xl flex items-center justify-center border border-purple-200 dark:border-purple-800 shadow-xs active:scale-95 transition-all"
            title="Сфотографировать чек (OCR)"
          >
            <Camera size={18} />
          </button>
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
          <button
            onClick={() => setShowForm(true)}
            className="w-9 h-9 bg-purple-700 hover:bg-purple-800 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25 active:scale-95 transition-all"
            title="Добавить расход вручную"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Month Filter Bar */}
      <div className="flex items-center justify-between bg-gray-100/80 dark:bg-[#1e2433] rounded-2xl p-1 border border-gray-200/50 dark:border-gray-700/50">
        {monthsData.map((m) => {
          const isSelected = selectedMonth === m.id;
          return (
            <button
              key={m.id}
              onClick={() => handleMonthChange(m.id)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                isSelected
                  ? 'bg-white dark:bg-[#2b3347] text-purple-700 dark:text-purple-300 shadow-sm scale-[1.02]'
                  : 'text-gray-400 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {m.label.split(' ')[0]}
            </button>
          );
        })}
      </div>

      {/* Main Gradient Spending Card */}
      <div className="relative overflow-hidden rounded-3xl p-5 shadow-lg card-animate text-white bg-gradient-to-br from-purple-800 via-purple-700 to-indigo-900 dark:from-purple-950 dark:via-purple-900 dark:to-slate-950 border border-purple-400/20 dark:border-purple-500/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Wallet size={16} className="text-purple-200" />
            <span className="text-xs font-semibold text-purple-200 uppercase tracking-wider">
              {currentMonthObj.label}
            </span>
          </div>
          <span className="text-[11px] font-bold bg-white/10 px-2 py-0.5 rounded-full text-purple-100">
            {expenses.length} операций
          </span>
        </div>

        <div className="text-4xl font-black tracking-tight mb-2">
          {totalAmount.toLocaleString('ru-RU')} ₽
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/10">
          <div>
            <p className="text-[10px] text-purple-200 font-medium">Консультации врачей</p>
            <p className="text-sm font-bold">
              {expenses.filter((e) => e.category === 'doctor').reduce((s, e) => s + e.amount, 0).toLocaleString('ru-RU')} ₽
            </p>
          </div>
          <div>
            <p className="text-[10px] text-purple-200 font-medium">Лабораторные анализы</p>
            <p className="text-sm font-bold">
              {expenses.filter((e) => e.category === 'analysis').reduce((s, e) => s + e.amount, 0).toLocaleString('ru-RU')} ₽
            </p>
          </div>
        </div>

        {/* Quick Camera Scan Action Button */}
        <div className="mt-3.5 pt-3 border-t border-white/10 flex gap-2">
          <button
            onClick={() => setShowReceiptScanner(true)}
            className="flex-1 py-2 px-3 bg-white/20 hover:bg-white/30 active:scale-98 transition-all rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 backdrop-blur-md text-white border border-white/20 shadow-sm"
          >
            <Camera size={14} className="text-purple-200" />
            <span>Сфотографировать чек (ИИ)</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="py-2 px-3 bg-white/10 hover:bg-white/20 active:scale-98 transition-all rounded-xl text-xs font-semibold flex items-center justify-center gap-1 text-purple-200 border border-white/10"
          >
            <Plus size={14} />
            <span>Вручную</span>
          </button>
        </div>
      </div>

      {/* Category Donut Chart with modern pop-out selection & center metrics */}
      <div className="bg-white dark:bg-[#161b26] rounded-3xl p-4.5 shadow-sm border border-purple-100/60 dark:border-purple-500/20 card-animate transition-colors">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
              Структура расходов
            </h3>
            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              Нажмите на сегмент бублика для фильтрации
            </p>
          </div>
          {selectedCategory !== 'all' ? (
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-[11px] font-bold text-purple-700 dark:text-purple-400 hover:underline flex items-center gap-1 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full"
            >
              <span>Сбросить</span>
              <X size={11} />
            </button>
          ) : (
            <span className="text-[11px] font-medium text-gray-400">{categoryTotals.length} категории</span>
          )}
        </div>

        {/* Donut Container with Centered Information Hole or Empty State */}
        {expenses.length === 0 ? (
          <div className="py-7 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2 border border-purple-100 dark:border-purple-900/40">
              <Wallet size={22} />
            </div>
            <p className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">
              Расходов за выбранный период нет
            </p>
            <p className="text-[11px] text-gray-400 dark:text-gray-400 max-w-[260px] mx-auto mb-3">
              Сфотографируйте первый чек (OCR) или внесите трату вручную
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowReceiptScanner(true)}
                className="py-1.5 px-3 bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <Camera size={13} />
                <span>Скан чека (ИИ)</span>
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="py-1.5 px-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold flex items-center gap-1 active:scale-95 transition-all"
              >
                <Plus size={13} />
                <span>Вручную</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="relative h-[180px] w-full flex items-center justify-center overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    shape={renderSectorShape}
                    data={categoryTotals}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={70}
                    paddingAngle={4}
                    cornerRadius={4}
                    dataKey="value"
                    onClick={handlePieClick}
                  >
                    {categoryTotals.map((entry) => (
                      <Cell
                        key={entry.key}
                        fill={entry.color}
                        stroke="none"
                        strokeWidth={0}
                        className="cursor-pointer outline-none focus:outline-none"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      typeof value === 'number' ? `${value.toLocaleString('ru-RU')} ₽` : String(value ?? ''),
                      name || 'Сумма',
                    ]}
                    contentStyle={{
                      background: '#0f172a',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#fff',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                      padding: '6px 12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Central Metric in Donut Hole */}
              <div
                onClick={() => setSelectedCategory('all')}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="flex flex-col items-center justify-center text-center p-1 cursor-pointer pointer-events-auto">
                  {activeCategoryObj ? (
                    <>
                      <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 truncate max-w-[100px] block leading-tight">
                        {activeCategoryObj.name}
                      </span>
                      <span className="text-xs font-black text-gray-900 dark:text-white leading-tight mt-0.5">
                        {privacyMode ? '•••••• ₽' : `${activeCategoryObj.value.toLocaleString('ru-RU')} ₽`}
                      </span>
                      <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                        {activeCategoryObj.percentage}%
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400">
                        Всего
                      </span>
                      <span className="text-xs font-black text-gray-900 dark:text-white leading-tight mt-0.5">
                        {privacyMode ? '•••••• ₽' : `${totalAmount.toLocaleString('ru-RU')} ₽`}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        100%
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Category Legend & Clickable Selectors */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              {categoryTotals.map((c) => {
                const isSelected = selectedCategory === c.key;
                return (
                  <div
                    key={c.name}
                    onClick={() => setSelectedCategory(isSelected ? 'all' : c.key)}
                    className={`flex flex-col gap-1 p-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-purple-50 dark:bg-purple-950/70 border-2 border-purple-600 dark:border-purple-400 shadow-xs scale-[1.02]'
                        : 'bg-gray-50/70 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-800/70 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: c.color }}
                      />
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                        {c.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 pl-3.5">
                      <span className="font-semibold text-purple-700 dark:text-purple-300">{c.percentage}%</span>
                      <span className="font-black text-gray-900 dark:text-white">
                        {privacyMode ? '•••••• ₽' : `${c.value.toLocaleString('ru-RU')} ₽`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Doctors Directory */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400">
            Мои врачи и клиники
          </h3>
          <span className="text-xs font-semibold text-purple-700 dark:text-purple-400">
            {doctorsList.length} {doctorsList.length === 1 ? 'специалист' : (doctorsList.length >= 2 && doctorsList.length <= 4 ? 'специалиста' : 'специалистов')}
          </span>
        </div>

        {doctorsList.length === 0 ? (
          <div className="p-4 rounded-3xl bg-white dark:bg-[#161b26] border border-purple-100/60 dark:border-purple-500/20 text-center text-xs text-gray-400 shadow-sm">
            Врачи и клиники будут сохраняться здесь автоматически при добавлении медицинских расходов и чеков
          </div>
        ) : (
          <div className="space-y-2.5">
            {doctorsList.map((doc) => (
              <div
                key={doc.id}
                className="bg-white dark:bg-[#161b26] rounded-3xl p-3.5 shadow-sm border border-purple-100/60 dark:border-purple-500/20 flex items-center gap-3 card-animate hover:shadow-md transition-all"
              >
                <div className="w-11 h-11 bg-purple-50 dark:bg-purple-950/60 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 border border-purple-100 dark:border-purple-900/50">
                  {doc.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    {doc.name}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 dark:text-gray-400 mt-0.5">
                    <span className="text-purple-700 dark:text-purple-400 font-semibold">{doc.specialty}</span>
                    <span>•</span>
                    <span>{doc.visits} {doc.visits === 1 ? 'визит' : (doc.visits >= 2 && doc.visits <= 4 ? 'визита' : 'визитов')}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-black text-gray-900 dark:text-white">
                    {privacyMode ? '•••••• ₽' : `${doc.totalSpent.toLocaleString('ru-RU')} ₽`}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-400">
                    {doc.lastVisit}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expenses History List */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400">
            История операций ({filteredExpenses.length})
          </h3>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-xs font-semibold text-purple-700 dark:text-purple-400 underline flex items-center gap-1"
            >
              <Filter size={12} />
              <span>Показать все</span>
            </button>
          )}
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="p-4 rounded-2xl bg-gray-50/60 dark:bg-[#1a202c]/40 border border-gray-100 dark:border-gray-800 text-center text-xs text-gray-400">
            Нет добавленных операций за выбранный период
          </div>
        ) : (
          <div className="space-y-2">
            {filteredExpenses.map((exp) => {
              const Icon = categoryIcons[exp.category] || Stethoscope;
              return (
                <div
                  key={exp.id}
                  className="bg-white dark:bg-[#161b26] rounded-2xl p-3 shadow-sm border border-purple-100/50 dark:border-purple-500/20 flex items-center gap-3 card-animate group hover:border-purple-200 transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${categoryColors[exp.category]}18` }}
                  >
                    <Icon size={18} style={{ color: categoryColors[exp.category] }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      {exp.title}
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-400 truncate">
                      {exp.date} {exp.doctor ? `· ${exp.doctor}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-gray-900 dark:text-white whitespace-nowrap">
                      {privacyMode ? '−•••••• ₽' : `−${exp.amount.toLocaleString('ru-RU')} ₽`}
                    </span>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-rose-500 transition-opacity"
                      title="Удалить"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-[390px] bg-white dark:bg-[#161b26] rounded-t-3xl p-6 animate-slide-up shadow-2xl border-t border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                Новый медицинский чек
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Категория</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(Object.keys(categoryLabels) as Expense['category'][]).map((cat) => {
                    const Icon = categoryIcons[cat] || Stethoscope;
                    const isSelected = formData.category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat })}
                        className={`flex flex-col items-center gap-1 p-2 rounded-2xl border text-[10px] font-semibold transition-all ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 shadow-xs'
                            : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <Icon size={16} />
                        <span className="truncate w-full text-center">{categoryLabels[cat]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">Название услуги или препарата</label>
                <input
                  type="text"
                  placeholder="Например: Биохимия крови"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a202c] text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">Сумма (₽)</label>
                <input
                  type="number"
                  placeholder="3 200"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a202c] text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">Врач или медицинский центр</label>
                <input
                  type="text"
                  placeholder="Инвитро / Д-р Иванов"
                  value={formData.doctor}
                  onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a202c] text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white rounded-2xl font-bold text-xs shadow-lg shadow-purple-500/25 active:scale-98 transition-all mt-2"
              >
                Сохранить расход
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Receipt Camera & OCR Scanner Modal */}
      <ReceiptScannerModal
        isOpen={showReceiptScanner}
        onClose={() => setShowReceiptScanner(false)}
        onSaveExpense={(newExp) => {
          setAllExpenses((prev) => [newExp, ...prev]);
          if (newExp.date?.startsWith('2026-11')) setSelectedMonth('nov2026');
          else if (newExp.date?.startsWith('2026-10')) setSelectedMonth('oct2026');
          else if (newExp.date?.startsWith('2026-09')) setSelectedMonth('sep2026');
        }}
      />

      {/* Family Cabinet Switcher Modal */}
      <FamilySwitcherModal
        isOpen={showFamilyModal}
        onClose={() => setShowFamilyModal(false)}
      />
    </div>
  );
};

export default FinancesPage;
