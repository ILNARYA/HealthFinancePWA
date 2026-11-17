import React, { useState } from 'react';
import { Lock, X, Check, AlertCircle } from 'lucide-react';
import { useFamily } from '../../context/FamilyContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PinSetupModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { setPinCode, setIsPinSet } = useFamily();
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [firstPin, setFirstPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentPin = step === 'create' ? firstPin : confirmPin;

  const handleKeyPress = (digit: string) => {
    if (currentPin.length < 4) {
      const next = currentPin + digit;
      if (step === 'create') {
        setFirstPin(next);
        if (next.length === 4) {
          setTimeout(() => {
            setStep('confirm');
          }, 200);
        }
      } else {
        setConfirmPin(next);
        if (next.length === 4) {
          setTimeout(() => {
            if (next === firstPin) {
              setPinCode(next);
              setIsPinSet(true);
              setSuccess(true);
              setTimeout(() => {
                setSuccess(false);
                setStep('create');
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
    if (step === 'create') {
      setFirstPin((prev) => prev.slice(0, -1));
    } else {
      setConfirmPin((prev) => prev.slice(0, -1));
    }
  };

  const handleReset = () => {
    setStep('create');
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
              <h3 className="text-sm font-extrabold tracking-tight">Установка PIN-кода</h3>
              <p className="text-[10px] text-gray-400">Защита личного кабинета от посторонних</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-700"
          >
            <X size={15} />
          </button>
        </div>

        {/* Status prompt */}
        <div className="flex flex-col items-center my-4 text-center">
          {success ? (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs animate-bounce">
              <Check size={16} />
              <span>PIN-код успешно установлен!</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold text-xs">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          ) : (
            <>
              <p className="text-xs font-bold text-gray-900 dark:text-white">
                {step === 'create' ? 'Придумайте 4-значный PIN' : 'Повторите PIN для подтверждения'}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {step === 'create' ? 'Он будет использоваться для быстрой блокировки' : 'Введите те же 4 цифры ещё раз'}
              </p>
            </>
          )}

          {/* Dots */}
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
      </div>
    </div>
  );
};
