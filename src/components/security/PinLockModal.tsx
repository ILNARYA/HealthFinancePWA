import React, { useState } from 'react';
import { ShieldCheck, Fingerprint, Delete, HeartPulse, X } from 'lucide-react';
import { useFamily } from '../../context/FamilyContext';

export const PinLockModal: React.FC = () => {
  const { isLocked, unlockApp, activeMember, biometricsEnabled } = useFamily();
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [errorShake, setErrorShake] = useState<boolean>(false);
  const [showEmergency, setShowEmergency] = useState<boolean>(false);

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

  const handleBiometrics = () => {
    unlockApp('faceid');
    setEnteredPin('');
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
            {errorShake ? 'Неверный PIN-код (попробуйте 1234)' : 'Введите PIN-код для разблокировки'}
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

          {/* Biometrics button */}
          <button
            onClick={handleBiometrics}
            className="h-14 rounded-2xl bg-purple-900/40 hover:bg-purple-800/60 active:scale-95 transition-all flex flex-col items-center justify-center border border-purple-500/30 text-purple-300"
            title={biometricsEnabled ? 'Войти по Face ID / Touch ID' : 'Быстрый вход'}
          >
            <Fingerprint size={22} />
            <span className="text-[9px] font-semibold mt-0.5">Touch ID</span>
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
          >
            <Delete size={20} />
          </button>
        </div>

        {/* Emergency Medical Sheet Action */}
        <div className="mt-2 text-center">
          <button
            onClick={() => setShowEmergency(true)}
            className="text-xs text-rose-400/90 hover:text-rose-300 font-semibold flex items-center gap-1.5 underline px-3 py-1"
          >
            <HeartPulse size={14} />
            <span>Экстренная медицинская карта</span>
          </button>
        </div>
      </div>

      {/* Emergency Sheet Modal (Accessible without unlocking) */}
      {showEmergency && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-end justify-center p-4">
          <div className="w-full max-w-[360px] bg-[#1e2433] rounded-3xl p-5 border border-rose-500/40 text-white animate-slide-up">
            <div className="flex items-center justify-between mb-3 border-b border-gray-700 pb-2">
              <div className="flex items-center gap-2 text-rose-400">
                <HeartPulse size={20} />
                <h3 className="text-sm font-extrabold uppercase">Экстренные медданные</h3>
              </div>
              <button onClick={() => setShowEmergency(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-700/50">
                <span className="text-gray-400">ФИО пациента:</span>
                <span className="font-bold">{activeMember.name} ({activeMember.roleLabel})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-700/50">
                <span className="text-gray-400">Группа крови:</span>
                <span className="font-bold text-rose-400">{activeMember.bloodType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-700/50">
                <span className="text-gray-400">Полис ОМС:</span>
                <span className="font-mono font-bold">{activeMember.policyOMS}</span>
              </div>
              {activeMember.policyDMS && (
                <div className="flex justify-between py-1 border-b border-gray-700/50">
                  <span className="text-gray-400">Полис ДМС:</span>
                  <span className="font-bold text-purple-300">{activeMember.policyDMS}</span>
                </div>
              )}
              <div className="py-1">
                <span className="text-gray-400 block mb-0.5">Аллергии и непереносимости:</span>
                <div className="flex flex-wrap gap-1">
                  {(activeMember.allergies || ['Нет']).map((a, i) => (
                    <span key={i} className="bg-rose-950/80 text-rose-300 border border-rose-700/50 px-2 py-0.5 rounded-md text-[10px] font-bold">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowEmergency(false)}
              className="mt-4 w-full py-2.5 bg-rose-600 hover:bg-rose-700 rounded-xl font-bold text-xs"
            >
              Закрыть карту
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
