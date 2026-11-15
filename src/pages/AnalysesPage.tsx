import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertTriangle, CheckCircle, XCircle, Loader2, ShieldAlert } from 'lucide-react';
import type { AnalysisResult, Biomarker } from '../types';
import { demoAnalysisResult } from '../data/demo';
import { simulateAnalysis } from '../utils/analysisEngine';

const StatusBadge: React.FC<{ status: Biomarker['status'] }> = ({ status }) => {
  const config = {
    'in-range': { icon: CheckCircle, text: 'В норме', cls: 'text-green-600 bg-green-50' },
    below: { icon: AlertTriangle, text: 'Ниже', cls: 'text-blue-600 bg-blue-50' },
    above: { icon: XCircle, text: 'Выше', cls: 'text-red-600 bg-red-50' },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${c.cls}`}>
      <c.icon size={10} />
      {c.text}
    </span>
  );
};

const AnalysesPage: React.FC = () => {
  const [result, setResult] = useState<AnalysisResult | null>(demoAnalysisResult);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await simulateAnalysis(file.name);
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 pt-12 pb-4 space-y-4">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-xl font-bold text-gray-900">Анализы и ИИ-разбор</h1>
        <p className="text-xs text-gray-500">Загрузите анализ для автоматического разбора</p>
      </div>

      {/* Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-purple-300 rounded-2xl p-6 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50/50 transition-all duration-200"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleUpload}
          className="hidden"
        />
        <Upload size={32} className="mx-auto mb-2 text-purple-400" />
        <p className="text-sm font-medium text-gray-700">Нажмите для загрузки</p>
        <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG — до 10 МБ</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
          <Loader2 size={32} className="mx-auto mb-3 text-purple-600 animate-spin" />
          <p className="text-sm font-medium text-gray-700">Анализируем документ...</p>
          <p className="text-xs text-gray-400 mt-1">Извлекаем биомаркеры и сравниваем с нормами</p>
          <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-purple-600 rounded-full animate-pulse-slow" style={{ width: '60%' }} />
          </div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <>
          {/* File Info */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 card-animate">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <FileText size={20} className="text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{result.fileName}</p>
                <p className="text-xs text-gray-400">{result.date}</p>
              </div>
              <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
                {result.biomarkers.length} показателей
              </span>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 card-animate">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Сводка</h3>
            <p className="text-xs text-gray-600 leading-relaxed">{result.summary}</p>
          </div>

          {/* Biomarkers Table */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 card-animate">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Биомаркеры</h3>
            <div className="space-y-2.5">
              {result.biomarkers.map((bio) => (
                <div
                  key={bio.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border ${
                    bio.status !== 'in-range' ? 'border-red-100 bg-red-50/30' : 'border-gray-100 bg-gray-50/50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900">{bio.name}</p>
                    <p className="text-[10px] text-gray-400">
                      Норма: {bio.refMin}–{bio.refMax} {bio.unit}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">
                      {bio.value} <span className="text-[10px] font-normal text-gray-400">{bio.unit}</span>
                    </span>
                    <StatusBadge status={bio.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 card-animate">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Рекомендации</h3>
            <ul className="space-y-2">
              {result.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="mt-0.5 w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-purple-700">
                    {i + 1}
                  </span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          {/* Medical Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 card-animate">
            <div className="flex items-start gap-2">
              <ShieldAlert size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-800 mb-1">Медицинский дисклеймер</p>
                <p className="text-[10px] text-amber-700 leading-relaxed">
                  Результаты автоматического анализа носят исключительно информационный характер
                  и не являются медицинским заключением. Для постановки диагноза и назначения лечения
                  обязательно обратитесь к квалифицированному врачу.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalysesPage;
