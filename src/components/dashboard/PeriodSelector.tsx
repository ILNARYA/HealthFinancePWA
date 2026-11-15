import React from 'react';
import type { PeriodType } from '../../types';

interface Props {
  selected: PeriodType;
  onChange: (period: PeriodType) => void;
}

const periods: PeriodType[] = ['1d', '1w', '1m', '1y', 'All'];

const PeriodSelector: React.FC<Props> = ({ selected, onChange }) => {
  return (
    <div className="flex items-center justify-between bg-gray-100/90 rounded-2xl p-1 w-full max-w-[340px] mx-auto border border-gray-200/50">
      {periods.map((period) => {
        const isSelected = selected === period;
        return (
          <button
            key={period}
            onClick={() => onChange(period)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 ${
              isSelected
                ? 'bg-white text-gray-900 shadow-sm border border-gray-200/40 scale-[1.02]'
                : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            {period}
          </button>
        );
      })}
    </div>
  );
};

export default PeriodSelector;
