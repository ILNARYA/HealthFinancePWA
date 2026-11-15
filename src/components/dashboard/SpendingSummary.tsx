import React from 'react';
import { TrendingUp, CreditCard, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Expense } from '../../types';

interface Props {
  expenses: Expense[];
  monthLabel: string;
}

const SpendingSummary: React.FC<Props> = ({ expenses, monthLabel }) => {
  const navigate = useNavigate();
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const doctorExpenses = expenses.filter((e) => e.category === 'doctor').reduce((s, e) => s + e.amount, 0);
  const analysisExpenses = expenses.filter((e) => e.category === 'analysis').reduce((s, e) => s + e.amount, 0);
  const medicineExpenses = expenses.filter((e) => e.category === 'medicine').reduce((s, e) => s + e.amount, 0);

  return (
    <div className="relative overflow-hidden rounded-3xl p-5 shadow-lg card-animate text-white bg-gradient-to-br from-purple-800 via-purple-700 to-indigo-900 dark:from-purple-950 dark:via-purple-900 dark:to-slate-950 border border-purple-400/25 dark:border-purple-500/30">
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-purple-400/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center">
              <CreditCard size={18} className="text-purple-200" />
            </div>
            <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">
              Медицинские траты
            </span>
          </div>
          <span className="text-[11px] font-bold bg-white/10 px-2.5 py-0.5 rounded-full text-purple-100">
            {monthLabel}
          </span>
        </div>

        <div className="flex items-baseline justify-between mb-1">
          <div className="text-3xl font-black tracking-tight">
            {totalAmount.toLocaleString('ru-RU')} ₽
          </div>
          <div className="flex items-center gap-1 text-emerald-300 text-xs font-bold bg-emerald-500/20 px-2 py-0.5 rounded-lg">
            <TrendingUp size={13} />
            <span>{expenses.length} операций</span>
          </div>
        </div>

        <p className="text-xs text-purple-200/90 mb-4 font-normal">
          Расходы на приёмы врачей, анализы и лечение за выбранный месяц
        </p>

        {/* Breakdown mini cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/10 rounded-2xl p-2.5 backdrop-blur-md border border-white/5">
            <p className="text-[10px] text-purple-200 font-medium mb-0.5">Врачи</p>
            <p className="text-xs font-bold">{doctorExpenses.toLocaleString('ru-RU')} ₽</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-2.5 backdrop-blur-md border border-white/5">
            <p className="text-[10px] text-purple-200 font-medium mb-0.5">Анализы</p>
            <p className="text-xs font-bold">{analysisExpenses.toLocaleString('ru-RU')} ₽</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-2.5 backdrop-blur-md border border-white/5">
            <p className="text-[10px] text-purple-200 font-medium mb-0.5">Препараты</p>
            <p className="text-xs font-bold">{medicineExpenses.toLocaleString('ru-RU')} ₽</p>
          </div>
        </div>

        {/* Action link */}
        <button
          onClick={() => navigate('/finances')}
          className="mt-4 w-full py-2.5 px-3 bg-white/15 hover:bg-white/25 active:scale-[0.99] transition-all rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 backdrop-blur-md text-white border border-white/10"
        >
          <span>Перейти в детализацию финансов</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default SpendingSummary;
