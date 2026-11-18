import React, { useState } from 'react';
import { FlaskConical, CheckCircle2 } from 'lucide-react';
import { CustomSelect } from '../common/CustomSelect';

export interface BiomarkerRangeConfig {
  id: string;
  name: string;
  shortName: string;
  category: string;
  unit: string;
  targetRange: string;
  minScale: number;
  maxScale: number;
  subtitle: string;
  dateRange: string;
  statusText: string;
  dataPoints: {
    period: string;
    min: number;
    max: number;
  }[];
}

export const biomarkerConfigs: BiomarkerRangeConfig[] = [
  {
    id: 'egfr',
    name: 'eGFR (СКФ)',
    shortName: 'СКФ (eGFR)',
    category: 'Почки & Фильтрация',
    unit: 'мл/мин',
    targetRange: '> 60 (норма 90–120)',
    minScale: 60,
    maxScale: 125,
    subtitle: 'Скорость клубочковой фильтрации почек',
    dateRange: '02 янв 2026 – 04 янв 2027',
    statusText: 'Оптимальная фильтрация',
    dataPoints: [
      { period: '2021', min: 96, max: 110 },
      { period: '2022', min: 93, max: 106 },
      { period: '2023', min: 88, max: 99 },
      { period: '2024', min: 90, max: 102 },
      { period: '2025', min: 92, max: 104 },
      { period: '2026', min: 94, max: 106 },
    ],
  },
  {
    id: 'creatinine',
    name: 'Креатинин сыворотки',
    shortName: 'Креатинин',
    category: 'Мышечный & Почечный баланс',
    unit: 'мкмоль/л',
    targetRange: '62 – 106',
    minScale: 50,
    maxScale: 120,
    subtitle: 'Уровень креатинина сыворотки',
    dateRange: '02 янв 2026 – 04 янв 2027',
    statusText: 'В пределах референса',
    dataPoints: [
      { period: '2021', min: 70, max: 81 },
      { period: '2022', min: 73, max: 85 },
      { period: '2023', min: 78, max: 92 },
      { period: '2024', min: 75, max: 87 },
      { period: '2025', min: 73, max: 84 },
      { period: '2026', min: 74, max: 85 },
    ],
  },
  {
    id: 'glucose',
    name: 'Глюкоза натощак',
    shortName: 'Глюкоза',
    category: 'Углеводный обмен',
    unit: 'ммоль/л',
    targetRange: '3.9 – 5.8',
    minScale: 3.0,
    maxScale: 7.0,
    subtitle: 'Гликемический профиль натощак',
    dateRange: '02 янв 2026 – 04 янв 2027',
    statusText: 'Гликемический оптимум',
    dataPoints: [
      { period: '2021', min: 4.6, max: 5.3 },
      { period: '2022', min: 4.8, max: 5.6 },
      { period: '2023', min: 5.1, max: 6.0 },
      { period: '2024', min: 4.8, max: 5.4 },
      { period: '2025', min: 4.6, max: 5.2 },
      { period: '2026', min: 4.7, max: 5.2 },
    ],
  },
  {
    id: 'potassium',
    name: 'Калий (K+)',
    shortName: 'Калий',
    category: 'Электролиты & Сердце',
    unit: 'ммоль/л',
    targetRange: '3.5 – 5.0',
    minScale: 2.0,
    maxScale: 5.5,
    subtitle: 'Стабильный диапазон за 6 месяцев',
    dateRange: '02 янв 2026 – 04 янв 2027',
    statusText: 'Целевой коридор нормы',
    dataPoints: [
      { period: '2021', min: 3.6, max: 4.1 },
      { period: '2022', min: 3.8, max: 4.3 },
      { period: '2023', min: 3.7, max: 4.4 },
      { period: '2024', min: 3.9, max: 4.5 },
      { period: '2025', min: 4.1, max: 4.6 },
      { period: '2026', min: 4.2, max: 4.6 },
    ],
  },
  {
    id: 'cholesterol',
    name: 'Холестерин общий',
    shortName: 'Холестерин',
    category: 'Липидный обмен',
    unit: 'ммоль/л',
    targetRange: '3.6 – 5.2',
    minScale: 2.5,
    maxScale: 7.2,
    subtitle: 'Динамика липидного баланса',
    dateRange: '02 янв 2026 – 04 янв 2027',
    statusText: 'Позитивная коррекция',
    dataPoints: [
      { period: '2021', min: 4.4, max: 5.3 },
      { period: '2022', min: 4.9, max: 5.9 },
      { period: '2023', min: 5.3, max: 6.3 },
      { period: '2024', min: 4.9, max: 5.8 },
      { period: '2025', min: 4.6, max: 5.4 },
      { period: '2026', min: 4.5, max: 5.2 },
    ],
  },
  {
    id: 'alt',
    name: 'АЛТ (фермент печени)',
    shortName: 'АЛТ',
    category: 'Функция печени',
    unit: 'Ед/л',
    targetRange: '10 – 40',
    minScale: 8,
    maxScale: 50,
    subtitle: 'Ферменты цитолиза печени',
    dateRange: '02 янв 2026 – 04 янв 2027',
    statusText: 'Гепатопротекция в норме',
    dataPoints: [
      { period: '2021', min: 18, max: 26 },
      { period: '2022', min: 22, max: 32 },
      { period: '2023', min: 26, max: 37 },
      { period: '2024', min: 23, max: 32 },
      { period: '2025', min: 20, max: 27 },
      { period: '2026', min: 19, max: 25 },
    ],
  },
];

