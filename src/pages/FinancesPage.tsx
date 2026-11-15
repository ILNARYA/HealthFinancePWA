import React, { useState } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from 'recharts';
import { Plus, Stethoscope, TestTube, Pill, HeartPulse, X } from 'lucide-react';
import { demoExpenses, demoDoctors, categoryLabels, categoryColors } from '../data/demo';
import type { Expense } from '../types';

const categoryIcons: Record<string, React.FC<{ size?: number; className?: string }>> = {
  doctor: Stethoscope,
  analysis: TestTube,
  medicine: Pill,
  procedure: HeartPulse,
};

const FinancesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>(demoExpenses);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: 'doctor' as Expense['category'],
    title: '',
    amount: '',
    doctor: '',
  });

  const totalAmount = expenses.reduce((s, e) => s + e.amount, 0);

  // Pie chart data
  const categoryTotals = Object.keys(categoryLabels).map((cat) => ({
    name: categoryLabels[cat],
    value: expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0),
    color: categoryColors[cat],
  })).filter((c) => c.value > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return;
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      category: formData.category,
      title: formData.title,
      amount: Number(formData.amount),
      date: new Date().toISOString().split('T')[0],
      doctor: formData.doctor || undefined,
    };
    setExpenses([newExpense, ...expenses]);
    setFormData({ category: 'doctor', title: '', amount: '', doctor: '' });
    setShowForm(false);
  };

  return (
    <div className="px-4 pt-12 pb-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Финансы</h1>
          <p className="text-xs text-gray-500">Учёт медицинских расходов</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="w-9 h-9 bg-purple-700 rounded-full flex items-center justify-center shadow-lg shadow-purple-300"
        >
          <Plus size={20} className="text-white" />
        </button>
      </div>

      {/* Total card */}
      <div className="bg-gradient-to-br from-purple-700 via-purple-600 to-purple-800 rounded-2xl p-4 shadow-lg text-white card-animate">
        <p className="text-xs text-purple-200 mb-1">Общие расходы · Ноябрь 2026</p>
        <p className="text-3xl font-bold">{totalAmount.toLocaleString('ru-RU')} ₽</p>
        <p className="text-xs text-purple-200 mt-1">{expenses.length} операций</p>
      </div>

      {/* Pie chart */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 card-animate">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">По категориям</h3>
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryTotals}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
              >
                {categoryTotals.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value.toLocaleString('ru-RU')} ₽`, '']}
                contentStyle={{
                  background: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#fff',
                  padding: '4px 8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {categoryTotals.map((c) => (
            <div key={c.name} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
              <span className="text-[10px] text-gray-500">{c.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Doctors */}
      <h3 className="text-sm font-semibold text-gray-800">Мои врачи</h3>
      <div className="space-y-2">
        {demoDoctors.map((doc) => (
          <div key={doc.id} className="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100 flex items-center gap-3 card-animate">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-lg">
              {doc.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
              <p className="text-[10px] text-gray-400">{doc.specialty} · {doc.visits} визита</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">{doc.totalSpent.toLocaleString('ru-RU')} ₽</p>
              <p className="text-[10px] text-gray-400">всего</p>
            </div>
          </div>
        ))}
      </div>

      {/* Expense List */}
      <h3 className="text-sm font-semibold text-gray-800">Последние расходы</h3>
      <div className="space-y-2">
        {expenses.map((exp) => {
          const Icon = categoryIcons[exp.category] || Stethoscope;
          return (
            <div key={exp.id} className="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100 flex items-center gap-3 card-animate">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: categoryColors[exp.category] + '15' }}
              >
                <Icon size={18} style={{ color: categoryColors[exp.category] }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">{exp.title}</p>
                <p className="text-[10px] text-gray-400">{exp.date}{exp.doctor ? ` · ${exp.doctor}` : ''}</p>
              </div>
              <p className="text-sm font-bold text-gray-900">−{exp.amount.toLocaleString('ru-RU')} ₽</p>
            </div>
          );
        })}
      </div>

      {/* Add Expense Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-[390px] bg-white rounded-t-3xl p-5 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">Новый расход</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Category */}
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(categoryLabels) as Expense['category'][]).map((cat) => {
                  const Icon = categoryIcons[cat] || Stethoscope;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat })}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-[10px] transition-all ${
                        formData.category === cat
                          ? 'border-purple-400 bg-purple-50 text-purple-700 font-semibold'
                          : 'border-gray-200 text-gray-500'
                      }`}
                    >
                      <Icon size={16} />
                      {categoryLabels[cat]}
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                placeholder="Название"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              />

              <input
                type="number"
                placeholder="Сумма, ₽"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              />

              <input
                type="text"
                placeholder="Врач / клиника (необязательно)"
                value={formData.doctor}
                onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              />

              <button
                type="submit"
                className="w-full py-3 bg-purple-700 text-white rounded-xl font-semibold text-sm hover:bg-purple-800 transition-colors shadow-lg shadow-purple-300"
              >
                Добавить расход
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancesPage;
