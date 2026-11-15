import React from 'react';
import { TrendingUp, CreditCard } from 'lucide-react';
import type { Expense } from '../../types';

interface Props {
  expenses: Expense[];
}

const SpendingSummary: React.FC<Props> = ({ expenses }) => {
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const doctorExpenses = expenses.filter((e) => e.category === 'doctor').reduce((s, e) => s + e.amount, 0);
  const analysisExpenses = expenses.filter((e) => e.category === 'analysis').reduce((s, e) => s + e.amount, 0);

  return (
    <div className="bg-gradient-to-br from-purple-700 via-purple-600 to-purple-800 rounded-2xl p-4 shadow-lg card-animate text-white">
      <div className="flex items-center gap-2 mb-3">
        <CreditCard size={18} />
        <span className="text-sm font-medium opacity-90">Расходы за ноябрь</span>
      </div>

      <div className="text-3xl font-bold mb-1">
        {totalAmount.toLocaleString('ru-RU')} ₽
      </div>

      <div className="flex items-center gap-1 mb-4">
        <TrendingUp size={14} className="text-green-300" />
        <span className="text-xs text-green-200">+12% к прошлому месяцу</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-sm">
          <p className="text-[10px] text-purple-200 mb-0.5">Врачи</p>
          <p className="text-sm font-bold">{doctorExpenses.toLocaleString('ru-RU')} ₽</p>
        </div>
        <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-sm">
          <p className="text-[10px] text-purple-200 mb-0.5">Анализы</p>
          <p className="text-sm font-bold">{analysisExpenses.toLocaleString('ru-RU')} ₽</p>
        </div>
      </div>
    </div>
  );
};

export default SpendingSummary;