interface Props {
  isEmpty?: boolean;
  onUploadClick?: () => void;
}

const BiomarkerRangeChart: React.FC<Props> = ({ isEmpty = false, onUploadClick }) => {
  const [selectedBioId, setSelectedBioId] = useState<string>('potassium');
  const [activeIndex, setActiveIndex] = useState<number>(5); // default to latest year (2026)

  const biomarker = biomarkerConfigs.find((b) => b.id === selectedBioId) || biomarkerConfigs[0];
  const activeData = biomarker.dataPoints[activeIndex] || biomarker.dataPoints[biomarker.dataPoints.length - 1];

  // Headroom-aware scaling formula:
  // Maps values strictly between 22% (top margin) and 82% (bottom margin)
  // Tooltip positioned above topPercent at -translate-y-full stays comfortably within 0%..22%
  // and will NEVER bleed into or overlap the card header.
  const getYPercent = (val: number) => {
    const norm = (biomarker.maxScale - val) / (biomarker.maxScale - biomarker.minScale);
    const clamped = Math.max(0, Math.min(1, norm));
    return 22 + clamped * 58;
  };

  const handleBiomarkerChange = (newId: string) => {
    setSelectedBioId(newId);
    const targetBio = biomarkerConfigs.find((b) => b.id === newId);
    if (targetBio) {
      setActiveIndex(targetBio.dataPoints.length - 1);
    }
  };

  return (
    <div className="bg-white dark:bg-[#161b26] rounded-3xl p-5 shadow-sm border border-purple-100/60 dark:border-purple-500/20 card-animate relative overflow-visible transition-colors">
      {/* Top Biomarker Switcher Bar */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-gray-100 dark:border-gray-800">
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400">
          Выбор биомаркера
        </span>

        <div className="w-44">
          <CustomSelect
            value={selectedBioId}
            onChange={handleBiomarkerChange}
            options={biomarkerConfigs.map((b) => ({ value: b.id, label: b.name }))}
            buttonClassName="pl-3 pr-3 py-1.5 border-purple-200 dark:border-purple-800/80 bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200"
          />
        </div>
      </div>

      {/* Quick Filter Horizontal Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-3 mb-1">
        {biomarkerConfigs.map((b) => {
          const isSelected = b.id === selectedBioId;
          return (
            <button
              key={b.id}
              onClick={() => handleBiomarkerChange(b.id)}
              className={`flex-shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all ${
                isSelected
                  ? 'bg-purple-700 text-white shadow-xs scale-[1.02]'
                  : 'bg-gray-100 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-950/40'
              }`}
            >
              {b.shortName}
            </button>
          );
        })}
      </div>

      {/* Header matching healthcare_1.webp */}
      <div className="flex items-start gap-3 mb-1">
        <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center flex-shrink-0 border border-purple-100 dark:border-purple-900/40">
          <FlaskConical size={22} className="text-purple-700 dark:text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {isEmpty ? '— —' : `${activeData.min} – ${activeData.max}`}
            </span>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {biomarker.unit}
            </span>
          </div>
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5 truncate">
            {isEmpty
              ? 'Ориентир нормы: ' + biomarker.targetRange + ' ' + biomarker.unit
              : activeIndex === biomarker.dataPoints.length - 1
              ? biomarker.subtitle
              : `Диапазон за ${activeData.period} год`}
          </p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            {isEmpty ? 'Ожидание первого лабораторного анализа' : biomarker.dateRange}
          </p>
        </div>
      </div>

      {isEmpty ? (
        <div className="h-48 mt-2 p-4 rounded-2xl bg-gray-50/50 dark:bg-[#1a202c]/40 border border-dashed border-purple-200 dark:border-purple-800/60 flex flex-col items-center justify-center text-center">
          <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
            Многолетняя динамика формируется
          </p>
          <p className="text-[11px] text-gray-400 dark:text-gray-400 max-w-[280px] mt-1 leading-relaxed">
            Загрузите медицинский бланк, чтобы система автоматически выстроила свечной график коридоров нормы
          </p>
          {onUploadClick && (
            <button
              onClick={onUploadClick}
              className="mt-3 px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              + Загрузить анализ
            </button>
          )}
        </div>
      ) : (
        /* Chart Canvas with dedicated vertical headroom */
        <div className="relative h-48 mt-2 px-1">
          {/* Background Grid Lines (Dashed) */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none py-3">
            <div className="border-b border-dashed border-gray-100 dark:border-gray-800 w-full" />
            <div className="border-b border-dashed border-gray-100 dark:border-gray-800 w-full" />
            <div className="border-b border-dashed border-gray-100 dark:border-gray-800 w-full" />
            <div className="border-b border-dashed border-gray-100 dark:border-gray-800 w-full" />
          </div>

          {/* Floating Candlestick Bars */}
          <div className="relative h-full flex items-end justify-between px-1">
            {biomarker.dataPoints.map((dp, idx) => {
              const topPercent = getYPercent(dp.max);
              const bottomPercent = getYPercent(dp.min);
              const heightPercent = Math.max(8, bottomPercent - topPercent);
              const isActive = activeIndex === idx;

              return (
                <div
                  key={dp.period}
                  className="relative flex flex-col items-center h-full cursor-pointer select-none group"
                  onClick={() => setActiveIndex(idx)}
                  style={{ width: '44px' }}
                >
                  {/* Active Column Vertical Guide Line */}
                  {isActive && (
                    <div className="absolute inset-y-0 w-px border-l border-dashed border-purple-400/40 dark:border-purple-500/40 pointer-events-none" />
                  )}

                  {/* Floating Tooltip positioned right above dp.max - NEVER overlaps header */}
                  {isActive && (
                    <div
                      className="absolute z-30 transition-all duration-200 pointer-events-none flex flex-col items-center"
                      style={{
                        top: `${topPercent}%`,
                        transform: 'translateY(-100%)',
                        marginTop: '-6px',
                      }}
                    >
                      <div className="bg-slate-900 dark:bg-purple-950 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-lg border border-purple-500/30 flex items-center gap-1 whitespace-nowrap">
                        <span>{dp.min} – {dp.max}</span>
                      </div>
                      {/* Downward pointing triangle arrow */}
                      <div className="w-1.5 h-1.5 bg-slate-900 dark:bg-purple-950 rotate-45 -mt-0.5 border-r border-b border-purple-500/30" />
                    </div>
                  )}

                  {/* Vertical Candlestick Pill Bar */}
                  <div
                    className={`absolute w-3.5 rounded-full transition-all duration-300 ${
                      isActive ? 'scale-110' : 'group-hover:opacity-90'
                    }`}
                    style={{
                      top: `${topPercent}%`,
                      height: `${heightPercent}%`,
                      backgroundColor: isActive ? '#7c3aed' : '#334155',
                      boxShadow: isActive ? '0 4px 14px rgba(124, 58, 237, 0.5)' : 'none',
                      opacity: isActive ? 1 : 0.75,
                    }}
                  />

                  {/* X Axis Year Label */}
                  <span
                    className={`absolute bottom-0 text-[11px] font-semibold transition-colors ${
                      isActive ? 'text-purple-700 dark:text-purple-400 font-extrabold scale-105' : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {dp.period}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Target Corridor & Status Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 mt-2.5 pt-2.5 border-t border-gray-100 dark:border-gray-800 gap-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-gray-400">Целевой коридор:</span>
          <span className="font-bold text-gray-800 dark:text-gray-200">
            {biomarker.targetRange} {biomarker.unit}
          </span>
        </div>
        <div className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold self-start sm:self-auto text-[11px]">
          <CheckCircle2 size={13} className="flex-shrink-0" />
          <span>{biomarker.statusText}</span>
        </div>
      </div>
    </div>
  );
};

export default BiomarkerRangeChart;
