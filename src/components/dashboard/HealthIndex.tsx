import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { HealthScore } from '../../types';

interface Props {
  score: HealthScore;
}

const HealthIndex: React.FC<Props> = ({ score }) => {
  const radarData = [
    { subject: 'Калории', wellness: score.calorie, sleep: Math.round(score.calorie * 0.8), endurance: Math.round(score.calorie * 0.9), fullMark: 100 },
    { subject: 'BMI', wellness: score.bmi, sleep: Math.round(score.bmi * 0.7), endurance: Math.round(score.bmi * 0.85), fullMark: 100 },
    { subject: 'Пульс', wellness: score.bpm, sleep: Math.round(score.bpm * 0.9), endurance: Math.round(score.bpm * 0.75), fullMark: 100 },
    { subject: 'Гидратация', wellness: score.hydration, sleep: Math.round(score.hydration * 0.85), endurance: Math.round(score.hydration * 0.7), fullMark: 100 },
    { subject: 'Сон', wellness: score.sleep, sleep: score.sleep, endurance: Math.round(score.sleep * 0.8), fullMark: 100 },
    { subject: 'Шаги', wellness: score.steps, sleep: Math.round(score.steps * 0.6), endurance: score.steps, fullMark: 100 },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 card-animate">
      <h3 className="text-sm font-semibold text-gray-800 text-center mb-2">
        Индекс здоровья
      </h3>

      <div className="h-[220px] -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 10, fill: '#6b7280' }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <Radar
              name="Wellness"
              dataKey="wellness"
              stroke="#7c3aed"
              fill="#7c3aed"
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Radar
              name="Сон"
              dataKey="sleep"
              stroke="#a855f7"
              fill="#a855f7"
              fillOpacity={0.1}
              strokeWidth={1.5}
            />
            <Radar
              name="Endurance"
              dataKey="endurance"
              stroke="#c084fc"
              fill="#c084fc"
              fillOpacity={0.08}
              strokeWidth={1.5}
            />
            <Legend
              wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }}
              iconSize={8}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="text-center mt-1">
        <div className="text-5xl font-bold text-gray-900 tracking-tight">
          {score.overall.toFixed(1).replace('.', ',')}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Отличное состояние здоровья
        </p>
      </div>
    </div>
  );
};

export default HealthIndex;
