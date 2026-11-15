import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import HealthIndex from '../components/dashboard/HealthIndex';
import BiomarkerCard from '../components/dashboard/BiomarkerCard';
import SpendingSummary from '../components/dashboard/SpendingSummary';
import PeriodSelector from '../components/dashboard/PeriodSelector';
import { demoHealthScore, demoBiomarkers, demoExpenses, demoHealthTrend } from '../data/demo';
import type { PeriodType } from '../types';
import { Activity } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const [period, setPeriod] = useState<PeriodType>('All');

  return (
    <div className="px-4 pt-12 pb-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Здоровье</h1>
          <p className="text-xs text-gray-500">Ноябрь 2026</p>
        </div>
        <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center">
          <Activity size={18} className="text-purple-700" />
        </div>
      </div>

      {/* Health Index Radar */}
      <HealthIndex score={demoHealthScore} />

      {/* Period Selector */}
      <div className="flex justify-center">
        <PeriodSelector selected={period} onChange={setPeriod} />
      </div>

      {/* Health Trend Chart */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 card-animate">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Динамика индекса</h3>
        <div className="h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={demoHealthTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis domain={[75, 95]} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip
                contentStyle={{
                  background: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#fff',
                  padding: '6px 10px',
                }}
                formatter={(value: number) => [value.toFixed(1), 'Индекс']}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#7c3aed"
                strokeWidth={2.5}
                dot={{ fill: '#7c3aed', r: 4, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, fill: '#7c3aed', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Biomarker Cards */}
      <h3 className="text-sm font-semibold text-gray-800">Ключевые показатели</h3>
      <div className="grid grid-cols-2 gap-3">
        {demoBiomarkers.map((bio) => (
          <BiomarkerCard key={bio.id} biomarker={bio} />
        ))}
      </div>

      {/* Spending Summary */}
      <SpendingSummary expenses={demoExpenses} />
    </div>
  );
};

export default DashboardPage;
