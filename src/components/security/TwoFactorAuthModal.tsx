import React, { useState } from 'react';
import { ShieldCheck, X, Copy, Check, KeyRound } from 'lucide-react';
import { useFamily } from '../../context/FamilyContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const TwoFactorAuthModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { twoFactorEnabled, setTwoFactorEnabled, totpSecret } = useFamily();
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopySecret = () => {
    navigator.clipboard?.writeText(totpSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      setSuccess(true);
      setTwoFactorEnabled(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  };

  const handleDisable2FA = () => {
    setTwoFactorEnabled(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in select-none">
      <div className="w-full max-w-[360px] bg-white dark:bg-[#161b26] rounded-3xl p-5 border border-purple-500/20 shadow-2xl animate-scale-in text-gray-900 dark:text-white">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-700 dark:text-purple-400">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold">Google Authenticator</h3>
              <p className="text-[10px] text-gray-400">Двухфакторная защита TOTP 2FA</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-700"
          >
            <X size={15} />
          </button>
        </div>

        {!twoFactorEnabled ? (
          <div className="mt-3.5 space-y-3.5 text-xs">
            <p className="text-gray-600 dark:text-gray-300 text-[11px] leading-relaxed">
              Отсканируйте этот QR-код в приложении <strong>Google Authenticator</strong> или <strong>Яндекс Ключ</strong>:
            </p>

            {/* Stylized Crisp SVG QR-Code */}
            <div className="bg-white p-3 rounded-2xl mx-auto w-44 h-44 shadow-md flex items-center justify-center border border-gray-200">
              <svg viewBox="0 0 100 100" className="w-full h-full text-gray-900">
                {/* QR Finder Corners */}
                <rect x="5" y="5" width="26" height="26" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
                <rect x="12" y="12" width="12" height="12" rx="2" fill="currentColor" />

                <rect x="69" y="5" width="26" height="26" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
                <rect x="76" y="12" width="12" height="12" rx="2" fill="currentColor" />

                <rect x="5" y="69" width="26" height="26" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
                <rect x="12" y="76" width="12" height="12" rx="2" fill="currentColor" />

                {/* QR Code Pixel Matrix Simulation */}
                <rect x="36" y="8" width="6" height="6" fill="currentColor" />
                <rect x="46" y="14" width="6" height="6" fill="currentColor" />
                <rect x="56" y="8" width="6" height="6" fill="currentColor" />
                <rect x="36" y="24" width="6" height="6" fill="currentColor" />
                <rect x="46" y="24" width="6" height="6" fill="currentColor" />

                <rect x="8" y="36" width="6" height="6" fill="currentColor" />
                <rect x="20" y="44" width="6" height="6" fill="currentColor" />
                <rect x="36" y="36" width="8" height="8" rx="1" fill="#7c3aed" />
                <rect x="52" y="44" width="6" height="6" fill="currentColor" />
                <rect x="64" y="36" width="6" height="6" fill="currentColor" />
                <rect x="76" y="44" width="6" height="6" fill="currentColor" />
                <rect x="86" y="36" width="6" height="6" fill="currentColor" />

                <rect x="36" y="60" width="6" height="6" fill="currentColor" />
                <rect x="46" y="68" width="6" height="6" fill="currentColor" />
                <rect x="56" y="60" width="6" height="6" fill="currentColor" />
                <rect x="70" y="76" width="8" height="8" fill="currentColor" />
                <rect x="84" y="68" width="6" height="6" fill="currentColor" />
                <rect x="84" y="84" width="6" height="6" fill="currentColor" />
              </svg>
            </div>

            {/* Secret Key with Copy */}
            <div className="bg-purple-50 dark:bg-purple-950/40 p-2.5 rounded-xl border border-purple-100 dark:border-purple-900/40 flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-purple-700 dark:text-purple-300 font-bold block">
                  Секретный ключ (для ручного ввода)
                </span>
                <span className="font-mono text-xs font-bold text-gray-900 dark:text-white">
                  {totpSecret}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopySecret}
                className="p-1.5 rounded-lg bg-white dark:bg-[#1e2433] text-purple-700 dark:text-purple-300 shadow-xs hover:bg-purple-50"
                title="Скопировать ключ"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
            </div>

            {/* Form to enter 6-digit code */}
            <form onSubmit={handleVerify} className="space-y-2.5">
              <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block">
                Введите 6-значный код из Authenticator:
              </label>
              <input
                type="text"
                maxLength={6}
                pattern="[0-9]{6}"
                placeholder="482 193"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className={`w-full py-2.5 px-3 text-center text-xl font-mono tracking-widest rounded-xl border bg-gray-50 dark:bg-[#1a202c] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  error ? 'border-rose-500 text-rose-500 animate-bounce' : 'border-gray-200 dark:border-gray-700'
                }`}
                required
              />

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={code.length !== 6}
                  className="flex-1 py-2.5 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  {success ? (
                    <>
                      <Check size={14} />
                      <span>2FA Активирован!</span>
                    </>
                  ) : (
                    <>
                      <KeyRound size={14} />
                      <span>Подтвердить и включить</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setCode('654321')}
                  className="px-2.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-[10px] text-gray-400 hover:text-purple-600"
                  title="Автозаполнение демо-кода"
                >
                  Тест
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="mt-4 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <Check size={24} strokeWidth={3} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">2FA Защита включена</p>
              <p className="text-xs text-gray-400 mt-1">
                Приложение запрашивает 6-значный одноразовый код из Google Authenticator при каждом входе.
              </p>
            </div>
            <button
              onClick={handleDisable2FA}
              className="w-full py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              Отключить Google Authenticator
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
