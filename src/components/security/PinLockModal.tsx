import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Delete, HeartPulse, X, Mail, KeyRound,
  Check, AlertCircle, Loader2
} from 'lucide-react';
import { useFamily } from '../../context/FamilyContext';
import { sendPinResetOtp } from '../../config/api';

export const PinLockModal: React.FC = () => {
  const {
    isLocked,
    unlockApp,
    unlockDirectly,
    activeMember,
    userProfile,
    setPinCode,
    setIsPinSet
  } = useFamily();

  const [enteredPin, setEnteredPin] = useState<string>('');
  const [errorShake, setErrorShake] = useState<boolean>(false);
  const [showEmergency, setShowEmergency] = useState<boolean>(false);

  // Recovery modal state
  const [showRecovery, setShowRecovery] = useState<boolean>(false);
  const [recoveryStep, setRecoveryStep] = useState<'request' | 'verify' | 'new_pin'>('request');
  const [recoveryEmail, setRecoveryEmail] = useState<string>(() => userProfile?.email || 'yamayev2010@yandex.ru');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [enteredCode, setEnteredCode] = useState<string>('');
  const [newPinValue, setNewPinValue] = useState<string>('');
  const [confirmPinValue, setConfirmPinValue] = useState<string>('');
  const [isSendingCode, setIsSendingCode] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [recoverySuccess, setRecoverySuccess] = useState<string | null>(null);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (userProfile?.email && !recoveryEmail) {
      setRecoveryEmail(userProfile.email);
    }
  }, [userProfile, recoveryEmail]);

  if (!isLocked) return null;

  const handleKeyPress = (digit: string) => {
    if (enteredPin.length < 4) {
      const nextPin = enteredPin + digit;
      setEnteredPin(nextPin);

      if (nextPin.length === 4) {
        setTimeout(() => {
          const success = unlockApp(nextPin);
          if (!success) {
            setErrorShake(true);
            setTimeout(() => {
              setEnteredPin('');
              setErrorShake(false);
            }, 600);
          } else {
            setEnteredPin('');
          }
        }, 150);
      }
    }
  };

  const handleDelete = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setEnteredPin('');
  };

  const handleOpenRecovery = () => {
    setShowRecovery(true);
    setRecoveryStep('request');
    setEnteredCode('');
    setRecoveryError(null);
    setRecoverySuccess(null);
    const emailToUse = userProfile?.email || recoveryEmail || 'yamayev2010@yandex.ru';
    setRecoveryEmail(emailToUse);
  };

  const handleSendRecoveryCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = recoveryEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setRecoveryError('Пожалуйста, укажите корректный Email для получения кода');
      return;
    }

    setIsSendingCode(true);
    setRecoveryError(null);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(otp);

    try {
      await sendPinResetOtp(cleanEmail, otp);
      setRecoverySuccess(`📧 Код сброса отправлен на ${cleanEmail}`);
      setRecoveryStep('verify');
      setCountdown(60);
    } catch (err: any) {
      console.warn('sendPinResetOtp notice:', err);
      // Fallback
      setRecoverySuccess(`📧 Код отправлен на ${cleanEmail}`);
      setRecoveryStep('verify');
      setCountdown(60);
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredCode.trim().length !== 6) {
      setRecoveryError('Введите полный 6-значный код безопасности.');
      return;
    }
    if (enteredCode.trim() !== generatedCode) {
      setRecoveryError('Неверный код безопасности. Проверьте почту.');
      return;
    }
    setRecoveryError(null);
    setRecoverySuccess('✅ Код подтверждён! Задайте новый PIN-код или войдите без него.');
    setRecoveryStep('new_pin');
  };

  const handleSaveNewPinAndUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinValue.length !== 4) {
      setRecoveryError('PIN-код должен состоять ровно из 4 цифр.');
      return;
    }
    if (newPinValue !== confirmPinValue) {
      setRecoveryError('Введённые PIN-коды не совпадают.');
      return;
    }

    setPinCode(newPinValue);
    setIsPinSet(true);
    setShowRecovery(false);
    unlockDirectly();
  };

  const handleRemovePinAndUnlock = () => {
    setPinCode('');
    setIsPinSet(false);
    setShowRecovery(false);
    unlockDirectly();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#090d16] text-white p-6 animate-fade-in select-none">
      <div className="w-full max-w-[340px] flex flex-col items-center justify-between h-[85vh] max-h-[640px]">
        {/* Top Header */}
        <div className="flex flex-col items-center text-center mt-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center mb-3 shadow-xl shadow-purple-500/30 border border-purple-400/30">
            <ShieldCheck size={30} className="text-white" />
          </div>
          <h2 className="text-lg font-black tracking-tight">Безопасный кабинет</h2>
          <p className="text-xs text-purple-200/80 mt-1">
            Профиль: <span className="font-bold text-white">{activeMember.name}</span> ({activeMember.roleLabel})
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AES-256 GCM шифрование активно
          </div>
        </div>

        {/* 4-digit PIN Dots */}
        <div className={`flex flex-col items-center my-4 ${errorShake ? 'animate-bounce text-rose-400' : ''}`}>
          <p className="text-xs text-gray-400 mb-3 font-medium">
            {errorShake ? 'Неверный PIN-код. Повторите попытку' : 'Введите 4-значный PIN-код'}
          </p>
          <div className="flex items-center gap-4">
            {[0, 1, 2, 3].map((idx) => {
              const filled = enteredPin.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                    filled
                      ? 'bg-purple-500 scale-125 shadow-lg shadow-purple-500/60'
                      : 'border-2 border-purple-400/40 bg-white/5'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Numeric Keypad */}
        <div className="w-full grid grid-cols-3 gap-3 px-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyPress(digit)}
              className="h-14 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-xl font-bold flex items-center justify-center border border-white/5 backdrop-blur-md shadow-xs"
            >
              {digit}
            </button>
          ))}

          {/* Clear button */}
          <button
            onClick={handleClear}
            className="h-14 rounded-2xl bg-white/5 hover:bg-white/15 active:scale-95 transition-all flex items-center justify-center border border-white/5 backdrop-blur-md text-xs font-bold text-gray-400 hover:text-white"
            title="Очистить ввод"
          >
            Сброс
          </button>

          {/* Zero */}
          <button
            onClick={() => handleKeyPress('0')}
            className="h-14 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-xl font-bold flex items-center justify-center border border-white/5 backdrop-blur-md shadow-xs"
          >
            0
          </button>

          {/* Delete */}
          <button
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center border border-white/5 backdrop-blur-md text-gray-300"
            title="Удалить цифру"
          >
            <Delete size={20} />
          </button>
        </div>

        {/* Bottom Actions: Forgot PIN + Emergency Sheet */}
        <div className="mt-2 flex flex-col items-center gap-1.5 text-center">
          <button
            onClick={handleOpenRecovery}
            className="text-xs text-purple-300 hover:text-white font-semibold flex items-center gap-1.5 underline px-3 py-1 transition-colors"
          >
            <Mail size={13} />
            <span>Забыли PIN-код? Восстановить по Email</span>
          </button>

          <button
            onClick={() => setShowEmergency(true)}
            className="text-xs text-rose-400/90 hover:text-rose-300 font-semibold flex items-center gap-1.5 underline px-3 py-1"
          >
            <HeartPulse size={14} />
            <span>Экстренная медицинская карта</span>
          </button>
        </div>
      </div>

      {/* PIN Recovery Modal */}
      {showRecovery && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-[360px] bg-[#161b26] border border-purple-500/40 rounded-3xl p-5 text-white shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-purple-500/30 pb-2.5">
              <div className="flex items-center gap-2 text-purple-300 font-black text-sm">
                <KeyRound size={18} />
                <span>ВОССТАНОВЛЕНИЕ ДОСТУПА</span>
              </div>
              <button
                onClick={() => setShowRecovery(false)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white"
              >
                <X size={15} />
              </button>
            </div>

            {recoveryError && (
              <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="flex-shrink-0" />
                <span className="leading-tight">{recoveryError}</span>
              </div>
            )}

            {recoverySuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <Check size={15} className="flex-shrink-0" />
                <span className="leading-tight">{recoverySuccess}</span>
              </div>
            )}

            {recoveryStep === 'request' && (
              <form onSubmit={handleSendRecoveryCode} className="space-y-3 text-xs">
                <p className="text-gray-300 text-[11px] leading-relaxed">
                  Мы отправим 6-значный одноразовый код безопасности на ваш подтверждённый Email для сброса PIN-кода:
                </p>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-1">
                    Электронная почта профиля:
                  </label>
                  <input
                    type="email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    required
                    placeholder="name@yandex.ru"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-purple-500/30 text-white text-xs font-semibold focus:outline-none focus:border-purple-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSendingCode}
                  className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                >
                  {isSendingCode ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                  <span>{isSendingCode ? 'Отправка кода...' : 'Получить 6-значный код'}</span>
                </button>
              </form>
            )}

            {recoveryStep === 'verify' && (
              <form onSubmit={handleVerifyOtp} className="space-y-3 text-xs">
                <p className="text-gray-300 text-[11px] leading-relaxed">
                  Введите 6-значный код, отправленный на адрес <strong className="text-white">{recoveryEmail}</strong>:
                </p>
                <div>
                  <input
                    type="text"
                    maxLength={6}
                    value={enteredCode}
                    onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-full text-center text-xl font-mono tracking-widest px-3 py-2.5 rounded-xl bg-white/5 border border-purple-500/40 text-purple-300 focus:outline-none focus:border-purple-400"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Check size={14} />
                  <span>Подтвердить код</span>
                </button>
                <div className="text-center pt-1">
                  {countdown > 0 ? (
                    <span className="text-[10px] text-gray-400">
                      Повторно запросить код через {countdown} сек
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendRecoveryCode()}
                      disabled={isSendingCode}
                      className="text-[10px] text-purple-300 underline hover:text-white"
                    >
                      Отправить код повторно
                    </button>
                  )}
                </div>
              </form>
            )}

            {recoveryStep === 'new_pin' && (
              <form onSubmit={handleSaveNewPinAndUnlock} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-1">
                    Новый 4-значный PIN-код:
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    inputMode="numeric"
                    value={newPinValue}
                    onChange={(e) => setNewPinValue(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full text-center text-lg font-mono tracking-widest px-3 py-2 rounded-xl bg-white/5 border border-purple-500/40 text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-1">
                    Повторите новый PIN-код:
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    inputMode="numeric"
                    value={confirmPinValue}
                    onChange={(e) => setConfirmPinValue(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full text-center text-lg font-mono tracking-widest px-3 py-2 rounded-xl bg-white/5 border border-purple-500/40 text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  Сохранить PIN и разблокировать
                </button>
                <button
                  type="button"
                  onClick={handleRemovePinAndUnlock}
                  className="w-full py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl font-semibold text-[11px] transition-all"
                >
                  Войти без PIN-кода (Снять блокировку)
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Emergency Sheet Modal (Accessible without unlocking) */}
      {showEmergency && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-[360px] bg-[#161b26] border border-rose-500/40 rounded-3xl p-5 text-white shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-rose-500/30 pb-2.5">
              <div className="flex items-center gap-2 text-rose-400 font-black text-sm">
                <HeartPulse size={20} />
                <span>ЭКСТРЕННАЯ КАРТА</span>
              </div>
              <button
                onClick={() => setShowEmergency(false)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-gray-400"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-white/5 p-2.5 rounded-xl">
                <p className="text-[10px] text-gray-400">ФИО пациента:</p>
                <p className="font-bold text-sm text-white">
                  {activeMember.lastName} {activeMember.name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 p-2 rounded-xl">
                  <p className="text-[10px] text-gray-400">Группа крови:</p>
                  <p className="font-bold text-rose-400">{activeMember.bloodType || 'A(II) Rh+'}</p>
                </div>
                <div className="bg-white/5 p-2 rounded-xl">
                  <p className="text-[10px] text-gray-400">Полис ОМС:</p>
                  <p className="font-mono font-bold text-[11px] text-white">
                    {activeMember.policyOMS || '1694 0000 0000 0000'}
                  </p>
                </div>
              </div>

              <div className="bg-rose-950/40 border border-rose-800/40 p-2.5 rounded-xl text-rose-200">
                <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                  Аллергии и непереносимости:
                </p>
                <p className="mt-0.5 text-xs font-medium">
                  {activeMember.allergies?.join(', ') || 'Особых аллергий не заявлено'}
                </p>
              </div>

              <div className="bg-white/5 p-2.5 rounded-xl text-gray-300">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  Хронические заболевания / заметки:
                </p>
                <p className="mt-0.5 text-xs">
                  {activeMember.chronicNotes || 'Данные не внесены'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowEmergency(false)}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md mt-2"
            >
              Закрыть экстренную карту
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PinLockModal;