import React, { useState } from 'react';
import {
  UserCheck, X, Check, Copy, Sparkles, Scale, ChevronDown
} from 'lucide-react';
import { useFamily } from '../../context/FamilyContext';
import { formatYears } from '../../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const RegisterModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { userProfile, updateUserProfile, googleAccount } = useFamily();

  const [lastName, setLastName] = useState(userProfile.lastName || '');
  const [firstName, setFirstName] = useState(userProfile.firstName || '');
  const [middleName, setMiddleName] = useState(userProfile.middleName || '');
  const [birthYear, setBirthYear] = useState<number>(userProfile.birthYear || 1995);
  const [gender, setGender] = useState<'male' | 'female'>(userProfile.gender || 'male');
  const [height, setHeight] = useState<number>(userProfile.height || 180);
  const [weight, setWeight] = useState<number>(userProfile.weight || 76);
  const [bloodType, setBloodType] = useState(userProfile.bloodType || 'A(II) Rh+');
  const [policyOMS, setPolicyOMS] = useState(userProfile.policyOMS || '');
  const [policyDMS, setPolicyDMS] = useState(userProfile.policyDMS || '');
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  // Real-time BMI calculation
  const heightMeters = (height || 170) / 100;
  const bmi = Math.round(((weight || 70) / (heightMeters * heightMeters)) * 10) / 10;
  const age = 2026 - birthYear;

  const getBmiBadge = (val: number) => {
    if (val < 18.5) return { label: 'Дефицит массы', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 border-amber-200' };
    if (val <= 24.9) return { label: 'Нормальный вес', color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200' };
    if (val <= 29.9) return { label: 'Избыточный вес', color: 'text-amber-700 bg-amber-50 dark:bg-amber-950/60 border-amber-200' };
    return { label: 'Ожирение', color: 'text-rose-700 bg-rose-50 dark:bg-rose-950/60 border-rose-200' };
  };

  const bmiBadge = getBmiBadge(bmi);

  const handleCopyId = () => {
    navigator.clipboard?.writeText(userProfile.personalId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      lastName: lastName.trim(),
      firstName: firstName.trim(),
      middleName: middleName.trim(),
      birthYear,
      gender,
      height,
      weight,
      bmi,
      bloodType,
      policyOMS: policyOMS.trim(),
      policyDMS: policyDMS.trim(),
      avatar: `${firstName.trim().slice(0, 1)}${lastName.trim().slice(0, 1)}`.toUpperCase(),
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 animate-fade-in select-none">
      <div className="w-full max-w-[390px] bg-white dark:bg-[#161b26] rounded-3xl p-4 border border-purple-500/20 shadow-2xl animate-scale-in text-gray-900 dark:text-white max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-700 dark:text-purple-400">
              <UserCheck size={18} />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight">Личный кабинет и анкета</h2>
              <p className="text-[10px] text-gray-400">Индивидуальный профиль здоровья и Google ID</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Compact Combined Google & Personal ID Bar */}
        <div className="mt-2.5 p-2.5 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50/60 to-blue-50 dark:from-purple-950/50 dark:via-indigo-950/30 dark:to-blue-950/40 border border-purple-200/60 dark:border-purple-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 pr-1">
            <div className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
              G
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-gray-900 dark:text-white truncate block">
                {googleAccount.email}
              </span>
              <span className="text-[9px] text-purple-700 dark:text-purple-300 font-mono font-bold">
                ID: {userProfile.personalId}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopyId}
            className="px-2 py-1 rounded-xl bg-white dark:bg-[#161b26] border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-[10px] font-bold flex items-center gap-1 shadow-xs hover:bg-purple-50 transition-all flex-shrink-0"
          >
            {copied ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
            <span>{copied ? 'Скопирован' : 'Копировать'}</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="mt-2.5 space-y-2.5">
          {/* FIO Group */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                Фамилия (для подтверждения семьи) *
              </label>
              <span className="text-[9px] text-purple-600 dark:text-purple-400 font-semibold">
                Ключ автопроверки детей
              </span>
            </div>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#1a202c] font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Например: Иванов"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1">Имя *</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#1a202c] text-gray-900 dark:text-white font-bold"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1">Отчество</label>
              <input
                type="text"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#1a202c] text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Birth Year & Gender */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-gray-400">Год рождения</label>
                <span className="text-[9px] font-bold text-gray-500">{formatYears(age)}</span>
              </div>
              <input
                type="number"
                min="1930"
                max="2026"
                value={birthYear}
                onChange={(e) => setBirthYear(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#1a202c] text-gray-900 dark:text-white font-bold"
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
                  Муж
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`py-1 text-[11px] font-bold rounded-lg transition-all ${
                    gender === 'female' ? 'bg-white dark:bg-[#161b26] text-purple-700 shadow-xs' : 'text-gray-400'
                  }`}
                >
                  Жен
                </button>
              </div>
            </div>
          </div>

          {/* Physical Parameters: Height, Weight & Dynamic BMI */}
          <div className="p-3 rounded-2xl bg-purple-50/40 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300">
                <Scale size={14} />
                <span className="text-xs font-bold">Рост, вес и расчёт ИМТ</span>
              </div>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${bmiBadge.color}`}>
                {bmiBadge.label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-gray-400 block mb-0.5">Рост (см)</label>
                <input
                  type="number"
                  min="120"
                  max="220"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161b26] text-gray-900 dark:text-white font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-400 block mb-0.5">Вес (кг)</label>
                <input
                  type="number"
                  min="30"
                  max="200"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161b26] text-gray-900 dark:text-white font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-purple-100 dark:border-purple-900/40 text-[11px]">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Индекс массы тела (ИМТ):</span>
              <span className="font-black text-purple-700 dark:text-purple-300 font-mono text-sm">
                {bmi} <span className="text-[10px] font-normal text-gray-400">кг/м²</span>
              </span>
            </div>
          </div>

          {/* Blood Type & Policy */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1">
                Группа крови
              </label>
              <div className="relative">
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#1a202c] text-gray-900 dark:text-white font-bold appearance-none cursor-pointer"
                >
                  <option className="bg-white dark:bg-[#161b26] text-gray-900 dark:text-white" value="O(I) Rh+">O(I) Rh+</option>
                  <option className="bg-white dark:bg-[#161b26] text-gray-900 dark:text-white" value="O(I) Rh-">O(I) Rh-</option>
                  <option className="bg-white dark:bg-[#161b26] text-gray-900 dark:text-white" value="A(II) Rh+">A(II) Rh+</option>
                  <option className="bg-white dark:bg-[#161b26] text-gray-900 dark:text-white" value="A(II) Rh-">A(II) Rh-</option>
                  <option className="bg-white dark:bg-[#161b26] text-gray-900 dark:text-white" value="B(III) Rh+">B(III) Rh+</option>
                  <option className="bg-white dark:bg-[#161b26] text-gray-900 dark:text-white" value="B(III) Rh-">B(III) Rh-</option>
                  <option className="bg-white dark:bg-[#161b26] text-gray-900 dark:text-white" value="AB(IV) Rh+">AB(IV) Rh+</option>
                  <option className="bg-white dark:bg-[#161b26] text-gray-900 dark:text-white" value="AB(IV) Rh-">AB(IV) Rh-</option>
                </select>
                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1">
                Полис ОМС / ДМС
              </label>
              <input
                type="text"
                value={policyOMS}
                onChange={(e) => setPolicyOMS(e.target.value)}
                placeholder="1694 0000 0000 0000"
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#1a202c] text-gray-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 block mb-1">
              Полис ДМС (опционально)
            </label>
            <input
              type="text"
              value={policyDMS}
              onChange={(e) => setPolicyDMS(e.target.value)}
              placeholder="Например: СОГАЗ ДМС Эксперт"
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#1a202c] text-gray-900 dark:text-white font-medium"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              disabled={savedSuccess}
              className="flex-1 py-3 bg-purple-700 hover:bg-purple-800 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-purple-500/25 flex items-center justify-center gap-1.5 active:scale-98 transition-all"
            >
              {savedSuccess ? (
                <>
                  <Check size={16} className="text-emerald-400" />
                  <span>Профиль обновлен!</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>Сохранить анкету</span>
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
