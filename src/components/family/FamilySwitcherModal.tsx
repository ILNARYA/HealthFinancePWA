import React, { useState } from 'react';
import {
  Users, UserPlus, Baby, ShieldCheck, X, Check, Wallet,
  Activity, Copy, ChevronDown, Sparkles
} from 'lucide-react';
import { useFamily } from '../../context/FamilyContext';
import type { FamilyMember } from '../../types';
import { InviteMemberModal } from './InviteMemberModal';
import { AddChildModal } from './AddChildModal';
import { formatYears } from '../../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const FamilySwitcherModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    userProfile,
    familyName,
    members,
    activeMemberId,
    setActiveMemberId,
    invites,
    acceptFamilyInvite,
    declineFamilyInvite,
    updateMemberRole,
  } = useFamily();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showChildModal, setShowChildModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalFamilyExpenses = members.reduce((sum, m) => sum + m.expensesTotal, 0);
  const totalFamilyAnalyses = members.reduce((sum, m) => sum + m.analysesCount, 0);
  const pendingInvites = invites.filter((inv) => inv.status === 'pending');

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(userProfile.personalId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const roleLabels: Record<FamilyMember['role'], string> = {
    head: 'Глава семьи',
    spouse: 'Супруга / Супруг',
    child: 'Ребёнок',
    parent: 'Родственник',
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-3.5 animate-fade-in select-none">
        <div className="w-full max-w-[400px] bg-white dark:bg-[#161b26] rounded-3xl p-5 border border-purple-500/20 shadow-2xl animate-scale-in text-gray-900 dark:text-white max-h-[92vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-700 dark:text-purple-400">
                <Users size={20} />
              </div>
              <div>
                <h2 className="text-base font-extrabold tracking-tight">
                  {familyName}
                </h2>
                <p className="text-[10px] text-gray-400">
                  Управление профилями и доступом семьи
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          {/* User Personal ID Bar */}
          <div className="mt-3 p-2.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/70 dark:border-purple-800/60 flex items-center justify-between text-xs">
            <div className="min-w-0 pr-2">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">
                Ваш ID для приглашений
              </span>
              <span className="font-mono font-black text-purple-700 dark:text-purple-300 text-sm tracking-wide">
                {userProfile.personalId}
              </span>
            </div>
            <button
              onClick={handleCopyId}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#161b26] border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center gap-1 shadow-xs hover:bg-purple-50 transition-all flex-shrink-0"
            >
              {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              <span>{copied ? 'Скопирован' : 'Копировать'}</span>
            </button>
          </div>

          {/* Pending Incoming Invites Banner */}
          {pendingInvites.length > 0 && (
            <div className="mt-3 space-y-2">
              {pendingInvites.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-200 dark:border-amber-800/60 text-xs animate-slide-up"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1 text-amber-900 dark:text-amber-200 font-bold">
                        <Sparkles size={13} className="text-amber-600" />
                        <span>Приглашение в семью</span>
                      </div>
                      <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-0.5">
                        <strong>{inv.fromUserName} {inv.fromUserSurname}</strong> приглашает вас в «{inv.familyName}» на роль «{inv.roleLabel}».
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2.5 pt-2 border-t border-amber-200/60 dark:border-amber-800/60">
                    <button
                      onClick={() => acceptFamilyInvite(inv.id)}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1"
                    >
                      <Check size={13} />
                      <span>Принять</span>
                    </button>
                    <button
                      onClick={() => declineFamilyInvite(inv.id)}
                      className="px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 text-xs text-gray-500 hover:bg-white transition-colors"
                    >
                      Отклонить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Family Summary Banner */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="bg-purple-50/70 dark:bg-purple-950/40 p-2.5 rounded-2xl border border-purple-100 dark:border-purple-900/40">
              <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 mb-0.5">
                <Wallet size={12} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Семейный бюджет</span>
              </div>
              <p className="text-sm font-black text-gray-900 dark:text-white">
                {totalFamilyExpenses.toLocaleString('ru-RU')} ₽
              </p>
            </div>
            <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-2.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 mb-0.5">
                <Activity size={12} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Анализы семьи</span>
              </div>
              <p className="text-sm font-black text-gray-900 dark:text-white">
                {totalFamilyAnalyses} бланков
              </p>
            </div>
          </div>

          {/* Member Cards List */}
          <div className="mt-3.5 space-y-2">
            <div className="flex items-center justify-between px-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Члены семьи ({members.length})
              </p>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                Клик для переключения
              </span>
            </div>

            {members.map((member) => {
              const isCurrent = member.id === activeMemberId;
              const isEditing = editingRoleId === member.id;

              return (
                <div
                  key={member.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'border-purple-600 dark:border-purple-500 bg-purple-50/80 dark:bg-purple-950/50 shadow-sm ring-2 ring-purple-500/20'
                      : 'border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#1a202c]/40 hover:bg-gray-100 dark:hover:bg-gray-800/60'
                  }`}
                >
                  <div
                    onClick={() => {
                      setActiveMemberId(member.id);
                      onClose();
                    }}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white text-xs shadow-sm flex-shrink-0"
                        style={{ backgroundColor: member.color }}
                      >
                        {member.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-gray-900 dark:text-white">
                            {member.name} {member.lastName ? `${member.lastName[0]}.` : ''}
                          </p>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-purple-100/70 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex-shrink-0">
                            {member.roleLabel}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 dark:text-gray-400 mt-0.5 truncate flex items-center gap-1">
                          <span>{formatYears(2026 - member.birthYear)}</span>
                          <span>·</span>
                          <span>{member.bloodType}</span>
                          {member.isVerifiedChild && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-1">
                              ✓ Ребёнок
                            </span>
                          )}
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

                  {/* Role Configurer Toggle */}
                  <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[10px]">
                    <span className="text-gray-400">
                      Полис ОМС: {member.policyOMS ? member.policyOMS.slice(-4) : '—'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingRoleId(isEditing ? null : member.id)}
                      className="text-purple-700 dark:text-purple-300 font-semibold underline flex items-center gap-0.5"
                    >
                      <span>{isEditing ? 'Скрыть роли' : 'Настроить роль'}</span>
                      <ChevronDown size={11} className={isEditing ? 'rotate-180' : ''} />
                    </button>
                  </div>

                  {/* Inline Role Picker */}
                  {isEditing && (
                    <div className="mt-2 p-2 bg-white dark:bg-[#161b26] rounded-xl border border-purple-200 dark:border-purple-800/60 grid grid-cols-4 gap-1 animate-fade-in">
                      {(['head', 'spouse', 'child', 'parent'] as FamilyMember['role'][]).map((r) => (
                        <button
                          key={r}
                          onClick={() => {
                            updateMemberRole(member.id, r);
                            setEditingRoleId(null);
                          }}
                          className={`py-1 text-[10px] font-bold rounded-lg transition-all ${
                            member.role === r
                              ? 'bg-purple-700 text-white shadow-xs'
                              : 'bg-gray-50 dark:bg-[#1a202c] text-gray-600 dark:text-gray-300 hover:bg-purple-50'
                          }`}
                        >
                          {roleLabels[r].split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Buttons: Adult Invite & Fast-track Child */}
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowInviteModal(true)}
              className="py-2.5 px-3 rounded-2xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-98"
            >
              <UserPlus size={14} />
              <span>Пригласить по ID</span>
            </button>

            <button
              onClick={() => setShowChildModal(true)}
              className="py-2.5 px-3 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-500/20 active:scale-98"
            >
              <Baby size={15} />
              <span>+ Ребёнок (&lt; 20)</span>
            </button>
          </div>

          {/* Security Badge in Footer */}
          <div className="mt-3.5 pt-2.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <ShieldCheck size={14} />
              <span>Медицинская тайна разделена</span>
            </div>
            <span className="text-[10px] font-mono">AES-256</span>
          </div>
        </div>
      </div>

      {/* Sub-modals */}
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />

      <AddChildModal
        isOpen={showChildModal}
        onClose={() => setShowChildModal(false)}
      />
    </>
  );
};
