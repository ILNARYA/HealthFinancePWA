import React, { useState } from 'react';
import {
  UserPlus, X, Check, Search,
  Users, AlertCircle, ArrowRight, Sparkles
} from 'lucide-react';
import { useFamily, knownAdultRegistry } from '../../context/FamilyContext';
import type { FamilyInvite } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteMemberModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { familyName, sendFamilyInvite } = useFamily();
  const [targetId, setTargetId] = useState('');
  const [selectedRole, setSelectedRole] = useState<FamilyInvite['role']>('spouse');
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSelectSample = (personalId: string, role: FamilyInvite['role']) => {
    setTargetId(personalId);
    setSelectedRole(role);
    setStatusMessage(null);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const res = sendFamilyInvite(targetId, selectedRole);
    if (!res.success) {
      setStatusMessage({ text: res.message, isError: true });
    } else {
      setIsSuccess(true);
      setStatusMessage({ text: res.message, isError: false });
      setTimeout(() => {
        setIsSuccess(false);
        setTargetId('');
        setStatusMessage(null);
        onClose();
      }, 1800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3.5 animate-fade-in select-none">
      <div className="w-full max-w-[390px] bg-white dark:bg-[#161b26] rounded-3xl p-5 border border-purple-500/20 shadow-2xl animate-scale-in text-gray-900 dark:text-white max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-700 dark:text-purple-400">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight">Приглашение в семью</h2>
              <p className="text-[10px] text-gray-400">Подключение взрослого по ID личного кабинета</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Info Banner */}
        <div className="mt-3 p-3 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-purple-900 dark:text-purple-200">
            <Users size={14} className="text-purple-600" />
            <span>Группа: «{familyName}»</span>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
            Каждый взрослый регистрирует свой личный кабинет через Google. Чтобы объединить профили, отправьте ему приглашение по персональному ID.
          </p>
        </div>

        {/* Quick Sample Chips */}
        <div className="mt-3">
          <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1.5 px-0.5">
            Быстрый выбор из родственников:
          </span>
          <div className="space-y-1.5">
            {knownAdultRegistry.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleSelectSample(user.personalId, user.familyRole as any)}
                className={`w-full p-2 rounded-xl border text-left text-xs flex items-center justify-between transition-all ${
                  targetId.toUpperCase() === user.personalId.toUpperCase()
                    ? 'border-purple-600 bg-purple-50/80 dark:bg-purple-950/60 font-bold'
                    : 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#1a202c]/50 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center">
                    {user.avatar}
                  </div>
                  <span className="truncate">{user.firstName} {user.lastName}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-[10px] font-mono font-bold text-purple-700 dark:text-purple-300">
                    {user.personalId}
                  </span>
                  <ArrowRight size={12} className="text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSend} className="mt-3.5 space-y-3">
          {/* Target Personal ID */}
          <div>
            <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
              ID личного кабинета получателя *
            </label>
            <div className="relative">
              <input
                type="text"
                value={targetId}
                onChange={(e) => {
                  setTargetId(e.target.value);
                  setStatusMessage(null);
                }}
                placeholder="Например: MED-3910"
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161b26] text-gray-900 dark:text-white font-mono uppercase font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              Получатель может найти свой ID в разделе «Настройки → Мой личный кабинет»
            </p>
          </div>

          {/* Role in Family */}
          <div>
            <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
              Роль в семье
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'spouse', label: 'Супруг(а)' },
                { id: 'parent', label: 'Родственник' },
                { id: 'head', label: 'Со-глава' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRole(r.id as any)}
                  className={`py-2 px-1 text-center text-xs font-bold rounded-xl border transition-all ${
                    selectedRole === r.id
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 shadow-xs'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#1a202c] text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Message */}
          {statusMessage && (
            <div
              className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                statusMessage.isError
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              }`}
            >
              {statusMessage.isError ? (
                <AlertCircle size={15} className="flex-shrink-0" />
              ) : (
                <Check size={15} className="flex-shrink-0" />
              )}
              <span className="text-[11px] leading-tight">{statusMessage.text}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              disabled={isSuccess || !targetId.trim()}
              className="flex-1 py-3 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-purple-500/25 flex items-center justify-center gap-1.5 active:scale-98 transition-all"
            >
              {isSuccess ? (
                <>
                  <Check size={16} />
                  <span>Приглашение отправлено!</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>Отправить инвайт</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
