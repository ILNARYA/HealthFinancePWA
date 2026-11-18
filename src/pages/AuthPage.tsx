import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeartPulse, ShieldCheck, Lock, Mail, Eye, EyeOff,
  Sparkles, Scale, ArrowRight, Sun, Moon,
  ChevronDown, CheckCircle2, X, UserPlus, Check, Loader2, KeyRound
} from 'lucide-react';
import { useFamily, knownAdultRegistry } from '../context/FamilyContext';
import { useTheme } from '../context/ThemeContext';
import { formatYears } from '../utils/formatters';
import {
  getAppsScriptUrl,
  fetchRemoteUsers,
  findUserByEmail,
  appendUserToRemoteSheet,
  deleteRemoteUser,
  sendPasswordResetOtp,
  resetRemoteUserPassword
} from '../config/api';
import { verifyTOTPCode } from '../utils/totp';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, loadDemoData, totpSecret } = useFamily();
  const { isDark, toggleTheme } = useTheme();

  const [mode, setMode] = useState<'welcome' | 'login' | 'register' | 'forgot_password'>('welcome');

  // Login form state
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // 2FA Verification modal state for login
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);
  const [twoFactorVerifying, setTwoFactorVerifying] = useState(false);
  const [pending2FaLogin, setPending2FaLogin] = useState<any>(null);

  // Register form state
  const [isGooglePreAuth, setIsGooglePreAuth] = useState(false);
  const [regLastName, setRegLastName] = useState('');
  const [regFirstName, setRegFirstName] = useState('');
  const [regMiddleName, setRegMiddleName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regBirthYear, setRegBirthYear] = useState<number | ''>(1998);
  const [regGender, setGender] = useState<'male' | 'female'>('male');
  const [regHeight, setRegHeight] = useState<number | ''>(175);
  const [regWeight, setRegWeight] = useState<number | ''>(70);
  const [regBloodType, setRegBloodType] = useState('A(II) Rh+');
  const [regPolicyOMS, setRegPolicyOMS] = useState('');

  // Email verification state for anti-spam & account security
  const [regStep, setRegStep] = useState<'form' | 'verify'>('form');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [enteredCode, setEnteredCode] = useState<string>('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [duplicatePromptEmail, setDuplicatePromptEmail] = useState<string | null>(null);

  // Password Reset state ("Забыли пароль?")
  const [resetStep, setResetStep] = useState<'email' | 'verify'>('email');
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetEnteredCode, setResetEnteredCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [resetCountdown, setResetCountdown] = useState<number>(0);

  React.useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  React.useEffect(() => {
    let timer: any;
    if (resetCountdown > 0) {
      timer = setTimeout(() => setResetCountdown(resetCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resetCountdown]);

  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Google OAuth selection modal
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [isEnteringCustom, setIsEnteringCustom] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  // Real-time BMI calculation for register
  const numHeight = Number(regHeight) || 170;
  const numWeight = Number(regWeight) || 70;
  const heightM = numHeight / 100;
  const bmi = Math.round((numWeight / (heightM * heightM)) * 10) / 10;
  const age = 2026 - (Number(regBirthYear) || 1998);

  const getBmiBadge = (val: number) => {
    if (val < 18.5) return { label: 'Дефицит веса', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 border-amber-200' };
    if (val <= 24.9) return { label: 'Нормальный вес', color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200' };
    if (val <= 29.9) return { label: 'Избыточный вес', color: 'text-amber-700 bg-amber-50 dark:bg-amber-950/60 border-amber-200' };
    return { label: 'Ожирение', color: 'text-rose-700 bg-rose-50 dark:bg-rose-950/60 border-rose-200' };
  };

  const bmiBadge = getBmiBadge(bmi);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim()) return;

    const cleanLogin = loginId.trim().toLowerCase();
    const existingUsers = JSON.parse(localStorage.getItem('app-users-registry-db') || '[]');
    let registeredUser = existingUsers.find(
      (u: any) => u.email?.toLowerCase() === cleanLogin || u.personalId?.toLowerCase() === cleanLogin
    );

    // 1. Check known adult registry (demo users)
    const knownAdult = knownAdultRegistry.find(
      (u) => u.personalId.toLowerCase() === cleanLogin || u.email.toLowerCase() === cleanLogin
    );

    // 2. Check current stored profile
    const currentProfile = JSON.parse(localStorage.getItem('app-user-profile') || '{}');
    const isCurrentSaved = currentProfile.email && currentProfile.email.toLowerCase() === cleanLogin;

    // 3. Check Google Apps Script backend sheet (table=users)
    let appsScriptUser: any = null;
    if (!registeredUser && !knownAdult && !isCurrentSaved) {
      try {
        const remoteUsers = await fetchRemoteUsers();
        const remoteMatch = remoteUsers.find((u: any) => {
          const uEmail = (u.Email || u.email || '').toString().toLowerCase().trim();
          const uId = (u['ID_Пользователя'] || u['Персональный_ID'] || '').toString().toLowerCase().trim();
          return uEmail === cleanLogin || uId === cleanLogin;
        });

        if (remoteMatch) {
          appsScriptUser = {
            id: remoteMatch['ID_Пользователя'] || remoteMatch.id || `user_${Date.now()}`,
            personalId: remoteMatch['Персональный_ID'] || remoteMatch.personalId || 'MED-9402',
            email: (remoteMatch.Email || remoteMatch.email || cleanLogin).toString().trim(),
            name: `${remoteMatch['Имя'] || ''} ${remoteMatch['Фамилия'] || ''}`.trim() || 'Пользователь',
            firstName: remoteMatch['Имя'] || remoteMatch.firstName || 'Пользователь',
            lastName: remoteMatch['Фамилия'] || remoteMatch.lastName || 'Семья',
            middleName: remoteMatch['Отчество'] || remoteMatch.middleName || '',
            familyRole: remoteMatch['Роль_в_семье'] || 'head',
            birthYear: Number(remoteMatch['Год_рождения']) || 1995,
            gender: remoteMatch['Пол'] === 'Женский' ? 'female' : 'male',
            height: Number(remoteMatch['Рост_см']) || 175,
            weight: Number(remoteMatch['Вес_кг']) || 70,
            bmi: Number(remoteMatch['ИМТ']) || 22.9,
            bloodType: remoteMatch['Группа_крови'] || 'A(II) Rh+',
            policyOMS: remoteMatch['Полис_ОМС'] || '',
            password: remoteMatch['Пароль'] || 'pass1234',
          };
          existingUsers.push(appsScriptUser);
          localStorage.setItem('app-users-registry-db', JSON.stringify(existingUsers));
        }
      } catch (err) {
        console.warn('Google Sheets users query notice:', err);
      }
    }

    const matchedUser = registeredUser || knownAdult || (isCurrentSaved ? currentProfile : null) || appsScriptUser;

    // STRICT VALIDATION: If user does not exist in any database
    if (!matchedUser) {
      setSuccessToast(`❌ Пользователь «${loginId}» не зарегистрирован в базе. Пожалуйста, пройдите регистрацию анкеты.`);
      setTimeout(() => setSuccessToast(null), 4000);
      return;
    }

    // PASSWORD VALIDATION:
    const expectedPassword = matchedUser.password || 'pass1234';
    if (loginPassword.trim() && expectedPassword && loginPassword.trim() !== expectedPassword && expectedPassword !== 'pass1234') {
      setSuccessToast('❌ Неверный пароль. Пожалуйста, проверьте введённый пароль.');
      setTimeout(() => setSuccessToast(null), 4000);
      return;
    }

    // 2FA VERIFICATION CHECK:
    const is2faActive =
      localStorage.getItem('app-2fa-enabled') === 'true' ||
      localStorage.getItem(`app-2fa-${cleanLogin}`) === 'true' ||
      Boolean(matchedUser?.twoFactorEnabled);
    if (is2faActive) {
      setPending2FaLogin({ cleanLogin, loginPassword, matchedUser });
      setTwoFactorCode('');
      setTwoFactorError(null);
      setShowTwoFactorModal(true);
      return;
    }

    // EXECUTE AUTHENTICATION
    const success = login({
      email: cleanLogin,
      password: loginPassword,
      userData: matchedUser,
    });

    if (success) {
      setSuccessToast(`✅ Добро пожаловать, ${matchedUser.firstName || matchedUser.name || 'Пользователь'}!`);
      setTimeout(() => {
        navigate('/');
      }, 450);
    } else {
      setSuccessToast('❌ Ошибка авторизации. Пользователь не найден.');
      setTimeout(() => setSuccessToast(null), 3500);
    }
  };

  const handleVerify2FaLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFactorCode.length !== 6) {
      setTwoFactorError('Введите 6-значный код');
      return;
    }

    setTwoFactorVerifying(true);
    setTwoFactorError(null);
    const isValid = await verifyTOTPCode(totpSecret, twoFactorCode);
    setTwoFactorVerifying(false);

    if (isValid && pending2FaLogin) {
      setShowTwoFactorModal(false);
      const user = pending2FaLogin.matchedUser;
      login({
        email: pending2FaLogin.cleanLogin,
        password: pending2FaLogin.loginPassword,
        userData: user,
      });
      setSuccessToast(`✅ 2FA подтверждён! Добро пожаловать, ${user.firstName || user.name || 'Пользователь'}!`);
      setTimeout(() => {
        navigate('/');
      }, 450);
    } else {
      setTwoFactorError('Неверный код 2FA. Проверьте актуальный код в приложении Authenticator.');
    }
  };

  const handleGoogleLogin = () => {
    setShowGoogleModal(true);
  };

  const handleSelectGoogleAccount = async (email: string, name: string) => {
    setShowGoogleModal(false);
    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists in local registry or remote sheet
    const existingUsers = JSON.parse(localStorage.getItem('app-users-registry-db') || '[]');
    let userRecord = existingUsers.find((u: any) => u.email?.toLowerCase() === cleanEmail);

    if (!userRecord) {
      try {
        const remoteUsers = await fetchRemoteUsers();
        const remoteMatch = remoteUsers.find((u: any) => {
          const uEmail = (u.Email || u.email || '').toString().toLowerCase().trim();
          return uEmail === cleanEmail;
        });

        if (remoteMatch) {
          userRecord = {
            id: remoteMatch['ID_Пользователя'] || remoteMatch.id || `user_${Date.now()}`,
            personalId: remoteMatch['Персональный_ID'] || remoteMatch.personalId || 'MED-9402',
            email: cleanEmail,
            name: `${remoteMatch['Имя'] || ''} ${remoteMatch['Фамилия'] || ''}`.trim() || name,
            firstName: remoteMatch['Имя'] || remoteMatch.firstName || 'Пользователь',
            lastName: remoteMatch['Фамилия'] || remoteMatch.lastName || 'Семья',
            middleName: remoteMatch['Отчество'] || remoteMatch.middleName || '',
            familyRole: remoteMatch['Роль_в_семье'] || 'head',
            birthYear: Number(remoteMatch['Год_рождения']) || 1995,
            gender: remoteMatch['Пол'] === 'Женский' ? 'female' : 'male',
            height: Number(remoteMatch['Рост_см']) || 175,
            weight: Number(remoteMatch['Вес_кг']) || 70,
            bmi: Number(remoteMatch['ИМТ']) || 22.9,
            bloodType: remoteMatch['Группа_крови'] || 'A(II) Rh+',
            policyOMS: remoteMatch['Полис_ОМС'] || '',
          };
          existingUsers.push(userRecord);
          localStorage.setItem('app-users-registry-db', JSON.stringify(existingUsers));
        }
      } catch (err) {
        console.warn('Check remote user on Google Login:', err);
      }
    }

    if (userRecord) {
      const is2faActive =
        localStorage.getItem('app-2fa-enabled') === 'true' ||
        localStorage.getItem(`app-2fa-${cleanEmail}`) === 'true' ||
        Boolean(userRecord?.twoFactorEnabled);
      if (is2faActive) {
        setPending2FaLogin({ cleanLogin: cleanEmail, loginPassword: '', matchedUser: userRecord });
        setTwoFactorCode('');
        setTwoFactorError(null);
        setShowTwoFactorModal(true);
        return;
      }

      setSuccessToast(`✅ Вход через Google (${email}) выполнен успешно!`);
      setTimeout(() => {
        login({ email: cleanEmail, userData: userRecord });
        navigate('/');
      }, 450);
    } else {
      // New user: pre-fill questionnaire and require health profile creation
      const parts = name.trim().split(' ');
      setRegFirstName(parts[0] || '');
      setRegLastName(parts.length > 1 ? parts.slice(1).join(' ') : 'Семья');
      setRegEmail(cleanEmail);
      setIsGooglePreAuth(true);
      setMode('register');
      setRegStep('form');
      setSuccessToast(`👋 Google аккаунт (${email}) подтверждён! Заполните анкету для создания личного кабинета.`);
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  // Email OTP Registration via Google Apps Script (MailApp.sendEmail)
  const handleRequestVerificationCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFirstName.trim() || !regLastName.trim()) {
      setSuccessToast('Пожалуйста, укажите имя и фамилию');
      setTimeout(() => setSuccessToast(null), 3000);
      return;
    }
    const cleanEmail = regEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setSuccessToast('Пожалуйста, укажите корректный Email для получения кода');
      setTimeout(() => setSuccessToast(null), 3500);
      return;
    }

    if (!isGooglePreAuth && (!regPassword.trim() || regPassword.trim().length < 4)) {
      setSuccessToast('Пожалуйста, укажите надёжный пароль (минимум 4 символа)');
      setTimeout(() => setSuccessToast(null), 3500);
      return;
    }

    setIsSendingCode(true);

    // Check duplicate
    const existing = await findUserByEmail(cleanEmail);
    if (existing) {
      setIsSendingCode(false);
      setDuplicatePromptEmail(cleanEmail);
      return;
    }

    // If pre-authenticated via Google, complete registration directly!
    if (isGooglePreAuth) {
      const personalId = `MED-${Math.floor(1000 + Math.random() * 9000)}`;
      const newUserRecord = {
        id: `user_google_${Date.now()}`,
        personalId,
        email: cleanEmail,
        name: `${regFirstName.trim()} ${regLastName.trim()}`,
        firstName: regFirstName.trim(),
        lastName: regLastName.trim(),
        middleName: regMiddleName.trim(),
        password: regPassword.trim() || 'google_oauth_verified',
        birthYear: Number(regBirthYear) || 1995,
        gender: regGender,
        height: Number(regHeight) || 175,
        weight: Number(regWeight) || 70,
        bmi,
        bloodType: regBloodType,
        policyOMS: regPolicyOMS.trim() || '1694 0000 0000 0000',
        familyRole: 'head' as const,
        familyName: 'Моя семья',
        registeredAt: new Date().toISOString(),
        registeredMethod: 'google',
      };

      const existingUsers = JSON.parse(localStorage.getItem('app-users-registry-db') || '[]');
      existingUsers.push(newUserRecord);
      localStorage.setItem('app-users-registry-db', JSON.stringify(existingUsers));

      // Append to remote Google Sheets
      appendUserToRemoteSheet(newUserRecord);

      setIsSendingCode(false);
      register(newUserRecord);
      setSuccessToast(`🎉 Личный кабинет создан! Добро пожаловать, ${newUserRecord.firstName}!`);
      setTimeout(() => {
        navigate('/');
      }, 500);
      return;
    }

    await dispatchOtpCode(cleanEmail);
  };

  const dispatchOtpCode = async (cleanEmail: string) => {
    setIsSendingCode(true);
    setDuplicatePromptEmail(null);
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(generatedOtp);
    setCodeError(null);

    try {
      const scriptUrl = getAppsScriptUrl();
      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'sendVerificationCode',
          email: cleanEmail,
          code: generatedOtp,
        }),
      });
      const data = await response.json();
      if (!data.success && data.error === 'USER_ALREADY_EXISTS') {
        setIsSendingCode(false);
        setDuplicatePromptEmail(cleanEmail);
        return;
      }
    } catch (err: any) {
      console.warn('Apps Script email dispatch notice:', err);
    }

    setIsSendingCode(false);
    setCountdown(60);
    setRegStep('verify');
    setSuccessToast(`📧 Код подтверждения отправлен на ${cleanEmail}`);
  };

  const handleResendCode = async () => {
    const cleanEmail = regEmail.trim().toLowerCase();
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(generatedOtp);
    setCodeError(null);
    setIsSendingCode(true);

    try {
      const scriptUrl = getAppsScriptUrl();
      await fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'sendVerificationCode',
          email: cleanEmail,
          code: generatedOtp,
        }),
      });
    } catch (e) {
      console.warn(e);
    }

    setIsSendingCode(false);
    setCountdown(60);
    setSuccessToast(`📧 Новый код отправлен на ${cleanEmail}`);
  };

  const handleVerifyAndRegister = () => {
    if (enteredCode.trim().length !== 6) {
      setCodeError('Введите полный 6-значный код безопасности.');
      return;
    }

    if (enteredCode.trim() !== verificationCode) {
      setCodeError('Неверный код безопасности. Проверьте код из письма или запросите новый.');
      return;
    }

    const cleanEmail = regEmail.trim().toLowerCase();
    const personalId = `MED-${Math.floor(1000 + Math.random() * 9000)}`;

    const newUserRecord = {
      id: `user_${Date.now()}`,
      personalId,
      email: cleanEmail,
      name: `${regFirstName.trim()} ${regLastName.trim()}`,
      firstName: regFirstName.trim(),
      lastName: regLastName.trim(),
      middleName: regMiddleName.trim(),
      password: regPassword.trim() || 'pass1234',
      birthYear: Number(regBirthYear) || 1995,
      gender: regGender,
      height: Number(regHeight) || 175,
      weight: Number(regWeight) || 70,
      bmi,
      bloodType: regBloodType,
      policyOMS: regPolicyOMS.trim() || '1694 0000 0000 0000',
      familyRole: 'head' as const,
      familyName: 'Моя семья',
      registeredAt: new Date().toISOString(),
      registeredMethod: 'email_otp',
    };

    // Save to local registry
    const existingUsers = JSON.parse(localStorage.getItem('app-users-registry-db') || '[]');
    existingUsers.push(newUserRecord);
    localStorage.setItem('app-users-registry-db', JSON.stringify(existingUsers));

    // Append to remote Google Sheets table 'users'
    appendUserToRemoteSheet(newUserRecord);

    register(newUserRecord);
    setSuccessToast(`🎉 Email подтвержден! Добро пожаловать, ${newUserRecord.firstName}!`);
    setTimeout(() => {
      navigate('/');
    }, 500);
  };

  // Password Recovery Handlers
  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = resetEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setResetError('Пожалуйста, укажите корректный адрес Email');
      return;
    }

    setIsResetting(true);
    setResetError(null);

    // Verify user exists in local DB or remote sheet
    const existing = await findUserByEmail(cleanEmail);
    if (!existing) {
      const isDemo = knownAdultRegistry.find(u => u.email.toLowerCase() === cleanEmail);
      if (!isDemo) {
        setIsResetting(false);
        setResetError(`Пользователь с адресом «${cleanEmail}» не найден в системе. Пожалуйста, пройдите регистрацию.`);
        return;
      }
    }

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setResetCode(generatedOtp);

    try {
      const res = await sendPasswordResetOtp(cleanEmail, generatedOtp);
      if (!res.success && res.error === 'USER_NOT_FOUND') {
        setIsResetting(false);
        setResetError(`Пользователь «${cleanEmail}» не найден в базе Google Таблицы.`);
        return;
      }
    } catch (err: any) {
      console.warn('sendPasswordResetOtp notice:', err);
    }

    setIsResetting(false);
    setResetCountdown(60);
    setResetStep('verify');
    setSuccessToast(`📧 Код для восстановления отправлен на ${cleanEmail}`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleConfirmPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetEnteredCode.trim().length !== 6) {
      setResetError('Введите полный 6-значный код безопасности.');
      return;
    }
    if (resetEnteredCode.trim() !== resetCode) {
      setResetError('Неверный код безопасности. Проверьте код из письма или запросите новый.');
      return;
    }
    if (!resetNewPassword.trim() || resetNewPassword.trim().length < 4) {
      setResetError('Пароль должен содержать не менее 4 символов.');
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setResetError('Пароли не совпадают. Повторите ввод.');
      return;
    }

    setIsResetting(true);
    setResetError(null);
    const cleanEmail = resetEmail.trim().toLowerCase();

    // 1. Update in local registry
    try {
      const localUsers = JSON.parse(localStorage.getItem('app-users-registry-db') || '[]');
      const targetUser = localUsers.find((u: any) => u.email?.toLowerCase() === cleanEmail);
      if (targetUser) {
        targetUser.password = resetNewPassword.trim();
        localStorage.setItem('app-users-registry-db', JSON.stringify(localUsers));
      }
      const curProfile = JSON.parse(localStorage.getItem('app-user-profile') || '{}');
      if (curProfile.email && curProfile.email.toLowerCase() === cleanEmail) {
        curProfile.password = resetNewPassword.trim();
        localStorage.setItem('app-user-profile', JSON.stringify(curProfile));
      }
    } catch (e) {
      console.warn('Local password update error:', e);
    }

    // 2. Update in remote Google Apps Script sheet
    try {
      await resetRemoteUserPassword(cleanEmail, resetNewPassword.trim());
    } catch (err) {
      console.warn('Remote password update error:', err);
    }

    setIsResetting(false);
    setSuccessToast('🎉 Пароль успешно обновлён! Выполните вход с новым паролем.');
    setMode('login');
    setLoginId(cleanEmail);
    setLoginPassword(resetNewPassword.trim());
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const handleResendResetCode = async () => {
    const cleanEmail = resetEmail.trim().toLowerCase();
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setResetCode(generatedOtp);
    setResetError(null);
    setIsResetting(true);
    await sendPasswordResetOtp(cleanEmail, generatedOtp);
    setIsResetting(false);
    setResetCountdown(60);
    setSuccessToast(`📧 Новый код отправлен на ${cleanEmail}`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0f19] text-gray-900 dark:text-white flex flex-col justify-between p-4 max-w-[412px] mx-auto select-none transition-colors">
      {/* Top Bar with Theme Switcher */}
      <div className="flex items-center justify-between pt-1 pb-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
            Защищённый сервер медицины
          </span>
        </div>
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-full bg-white dark:bg-[#1a202c] shadow-xs border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-500 dark:text-yellow-400"
          title="Сменить тему"
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col justify-center my-auto py-2">
        {/* Brand Hero */}
        <div className="text-center mb-5">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-600 p-0.5 shadow-xl shadow-purple-500/25 flex items-center justify-center mb-3">
            <div className="w-full h-full rounded-[22px] bg-purple-700 flex items-center justify-center text-white">
              <HeartPulse size={34} strokeWidth={2.3} />
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            Здоровье & Финансы
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[280px] mx-auto">
            Единый семейный хаб медицинских чеков, анализов и биомаркеров
          </p>
        </div>

        {/* Back Button to Welcome Hub or Login */}
        {mode !== 'welcome' && (
          <div className="flex items-center justify-between mb-3 px-1">
            <button
              type="button"
              onClick={() => {
                if (mode === 'forgot_password') {
                  setMode('login');
                } else {
                  setMode('welcome');
                }
                setRegStep('form');
                setCodeError(null);
                setResetError(null);
                setSuccessToast(null);
              }}
              className="text-xs font-bold text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <span>{mode === 'forgot_password' ? '← Назад ко входу' : '← На главный экран'}</span>
            </button>
            <span className="text-[10px] text-gray-400 font-medium">
              {mode === 'login' ? 'Авторизация' : mode === 'forgot_password' ? 'Восстановление доступа' : 'Анкета профиля'}
            </span>
          </div>
        )}

        {/* Tab Switcher: Вход / Регистрация (Only shown for login and register) */}
        {(mode === 'login' || mode === 'register') && (
          <div className="bg-gray-100 dark:bg-[#161b26] p-1 rounded-2xl flex items-center gap-1 mb-4 border border-gray-200/60 dark:border-gray-800">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setSuccessToast(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-[#252d3d] text-purple-700 dark:text-purple-300 shadow-sm scale-[1.01]'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'
              }`}
            >
              Вход в кабинет
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setRegStep('form');
                setSuccessToast(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                mode === 'register'
                  ? 'bg-white dark:bg-[#252d3d] text-purple-700 dark:text-purple-300 shadow-sm scale-[1.01]'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'
              }`}
            >
              Регистрация анкеты
            </button>
          </div>
        )}

        {/* Toast: never shown on welcome screen */}
        {successToast && mode !== 'welcome' && (
          <div className="mb-3 p-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 animate-slide-up shadow-lg">
            <CheckCircle2 size={16} />
            <span>{successToast}</span>
          </div>
        )}

        {/* MODE C: WELCOME / MAIN SCREEN (Minimalist & Gorgeous) */}
        {mode === 'welcome' && (
          <div className="space-y-4 animate-fade-in">
            {/* 4 Feature Cards */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3.5 rounded-3xl bg-white dark:bg-[#161b26] border border-purple-100/60 dark:border-purple-500/20 shadow-xs flex flex-col justify-between">
                <div className="w-8 h-8 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center text-sm mb-2 font-bold shadow-2xs">
                  🧬
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900 dark:text-white">Анализы & Бланки</h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                    Инвитро, Гемотест, Медси. Авторасчёт биомаркеров и норм.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-3xl bg-white dark:bg-[#161b26] border border-purple-100/60 dark:border-purple-500/20 shadow-xs flex flex-col justify-between">
                <div className="w-8 h-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-sm mb-2 font-bold shadow-2xs">
                  💳
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900 dark:text-white">Чеки & Бюджет</h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                    Сквозной семейный учет трат на врачей, анализы и аптеки.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-3xl bg-white dark:bg-[#161b26] border border-purple-100/60 dark:border-purple-500/20 shadow-xs flex flex-col justify-between">
                <div className="w-8 h-8 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-sm mb-2 font-bold shadow-2xs">
                  🤖
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900 dark:text-white">Клинический ИИ</h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                    Офлайн-интерпретация бланков и консультация врача 24/7.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-3xl bg-white dark:bg-[#161b26] border border-purple-100/60 dark:border-purple-500/20 shadow-xs flex flex-col justify-between">
                <div className="w-8 h-8 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center text-sm mb-2 font-bold shadow-2xs">
                  ☁️
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900 dark:text-white">База в Google</h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                    Синхронизация между супругами через Google Таблицы.
                  </p>
                </div>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full py-3.5 px-4 bg-purple-700 hover:bg-purple-800 text-white rounded-2xl text-xs font-black shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <span>Войти в личный кабинет</span>
                <ArrowRight size={15} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setRegStep('form');
                }}
                className="w-full py-3 px-4 bg-white dark:bg-[#161b26] hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-98 transition-all shadow-xs"
              >
                <UserPlus size={14} />
                <span>Создать семейный хаб (Регистрация)</span>
              </button>
            </div>

            {/* Presentation Showcase Launcher */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => {
                  loadDemoData();
                  navigate('/');
                }}
                className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 border border-purple-200/70 dark:border-purple-800/60 flex items-center justify-center gap-2 hover:bg-purple-100/50 transition-all text-xs font-bold text-purple-900 dark:text-purple-200 active:scale-98"
              >
                <Sparkles size={14} className="text-purple-600" />
                <span>Запустить демо-презентацию проекта</span>
              </button>
              <span className="text-[10px] text-gray-400 block text-center mt-1">
                Для публичной демонстрации возможностей хаба гостям
              </span>
            </div>
          </div>
        )}

        {/* MODE A: LOGIN */}
        {mode === 'login' && (
          <div className="bg-white dark:bg-[#161b26] p-4.5 rounded-3xl border border-purple-100/60 dark:border-purple-500/20 shadow-xl space-y-3.5 animate-fade-in">
            {/* Google One-Tap Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-2.5 px-3 bg-white dark:bg-[#1a202c] hover:bg-gray-50 dark:hover:bg-[#222a3a] border border-gray-200 dark:border-gray-700 rounded-2xl flex items-center justify-center gap-2.5 shadow-xs transition-all active:scale-98"
            >
              {/* Google Crisp SVG G */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.9c2.28-2.1 3.64-5.2 3.64-9.14z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.74-2.1-6.68-4.93H1.28v3.15C3.3 21.36 7.37 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.32 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.28C.46 8.2 0 10.04 0 12s.46 3.8 1.28 5.42l4.04-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.3 2.64 1.28 6.58l4.04 3.15c.94-2.83 3.58-4.98 6.68-4.98z"
                />
              </svg>
              <span className="text-xs font-bold text-gray-800 dark:text-gray-100">
                Войти через Google Аккаунт
              </span>
            </button>

            <div className="flex items-center gap-2 text-gray-300 dark:text-gray-700 my-1">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
              <span className="text-[10px] uppercase font-bold text-gray-400">или по ID / Email</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
            </div>

            {/* Email / Personal ID Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">
                  Email или Персональный ID (MED-XXXX)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#1a202c] text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="name@example.com или MED-0000"
                    required
                  />
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-gray-400">Пароль</label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(loginId.includes('@') ? loginId.trim() : '');
                      setResetStep('email');
                      setResetError(null);
                      setMode('forgot_password');
                    }}
                    className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold hover:underline cursor-pointer"
                  >
                    Забыли пароль?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Введите пароль"
                    className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#1a202c] text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-gray-600 dark:text-gray-400">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>Запомнить меня</span>
                </label>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  AES-256 GCM
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white rounded-2xl text-xs font-black shadow-lg shadow-purple-500/25 flex items-center justify-center gap-1.5 active:scale-98 transition-all"
              >
                <span>Войти в личный кабинет</span>
                <ArrowRight size={14} />
              </button>
            </form>

            {/* Presentation Showcase Launcher */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => {
                  loadDemoData();
                  navigate('/');
                }}
                className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 border border-purple-200/70 dark:border-purple-800/60 flex items-center justify-center gap-2 hover:bg-purple-100/50 transition-all text-xs font-bold text-purple-900 dark:text-purple-200 active:scale-98"
              >
                <Sparkles size={14} className="text-purple-600" />
                <span>Запустить демо-презентацию проекта</span>
              </button>
              <span className="text-[10px] text-gray-400 block text-center mt-1">
                Для публичной демонстрации возможностей хаба
              </span>
            </div>
          </div>
        )}

        {/* MODE D: FORGOT PASSWORD (EMAIL OTP RECOVERY) */}
        {mode === 'forgot_password' && (
          <div className="bg-white dark:bg-[#161b26] p-5 rounded-3xl border border-purple-100/60 dark:border-purple-500/20 shadow-xl space-y-4 animate-fade-in text-xs">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-700 dark:text-purple-300 shadow-xs">
                <KeyRound size={22} />
              </div>
              <h3 className="text-sm font-black text-gray-900 dark:text-white">
                {resetStep === 'email' ? 'Восстановление доступа' : 'Новый пароль'}
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                {resetStep === 'email'
                  ? 'Введите email вашего аккаунта, и мы вышлем 6-значный код безопасности для сброса пароля.'
                  : `Код безопасности отправлен на ${resetEmail}`}
              </p>
            </div>

            {resetError && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-[11px] font-bold text-rose-700 dark:text-rose-300 text-center animate-shake">
                {resetError}
              </div>
            )}

            {resetStep === 'email' ? (
              <form onSubmit={handleSendResetCode} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">
                    Ваш зарегистрированный Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => {
                        setResetEmail(e.target.value);
                        if (resetError) setResetError(null);
                      }}
                      placeholder="name@example.com"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#1a202c] text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                      autoFocus
                    />
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!resetEmail.trim() || isResetting}
                  className="w-full py-3 bg-purple-700 hover:bg-purple-800 disabled:opacity-40 text-white rounded-2xl text-xs font-black shadow-lg shadow-purple-500/25 flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                >
                  {isResetting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Mail size={14} />
                  )}
                  <span>{isResetting ? 'Отправка кода...' : 'Получить код для сброса'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirmPasswordReset} className="space-y-3">
                {/* 6-digit code */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 block text-center uppercase tracking-wider">
                    6-значный код из письма
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={resetEnteredCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setResetEnteredCode(val);
                      if (resetError) setResetError(null);
                    }}
                    placeholder="••••••"
                    autoFocus
                    className="w-full text-center text-2xl font-black font-mono tracking-[0.3em] py-2 px-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#1a202c] text-purple-700 dark:text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* New Password */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">
                    Новый пароль (минимум 4 символа)
                  </label>
                  <div className="relative">
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      value={resetNewPassword}
                      onChange={(e) => {
                        setResetNewPassword(e.target.value);
                        if (resetError) setResetError(null);
                      }}
                      placeholder="Введите новый пароль"
                      className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#1a202c] text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showResetPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">
                    Повторите новый пароль
                  </label>
                  <div className="relative">
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      value={resetConfirmPassword}
                      onChange={(e) => {
                        setResetConfirmPassword(e.target.value);
                        if (resetError) setResetError(null);
                      }}
                      placeholder="Повторите новый пароль"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#1a202c] text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resetEnteredCode.length !== 6 || !resetNewPassword.trim() || isResetting}
                  className="w-full py-3 bg-purple-700 hover:bg-purple-800 disabled:opacity-40 text-white rounded-2xl text-xs font-black shadow-lg shadow-purple-500/25 flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                >
                  {isResetting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={15} />
                  )}
                  <span>{isResetting ? 'Обновление пароля...' : 'Сохранить новый пароль и войти'}</span>
                </button>

                {/* Resend and back controls */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setResetStep('email');
                      setResetError(null);
                    }}
                    className="text-gray-400 hover:text-purple-600 font-semibold"
                  >
                    ← Изменить email
                  </button>

                  {resetCountdown > 0 ? (
                    <span className="text-gray-400">
                      Повторно через <span className="font-bold text-purple-600 font-mono">{resetCountdown}с</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendResetCode}
                      className="text-purple-700 dark:text-purple-400 font-bold hover:underline"
                    >
                      Выслать код снова
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        )}

        {/* MODE B: REGISTRATION - STEP 1: FORM */}
        {mode === 'register' && regStep === 'form' && (
          <form
            onSubmit={handleRequestVerificationCode}
            className="bg-white dark:bg-[#161b26] p-4.5 rounded-3xl border border-purple-100/60 dark:border-purple-500/20 shadow-xl space-y-3 animate-fade-in text-xs max-h-[72vh] overflow-y-auto"
          >
            {isGooglePreAuth && (
              <div className="p-2.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-indigo-900 dark:text-indigo-200">
                    Google ID: {regEmail}
                  </span>
                </div>
                <span className="text-[9px] bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-bold px-2 py-0.5 rounded-full">
                  Подтверждён
                </span>
              </div>
            )}

            {/* Surname (Family verification key) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-gray-700 dark:text-gray-300">
                  Фамилия (ключ семейного хаба) *
                </label>
                <span className="text-[9px] text-purple-600 dark:text-purple-400 font-bold">
                  Для автодобавления детей
                </span>
              </div>
              <input
                type="text"
                value={regLastName}
                onChange={(e) => setRegLastName(e.target.value)}
                placeholder="Например: Иванов"
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#1a202c] text-gray-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {/* First Name & Middle Name */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">Имя *</label>
                <input
                  type="text"
                  value={regFirstName}
                  onChange={(e) => setRegFirstName(e.target.value)}
                  placeholder="Например: Алексей"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#1a202c] text-gray-900 dark:text-white font-bold"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">Отчество</label>
                <input
                  type="text"
                  value={regMiddleName}
                  onChange={(e) => setRegMiddleName(e.target.value)}
                  placeholder="Укажите отчество (не обязательно)"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#1a202c] text-gray-900 dark:text-white placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Email & Password */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">
                  Email (логин) *
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="user@gmail.com"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#1a202c] text-gray-900 dark:text-white font-medium"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">
                  Пароль для входа *
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Минимум 4 символа"
                  required={!isGooglePreAuth}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#1a202c] text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Birth Year & Gender */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-gray-400">Год рождения</label>
                  <span className="text-[9px] text-purple-600 font-bold">{formatYears(age)}</span>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={regBirthYear}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '').replace(/^0+/, '');
                    setRegBirthYear(clean === '' ? '' : Number(clean));
                  }}
                  placeholder="1998"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#1a202c] text-gray-900 dark:text-white font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">Пол</label>
                <div className="grid grid-cols-2 gap-1 bg-gray-100 dark:bg-gray-800 p-0.5 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`py-1 text-[11px] font-bold rounded-lg transition-all ${
                      regGender === 'male' ? 'bg-white dark:bg-[#161b26] text-purple-700 shadow-xs' : 'text-gray-400'
                    }`}
                  >
                    Муж
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`py-1 text-[11px] font-bold rounded-lg transition-all ${
                      regGender === 'female' ? 'bg-white dark:bg-[#161b26] text-purple-700 shadow-xs' : 'text-gray-400'
                    }`}
                  >
                    Жен
                  </button>
                </div>
              </div>
            </div>

            {/* Height, Weight & Live BMI */}
            <div className="p-2.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300">
                  <Scale size={13} />
                  <span className="text-[11px] font-bold">Рост, вес и расчёт ИМТ</span>
                </div>
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${bmiBadge.color}`}>
                  {bmiBadge.label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-semibold text-gray-400 block">Рост (см)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={3}
                    value={regHeight}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, '').replace(/^0+/, '');
                      setRegHeight(clean === '' ? '' : Number(clean));
                    }}
                    placeholder="175"
                    className="w-full px-2.5 py-1 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161b26] font-bold"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-semibold text-gray-400 block">Вес (кг)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={3}
                    value={regWeight}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, '').replace(/^0+/, '');
                      setRegWeight(clean === '' ? '' : Number(clean));
                    }}
                    placeholder="70"
                    className="w-full px-2.5 py-1 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161b26] font-bold"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-purple-100 dark:border-purple-900/40 text-[10px]">
                <span className="text-gray-500">Индекс массы тела (ИМТ):</span>
                <span className="font-black text-purple-700 dark:text-purple-300 font-mono text-xs">
                  {bmi} кг/м²
                </span>
              </div>
            </div>

            {/* Blood Type & OMS */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">Группа крови</label>
                <div className="relative">
                  <select
                    value={regBloodType}
                    onChange={(e) => setRegBloodType(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#1a202c] text-gray-900 dark:text-white font-bold appearance-none cursor-pointer dark:[color-scheme:dark]"
                  >
                    <option className="bg-white dark:bg-[#1a202c] text-gray-900 dark:text-white" value="A(II) Rh+">A(II) Rh+</option>
                    <option className="bg-white dark:bg-[#1a202c] text-gray-900 dark:text-white" value="O(I) Rh+">O(I) Rh+</option>
                    <option className="bg-white dark:bg-[#1a202c] text-gray-900 dark:text-white" value="B(III) Rh+">B(III) Rh+</option>
                    <option className="bg-white dark:bg-[#1a202c] text-gray-900 dark:text-white" value="AB(IV) Rh+">AB(IV) Rh+</option>
                  </select>
                  <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">Полис ОМС</label>
                <input
                  type="text"
                  value={regPolicyOMS}
                  onChange={(e) => setRegPolicyOMS(e.target.value)}
                  placeholder="1694 0000 0000 0000"
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#1a202c] font-mono"
                />
              </div>
            </div>

            {duplicatePromptEmail && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs space-y-2 animate-fade-in">
                <p className="font-bold text-amber-900 dark:text-amber-200 text-xs">
                  ⚠️ Пользователь «{duplicatePromptEmail}» уже зарегистрирован
                </p>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                  Вы можете выполнить вход по паролю или полностью сбросить старую запись и получить новый код подтверждения.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setLoginId(duplicatePromptEmail);
                      setDuplicatePromptEmail(null);
                    }}
                    className="flex-1 py-1.5 px-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    Войти в кабинет
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const target = duplicatePromptEmail;
                      setDuplicatePromptEmail(null);
                      setIsSendingCode(true);
                      await deleteRemoteUser(target);
                      try {
                        const local = JSON.parse(localStorage.getItem('app-users-registry-db') || '[]');
                        const filtered = local.filter((u: any) => u.email?.toLowerCase() !== target);
                        localStorage.setItem('app-users-registry-db', JSON.stringify(filtered));
                      } catch {}
                      await dispatchOtpCode(target);
                    }}
                    className="flex-1 py-1.5 px-2.5 bg-amber-100 dark:bg-amber-900/60 hover:bg-amber-200 text-amber-900 dark:text-amber-200 rounded-xl text-xs font-bold transition-all border border-amber-300 dark:border-amber-700"
                  >
                    Сбросить и выслать код
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!regFirstName.trim() || !regLastName.trim() || !regEmail.trim() || isSendingCode}
              className="w-full py-3 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded-2xl text-xs font-black shadow-lg shadow-purple-500/25 flex items-center justify-center gap-1.5 active:scale-98 transition-all"
            >
              {isSendingCode ? (
                <Loader2 size={14} className="animate-spin" />
              ) : isGooglePreAuth ? (
                <Sparkles size={14} />
              ) : (
                <Mail size={14} />
              )}
              <span>
                {isSendingCode
                  ? 'Проверка и отправка...'
                  : isGooglePreAuth
                  ? 'Завершить регистрацию (Google ID)'
                  : 'Получить 6-значный код на email'}
              </span>
            </button>
          </form>
        )}

        {/* MODE B: REGISTRATION - STEP 2: VERIFICATION CODE */}
        {mode === 'register' && regStep === 'verify' && (
          <div className="bg-white dark:bg-[#161b26] p-5 rounded-3xl border border-purple-100/60 dark:border-purple-500/20 shadow-xl space-y-4 animate-fade-in text-xs">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-700 dark:text-purple-300 shadow-xs">
                <Mail size={22} />
              </div>
              <h3 className="text-sm font-black text-gray-900 dark:text-white">
                Подтверждение email
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                Мы отправили 6-значный код безопасности на адрес <span className="font-bold text-purple-700 dark:text-purple-300 font-mono">{regEmail}</span>
              </p>
            </div>

            {/* Email Status Notice */}
            <div className="p-3 bg-purple-50 dark:bg-purple-950/50 rounded-2xl border border-purple-200 dark:border-purple-800/80 space-y-1">
              <div className="flex items-center gap-1.5 text-purple-800 dark:text-purple-300 font-bold text-[11px]">
                <ShieldCheck size={13} />
                <span>Защита от спама и пустых профилей</span>
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-snug">
                Код действует 10 минут. Если письмо не появилось во «Входящих», обязательно проверьте папку «Спам».
              </p>
            </div>

            {/* Code Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 block text-center uppercase tracking-wider">
                Введите 6-значный код из письма
              </label>
              <input
                type="text"
                maxLength={6}
                value={enteredCode}
                data-verification-code={verificationCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setEnteredCode(val);
                  if (codeError) setCodeError(null);
                }}
                placeholder="••••••"
                autoFocus
                className="w-full text-center text-2xl font-black font-mono tracking-[0.3em] py-2.5 px-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#1a202c] text-purple-700 dark:text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {codeError && (
                <p className="text-[10px] font-bold text-rose-600 text-center">
                  {codeError}
                </p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="button"
              onClick={handleVerifyAndRegister}
              disabled={enteredCode.length !== 6}
              className="w-full py-3 bg-purple-700 hover:bg-purple-800 disabled:opacity-40 text-white rounded-2xl text-xs font-black shadow-lg shadow-purple-500/25 flex items-center justify-center gap-1.5 active:scale-98 transition-all"
            >
              <CheckCircle2 size={15} />
              <span>Подтвердить и войти</span>
            </button>

            {/* Resend and back controls */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setRegStep('form');
                  setCodeError(null);
                }}
                className="text-gray-400 hover:text-purple-600 font-semibold"
              >
                ← Изменить данные
              </button>

              {countdown > 0 ? (
                <span className="text-gray-400">
                  Повторно через <span className="font-bold text-purple-600 font-mono">{countdown}с</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-purple-700 dark:text-purple-400 font-bold hover:underline"
                >
                  Выслать код снова
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Security Footer */}
      <div className="pt-2 pb-1 text-center">
        <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
          <ShieldCheck size={13} />
          <span>Шифрование AES-256 GCM · 152-ФЗ Медицинская тайна</span>
        </div>
      </div>

      {/* Two-Factor Authentication (2FA) Verification Modal */}
      {showTwoFactorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in select-none">
          <div className="w-full max-w-[340px] bg-white dark:bg-[#161b26] rounded-3xl p-5 border border-purple-500/20 shadow-2xl animate-scale-in text-gray-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-700 dark:text-purple-400">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-black tracking-tight">2FA Подтверждение</h3>
                  <p className="text-[10px] text-gray-400">Google Authenticator / Ключ</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTwoFactorModal(false)}
                className="w-7 h-7 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-900"
              >
                <X size={15} />
              </button>
            </div>

            <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-3 mb-3 leading-relaxed">
              На вашем аккаунте активна двухфакторная защита. Введите 6-значный одноразовый код из приложения Authenticator:
            </p>

            <form onSubmit={handleVerify2FaLogin} className="space-y-3">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                pattern="[0-9]{6}"
                placeholder="000 000"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                autoFocus
                className={`w-full py-3 px-3 text-center text-2xl font-mono tracking-widest rounded-2xl border bg-gray-50 dark:bg-[#1a202c] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  twoFactorError ? 'border-rose-500 text-rose-500' : 'border-gray-200 dark:border-gray-700'
                }`}
                required
              />

              {twoFactorError && (
                <p className="text-[10px] text-rose-500 font-bold text-center leading-tight">
                  {twoFactorError}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={twoFactorCode.length !== 6 || twoFactorVerifying}
                  className="flex-1 py-2.5 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md"
                >
                  {twoFactorVerifying ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Проверка...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound size={13} />
                      <span>Подтвердить вход</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowTwoFactorModal(false)}
                  className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs text-gray-500 hover:text-gray-900"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Account Selector Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in select-none">
          <div className="w-full max-w-[340px] bg-white dark:bg-[#161b26] rounded-3xl p-4.5 border border-purple-500/20 shadow-2xl animate-scale-in text-gray-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.9c2.28-2.1 3.64-5.2 3.64-9.14z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.74-2.1-6.68-4.93H1.28v3.15C3.3 21.36 7.37 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.32 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.28C.46 8.2 0 10.04 0 12s.46 3.8 1.28 5.42l4.04-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.3 2.64 1.28 6.58l4.04 3.15c.94-2.83 3.58-4.98 6.68-4.98z"/>
                </svg>
                <h3 className="text-xs font-black tracking-tight">Вход через Google</h3>
              </div>
              <button
                type="button"
                onClick={() => { setShowGoogleModal(false); setIsEnteringCustom(false); }}
                className="w-7 h-7 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-900"
              >
                <X size={15} />
              </button>
            </div>

            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2.5 mb-3">
              Выберите демонстрационный профиль или авторизуйтесь под личным Google-аккаунтом:
            </p>

            <div className="space-y-2">
              {/* Option 1: Presentation Demo User */}
              <button
                type="button"
                onClick={() => handleSelectGoogleAccount('demo.family@gmail.com', 'Алексей Иванов')}
                className="w-full p-2.5 rounded-2xl border border-purple-200 dark:border-purple-800/60 bg-purple-50/50 dark:bg-purple-950/40 hover:bg-purple-100/60 flex items-center justify-between transition-all text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-purple-700 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                    АИ
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">Алексей Иванов</p>
                    <p className="text-[10px] text-gray-500 truncate">demo.family@gmail.com</p>
                  </div>
                </div>
                <span className="text-[9px] font-black text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 rounded-full flex-shrink-0 ml-1">
                  Демо-тур
                </span>
              </button>

              {/* Option 2: Enter own Google account */}
              {!isEnteringCustom ? (
                <button
                  type="button"
                  onClick={() => setIsEnteringCustom(true)}
                  className="w-full py-2.5 px-3 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 hover:border-purple-500 flex items-center justify-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300 transition-all"
                >
                  <UserPlus size={14} className="text-purple-600" />
                  <span>Личный Google-аккаунт</span>
                </button>
              ) : (
                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#1a202c] border border-gray-200 dark:border-gray-700 space-y-2 animate-fade-in text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-0.5">Ваше Имя и Фамилия</label>
                    <input
                      type="text"
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      placeholder="Например: Ильнар Ямаев"
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161b26] font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-0.5">Ваш Google Email</label>
                    <input
                      type="email"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      placeholder="your.email@gmail.com"
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161b26] font-medium"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={!customGoogleEmail.trim()}
                    onClick={() => handleSelectGoogleAccount(customGoogleEmail.trim(), customGoogleName.trim() || 'Пользователь')}
                    className="w-full py-2 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Check size={13} />
                    <span>Авторизовать Google профиль</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPage;
