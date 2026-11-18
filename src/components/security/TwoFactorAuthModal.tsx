import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, Copy, Check, KeyRound, Loader2 } from 'lucide-react';
import { useFamily } from '../../context/FamilyContext';
import { generateTOTPQRCodeUrl, verifyTOTPCode } from '../../utils/totp';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const TwoFactorAuthModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { twoFactorEnabled, setTwoFactorEnabled, totpSecret, userProfile } = useFamily();
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [loadingQr, setLoadingQr] = useState<boolean>(true);
  const [verifying, setVerifying] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setCode('');
      setErrorMsg(null);
      setSuccess(false);
      setLoadingQr(true);

      const targetEmail = userProfile?.email || 'yamayev2010@yandex.ru';
      generateTOTPQRCodeUrl(totpSecret, targetEmail).then((url) => {
        setQrCodeDataUrl(url);
        setLoadingQr(false);
      });
    }
  }, [isOpen, totpSecret, userProfile?.email]);

  if (!isOpen) return null;

  const handleCopySecret = () => {
    navigator.clipboard?.writeText(totpSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setErrorMsg('Введите 6 цифр из приложения');
      return;
    }

    setVerifying(true);
    setErrorMsg(null);

    const isValid = await verifyTOTPCode(totpSecret, code);
    setVerifying(false);

    if (isValid) {
      setSuccess(true);
      setTwoFactorEnabled(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } else {
      setErrorMsg('Неверный код. Проверьте время на телефоне и актуальный код в приложении.');
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  const handleDisable2FA = () => {
    setTwoFactorEnabled(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in select-none">
      <div className="w-full max-w-[360px] bg-white dark:bg-[#161b26] rounded-3xl p-5 border border-purple-500/20 shadow-2xl animate-scale-in text-gray-900 dark:text-white max-h-[92vh] overflow-y-auto no-scrollbar">
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
              Отсканируйте настоящий QR-код в приложении <strong>Google Authenticator</strong> или <strong>Яндекс Ключ</strong>:
            </p>

            {/* Real Crisp Generated Scannable QR-Code */}
            <div className="bg-white p-3 rounded-2xl mx-auto w-48 h-48 shadow-md flex items-center justify-center border border-purple-100 dark:border-purple-900/50">
              {loadingQr ? (
                <div className="flex flex-col items-center gap-2 text-purple-600">
                  <Loader2 size={28} className="animate-spin" />
                  <span className="text-[10px] text-gray-400">Генерация QR-кода...</span>
                </div>
              ) : qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="2FA TOTP QR Code"
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <div className="text-center p-2 text-rose-500 text-[11px]">
                  Не удалось сгенерировать QR. Используйте секретный ключ ниже.
                </div>
              )}
            </div>

            {/* Secret Key with Copy */}
            <div className="bg-purple-50 dark:bg-purple-950/40 p-2.5 rounded-xl border border-purple-100 dark:border-purple-900/40 flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-purple-700 dark:text-purple-300 font-bold block">
                  Секретный ключ (для ручного ввода)
                </span>
                <span className="font-mono text-xs font-bold text-gray-900 dark:text-white tracking-wider">
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
                Введите 6-значный код из Authenticator для подтверждения:
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                pattern="[0-9]{6}"
                placeholder="482 193"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className={`w-full py-2.5 px-3 text-center text-xl font-mono tracking-widest rounded-xl border bg-gray-50 dark:bg-[#1a202c] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errorMsg ? 'border-rose-500 text-rose-500' : 'border-gray-200 dark:border-gray-700'
                }`}
                required
              />

              {errorMsg && (
                <p className="text-[10px] text-rose-500 font-bold text-center leading-tight">
                  {errorMsg}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={code.length !== 6 || verifying}
                  className="flex-1 py-2.5 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  {verifying ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Проверка...</span>
                    </>
                  ) : success ? (
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

export default TwoFactorAuthModal;
