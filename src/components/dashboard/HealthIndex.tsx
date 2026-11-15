import React, { useState } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { HelpCircle, ChevronLeft } from 'lucide-react';
import type { HealthScore, PeriodType } from '../../types';
import PeriodSelector from './PeriodSelector';

interface Props {
  score: HealthScore;
  period: PeriodType;
  onPeriodChange: (p: PeriodType) => void;
}

const HealthIndex: React.FC<Props> = ({ score, period, onPeriodChange }) => {
  const [showInfo, setShowInfo] = useState(false);

  const radarData = [
    { subject: 'Калории', wellness: score.calorie, sleep: 68, endurance: 84, fullMark: 100 },
    { subject: 'ИМТ', wellness: score.bmi, sleep: 70, endurance: 88, fullMark: 100 },
    { subject: 'Пульс', wellness: score.bpm, sleep: 85, endurance: 74, fullMark: 100 },
    { subject: 'Гидратация', wellness: score.hydration, sleep: 78, endurance: 72, fullMark: 100 },
    { subject: 'Сон', wellness: 82, sleep: score.sleep, endurance: 79, fullMark: 100 },
    { subject: 'Шаги', wellness: 88, sleep: 62, endurance: score.steps, fullMark: 100 },
  ];

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-100/60 card-animate relative overflow-hidden">
      {/* Header bar matching healthcare_2.png */}
      <div className="flex items-center justify-between mb-2">
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          title="Назад"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-sm font-bold text-gray-900 tracking-tight">
          Score Breakdown
        </h2>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-purple-700 hover:bg-purple-50 transition-colors"
          title="Справка"
        >
          <HelpCircle size={18} />
        </button>
      </div>

      {showInfo && (
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-3 mb-3 text-xs text-purple-900 animate-slide-up">
          <p className="font-semibold mb-1">Как рассчитывается индекс?</p>
          <p className="text-[11px] leading-relaxed text-purple-700">
            Индекс здоровья объединяет 6 ключевых факторов: калораж, состав тела (ИМТ), сердечный ритм (BPM), гидратацию, качество сна и физическую активность (шаги).
          </p>
        </div>
      )}

      {/* Hexagonal Radar Chart */}
      <div className="h-[250px] -mx-4 my-1">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="68%">
            <PolarGrid stroke="#e2e8f0" strokeDasharray="2 2" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            {/* Wellness (Teal/Emerald) */}
            <Radar
              name="Wellness"
              dataKey="wellness"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.12}
              strokeWidth={2}
            />
            {/* Sleep (Slate) */}
            <Radar
              name="Сон"
              dataKey="sleep"
              stroke="#64748b"
              fill="#64748b"
              fillOpacity={0.08}
              strokeWidth={1.5}
            />
            {/* Endurance (Vibrant Purple) */}
            <Radar
              name="Выносливость"
              dataKey="endurance"
              stroke="#7c3aed"
              fill="#7c3aed"
              fillOpacity={0.18}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Big Score matching healthcare_2.png */}
      <div className="text-center pt-1 pb-3">
        <div className="text-6xl font-black text-gray-900 tracking-tight leading-none">
          88,2
        </div>
        <p className="text-xs font-medium text-gray-600 mt-2">
          Отличное состояние здоровья
        </p>

        {/* Legend matching healthcare_2.png */}
        <div className="flex items-center justify-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
            <span className="text-[11px] font-semibold text-gray-600">Wellness</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#64748b]" />
            <span className="text-[11px] font-semibold text-gray-600">Сон</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#7c3aed]" />
            <span className="text-[11px] font-semibold text-gray-600">Выносливость</span>
          </div>
        </div>
      </div>

      {/* Segmented Period Selector matching healthcare_2.png */}
      <div className="mt-1">
        <PeriodSelector selected={period} onChange={onPeriodChange} />
      </div>
    </div>
  );
};

export default HealthIndex;
