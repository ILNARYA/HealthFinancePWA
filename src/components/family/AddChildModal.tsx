import React, { useState } from 'react';
import {
  Baby, X, Check, ShieldCheck, AlertCircle,
  Sparkles, ChevronDown
} from 'lucide-react';
import { useFamily } from '../../context/FamilyContext';
import { formatYears } from '../../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AddChildModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { userProfile, addChildMember } = useFamily();

  const [lastName, setLastName] = useState(userProfile.lastName || 'Иванов');
  const [firstName, setFirstName] = useState('');
  const [birthYear, setBirthYear] = useState<number>(2023);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [height, setHeight] = useState<number>(98);
  const [weight, setWeight] = useState<number>(15);
  const [bloodType, setBloodType] = useState('A(II) Rh+');
  const [policyOMS, setPolicyOMS] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const currentYear = 2026;
  const age = currentYear - birthYear;
  const isSameSurname = lastName.trim().toLowerCase() === userProfile.lastName.trim().toLowerCase();
  const isUnder20 = age < 20 && age >= 0;
  const isEligibleForFastTrack = isSameSurname && isUnder20;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) return;

    const res = addChildMember({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      birthYear,
      gender,
      height,
      weight,
      bloodType,
      policyOMS: policyOMS.trim() || '1694 5102 0000 0000',
    });

    if (!res.success) {
      setStatusMessage({ text: res.message, isError: true });
    } else {
      setIsSuccess(true);
      setStatusMessage({ text: res.message, isError: false });
      setTimeout(() => {
        setIsSuccess(false);
        setFirstName('');
        setStatusMessage(null);
        onClose();
      }, 1800);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-3.5 animate-fade-in select-none">
      <div className="w-full max-w-[390px] bg-white dark:bg-[#161b26] rounded-3xl p-5 border border-purple-500/20 shadow-2xl animate-scale-in text-gray-900 dark:text-white max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-700 dark:text-purple-400">
              <Baby size={20} />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight">Добавить ребёнка в семью</h2>
              <p className="text-[10px] text-gray-400">Быстрое подключение без Google-аккаунта (до 20 лет)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Real-time Eligibility Rule Card */}
        <div
          className={`mt-3 p-3 rounded-2xl border text-xs transition-all ${
            isEligibleForFastTrack
              ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
              : !isUnder20
              ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200'
              : 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold mb-1">
            {isEligibleForFastTrack ? (
              <>
                <ShieldCheck size={15} className="text-emerald-600 dark:text-emerald-400" />
                <span>Автоматическое подтверждение родства</span>
              </>
            ) : (
              <>
                <AlertCircle size={15} className="text-rose-600 dark:text-rose-400" />
                <span>Ограничение быстрого добавления</span>
              </>
            )}
          </div>
          <p className="text-[11px] leading-relaxed opacity-90">
            {isEligibleForFastTrack
              ? `Единая фамилия («${lastName}») и возраст ${formatYears(age)} (< 20). Профиль будет создан мгновенно под опекой главы семьи без отдельного Google-аккаунта.`
              : !isUnder20
              ? `Возраст ${formatYears(age)} (≥ 20). Взрослые должны завести индивидуальный аккаунт Google и добавиться через инвайт по ID.`
              : `Фамилия «${lastName}» отличается от фамилии главы семьи («${userProfile.lastName}»). Требуется индивидуальный инвайт по личному ID.`}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-3.5 space-y-3">
          {/* Surname */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                Фамилия ребёнка *
              </label>
              <span className="text-[9px] text-purple-600 dark:text-purple-400 font-semibold">
                Совпадает с вашей: {userProfile.lastName}
              </span>
            </div>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#1a202c] font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* First Name & Role/Gender */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1">Имя ребёнка *</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Например: Амир"
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161b26] font-bold text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1">Пол</label>
              <div className="grid grid-cols-2 gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`py-1 text-[11px] font-bold rounded-lg transition-all ${
                    gender === 'male' ? 'bg-white dark:bg-[#161b26] text-purple-700 shadow-xs' : 'text-gray-400'
                  }`}
                >
                  Сын
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`py-1 text-[11px] font-bold rounded-lg transition-all ${
                    gender === 'female' ? 'bg-white dark:bg-[#161b26] text-purple-700 shadow-xs' : 'text-gray-400'
                  }`}
                >
                  Дочь
                </button>
              </div>
            </div>
          </div>

          {/* Birth Year & Age */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-gray-400">Год рождения</label>
                <span className="text-[9px] font-bold text-purple-600">{formatYears(age)}</span>
              </div>
              <input
                type="number"
                min="2007"
                max="2026"
                value={birthYear}
                onChange={(e) => setBirthYear(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161b26] font-bold text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1">Группа крови</label>
              <div className="relative">
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161b26] text-gray-900 dark:text-white font-bold appearance-none cursor-pointer"
                >
                  <option value="A(II) Rh+">A(II) Rh+</option>
                  <option value="O(I) Rh+">O(I) Rh+</option>
                  <option value="B(III) Rh+">B(III) Rh+</option>
                  <option value="AB(IV) Rh+">AB(IV) Rh+</option>
                </select>
                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Height & Weight */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1">Рост (см)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161b26] font-bold text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1">Вес (кг)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161b26] font-bold text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Policy OMS */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 block mb-1">Детский полис ОМС</label>
            <input
              type="text"
              value={policyOMS}
              onChange={(e) => setPolicyOMS(e.target.value)}
              placeholder="1694 5102 0000 0000"
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161b26] font-mono text-gray-900 dark:text-white"
            />
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
              disabled={isSuccess || !isEligibleForFastTrack || !firstName.trim()}
              className="flex-1 py-3 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-purple-500/25 flex items-center justify-center gap-1.5 active:scale-98 transition-all"
            >
              {isSuccess ? (
                <>
                  <Check size={16} />
                  <span>Ребёнок добавлен!</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>Добавить в семейный хаб</span>
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
