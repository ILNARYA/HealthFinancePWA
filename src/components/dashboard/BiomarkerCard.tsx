import React from 'react';
import { FlaskConical } from 'lucide-react';
import type { Biomarker } from '../../types';

interface Props {
  biomarker: Biomarker;
}

const BiomarkerCard: React.FC<Props> = ({ biomarker }) => {
  const statusConfig = {
    'in-range': {
      label: 'В норме',
      badgeClass: 'text-purple-700 bg-purple-50 border border-purple-100',
      dotColor: '#7c3aed',
      trackColor: '#e9d5ff',
      description: 'Показатель в пределах целевой нормы',
    },
    below: {
      label: 'Ниже нормы',
      badgeClass: 'text-blue-600 bg-blue-50 border border-blue-100',
      dotColor: '#3b82f6',
      trackColor: '#dbeafe',
      description: 'Ниже референсного интервала лаборатории',
    },
    above: {
      label: 'Выше нормы',
      badgeClass: 'text-rose-600 bg-rose-50 border border-rose-100',
      dotColor: '#f43f5e',
      trackColor: '#ffe4e6',
      description: 'Выше верхней границы целевой нормы',
    },
  };

  const config = statusConfig[biomarker.status];

  // Normalized position between 0% and 100%
  const span = biomarker.refMax - biomarker.refMin;
  const padding = span * 0.4;
  const chartMin = Math.max(0, biomarker.refMin - padding);
  const chartMax = biomarker.refMax + padding;
  const fullRange = chartMax - chartMin;

  const normalLeftPercent = ((biomarker.refMin - chartMin) / fullRange) * 100;
  const normalWidthPercent = (span / fullRange) * 100;

  const valuePositionPercent = Math.min(
    95,
    Math.max(5, ((biomarker.value - chartMin) / fullRange) * 100)
  );

  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-purple-50/80 card-animate hover:shadow-md transition-shadow">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
            <FlaskConical size={15} className="text-purple-700" />
          </div>
          <span className="font-bold text-sm text-gray-900 tracking-tight">
            {biomarker.name}
          </span>
        </div>
        <span className="text-[11px] font-medium text-gray-400">
          {biomarker.date}
        </span>
      </div>

      {/* Value & Status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-gray-900 tracking-tight">
            {biomarker.value}
          </span>
          <span className="text-xs font-semibold text-gray-500">
            {biomarker.unit}
          </span>
        </div>
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${config.badgeClass}`}>
          {config.label}
        </span>
      </div>

      {/* Visual Range Indicator Bar */}
      <div className="relative py-2">
        {/* Full grey track */}
        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
          {/* Target normal range zone */}
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
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md transition-all duration-300"
          style={{
            left: `${valuePositionPercent}%`,
            transform: 'translate(-50%, -50%)',
            backgroundColor: config.dotColor,
          }}
        />
      </div>

      {/* Range Info & Description */}
      <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-gray-50 mt-1">
        <span>{config.description}</span>
        <span className="font-medium text-gray-500">
          {biomarker.refMin}–{biomarker.refMax} {biomarker.unit}
        </span>
      </div>
    </div>
  );
};

export default BiomarkerCard;
