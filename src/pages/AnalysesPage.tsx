import React, { useState, useRef } from 'react';
import {
  Upload, AlertTriangle, CheckCircle2,
  XCircle, Loader2, ShieldAlert, Sparkles,
  FileCheck2, Stethoscope
} from 'lucide-react';
import type { AnalysisResult, Biomarker } from '../types';
import { demoAnalysisResult } from '../data/demo';
import { simulateAnalysis } from '../utils/analysisEngine';

const StatusBadge: React.FC<{ status: Biomarker['status'] }> = ({ status }) => {
  const config = {
    'in-range': {
      icon: CheckCircle2,
      text: 'В норме',
      cls: 'text-emerald-700 bg-emerald-50 border-emerald-200/80',
    },
    below: {
      icon: AlertTriangle,
      text: 'Ниже нормы',
      cls: 'text-blue-700 bg-blue-50 border-blue-200/80',
    },
    above: {
      icon: XCircle,
      text: 'Выше нормы',
      cls: 'text-rose-700 bg-rose-50 border-rose-200/80',
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

const AnalysesPage: React.FC = () => {
  const [result, setResult] = useState<AnalysisResult | null>(demoAnalysisResult);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (name: string) => {
    setLoading(true);
    setResult(null);

    setLoadingStep('Распознавание бланка и извлечение текста (OCR)...');
    await new Promise((r) => setTimeout(r, 700));

    setLoadingStep('Идентификация биомаркеров и референсных значений...');
    await new Promise((r) => setTimeout(r, 800));

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
    <div className="px-4 pt-4 pb-6 flex flex-col gap-4">
      {/* Header */}
      <div className="pt-2">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
            Анализы и ИИ-разбор
          </h1>
          <span className="flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
            <Sparkles size={12} /> AI Scanner
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Мгновенный разбор лабораторных бланков, графики отклонений и рекомендации
        </p>
      </div>

      {/* Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="relative overflow-hidden border-2 border-dashed border-purple-300 hover:border-purple-600 rounded-3xl p-6 text-center cursor-pointer bg-purple-50/30 hover:bg-purple-50/60 transition-all duration-300 group shadow-sm"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileUpload}
          className="hidden"
        />
        <div className="w-14 h-14 bg-white rounded-2xl mx-auto mb-3 flex items-center justify-center text-purple-700 shadow-md group-hover:scale-110 transition-transform">
          <Upload size={24} />
        </div>
        <p className="text-sm font-bold text-gray-800">
          Загрузить фото или скан PDF
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Поддерживаются форматы PDF, JPEG, PNG из любых лабораторий
        </p>

        {/* Preset sample buttons */}
        <div className="mt-4 pt-4 border-t border-purple-100/60 flex flex-wrap gap-2 justify-center" onClick={(e) => e.stopPropagation()}>
          <span className="text-[10px] font-semibold text-gray-400 w-full mb-0.5">Или выберите готовый образец для теста:</span>
          <button
            onClick={() => loadPreset('Общий_анализ_крови_05.11.2026.pdf')}
            className="text-[11px] font-bold text-purple-700 bg-white px-2.5 py-1.5 rounded-xl border border-purple-200/80 hover:bg-purple-50 shadow-xs transition-colors"
          >
            🧪 Общий анализ крови
          </button>
          <button
            onClick={() => loadPreset('Биохимия_крови_Инвитро.pdf')}
            className="text-[11px] font-bold text-purple-700 bg-white px-2.5 py-1.5 rounded-xl border border-purple-200/80 hover:bg-purple-50 shadow-xs transition-colors"
          >
            🩸 Биохимия и липидограмма
          </button>
        </div>
      </div>

      {/* Loading AI State */}
      {loading && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-100/60 text-center card-animate">
          <div className="relative w-16 h-16 mx-auto mb-3">
            <Loader2 size={64} className="text-purple-600 animate-spin opacity-30" />
            <Sparkles size={24} className="absolute inset-0 m-auto text-purple-700 animate-pulse" />
          </div>
          <p className="text-sm font-bold text-gray-900">ИИ анализирует медицинский бланк</p>
          <p className="text-xs text-purple-700 font-medium mt-1 min-h-[18px]">
            {loadingStep}
          </p>
          <div className="mt-4 h-2 bg-purple-50 rounded-full overflow-hidden w-full max-w-[240px] mx-auto">
            <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full animate-pulse-slow" style={{ width: '75%' }} />
          </div>
        </div>
      )}

      {/* Analysis Result */}
      {result && !loading && (
        <div className="space-y-4 card-animate">
          {/* File Card Header */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-purple-100/60 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-700 flex-shrink-0">
                <FileCheck2 size={22} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate">
                  {result.fileName}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Дата анализа: {result.date}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-purple-800 bg-purple-100/70 px-2.5 py-1 rounded-xl flex-shrink-0">
              {result.biomarkers.length} биомаркеров
            </span>
          </div>

          {/* AI Clinical Summary */}
          <div className="bg-gradient-to-br from-purple-50/80 to-indigo-50/50 rounded-3xl p-5 border border-purple-100 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-purple-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900">
                Сводка медицинского ИИ
              </h3>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed font-normal">
              {result.summary}
            </p>
          </div>

          {/* Biomarkers Table / Cards */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-100/60">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                Извлечённые показатели
              </h3>
              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                3 отклонения
              </span>
            </div>

            <div className="space-y-2.5">
              {result.biomarkers.map((bio) => {
                const isOutlier = bio.status !== 'in-range';
                return (
                  <div
                    key={bio.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isOutlier
                        ? 'border-rose-200/80 bg-rose-50/20'
                        : 'border-gray-100 bg-gray-50/40 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-gray-900">
                        {bio.name}
                      </span>
                      <StatusBadge status={bio.status} />
                    </div>

                    <div className="flex items-baseline justify-between text-xs">
                      <div>
                        <span className="text-base font-black text-gray-900">
                          {bio.value}
                        </span>
                        <span className="text-gray-400 font-medium ml-1">
                          {bio.unit}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400 font-medium">
                        Норма: {bio.refMin} – {bio.refMax} {bio.unit}
                      </span>
                    </div>

                    {/* Progress Range Bar */}
                    <div className="relative h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          bio.status === 'in-range'
                            ? 'bg-purple-600'
                            : bio.status === 'below'
                            ? 'bg-blue-500'
                            : 'bg-rose-500'
                        }`}
                        style={{
                          width: `${Math.min(100, Math.max(10, (bio.value / (bio.refMax * 1.3)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-100/60">
            <div className="flex items-center gap-2 mb-3">
              <Stethoscope size={18} className="text-purple-700" />
              <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                Рекомендованные шаги
              </h3>
            </div>
            <div className="space-y-2">
              {result.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-2xl bg-purple-50/40 border border-purple-100/50">
                  <span className="w-5 h-5 rounded-full bg-purple-700 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                    {i + 1}
                  </span>
                  <p className="text-xs text-gray-700 font-medium leading-relaxed">
                    {rec}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Mandatory Medical Disclaimer (Required by GEMINI.md) */}
          <div className="bg-amber-50/90 border border-amber-200/90 rounded-3xl p-4 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldAlert size={20} />
              </div>
              <div>
                <p className="text-xs font-extrabold text-amber-900 tracking-tight mb-1">
                  Обязательный медицинский дисклеймер
                </p>
                <p className="text-[11px] text-amber-800 leading-relaxed font-normal">
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
