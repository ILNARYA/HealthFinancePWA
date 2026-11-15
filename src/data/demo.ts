import type { Biomarker, HealthScore, Expense, Doctor, AnalysisResult, HealthTrend } from '../types';

export const demoBiomarkers: Biomarker[] = [
  {
    id: '1',
    name: 'eGFR',
    value: 4.2,
    unit: 'mL/min',
    refMin: 3.5,
    refMax: 5.0,
    date: 'Сентябрь 2026',
    status: 'in-range',
  },
  {
    id: '2',
    name: 'Креатинин',
    value: 0.64,
    unit: 'mg/dL',
    refMin: 0.7,
    refMax: 1.3,
    date: 'Август 2026',
    status: 'below',
  },
  {
    id: '3',
    name: 'Глюкоза',
    value: 5.1,
    unit: 'ммоль/л',
    refMin: 3.9,
    refMax: 5.8,
    date: 'Октябрь 2026',
    status: 'in-range',
  },
  {
    id: '4',
    name: 'Холестерин',
    value: 6.8,
    unit: 'ммоль/л',
    refMin: 3.6,
    refMax: 5.2,
    date: 'Октябрь 2026',
    status: 'above',
  },
];

export const demoHealthScore: HealthScore = {
  calorie: 72,
  bmi: 88,
  bpm: 82,
  hydration: 76,
  sleep: 90,
  steps: 91,
  overall: 88.2,
};

export const demoExpenses: Expense[] = [
  {
    id: '1',
    category: 'doctor',
    title: 'Приём терапевта',
    amount: 3500,
    date: '2026-11-03',
    doctor: 'Иванова А.С.',
    specialty: 'Терапевт',
  },
  {
    id: '2',
    category: 'analysis',
    title: 'Общий анализ крови',
    amount: 2800,
    date: '2026-11-05',
    doctor: 'Лаборатория Инвитро',
  },
  {
    id: '3',
    category: 'doctor',
    title: 'Приём кардиолога',
    amount: 5000,
    date: '2026-11-08',
    doctor: 'Петров М.В.',
    specialty: 'Кардиолог',
  },
  {
    id: '4',
    category: 'medicine',
    title: 'Лекарства (Аторвастатин, Метформин)',
    amount: 1200,
    date: '2026-11-10',
  },
  {
    id: '5',
    category: 'procedure',
    title: 'МРТ головного мозга',
    amount: 8500,
    date: '2026-11-12',
    doctor: 'Клиника «Медси»',
  },
  {
    id: '6',
    category: 'doctor',
    title: 'Приём стоматолога',
    amount: 7000,
    date: '2026-11-14',
    doctor: 'Сидорова Е.К.',
    specialty: 'Стоматолог',
  },
  {
    id: '7',
    category: 'analysis',
    title: 'Биохимический анализ крови',
    amount: 3200,
    date: '2026-11-06',
    doctor: 'Лаборатория Гемотест',
  },
  {
    id: '8',
    category: 'medicine',
    title: 'Витамин D3 + Омега-3',
    amount: 1850,
    date: '2026-11-09',
  },
];

export const demoDoctors: Doctor[] = [
  {
    id: '1',
    name: 'Иванова А.С.',
    specialty: 'Терапевт',
    totalSpent: 10500,
    visits: 3,
    lastVisit: '2026-11-03',
    avatar: '👩‍⚕️',
  },
  {
    id: '2',
    name: 'Петров М.В.',
    specialty: 'Кардиолог',
    totalSpent: 15000,
    visits: 3,
    lastVisit: '2026-11-08',
    avatar: '👨‍⚕️',
  },
  {
    id: '3',
    name: 'Сидорова Е.К.',
    specialty: 'Стоматолог',
    totalSpent: 21000,
    visits: 3,
    lastVisit: '2026-11-14',
    avatar: '👩‍⚕️',
  },
  {
    id: '4',
    name: 'Козлов Д.А.',
    specialty: 'Невролог',
    totalSpent: 8500,
    visits: 2,
    lastVisit: '2026-10-25',
    avatar: '👨‍⚕️',
  },
];

export const demoHealthTrend: HealthTrend[] = [
  { date: 'Июн', score: 82.1 },
  { date: 'Июл', score: 84.5 },
  { date: 'Авг', score: 83.2 },
  { date: 'Сен', score: 86.8 },
  { date: 'Окт', score: 87.4 },
  { date: 'Ноя', score: 88.2 },
];

export const demoAnalysisResult: AnalysisResult = {
  id: '1',
  fileName: 'Анализ_крови_05.11.2026.pdf',
  date: '2026-11-05',
  biomarkers: [
    { id: 'a1', name: 'Гемоглобин', value: 145, unit: 'г/л', refMin: 130, refMax: 160, date: '05.11.2026', status: 'in-range' },
    { id: 'a2', name: 'Эритроциты', value: 4.8, unit: '×10¹²/л', refMin: 4.0, refMax: 5.5, date: '05.11.2026', status: 'in-range' },
    { id: 'a3', name: 'Лейкоциты', value: 11.2, unit: '×10⁹/л', refMin: 4.0, refMax: 9.0, date: '05.11.2026', status: 'above' },
    { id: 'a4', name: 'Тромбоциты', value: 220, unit: '×10⁹/л', refMin: 180, refMax: 320, date: '05.11.2026', status: 'in-range' },
    { id: 'a5', name: 'СОЭ', value: 18, unit: 'мм/ч', refMin: 2, refMax: 15, date: '05.11.2026', status: 'above' },
    { id: 'a6', name: 'Глюкоза', value: 5.1, unit: 'ммоль/л', refMin: 3.9, refMax: 5.8, date: '05.11.2026', status: 'in-range' },
    { id: 'a7', name: 'Холестерин общий', value: 6.8, unit: 'ммоль/л', refMin: 3.6, refMax: 5.2, date: '05.11.2026', status: 'above' },
    { id: 'a8', name: 'Креатинин', value: 78, unit: 'мкмоль/л', refMin: 62, refMax: 106, date: '05.11.2026', status: 'in-range' },
  ],
  summary: 'Выявлены отклонения в 3 из 8 показателей. Повышенные лейкоциты и СОЭ могут указывать на воспалительный процесс. Холестерин выше нормы — рекомендуется контроль липидного профиля.',
  recommendations: [
    'Обратиться к терапевту для оценки воспалительных маркеров',
    'Сдать развёрнутый липидный профиль (ЛПНП, ЛПВП, триглицериды)',
    'Контроль анализа крови через 2 недели',
    'Рассмотреть коррекцию диеты для снижения холестерина',
  ],
};

export const categoryLabels: Record<string, string> = {
  doctor: 'Приём врача',
  analysis: 'Анализы',
  medicine: 'Лекарства',
  procedure: 'Процедуры',
};

export const categoryColors: Record<string, string> = {
  doctor: '#7c3aed',
  analysis: '#3b82f6',
  medicine: '#22c55e',
  procedure: '#f59e0b',
};
