import React, { useState, useRef } from 'react';
import {
  Upload, AlertTriangle, CheckCircle2,
  XCircle, Loader2, ShieldAlert, Sparkles,
  FileCheck2, Stethoscope, Moon, Sun
} from 'lucide-react';
import type { AnalysisResult, Biomarker } from '../types';
import { demoAnalysisResult } from '../data/demo';
import { simulateAnalysis } from '../utils/analysisEngine';
import { useTheme } from '../context/ThemeContext';

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
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${c.cls}`}>
      <Icon size={11} />
      {c.text}
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
    <div className="px-4 pt-3 pb-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Анализы и ИИ-разбор
            </h1>
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
              <Sparkles size={11} /> AI
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Мгновенный разбор бланков, графики отклонений и рекомендации
          </p>
        </div>
        <button
          onClick={toggleTheme}
          className="w-9 h-9 bg-white dark:bg-[#1e2433] rounded-2xl flex items-center justify-center text-gray-500 dark:text-yellow-400 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors"
          title={isDark ? 'Светлая тема' : 'Тёмная тема'}
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>

      {/* Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="relative overflow-hidden border-2 border-dashed border-purple-300 dark:border-purple-600/60 hover:border-purple-600 dark:hover:border-purple-400 rounded-3xl p-5 text-center cursor-pointer bg-purple-50/30 dark:bg-[#161b26]/50 hover:bg-purple-50/60 transition-all duration-300 group shadow-sm"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileUpload}
          className="hidden"
        />
        <div className="w-13 h-13 bg-white dark:bg-[#1e2433] rounded-2xl mx-auto mb-2.5 flex items-center justify-center text-purple-700 dark:text-purple-400 shadow-md group-hover:scale-110 transition-transform">
          <Upload size={22} />
        </div>
        <p className="text-sm font-bold text-gray-800 dark:text-white">
          Загрузить фото или скан PDF
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
          Поддерживаются форматы PDF, JPEG, PNG из любых лабораторий
        </p>

        {/* Preset sample buttons */}
        <div className="mt-3.5 pt-3 border-t border-purple-100/60 dark:border-purple-900/40 flex flex-wrap gap-2 justify-center" onClick={(e) => e.stopPropagation()}>
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
        <div className="bg-white dark:bg-[#161b26] rounded-3xl p-6 shadow-sm border border-purple-100/60 dark:border-purple-500/20 text-center card-animate">
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
        <div className="flex flex-col gap-3.5 card-animate">
          {/* File Card Header */}
          <div className="bg-white dark:bg-[#161b26] rounded-3xl p-4 shadow-sm border border-purple-100/60 dark:border-purple-500/20 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-purple-50 dark:bg-purple-950/60 rounded-2xl flex items-center justify-center text-purple-700 dark:text-purple-400 flex-shrink-0">
                <FileCheck2 size={22} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                  {result.fileName}
                </p>
                <p className="text-[11px] text-gray-400 dark:text-gray-400 mt-0.5">
                  Дата: {result.date}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-purple-800 dark:text-purple-300 bg-purple-100/70 dark:bg-purple-950/80 px-2.5 py-1 rounded-xl flex-shrink-0 ml-2">
              {result.biomarkers.length} биомаркеров
            </span>
          </div>

          {/* AI Clinical Summary */}
          <div className="bg-gradient-to-br from-purple-50/80 to-indigo-50/50 dark:from-purple-950/30 dark:to-indigo-950/20 rounded-3xl p-4.5 border border-purple-100 dark:border-purple-900/50 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-purple-700 dark:text-purple-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300">
                Сводка медицинского ИИ
              </h3>
            </div>
            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-normal">
              {result.summary}
            </p>
          </div>

          {/* Biomarkers Table / Cards */}
          <div className="bg-white dark:bg-[#161b26] rounded-3xl p-4.5 shadow-sm border border-purple-100/60 dark:border-purple-500/20 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                Извлечённые показатели
              </h3>
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-100 dark:border-rose-900/50">
                {result.biomarkers.filter((b) => b.status !== 'in-range').length} отклонения
              </span>
            </div>

            <div className="space-y-2.5">
              {result.biomarkers.map((bio) => {
                const isOutlier = bio.status !== 'in-range';
                return (
                  <div
                    key={bio.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      isOutlier
                        ? 'border-rose-200/80 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20'
                        : 'border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-[#1a202c]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {bio.name}
                        </span>
                        <span className="text-[9px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-1.5 py-0.5 rounded">
                          {categoryLabelsRu[bio.category] || bio.category}
                        </span>
                      </div>
                      <StatusBadge status={bio.status} />
                    </div>

                    <div className="flex items-baseline justify-between text-xs">
                      <div>
                        <span className="text-base font-black text-gray-900 dark:text-white">
                          {bio.value}
                        </span>
                        <span className="text-gray-400 font-medium ml-1">
                          {bio.unit}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400 dark:text-gray-400 font-medium">
                        Норма: {bio.refMin} – {bio.refMax} {bio.unit}
                      </span>
                    </div>

                    {/* Progress Range Bar */}
                    <div className="relative h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          bio.status === 'in-range'
                            ? 'bg-purple-600'
                            : bio.status === 'below'
                            ? 'bg-blue-500'
                            : 'bg-rose-500'
                        }`}
                        style={{
                          width: `${Math.min(95, Math.max(12, (bio.value / (bio.refMax * 1.3)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="bg-white dark:bg-[#161b26] rounded-3xl p-4.5 shadow-sm border border-purple-100/60 dark:border-purple-500/20 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <Stethoscope size={18} className="text-purple-700 dark:text-purple-400" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                Рекомендованные шаги
              </h3>
            </div>
            <div className="space-y-2">
              {result.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100/50 dark:border-purple-900/30">
                  <span className="w-5 h-5 rounded-full bg-purple-700 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                    {i + 1}
                  </span>
                  <p className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                    {rec}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Mandatory Medical Disclaimer (Required by GEMINI.md) */}
          <div className="bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-900/50 rounded-3xl p-4 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldAlert size={20} />
              </div>
              <div>
                <p className="text-xs font-extrabold text-amber-900 dark:text-amber-200 tracking-tight mb-1">
                  Обязательный медицинский дисклеймер
                </p>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed font-normal">
                  Автоматический разбор анализов с помощью ИИ носит исключительно справочно-информационный характер и ни при каких обстоятельствах не заменяет очную консультацию врача-специалиста. Не принимайте решений о приеме лекарств или изменении дозировок без назначения врача.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysesPage;
