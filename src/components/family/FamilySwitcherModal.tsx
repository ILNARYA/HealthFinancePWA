import React, { useState } from 'react';
import { Users, Plus, ShieldCheck, X, Check, Wallet, Activity } from 'lucide-react';
import { useFamily } from '../../context/FamilyContext';
import type { FamilyMember } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const FamilySwitcherModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { members, activeMemberId, setActiveMemberId, addMember } = useFamily();
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<FamilyMember['role']>('child');
  const [birthYear, setBirthYear] = useState('2020');
  const [bloodType, setBloodType] = useState('O(I) Rh+');
  const [policyOMS, setPolicyOMS] = useState('');

  if (!isOpen) return null;

  const totalFamilyExpenses = members.reduce((sum, m) => sum + m.expensesTotal, 0);
  const totalFamilyAnalyses = members.reduce((sum, m) => sum + m.analysesCount, 0);

  const roleLabels: Record<FamilyMember['role'], string> = {
    head: 'Глава семьи',
    spouse: 'Супруга / Супруг',
    child: 'Ребёнок',
    parent: 'Родитель',
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addMember({
      name: name.trim(),
      role,
      roleLabel: roleLabels[role],
      birthYear: Number(birthYear) || 2020,
      gender: 'female',
      bloodType,
      policyOMS: policyOMS.trim() || '1694 0000 0000 0000',
      avatar: name.trim().slice(0, 2).toUpperCase(),
      color: role === 'child' ? '#06b6d4' : '#ec4899',
      healthScore: 90,
      analysesCount: 0,
      expensesTotal: 0,
    });

    setName('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-0">
      <div className="w-full max-w-[412px] bg-white dark:bg-[#161b26] rounded-t-3xl p-5 border-t border-purple-500/20 shadow-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-700 dark:text-purple-400">
              <Users size={18} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                Семейный кабинет
              </h2>
              <p className="text-[11px] text-gray-400">
                Управление медицинскими профилями семьи
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Family Summary Banner */}
        <div className="mt-3.5 grid grid-cols-2 gap-2">
          <div className="bg-purple-50/70 dark:bg-purple-950/40 p-3 rounded-2xl border border-purple-100 dark:border-purple-900/40">
            <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 mb-1">
              <Wallet size={13} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Семейный бюджет</span>
            </div>
            <p className="text-sm font-black text-gray-900 dark:text-white">
              {totalFamilyExpenses.toLocaleString('ru-RU')} ₽
            </p>
          </div>
          <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 mb-1">
              <Activity size={13} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Анализы семьи</span>
            </div>
            <p className="text-sm font-black text-gray-900 dark:text-white">
              {totalFamilyAnalyses} бланков
            </p>
          </div>
        </div>

        {/* Member Cards List */}
        <div className="mt-4 space-y-2.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-1">
            Выберите профиль ({members.length})
          </p>

          {members.map((member) => {
            const isCurrent = member.id === activeMemberId;
            return (
              <div
                key={member.id}
                onClick={() => {
                  setActiveMemberId(member.id);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isCurrent
                    ? 'border-purple-600 dark:border-purple-500 bg-purple-50/80 dark:bg-purple-950/50 shadow-sm ring-2 ring-purple-500/20'
                    : 'border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#1a202c]/40 hover:bg-gray-100 dark:hover:bg-gray-800/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-white text-sm shadow-sm flex-shrink-0"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {member.name}
                      </p>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-purple-100/70 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                        {member.roleLabel}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 dark:text-gray-400 mt-0.5 truncate">
                      {2026 - member.birthYear} лет · Группа {member.bloodType} · ОМС: {member.policyOMS.slice(-4)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <div className="text-right">
                    <span className="text-xs font-black text-gray-900 dark:text-white block">
                      {member.healthScore}
                    </span>
                    <span className="text-[9px] font-medium text-gray-400">индекс</span>
                  </div>
                  {isCurrent && (
                    <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Member Form or Button */}
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-4 w-full py-2.5 px-3 rounded-2xl border-2 border-dashed border-purple-300 dark:border-purple-800 hover:border-purple-600 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus size={15} />
            <span>Добавить профиль члена семьи</span>
          </button>
        ) : (
          <form onSubmit={handleCreateMember} className="mt-4 p-4 rounded-2xl bg-gray-50 dark:bg-[#1a202c] border border-gray-200 dark:border-gray-700 space-y-3">
            <h4 className="text-xs font-bold text-gray-900 dark:text-white">Новый профиль</h4>
            <div>
              <label className="text-[10px] font-semibold text-gray-400 block mb-1">Имя</label>
              <input
                type="text"
                placeholder="Например: София"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161b26] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-gray-400 block mb-1">Роль</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-2.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161b26] text-gray-900 dark:text-white"
                >
                  <option value="child">Ребёнок</option>
                  <option value="spouse">Супруг / Супруга</option>
                  <option value="parent">Родитель</option>
                  <option value="head">Глава семьи</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-400 block mb-1">Год рождения</label>
                <input
                  type="number"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161b26] text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-400 block mb-1">Группа крови</label>
              <input
                type="text"
                placeholder="A(II) Rh+"
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161b26] text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-400 block mb-1">Полис ОМС</label>
              <input
                type="text"
                placeholder="1694 0000 0000 0000"
                value={policyOMS}
                onChange={(e) => setPolicyOMS(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161b26] text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                Сохранить
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs text-gray-500"
              >
                Отмена
              </button>
            </div>
          </form>
        )}

        {/* Security Badge in Footer */}
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <ShieldCheck size={14} />
            <span>Данные разделены по профилям</span>
          </div>
          <span className="text-[10px]">AES-256</span>
        </div>
      </div>
    </div>
  );
};
