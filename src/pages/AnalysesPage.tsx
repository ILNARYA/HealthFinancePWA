import React, { useState, useRef } from 'react';
import {
  Upload, AlertTriangle, CheckCircle2,
  XCircle, Loader2, ShieldAlert, Sparkles,
  FileCheck2, Stethoscope, Moon, Sun, Lock, Users
} from 'lucide-react';
import type { AnalysisResult, Biomarker } from '../types';
import { demoAnalysisResult } from '../data/demo';
import { simulateAnalysis } from '../utils/analysisEngine';
import { useTheme } from '../context/ThemeContext';
import { useFamily } from '../context/FamilyContext';
import { FamilySwitcherModal } from '../components/family/FamilySwitcherModal';

const StatusBadge: React.FC<{ status: Biomarker['status'] }> = ({ status }) => {
  const config = {
    'in-range': {
      icon: CheckCircle2,
      text: 'В норме',
      cls: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
    },
    below: {
      icon: AlertTriangle,
      text: 'Ниже нормы',
      cls: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
    },
    above: {
      icon: XCircle,
      text: 'Выше нормы',
      cls: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
    },
  };
  const c = config[status];
  const Icon = c.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border flex-shrink-0 ${c.cls}`}>
      <Icon size={11} />
      <span>{c.text}</span>
    </span>
  );
};

const categoryLabelsRu: Record<string, string> = {
  metabolism: 'Диета & Метаболизм',
  sleepRecovery: 'Сон & Восстановление',
  immune: 'Иммунитет',
  kidney: 'Почки',
  liver: 'Печень',
  blood: 'Кровь',
};

const AnalysesPage: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { activeMember, lockApp } = useFamily();
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(demoAnalysisResult);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (name: string) => {
    setLoading(true);
    setResult(null);

    setLoadingStep('Распознавание бланка и извлечение текста (OCR)...');
    await new Promise((r) => setTimeout(r, 600));

    setLoadingStep('Идентификация биомаркеров и референсных значений...');
    await new Promise((r) => setTimeout(r, 600));

    setLoadingStep('Сравнение показателей и генерация клинической сводки...');
    const res = await simulateAnalysis(name);
    setResult(res);
    setLoading(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file.name);
    }
  };

  const loadPreset = (presetName: string) => {
    processFile(presetName);
  };

  return (
    <div className="px-4 pt-3 pb-6 flex flex-col gap-4 w-full overflow-x-hidden">
      {/* Header with Family Member & Security Lock */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFamilyModal(true)}
          className="flex items-center gap-2 p-1 pr-2 rounded-2xl bg-white dark:bg-[#1e2433] border border-purple-100 dark:border-purple-900/50 shadow-xs hover:border-purple-300 transition-all text-left min-w-0"
          title="Переключить профиль члена семьи"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-xs shadow-xs flex-shrink-0"
            style={{ backgroundColor: activeMember.color }}
          >
            {activeMember.avatar}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-black text-gray-900 dark:text-white truncate">
                {activeMember.name}
              </span>
              <Users size={11} className="text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-[10px] text-gray-400 dark:text-gray-400 block truncate">
              {activeMember.roleLabel}
            </span>
          </div>
        </button>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={lockApp}
            className="w-9 h-9 bg-white dark:bg-[#1e2433] rounded-2xl flex items-center justify-center text-gray-500 hover:text-purple-600 dark:text-gray-400 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors"
            title="Заблокировать экран (PIN-код)"
          >
            <Lock size={16} />
          </button>
          <button
            onClick={toggleTheme}
            className="w-9 h-9 bg-white dark:bg-[#1e2433] rounded-2xl flex items-center justify-center text-gray-500 dark:text-yellow-400 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors"
            title={isDark ? 'Светлая тема' : 'Тёмная тема'}
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </div>

      {/* Screen Title */}
      <div className="px-1">
        <div className="flex items-center gap-1.5">
          <h1 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
            Анализы и ИИ-разбор
          </h1>
          <span className="flex items-center gap-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
            <Sparkles size={11} /> AI
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Мгновенный OCR-разбор бланков, оценка отклонений и рекомендации
        </p>
      </div>

      {/* Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="relative overflow-hidden border-2 border-dashed border-purple-300 dark:border-purple-600/60 hover:border-purple-600 dark:hover:border-purple-400 rounded-3xl p-4.5 text-center cursor-pointer bg-purple-50/30 dark:bg-[#161b26]/50 hover:bg-purple-50/60 transition-all duration-300 group shadow-sm w-full"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileUpload}
          className="hidden"
        />
        <div className="w-12 h-12 bg-white dark:bg-[#1e2433] rounded-2xl mx-auto mb-2 flex items-center justify-center text-purple-700 dark:text-purple-400 shadow-md group-hover:scale-110 transition-transform">
          <Upload size={20} />
        </div>
        <p className="text-sm font-bold text-gray-800 dark:text-white">
          Загрузить фото или скан PDF
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
          Поддерживаются форматы PDF, JPEG, PNG из любых лабораторий
        </p>

        {/* Preset sample buttons */}
        <div className="mt-3 pt-3 border-t border-purple-100/60 dark:border-purple-900/40 flex flex-wrap gap-1.5 justify-center" onClick={(e) => e.stopPropagation()}>
          <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-400 w-full mb-0.5">Быстрый тест на образцах:</span>
          <button
            onClick={() => loadPreset('Общий_анализ_крови_05.11.2026.pdf')}
            className="text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-white dark:bg-[#1e2433] px-2.5 py-1.5 rounded-xl border border-purple-200/80 dark:border-purple-700/60 hover:bg-purple-50 shadow-xs transition-colors"
          >
            🧪 Общий анализ крови
          </button>
          <button
            onClick={() => loadPreset('Биохимия_крови_Инвитро.pdf')}
            className="text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-white dark:bg-[#1e2433] px-2.5 py-1.5 rounded-xl border border-purple-200/80 dark:border-purple-700/60 hover:bg-purple-50 shadow-xs transition-colors"
          >
            🩸 Биохимия и липидограмма
          </button>
        </div>
      </div>

      {/* Loading AI State */}
      {loading && (
        <div className="bg-white dark:bg-[#161b26] rounded-3xl p-6 shadow-sm border border-purple-100/60 dark:border-purple-500/20 text-center card-animate w-full">
          <div className="relative w-14 h-14 mx-auto mb-3">
            <Loader2 size={56} className="text-purple-600 animate-spin opacity-30" />
            <Sparkles size={22} className="absolute inset-0 m-auto text-purple-700 dark:text-purple-400 animate-pulse" />
          </div>
          <p className="text-sm font-bold text-gray-900 dark:text-white">ИИ анализирует медицинский бланк</p>
          <p className="text-xs text-purple-700 dark:text-purple-300 font-medium mt-1 min-h-[18px]">
            {loadingStep}
          </p>
          <div className="mt-3.5 h-2 bg-purple-50 dark:bg-gray-800 rounded-full overflow-hidden w-full max-w-[220px] mx-auto">
            <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full animate-pulse-slow" style={{ width: '75%' }} />
          </div>
        </div>
      )}

      {/* Analysis Result */}
      {result && !loading && (
        <div className="flex flex-col gap-3.5 card-animate w-full">
          {/* File Card Header */}
          <div className="bg-white dark:bg-[#161b26] rounded-3xl p-4 shadow-sm border border-purple-100/60 dark:border-purple-500/20 flex items-center justify-between transition-colors w-full overflow-hidden">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-10 h-10 bg-purple-50 dark:bg-purple-950/60 rounded-2xl flex items-center justify-center text-purple-700 dark:text-purple-400 flex-shrink-0">
                <FileCheck2 size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                  {result.fileName}
                </p>
                <p className="text-[11px] text-gray-400 dark:text-gray-400 mt-0.5 truncate">
                  Пациент: {activeMember.name} · {result.date}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-purple-800 dark:text-purple-300 bg-purple-100/70 dark:bg-purple-950/80 px-2 py-0.5 rounded-xl flex-shrink-0 ml-1.5">
              {result.biomarkers.length} пок.
            </span>
          </div>

          {/* AI Clinical Summary */}
          <div className="bg-gradient-to-br from-purple-50/80 to-indigo-50/50 dark:from-purple-950/30 dark:to-indigo-950/20 rounded-3xl p-4 border border-purple-100 dark:border-purple-900/50 shadow-xs w-full overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-purple-700 dark:text-purple-400 flex-shrink-0" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300 truncate">
                Сводка медицинского ИИ
              </h3>
            </div>
            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-normal">
              {result.summary}
            </p>
          </div>

          {/* Biomarkers Table / Cards */}
          <div className="bg-white dark:bg-[#161b26] rounded-3xl p-4 shadow-sm border border-purple-100/60 dark:border-purple-500/20 transition-colors w-full overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                Извлечённые показатели
              </h3>
              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-100 dark:border-rose-900/50 flex-shrink-0">
                {result.biomarkers.filter((b) => b.status !== 'in-range').length} отклонения
              </span>
            </div>

            <div className="space-y-2.5">
              {result.biomarkers.map((bio) => {
                const isOutlier = bio.status !== 'in-range';
                return (
                  <div
                    key={bio.id}
                    className={`p-3 rounded-2xl border transition-all w-full overflow-hidden ${
                      isOutlier
                        ? 'border-rose-200/80 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20'
                        : 'border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-[#1a202c]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5 gap-1.5">
                      <div className="flex items-center gap-1 min-w-0 flex-1">
                        <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {bio.name}
                        </span>
                        <span className="text-[9px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-1.5 py-0.5 rounded flex-shrink-0">
                          {categoryLabelsRu[bio.category] || bio.category}
                        </span>
                      </div>
                      <StatusBadge status={bio.status} />
                    </div>

                    <div className="flex items-baseline justify-between text-xs gap-1">
                      <div className="min-w-0 flex items-baseline gap-1">
                        <span className="text-base font-black text-gray-900 dark:text-white">
                          {bio.value}
                        </span>
                        <span className="text-gray-400 font-medium text-[11px] truncate">
                          {bio.unit}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400 dark:text-gray-400 font-medium truncate text-right flex-shrink-0">
                        Норма: {bio.refMin}–{bio.refMax} {bio.unit}
                      </span>
                    </div>

                    {/* Progress Range Bar */}
                    <div className="relative h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden w-full">
                      <div
                        className={`h-full rounded-full ${
                          bio.status === 'in-range'
                            ? 'bg-purple-600'
                            : bio.status === 'below'
                            ? 'bg-blue-500'
                            : 'bg-rose-500'
                        }`}
                        style={{
                          width: `${Math.min(96, Math.max(10, (bio.value / (bio.refMax * 1.3)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="bg-white dark:bg-[#161b26] rounded-3xl p-4 shadow-sm border border-purple-100/60 dark:border-purple-500/20 transition-colors w-full overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <Stethoscope size={18} className="text-purple-700 dark:text-purple-400 flex-shrink-0" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                Рекомендованные шаги
              </h3>
            </div>
            <div className="space-y-2">
              {result.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-gray-700 dark:text-gray-300">
                  <span className="w-5 h-5 rounded-lg bg-purple-100/80 dark:bg-purple-950/80 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="flex-1 leading-snug">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl p-3 border border-amber-200/80 dark:border-amber-900/50 flex items-start gap-2.5 w-full">
            <ShieldAlert size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-900 dark:text-amber-200 leading-normal">
              <strong>Медицинский дисклеймер:</strong> ИИ-разбор носит исключительно информационный характер и не заменяет врачебного диагноза. Обязательно проконсультируйтесь с лечащим врачом.
            </p>
          </div>
        </div>
      )}

      {/* Family Cabinet Switcher Modal */}
      <FamilySwitcherModal
        isOpen={showFamilyModal}
        onClose={() => setShowFamilyModal(false)}
      />
    </div>
  );
};

export default AnalysesPage;
