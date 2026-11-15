import React from 'react';
import type { PeriodType } from '../../types';

interface Props {
  selected: PeriodType;
  onChange: (period: PeriodType) => void;
}

const periods: PeriodType[] = ['1d', '1w', '1m', '1y', 'All'];

const PeriodSelector: React.FC<Props> = ({ selected, onChange }) => {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
      {periods.map((period) => (
        <button
          key={period}
          onClick={() => onChange(period)}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
            selected === period
              ? 'bg-purple-700 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {period}
        </button>
      ))}
    </div>
  );
};

export default PeriodSelector;
