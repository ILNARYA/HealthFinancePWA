import React, { useState } from 'react';
import {
  HeartPulse, ShieldCheck, Lock, Mail, Eye, EyeOff,
  Sparkles, Scale, ArrowRight, Sun, Moon,
  ChevronDown, CheckCircle2, X, UserPlus, Check
} from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { useTheme } from '../context/ThemeContext';

export const AuthPage: React.FC = () => {
  const { login, loginWithGoogle, loginAsMember, register } = useFamily();
  const { isDark, toggleTheme } = useTheme();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginId, setLoginId] = useState('ilnar.yamaev@gmail.com');
  const [loginPassword, setLoginPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regLastName, setRegLastName] = useState('Ямаев');
  const [regFirstName, setRegFirstName] = useState('');
  const [regMiddleName, setRegMiddleName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regBirthYear, setRegBirthYear] = useState<number>(1995);
  const [regGender, setGender] = useState<'male' | 'female'>('male');
  const [regHeight, setRegHeight] = useState<number>(178);
  const [regWeight, setRegWeight] = useState<number>(74);
  const [regBloodType, setRegBloodType] = useState('A(II) Rh+');
  const [regPolicyOMS, setRegPolicyOMS] = useState('');

  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Google OAuth selection modal
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [isEnteringCustom, setIsEnteringCustom] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  // Real-time BMI calculation for register
  const heightM = (regHeight || 170) / 100;
  const bmi = Math.round(((regWeight || 70) / (heightM * heightM)) * 10) / 10;
  const age = 2026 - regBirthYear;

  const getBmiBadge = (val: number) => {
    if (val < 18.5) return { label: 'Дефицит веса', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 border-amber-200' };
    if (val <= 24.9) return { label: 'Нормальный вес', color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200' };
    if (val <= 29.9) return { label: 'Избыточный вес', color: 'text-amber-700 bg-amber-50 dark:bg-amber-950/60 border-amber-200' };
    return { label: 'Ожирение', color: 'text-rose-700 bg-rose-50 dark:bg-rose-950/60 border-rose-200' };
  };

  const bmiBadge = getBmiBadge(bmi);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email: loginId, password: loginPassword });
  };

  const handleGoogleLogin = () => {
    setShowGoogleModal(true);
  };

  const handleSelectGoogleAccount = (email: string, name: string) => {
    setShowGoogleModal(false);
    setSuccessToast(`Вход через Google (${email}) выполнен успешно!`);
    setTimeout(() => {
      loginWithGoogle(email, name);
    }, 450);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFirstName.trim() || !regLastName.trim()) return;

    register({
      firstName: regFirstName.trim(),
      lastName: regLastName.trim(),
      middleName: regMiddleName.trim(),
      email: regEmail.trim() || `${regFirstName.toLowerCase()}.${regLastName.toLowerCase()}@gmail.com`,
      birthYear: regBirthYear,
      gender: regGender,
      height: regHeight,
      weight: regWeight,
      bmi,
      bloodType: regBloodType,
      policyOMS: regPolicyOMS.trim() || '1694 0000 0000 0000',
    });
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

        {/* Tab Switcher: Вход / Регистрация */}
        <div className="bg-gray-100 dark:bg-[#161b26] p-1 rounded-2xl flex items-center gap-1 mb-4 border border-gray-200/60 dark:border-gray-800">
          <button
            type="button"
            onClick={() => setMode('login')}
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
            onClick={() => setMode('register')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
              mode === 'register'
                ? 'bg-white dark:bg-[#252d3d] text-purple-700 dark:text-purple-300 shadow-sm scale-[1.01]'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'
            }`}
          >
            Регистрация анкеты
          </button>
        </div>

        {/* Toast */}
        {successToast && (
          <div className="mb-3 p-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 animate-slide-up shadow-lg">
            <CheckCircle2 size={16} />
            <span>{successToast}</span>
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
                    placeholder="ilnar.yamaev@gmail.com или MED-9402"
                    required
                  />
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-gray-400">Пароль</label>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold cursor-pointer">
                    Забыли пароль?
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
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

            {/* Quick Demo Family Profiles Switcher */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-2 text-center">
                Быстрый вход для тестирования семьи:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => loginAsMember('MED-9402')}
                  className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/60 text-left hover:scale-[1.02] transition-all"
                >
                  <span className="text-[11px] font-black block text-purple-900 dark:text-purple-200 truncate">
                    Ильнар
                  </span>
                  <span className="text-[9px] text-purple-700 dark:text-purple-400 block">Глава</span>
                </button>

                <button
                  type="button"
                  onClick={() => loginAsMember('MED-3910')}
                  className="p-2 rounded-xl bg-pink-50 dark:bg-pink-950/50 border border-pink-200 dark:border-pink-800/60 text-left hover:scale-[1.02] transition-all"
                >
                  <span className="text-[11px] font-black block text-pink-900 dark:text-pink-200 truncate">
                    Алина
                  </span>
                  <span className="text-[9px] text-pink-700 dark:text-pink-400 block">Супруга</span>
                </button>

                <button
                  type="button"
                  onClick={() => loginAsMember('MED-5812')}
                  className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 text-left hover:scale-[1.02] transition-all"
                >
                  <span className="text-[11px] font-black block text-blue-900 dark:text-blue-200 truncate">
                    Рустам
                  </span>
                  <span className="text-[9px] text-blue-700 dark:text-blue-400 block">Брат</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODE B: REGISTRATION */}
        {mode === 'register' && (
          <form
            onSubmit={handleRegisterSubmit}
            className="bg-white dark:bg-[#161b26] p-4.5 rounded-3xl border border-purple-100/60 dark:border-purple-500/20 shadow-xl space-y-3 animate-fade-in text-xs max-h-[70vh] overflow-y-auto"
          >
            {/* Google Fast Register */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-2 px-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-between text-blue-900 dark:text-blue-200 text-xs font-bold"
            >
              <span>Быстрая регистрация через Google</span>
              <Sparkles size={14} className="text-blue-600" />
            </button>

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
                placeholder="Например: Ямаев"
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
                  placeholder="Ильнар"
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
                  placeholder="Рамилевич"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#1a202c] text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Email & Password */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">Email</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="user@gmail.com"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#1a202c] text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">Пароль</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#1a202c] text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Birth Year & Gender */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-gray-400">Год рождения</label>
                  <span className="text-[9px] text-purple-600 font-bold">{age} лет</span>
                </div>
                <input
                  type="number"
                  min="1940"
                  max="2026"
                  value={regBirthYear}
                  onChange={(e) => setRegBirthYear(Number(e.target.value))}
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
                    type="number"
                    value={regHeight}
                    onChange={(e) => setRegHeight(Number(e.target.value))}
                    className="w-full px-2.5 py-1 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161b26] font-bold"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-semibold text-gray-400 block">Вес (кг)</label>
                  <input
                    type="number"
                    value={regWeight}
                    onChange={(e) => setRegWeight(Number(e.target.value))}
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
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#1a202c] font-bold appearance-none cursor-pointer"
                  >
                    <option value="A(II) Rh+">A(II) Rh+</option>
                    <option value="O(I) Rh+">O(I) Rh+</option>
                    <option value="B(III) Rh+">B(III) Rh+</option>
                    <option value="AB(IV) Rh+">AB(IV) Rh+</option>
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

            <button
              type="submit"
              disabled={!regFirstName.trim() || !regLastName.trim()}
              className="w-full py-3 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded-2xl text-xs font-black shadow-lg shadow-purple-500/25 flex items-center justify-center gap-1.5 active:scale-98 transition-all"
            >
              <Sparkles size={14} />
              <span>Создать личный кабинет и семью</span>
            </button>
          </form>
        )}
      </div>

      {/* Security Footer */}
      <div className="pt-2 pb-1 text-center">
        <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
          <ShieldCheck size={13} />
          <span>Шифрование AES-256 GCM · 152-ФЗ Медицинская тайна</span>
        </div>
      </div>

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
              Выберите Google-аккаунт или введите свои данные для личного кабинета:
            </p>

            <div className="space-y-2">
              {/* Profile 1: Ilnar */}
              <button
                type="button"
                onClick={() => handleSelectGoogleAccount('ilnarmanya@gmail.com', 'Ильнар Ямаев')}
                className="w-full p-2.5 rounded-2xl border border-purple-200 dark:border-purple-800/60 bg-purple-50/50 dark:bg-purple-950/40 hover:bg-purple-100/60 flex items-center justify-between transition-all text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-purple-700 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                    ИЯ
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">Ильнар Ямаев</p>
                    <p className="text-[10px] text-gray-500 truncate">ilnarmanya@gmail.com</p>
                  </div>
                </div>
                <span className="text-[9px] font-black text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 rounded-full flex-shrink-0 ml-1">
                  Глава
                </span>
              </button>

              {/* Profile 2: Alina */}
              <button
                type="button"
                onClick={() => handleSelectGoogleAccount('alina.yamaeva@gmail.com', 'Алина Ямаева')}
                className="w-full p-2.5 rounded-2xl border border-pink-200 dark:border-pink-800/60 bg-pink-50/50 dark:bg-pink-950/40 hover:bg-pink-100/60 flex items-center justify-between transition-all text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-pink-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                    АЯ
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">Алина Ямаева</p>
                    <p className="text-[10px] text-gray-500 truncate">alina.yamaeva@gmail.com</p>
                  </div>
                </div>
                <span className="text-[9px] font-black text-pink-700 dark:text-pink-300 bg-pink-100 dark:bg-pink-900/60 px-2 py-0.5 rounded-full flex-shrink-0 ml-1">
                  Супруга
                </span>
              </button>

              {/* Option 3: Custom Google account */}
              {!isEnteringCustom ? (
                <button
                  type="button"
                  onClick={() => setIsEnteringCustom(true)}
                  className="w-full py-2.5 px-3 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 hover:border-purple-500 flex items-center justify-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300 transition-all"
                >
                  <UserPlus size={14} className="text-purple-600" />
                  <span>Войти под другим Google-аккаунтом</span>
                </button>
              ) : (
                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#1a202c] border border-gray-200 dark:border-gray-700 space-y-2 animate-fade-in text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-0.5">Имя и Фамилия</label>
                    <input
                      type="text"
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      placeholder="Например: Мария Иванова"
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161b26] font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-0.5">Google Email</label>
                    <input
                      type="email"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      placeholder="maria.ivanova@gmail.com"
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
                    <span>Подтвердить вход</span>
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
