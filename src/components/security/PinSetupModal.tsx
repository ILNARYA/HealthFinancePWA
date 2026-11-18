import React, { useState, useEffect } from 'react';
import { Lock, X, Check, AlertCircle, Mail, Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useFamily } from '../../context/FamilyContext';
import { sendPasswordResetOtp } from '../../config/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PinSetupModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { setPinCode, setIsPinSet, isPinSet, pinCode, userProfile } = useFamily();

  // Steps: 'verify_old' -> 'create' -> 'confirm' | 'forgot_pin'
  const [step, setStep] = useState<'verify_old' | 'create' | 'confirm' | 'forgot_pin'>('create');
  const [oldPin, setOldPin] = useState<string>('');
  const [firstPin, setFirstPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Email OTP recovery state
  const [otpCode, setOtpCode] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpCountdown, setOtpCountdown] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      if (isPinSet && pinCode) {
        setStep('verify_old');
      } else {
        setStep('create');
      }
      setOldPin('');
      setFirstPin('');
      setConfirmPin('');
      setError(null);
      setSuccess(false);
      setOtpSent(false);
      setEnteredOtp('');
    }
  }, [isOpen, isPinSet, pinCode]);

  useEffect(() => {
    let timer: any;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  if (!isOpen) return null;

  const currentPin =
    step === 'verify_old' ? oldPin : step === 'create' ? firstPin : confirmPin;

  const handleKeyPress = (digit: string) => {
    if (currentPin.length < 4) {
      const next = currentPin + digit;
      if (step === 'verify_old') {
        setOldPin(next);
        if (next.length === 4) {
          setTimeout(() => {
            if (next === pinCode) {
              setStep('create');
              setOldPin('');
              setError(null);
            } else {
              setError('Неверный старый PIN-код. Попробуйте снова.');
              setTimeout(() => {
                setOldPin('');
                setError(null);
              }, 1200);
            }
          }, 200);
        }
      } else if (step === 'create') {
        setFirstPin(next);
        if (next.length === 4) {
          setTimeout(() => {
            setStep('confirm');
          }, 200);
        }
      } else if (step === 'confirm') {
        setConfirmPin(next);
        if (next.length === 4) {
          setTimeout(() => {
            if (next === firstPin) {
              setPinCode(next);
              setIsPinSet(true);
              setSuccess(true);
              setTimeout(() => {
                setSuccess(false);
                setStep(isPinSet ? 'verify_old' : 'create');
                setFirstPin('');
                setConfirmPin('');
                setError(null);
                onClose();
                if (onSuccess) onSuccess();
              }, 900);
            } else {
              setError('PIN-коды не совпали. Попробуйте снова.');
              setTimeout(() => {
                setStep('create');
                setFirstPin('');
                setConfirmPin('');
                setError(null);
              }, 1200);
            }
          }, 200);
        }
      }
    }
  };

  const handleDelete = () => {
    if (step === 'verify_old') {
      setOldPin((prev) => prev.slice(0, -1));
    } else if (step === 'create') {
      setFirstPin((prev) => prev.slice(0, -1));
    } else if (step === 'confirm') {
      setConfirmPin((prev) => prev.slice(0, -1));
    }
  };

  const handleSendOtp = async () => {
    const targetEmail = userProfile.email || 'yamayev2010@yandex.ru';
    setIsSendingOtp(true);
    setError(null);
    const gen = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpCode(gen);

    try {
      await sendPasswordResetOtp(targetEmail, gen);
      setOtpSent(true);
      setOtpCountdown(60);
    } catch (err: any) {
      console.warn('PIN reset OTP error:', err);
    }
    setIsSendingOtp(false);
  };

  const handleVerifyOtp = () => {
    if (enteredOtp.trim().length !== 6) {
      setError('Введите полный 6-значный код из письма.');
      return;
    }
    if (enteredOtp.trim() !== otpCode) {
      setError('Неверный код безопасности. Проверьте почту.');
      return;
    }
    setError(null);
    setStep('create');
  };

  const handleReset = () => {
    setOldPin('');
    setFirstPin('');
    setConfirmPin('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in select-none">
      <div className="w-full max-w-[340px] bg-white dark:bg-[#161b26] rounded-3xl p-5 border border-purple-500/20 shadow-2xl animate-scale-in text-gray-900 dark:text-white flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-700 dark:text-purple-400">
              <Lock size={18} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold tracking-tight">
                {step === 'verify_old'
                  ? 'Смена PIN-кода'
                  : step === 'forgot_pin'
                  ? 'Сброс PIN-кода'
                  : isPinSet
                  ? 'Новый PIN-код'
                  : 'Установка PIN-кода'}
              </h3>
              <p className="text-[10px] text-gray-400">
                {step === 'verify_old'
                  ? 'Шаг 1 из 2: подтверждение владельца'
                  : step === 'forgot_pin'
                  ? 'Подтверждение через Email'
                  : 'Защита личного кабинета от посторонних'}
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-700"
          >
            <X size={15} />
          </button>
        </div>

        {/* FORGOT PIN / EMAIL OTP VIEW */}
        {step === 'forgot_pin' ? (
          <div className="w-full space-y-3.5 my-3 text-xs animate-fade-in">
            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-100 dark:border-purple-900/40 space-y-1 text-center">
              <div className="w-10 h-10 mx-auto rounded-2xl bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center text-purple-700 dark:text-purple-300">
                <Mail size={18} />
              </div>
              <p className="font-bold text-gray-900 dark:text-white text-xs">
                Восстановление доступа
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                Мы отправим 6-значный код безопасности на адрес{' '}
                <span className="font-bold text-purple-700 dark:text-purple-300">{userProfile.email}</span>
              </p>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-[11px] font-bold text-rose-700 dark:text-rose-300 text-center animate-shake">
                {error}
              </div>
            )}

            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSendingOtp}
                className="w-full py-3 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded-2xl text-xs font-bold shadow-lg shadow-purple-500/25 flex items-center justify-center gap-1.5 active:scale-98 transition-all"
              >
                {isSendingOtp ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />}
                <span>{isSendingOtp ? 'Отправка кода...' : 'Отправить код на email'}</span>
              </button>
            ) : (
              <div className="space-y-3 animate-fade-in">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block text-center uppercase tracking-wider mb-1">
                    Введите 6-значный код из письма
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={enteredOtp}
                    onChange={(e) => {
                      setEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                      if (error) setError(null);
                    }}
                    placeholder="••••••"
                    autoFocus
                    className="w-full text-center text-2xl font-black font-mono tracking-[0.3em] py-2 px-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#1a202c] text-purple-700 dark:text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={enteredOtp.length !== 6}
                  className="w-full py-3 bg-purple-700 hover:bg-purple-800 disabled:opacity-40 text-white rounded-2xl text-xs font-bold shadow-lg shadow-purple-500/25 flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                >
                  <ShieldCheck size={15} />
                  <span>Подтвердить и задать новый PIN</span>
                </button>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('verify_old');
                      setError(null);
                    }}
                    className="text-gray-400 hover:text-purple-600 font-semibold flex items-center gap-1"
                  >
                    <ArrowLeft size={12} />
                    <span>Ввести PIN</span>
                  </button>

                  {otpCountdown > 0 ? (
                    <span className="text-gray-400 font-mono text-[10px]">
                      Повторно через {otpCountdown}с
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-purple-700 dark:text-purple-400 font-bold hover:underline"
                    >
                      Выслать снова
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* STANDARD NUMPAD VIEW: 'verify_old' | 'create' | 'confirm' */
          <>
            {/* Status prompt */}
            <div className="flex flex-col items-center my-4 text-center">
              {success ? (
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs animate-bounce">
                  <Check size={16} />
                  <span>PIN-код успешно обновлен!</span>
                </div>
              ) : error ? (
                <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold text-xs animate-shake">
                  <AlertCircle size={15} />
                  <span>{error}</span>
                </div>
              ) : (
                <>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    {step === 'verify_old'
                      ? 'Введите текущий PIN-код'
                      : step === 'create'
                      ? 'Придумайте новый 4-значный PIN'
                      : 'Повторите новый PIN'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {step === 'verify_old'
                      ? 'Для подтверждения права на смену кода'
                      : step === 'create'
                      ? 'Он будет использоваться для блокировки'
                      : 'Введите те же 4 цифры ещё раз'}
                  </p>
                </>
              )}

              {/* 4 Dots */}
              <div className="flex items-center gap-3.5 mt-4">
                {[0, 1, 2, 3].map((idx) => {
                  const filled = currentPin.length > idx;
                  return (
                    <div
                      key={idx}
                      className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                        filled
                          ? 'bg-purple-600 scale-125 shadow-md shadow-purple-500/50'
                          : 'border-2 border-gray-300 dark:border-gray-700 bg-transparent'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Keypad */}
            <div className="w-full grid grid-cols-3 gap-2 px-2 mt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleKeyPress(digit)}
                  className="h-12 rounded-2xl bg-gray-100/80 dark:bg-[#1e2433] hover:bg-gray-200 dark:hover:bg-[#283144] active:scale-95 transition-all text-lg font-bold flex items-center justify-center text-gray-900 dark:text-white shadow-xs"
                >
                  {digit}
                </button>
              ))}
              <div />
              <button
                onClick={() => handleKeyPress('0')}
                className="h-12 rounded-2xl bg-gray-100/80 dark:bg-[#1e2433] hover:bg-gray-200 dark:hover:bg-[#283144] active:scale-95 transition-all text-lg font-bold flex items-center justify-center text-gray-900 dark:text-white shadow-xs"
              >
                0
              </button>
              <button
                onClick={handleDelete}
                className="h-12 rounded-2xl bg-gray-100/80 dark:bg-[#1e2433] hover:bg-gray-200 dark:hover:bg-[#283144] active:scale-95 transition-all text-xs font-bold flex items-center justify-center text-gray-500 hover:text-rose-500"
              >
                Удалить
              </button>
            </div>

            {/* "Forgot Old PIN?" link */}
            {step === 'verify_old' && (
              <div className="pt-3 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep('forgot_pin');
                    setError(null);
                  }}
                  className="text-[11px] text-purple-700 dark:text-purple-400 font-bold hover:underline"
                >
                  Забыли старый PIN-код? Сбросить по email
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PinSetupModal;
