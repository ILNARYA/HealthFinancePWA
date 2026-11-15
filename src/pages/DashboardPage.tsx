import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import HealthIndex from '../components/dashboard/HealthIndex';
import BiomarkerRangeChart from '../components/dashboard/BiomarkerRangeChart';
import BiomarkerCard from '../components/dashboard/BiomarkerCard';
import SpendingSummary from '../components/dashboard/SpendingSummary';
import { demoHealthScore, demoBiomarkers, demoExpenses, demoHealthTrend } from '../data/demo';
import type { PeriodType } from '../types';
import { Activity, Bell, Sparkles } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const [period, setPeriod] = useState<PeriodType>('All');

  return (
    <div className="px-4 pt-4 pb-6 flex flex-col gap-4">
      {/* Top App Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-700 to-purple-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-purple-500/20">
            ИЯ
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-extrabold text-gray-900 tracking-tight">
                Привет, Ильнар
              </h1>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                <Sparkles size={9} /> Норма
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium">Ноябрь 2026 · Данные синхронизированы</p>
          </div>
        </div>
        <button
          className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-gray-400 hover:text-purple-700 shadow-sm border border-gray-100 transition-colors"
          title="Уведомления"
        >
          <Bell size={18} />
        </button>
      </div>

      {/* 1. Radar Score Breakdown matching healthcare_2.png */}
      <HealthIndex
        score={demoHealthScore}
        period={period}
        onPeriodChange={setPeriod}
      />

      {/* 2. Monthly Medical Finance Card */}
      <SpendingSummary expenses={demoExpenses} />

      {/* 3. Range Dynamics Chart matching healthcare_1.webp right-hand card */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Динамика электролитов
          </h3>
          <span className="text-[11px] font-semibold text-purple-700">eGFR & K+</span>
        </div>
        <BiomarkerRangeChart />
      </div>

      {/* 4. Biomarkers Grid / List matching healthcare_1.webp */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Ключевые биомаркеры
          </h3>
          <span className="text-xs font-semibold text-purple-700">4 показателя</span>
        </div>
        <div className="space-y-3">
          {demoBiomarkers.map((bio) => (
            <BiomarkerCard key={bio.id} biomarker={bio} />
          ))}
        </div>
      </div>

      {/* 5. Health Index Trend Line Chart */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-100/60 card-animate">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900 tracking-tight">
              Динамика индекса здоровья
            </h3>
            <p className="text-[11px] text-gray-400">За последние 6 месяцев (+6.1 п.)</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700">
            <Activity size={18} />
          </div>
        </div>

        <div className="h-[140px] -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={demoHealthTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[78, 92]}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip
                contentStyle={{
                  background: '#0f172a',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#fff',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  padding: '6px 12px',
                }}
                formatter={(value: any) => [
                  typeof value === 'number' ? value.toFixed(1) : String(value ?? ''),
                  'Индекс',
                ]}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#7c3aed"
                strokeWidth={3}
                dot={{ fill: '#7c3aed', r: 4, strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 6, fill: '#7c3aed', stroke: '#ffffff', strokeWidth: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
