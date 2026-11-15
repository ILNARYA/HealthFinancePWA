import React from 'react';
import { FlaskConical } from 'lucide-react';
import type { Biomarker } from '../../types';

interface Props {
  biomarker: Biomarker;
}

const BiomarkerCard: React.FC<Props> = ({ biomarker }) => {
  const statusConfig = {
    'in-range': { label: 'В норме', color: 'bg-purple-600', textColor: 'text-purple-700', bgColor: 'bg-purple-50' },
    below: { label: 'Ниже нормы', color: 'bg-blue-500', textColor: 'text-blue-600', bgColor: 'bg-blue-50' },
    above: { label: 'Выше нормы', color: 'bg-red-500', textColor: 'text-red-600', bgColor: 'bg-red-50' },
  };

  const config = statusConfig[biomarker.status];

  // Calculate indicator position (0% to 100%)
  const range = biomarker.refMax - biomarker.refMin;
  const extendedMin = biomarker.refMin - range * 0.3;
  const extendedMax = biomarker.refMax + range * 0.3;
  const position = Math.max(0, Math.min(100, ((biomarker.value - extendedMin) / (extendedMax - extendedMin)) * 100));

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 card-animate">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FlaskConical size={16} className="text-purple-600" />
          <span className="font-semibold text-sm text-gray-900">{biomarker.name}</span>
        </div>
        <span className="text-xs text-gray-400">{biomarker.date}</span>
      </div>

      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-3xl font-bold text-gray-900">{biomarker.value}</span>
        <span className="text-sm text-gray-500">{biomarker.unit}</span>
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.bgColor} ${config.textColor}`}>
          {config.label}
        </span>
      </div>

      {/* Range indicator bar */}
      <div className="relative h-1.5 bg-gray-200 rounded-full overflow-visible">
        {/* Normal range zone */}
        <div
          className="absolute h-full bg-purple-200 rounded-full"
          style={{
            left: `${((biomarker.refMin - extendedMin) / (extendedMax - extendedMin)) * 100}%`,
            width: `${(range / (extendedMax - extendedMin)) * 100}%`,
          }}
        />
        {/* Current value dot */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${config.color} border-2 border-white shadow-sm`}
          style={{ left: `${position}%`, transform: `translate(-50%, -50%)` }}
        />
      </div>

      <p className="text-xs text-gray-400 mt-2">
        Норма: {biomarker.refMin}–{biomarker.refMax} {biomarker.unit}
      </p>
    </div>
  );
};

export default BiomarkerCard;
