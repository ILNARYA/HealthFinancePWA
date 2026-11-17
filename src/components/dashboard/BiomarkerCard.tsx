import React from 'react';
import { FlaskConical } from 'lucide-react';
import type { Biomarker } from '../../types';
import { useFamily } from '../../context/FamilyContext';

interface Props {
  biomarker: Biomarker;
}

const categoryLabelsRu: Record<string, string> = {
  metabolism: 'Диета & Метаболизм',
  sleepRecovery: 'Сон & Восстановление',
  immune: 'Иммунитет',
  kidney: 'Почки & Баланс',
  liver: 'Печень',
  blood: 'Кроветворение',
};

const BiomarkerCard: React.FC<Props> = ({ biomarker }) => {
  const statusConfig = {
    'in-range': {
      label: 'В норме',
      badgeClass: 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800',
      dotColor: '#7c3aed',
      trackColor: '#e9d5ff',
      description: 'В пределах целевой нормы',
    },
    below: {
      label: 'Ниже нормы',
      badgeClass: 'text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800',
      dotColor: '#3b82f6',
      trackColor: '#bfdbfe',
      description: 'Ниже референса лаборатории',
    },
    above: {
      label: 'Выше нормы',
      badgeClass: 'text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800',
      dotColor: '#f43f5e',
      trackColor: '#fecdd3',
      description: 'Выше верхней границы нормы',
    },
  };

  const { privacyMode } = useFamily();
  const config = statusConfig[biomarker.status];

  // Normalized position between 8% and 92% to strictly prevent overflow
  const span = Math.max(0.1, biomarker.refMax - biomarker.refMin);
  const padding = span * 0.4;
  const chartMin = Math.max(0, biomarker.refMin - padding);
  const chartMax = biomarker.refMax + padding;
  const fullRange = Math.max(0.1, chartMax - chartMin);

  const normalLeftPercent = Math.max(5, ((biomarker.refMin - chartMin) / fullRange) * 100);
  const normalWidthPercent = Math.min(90, (span / fullRange) * 100);

  const rawPosition = ((biomarker.value - chartMin) / fullRange) * 100;
  const valuePositionPercent = Math.min(92, Math.max(8, rawPosition));

  return (
    <div className="bg-white dark:bg-[#161b26] rounded-3xl p-4 shadow-sm border border-purple-100/60 dark:border-purple-500/20 card-animate hover:shadow-md transition-all">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center flex-shrink-0">
            <FlaskConical size={15} className="text-purple-700 dark:text-purple-400" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-bold text-xs text-gray-900 dark:text-white leading-tight block">
              {biomarker.name}
            </span>
          </div>
        </div>
        <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full flex-shrink-0 ml-1">
          {categoryLabelsRu[biomarker.category] || biomarker.category}
        </span>
      </div>

      {/* Value & Status */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            {biomarker.value}
          </span>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {biomarker.unit}
          </span>
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${config.badgeClass}`}>
          {config.label}
        </span>
      </div>

      {/* Visual Range Indicator Bar */}
      <div className="relative py-2 px-1">
        <div className="relative h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="absolute h-full rounded-full opacity-90"
            style={{
              left: `${normalLeftPercent}%`,
              width: `${normalWidthPercent}%`,
              backgroundColor: config.trackColor,
            }}
          />
        </div>

        {/* Current Value Dot */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white dark:border-[#161b26] shadow-md transition-all duration-300"
          style={{
            left: `${valuePositionPercent}%`,
            transform: 'translate(-50%, -50%)',
            backgroundColor: config.dotColor,
          }}
        />
      </div>

      {/* Range Info & Description */}
      <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500 pt-1.5 border-t border-gray-50 dark:border-gray-800/80 mt-1 gap-2">
        <span className="truncate flex-1 min-w-0" title={biomarker.clinicalNote || config.description}>
          {privacyMode ? '••••••••••••••••' : (biomarker.clinicalNote || config.description)}
        </span>
        <span className="font-semibold text-gray-600 dark:text-gray-300 flex-shrink-0 whitespace-nowrap">
          {biomarker.refMin}–{biomarker.refMax} {biomarker.unit}
        </span>
      </div>
    </div>
  );
};

export default BiomarkerCard;
