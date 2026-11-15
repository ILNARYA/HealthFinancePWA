import React, { useState } from 'react';
import { FlaskConical } from 'lucide-react';

interface RangeDataPoint {
  period: string;
  min: number;
  max: number;
}

const dataPoints: RangeDataPoint[] = [
  { period: '2022', min: 2.1, max: 2.8 },
  { period: '2023', min: 2.7, max: 3.8 },
  { period: '2024', min: 3.4, max: 4.5 },
  { period: '2025', min: 3.8, max: 4.8 },
  { period: '2026', min: 4.2, max: 4.6 },
];

const BiomarkerRangeChart: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number>(4);

  const chartMin = 1.5;
  const chartMax = 5.5;
  const totalRange = chartMax - chartMin;

  const getYPercent = (val: number) => {
    return ((chartMax - val) / totalRange) * 100;
  };

  return (
    <div className="bg-white dark:bg-[#161b26] rounded-3xl p-5 shadow-sm border border-purple-100/60 dark:border-purple-500/20 card-animate relative overflow-visible transition-colors">
      {/* Top Header matching healthcare_1.webp */}
      <div className="flex items-start gap-3 mb-2">
        <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center flex-shrink-0">
          <FlaskConical size={22} className="text-purple-700 dark:text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">4.2 – 4.6</span>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">ммоль/л</span>
          </div>
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5 truncate">
            Стабильный диапазон за 6 месяцев
          </p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            02 янв 2026 – 04 янв 2027
          </p>
        </div>
      </div>

      {/* Chart Canvas with generous top padding to prevent tooltip clipping */}
      <div className="relative h-44 mt-3 pt-6 px-1">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none py-2">
          <div className="border-b border-dashed border-gray-100 dark:border-gray-800 w-full" />
          <div className="border-b border-dashed border-gray-100 dark:border-gray-800 w-full" />
          <div className="border-b border-dashed border-gray-100 dark:border-gray-800 w-full" />
          <div className="border-b border-dashed border-gray-100 dark:border-gray-800 w-full" />
        </div>

        {/* Floating Range Bars */}
        <div className="relative h-full flex items-end justify-between px-2">
          {dataPoints.map((dp, idx) => {
            const topPercent = getYPercent(dp.max);
            const bottomPercent = getYPercent(dp.min);
            const heightPercent = bottomPercent - topPercent;
            const isActive = activeIndex === idx;

            return (
              <div
                key={dp.period}
                className="relative flex flex-col items-center h-full cursor-pointer group"
                onClick={() => setActiveIndex(idx)}
                style={{ width: '48px' }}
              >
                {/* Floating Tooltip if Active (safely positioned within container) */}
                {isActive && (
                  <div className="absolute -top-6 z-20 transition-all duration-200 pointer-events-none">
                    <div className="bg-gray-900 dark:bg-purple-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-lg flex items-center gap-1 whitespace-nowrap">
                      <span>{dp.min} – {dp.max}</span>
                    </div>
                    <div className="w-1.5 h-1.5 bg-gray-900 dark:bg-purple-900 rotate-45 mx-auto -mt-0.5" />
                  </div>
                )}

                {/* Vertical Pill Bar */}
                <div
                  className="absolute w-3.5 rounded-full transition-all duration-300"
                  style={{
                    top: `${Math.max(12, topPercent)}%`,
                    height: `${Math.max(heightPercent, 10)}%`,
                    backgroundColor: isActive ? '#7c3aed' : '#334155',
                    boxShadow: isActive ? '0 4px 14px rgba(124, 58, 237, 0.45)' : 'none',
                    opacity: isActive ? 1 : 0.75,
                  }}
                />

                {/* X Axis Label */}
                <span
                  className={`absolute bottom-0 text-[11px] font-medium transition-colors ${
                    isActive ? 'text-purple-700 dark:text-purple-400 font-bold' : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {dp.period}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500 mt-2 pt-2 border-t border-gray-50 dark:border-gray-800">
        <span>Целевой коридор: 3.5 – 5.0</span>
        <span className="text-purple-700 dark:text-purple-400 font-semibold cursor-pointer">
          Биомаркер: калий (K+)
        </span>
      </div>
    </div>
  );
};

export default BiomarkerRangeChart;
