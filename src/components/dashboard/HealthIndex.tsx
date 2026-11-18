import React, { useState } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { HelpCircle, Calendar } from 'lucide-react';
import type { HealthScore } from '../../types';

interface Props {
  score: HealthScore;
  selectedMonthId: string;
  onMonthChange: (monthId: string) => void;
  availableMonths: { id: string; label: string }[];
  isEmpty?: boolean;
}

const HealthIndex: React.FC<Props> = ({
  score,
  selectedMonthId,
  onMonthChange,
  availableMonths,
  isEmpty = false,
}) => {
  const [showInfo, setShowInfo] = useState(false);

  // Radar data based strictly on clinical blood test biomarker categories
  const radarData = [
    {
      subject: 'Метаболизм',
      user: isEmpty ? 0 : score.metabolism,
      target: 92,
      fullMark: 100,
      note: 'Глюкоза, Липиды, Мочевая кислота',
    },
    {
      subject: 'Сон & Отдых',
      user: isEmpty ? 0 : score.sleepRecovery,
      target: 90,
      fullMark: 100,
      note: 'Витамин D3, Ферритин, Магний',
    },
    {
      subject: 'Иммунитет',
      user: isEmpty ? 0 : score.immune,
      target: 95,
      fullMark: 100,
      note: 'Лейкоциты, СОЭ, СРБ',
    },
    {
      subject: 'Почки',
      user: isEmpty ? 0 : score.kidney,
      target: 94,
      fullMark: 100,
      note: 'eGFR, Креатинин, Мочевина, Калий',
    },
    {
      subject: 'Печень',
      user: isEmpty ? 0 : score.liver,
      target: 90,
      fullMark: 100,
      note: 'АЛТ, АСТ, Билирубин, ЩФ',
    },
    {
      subject: 'Кровь (O2)',
      user: isEmpty ? 0 : score.blood,
      target: 95,
      fullMark: 100,
      note: 'Гемоглобин, Эритроциты, Тромбоциты',
    },
  ];

  return (
    <div className="bg-white dark:bg-[#161b26] rounded-3xl p-5 shadow-sm border border-purple-100/60 dark:border-purple-500/20 card-animate relative overflow-visible transition-colors w-full">
      {/* Header bar matching healthcare_2.png */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Calendar size={15} className="text-purple-600 dark:text-purple-400" />
          <h2 className="text-sm font-extrabold text-gray-900 dark:text-white tracking-tight">
            Оценка по анализам (Score)
          </h2>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-purple-700 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors"
          title="Справка по научной группировке"
        >
          <HelpCircle size={18} />
        </button>
      </div>

      {showInfo && (
        <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50 rounded-2xl p-3.5 mb-3 text-xs animate-slide-up">
          <p className="font-bold text-purple-950 dark:text-purple-200 mb-1">
            Клиническая модель индекса здоровья (PubMed / Спектр биомаркеров):
          </p>
          <ul className="text-[11px] leading-relaxed text-purple-800 dark:text-purple-300 space-y-1 list-disc list-inside">
            <li><strong>Диета & Метаболизм:</strong> липидный профиль и гликемия.</li>
            <li><strong>Сон & Восстановление:</strong> Витамин D3 и ферритин (доказанная связь со структурой фаз сна и ночным восстановлением).</li>
            <li><strong>Иммунитет & Воспаление:</strong> клеточный ответ (лейкоцитарный профиль, СОЭ).</li>
            <li><strong>Почки, Печень & Кровь:</strong> ключевые биохимические маркеры гомеостаза.</li>
          </ul>
        </div>
      )}

      {/* Month Selector Tabs */}
      <div className="flex items-center justify-between bg-gray-100/80 dark:bg-[#1e2433] rounded-2xl p-1 mb-2 border border-gray-200/50 dark:border-gray-700/50">
        {availableMonths.map((m) => {
          const isSelected = selectedMonthId === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onMonthChange(m.id)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                isSelected
                  ? 'bg-white dark:bg-[#2b3347] text-purple-700 dark:text-purple-300 shadow-sm scale-[1.02]'
                  : 'text-gray-400 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {m.label.split(' ')[0]}
            </button>
          );
        })}
      </div>

      {/* Hexagonal Radar Chart based on lab results */}
      <div className="h-[230px] -mx-3 my-1">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="66%">
            <PolarGrid stroke="#e2e8f0" strokeDasharray="2 2" className="dark:stroke-gray-700/60" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 9.5, fill: '#64748b', fontWeight: 600 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            {/* Target optimal envelope */}
            <Radar
              name="Оптимум нормы"
              dataKey="target"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.08}
              strokeWidth={1.5}
            />
            {/* Current user laboratory profile */}
            <Radar
              name="Ваш профиль анализов"
              dataKey="user"
              stroke="#7c3aed"
              fill="#7c3aed"
              fillOpacity={0.22}
              strokeWidth={2.5}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Big Score matching healthcare_2.png */}
      <div className="text-center pt-1 pb-2">
        <div className={`text-6xl font-black tracking-tight leading-none ${isEmpty ? 'text-gray-300 dark:text-gray-600 font-mono tracking-widest' : 'text-gray-900 dark:text-white'}`}>
          {isEmpty ? '— —' : score.overall.toFixed(1).replace('.', ',')}
        </div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-2">
          {isEmpty
            ? 'Ожидание загрузки первого медицинского анализа'
            : score.overall >= 85
            ? 'Отличное состояние здоровья'
            : score.overall >= 80
            ? 'Хорошее состояние, есть маркеры для контроля'
            : 'Требуется внимание к отклонениям'}
        </p>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${isEmpty ? 'bg-gray-300 dark:bg-gray-600' : 'bg-[#7c3aed] dark:bg-[#a855f7]'}`} />
            <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
              {isEmpty ? 'Ваши анализы (пусто)' : 'Ваши анализы'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
            <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
              Целевая норма
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthIndex;
