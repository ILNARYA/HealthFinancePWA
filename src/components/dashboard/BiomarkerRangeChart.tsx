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

  // Chart coordinate mapping (scale 1.5 to 5.5)
  const chartMin = 1.5;
  const chartMax = 5.5;
  const totalRange = chartMax - chartMin;

  const getYPercent = (val: number) => {
    return ((chartMax - val) / totalRange) * 100;
  };

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-100/60 card-animate relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-start gap-3 mb-2">
        <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center flex-shrink-0">
          <FlaskConical size={22} className="text-purple-700" />
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-gray-900 tracking-tight">4.2 – 4.6</span>
            <span className="text-sm font-semibold text-gray-500">ммоль/л</span>
          </div>
          <p className="text-xs font-medium text-gray-700 mt-0.5">
            Стабильный диапазон за 6 месяцев
          </p>
          <p className="text-[11px] text-gray-400">
            02 янв 2026 – 04 янв 2027
          </p>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative h-44 mt-6 pt-5 px-2">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none py-4">
          <div className="border-b border-dashed border-gray-100 w-full" />
          <div className="border-b border-dashed border-gray-100 w-full" />
          <div className="border-b border-dashed border-gray-100 w-full" />
          <div className="border-b border-dashed border-gray-100 w-full" />
        </div>

        {/* Floating Range Bars */}
        <div className="relative h-full flex items-end justify-between px-3">
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
                style={{ width: '44px' }}
              >
                {/* Floating Tooltip if Active */}
                {isActive && (
                  <div
                    className="absolute -top-3 z-20 transition-all duration-200 pointer-events-none"
                    style={{
                      transform: 'translateY(-100%)',
                    }}
                  >
                    <div className="bg-gray-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-md flex items-center gap-1 whitespace-nowrap">
                      <span>{dp.min} – {dp.max}</span>
                    </div>
                    {/* Small triangle arrow */}
                    <div className="w-1.5 h-1.5 bg-gray-900 rotate-45 mx-auto -mt-0.5" />
                  </div>
                )}

                {/* Vertical Pill Bar */}
                <div
                  className="absolute w-3.5 rounded-full transition-all duration-300"
                  style={{
                    top: `${topPercent}%`,
                    height: `${Math.max(heightPercent, 8)}%`,
                    backgroundColor: isActive ? '#7c3aed' : '#1e293b',
                    boxShadow: isActive ? '0 4px 14px rgba(124, 58, 237, 0.4)' : 'none',
                    opacity: isActive ? 1 : 0.85,
                  }}
                />

                {/* X Axis Label */}
                <span
                  className={`absolute bottom-0 text-[11px] font-medium transition-colors ${
                    isActive ? 'text-purple-700 font-bold' : 'text-gray-400'
                  }`}
                >
                  {dp.period}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2 pt-2 border-t border-gray-50">
        <span>Целевой коридор: 3.5 – 5.0</span>
        <span className="text-purple-700 font-semibold cursor-pointer">Подробная динамика →</span>
      </div>
    </div>
  );
};

export default BiomarkerRangeChart;
