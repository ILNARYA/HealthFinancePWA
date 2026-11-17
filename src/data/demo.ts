import type { Biomarker, HealthScore, Expense, Doctor, AnalysisResult, HealthTrend, MonthData } from '../types';

export const monthsData: MonthData[] = [
  {
    id: 'nov2026',
    label: 'Ноябрь 2026',
    notes: 'Контроль липидов и маркеров воспаления после терапии',
    score: {
      metabolism: 76,    // Холестерин повышен
      sleepRecovery: 88, // Витамин D3 нормализуется (38 нг/мл)
      immune: 70,        // Лейкоциты и СОЭ на верхней границе
      kidney: 96,        // eGFR и креатинин отличные
      liver: 92,         // АЛТ, АСТ в норме
      blood: 95,         // Гемоглобин 145 г/л
      overall: 88.2,
    },
    biomarkers: [
      {
        id: 'nb1',
        name: 'eGFR (СКФ)',
        category: 'kidney',
        value: 4.2,
        unit: 'mL/min',
        refMin: 3.5,
        refMax: 5.0,
        date: '05.11.2026',
        status: 'in-range',
        clinicalNote: 'Фильтрационная функция почек сохранена на высоком уровне',
      },
      {
        id: 'nb2',
        name: 'Креатинин сыворотки',
        category: 'kidney',
        value: 0.64,
        unit: 'mg/dL',
        refMin: 0.7,
        refMax: 1.3,
        date: '05.11.2026',
        status: 'below',
        clinicalNote: 'Незначительное снижение, клинически не опасно (диета/мышечная масса)',
      },
      {
        id: 'nb3',
        name: 'Глюкоза натощак',
        category: 'metabolism',
        value: 5.1,
        unit: 'ммоль/л',
        refMin: 3.9,
        refMax: 5.8,
        date: '05.11.2026',
        status: 'in-range',
        clinicalNote: 'Углеводный обмен стабилен, риск инсулинорезистентности низкий',
      },
      {
        id: 'nb4',
        name: 'Холестерин общий',
        category: 'metabolism',
        value: 6.8,
        unit: 'ммоль/л',
        refMin: 3.6,
        refMax: 5.2,
        date: '05.11.2026',
        status: 'above',
        clinicalNote: 'Гиперхолестеринемия — показана консультация кардиолога и диета',
      },
      {
        id: 'nb5',
        name: 'Витамин D3 (25-OH)',
        category: 'sleepRecovery',
        value: 38,
        unit: 'нг/мл',
        refMin: 30,
        refMax: 80,
        date: '05.11.2026',
        status: 'in-range',
        clinicalNote: 'Целевой уровень достигнут; способствует нормализации фаз сна',
      },
      {
        id: 'nb6',
        name: 'Ферритин (депо железа)',
        category: 'sleepRecovery',
        value: 65,
        unit: 'мкг/л',
        refMin: 30,
        refMax: 200,
        date: '05.11.2026',
        status: 'in-range',
        clinicalNote: 'Достаточный уровень для синтеза дофамина и глубокого сна',
      },
      {
        id: 'nb7',
        name: 'Лейкоциты (WBC)',
        category: 'immune',
        value: 11.2,
        unit: '×10⁹/л',
        refMin: 4.0,
        refMax: 9.0,
        date: '05.11.2026',
        status: 'above',
        clinicalNote: 'Умеренный лейкоцитоз, признак перенесенного ОРВИ',
      },
      {
        id: 'nb8',
        name: 'СОЭ (по Вестергрену)',
        category: 'immune',
        value: 18,
        unit: 'мм/ч',
        refMin: 2,
        refMax: 15,
        date: '05.11.2026',
        status: 'above',
        clinicalNote: 'Остаточная воспалительная реакция',
      },
    ],
    expenses: [
      { id: 'e1', category: 'doctor', title: 'Приём терапевта', amount: 3500, date: '2026-11-03', doctor: 'Иванова А.С.', specialty: 'Терапевт' },
      { id: 'e2', category: 'analysis', title: 'Общий анализ крови + СОЭ', amount: 2800, date: '2026-11-05', doctor: 'Инвитро' },
      { id: 'e3', category: 'analysis', title: 'Липидный профиль и глюкоза', amount: 3200, date: '2026-11-06', doctor: 'Инвитро' },
      { id: 'e4', category: 'doctor', title: 'Приём кардиолога', amount: 5000, date: '2026-11-08', doctor: 'Петров М.В.', specialty: 'Кардиолог' },
      { id: 'e5', category: 'medicine', title: 'Омега-3 и витаминные комплексы', amount: 3050, date: '2026-11-09' },
      { id: 'e6', category: 'procedure', title: 'МРТ головного мозга', amount: 8500, date: '2026-11-12', doctor: 'Клиника «Медси»' },
      { id: 'e7', category: 'doctor', title: 'Приём стоматолога', amount: 7000, date: '2026-11-14', doctor: 'Сидорова Е.К.', specialty: 'Стоматолог' },
    ],
  },
  {
    id: 'oct2026',
    label: 'Октябрь 2026',
    notes: 'Плановый биохимический скрининг печени и почек',
    score: {
      metabolism: 70,
      sleepRecovery: 79,
      immune: 89,
      kidney: 94,
      liver: 82,
      blood: 92,
      overall: 84.6,
    },
    biomarkers: [
      { id: 'ob1', name: 'eGFR (СКФ)', category: 'kidney', value: 4.1, unit: 'mL/min', refMin: 3.5, refMax: 5.0, date: '12.10.2026', status: 'in-range' },
      { id: 'ob2', name: 'Креатинин', category: 'kidney', value: 0.72, unit: 'mg/dL', refMin: 0.7, refMax: 1.3, date: '12.10.2026', status: 'in-range' },
      { id: 'ob3', name: 'Глюкоза', category: 'metabolism', value: 5.4, unit: 'ммоль/л', refMin: 3.9, refMax: 5.8, date: '12.10.2026', status: 'in-range' },
      { id: 'ob4', name: 'Холестерин общий', category: 'metabolism', value: 7.1, unit: 'ммоль/л', refMin: 3.6, refMax: 5.2, date: '12.10.2026', status: 'above' },
      { id: 'ob5', name: 'Витамин D3', category: 'sleepRecovery', value: 29, unit: 'нг/мл', refMin: 30, refMax: 80, date: '12.10.2026', status: 'below' },
      { id: 'ob6', name: 'АЛТ (фермент печени)', category: 'liver', value: 42, unit: 'Ед/л', refMin: 10, refMax: 40, date: '12.10.2026', status: 'above' },
    ],
    expenses: [
      { id: 'oe1', category: 'doctor', title: 'Приём гастроэнтеролога', amount: 4500, date: '2026-10-10', doctor: 'Васильев П.Н.', specialty: 'Гастроэнтеролог' },
      { id: 'oe2', category: 'analysis', title: 'Биохимия расширенная (18 пок.)', amount: 4200, date: '2026-10-12', doctor: 'Гемотест' },
      { id: 'oe3', category: 'medicine', title: 'Гепатопротекторы (Урсосан)', amount: 2800, date: '2026-10-14' },
      { id: 'oe4', category: 'doctor', title: 'Приём терапевта', amount: 3500, date: '2026-10-20', doctor: 'Иванова А.С.', specialty: 'Терапевт' },
      { id: 'oe5', category: 'procedure', title: 'УЗИ брюшной полости', amount: 3800, date: '2026-10-22', doctor: 'Клиника «Медси»' },
      { id: 'oe6', category: 'medicine', title: 'Витамин D3 водный раствор', amount: 950, date: '2026-10-24' },
      { id: 'oe7', category: 'doctor', title: 'Приём невролога', amount: 4450, date: '2026-10-25', doctor: 'Козлов Д.А.', specialty: 'Невролог' },
    ],
  },
  {
    id: 'sep2026',
    label: 'Сентябрь 2026',
    notes: 'Скрининг утомляемости и качества сна',
    score: {
      metabolism: 82,
      sleepRecovery: 68,
      immune: 88,
      kidney: 92,
      liver: 89,
      blood: 74,
      overall: 81.9,
    },
    biomarkers: [
      { id: 'sb1', name: 'Витамин D3 (25-OH)', category: 'sleepRecovery', value: 19, unit: 'нг/мл', refMin: 30, refMax: 80, date: '18.09.2026', status: 'below', clinicalNote: 'Выраженный дефицит, ассоциированный с нарушением фаз сна' },
      { id: 'sb2', name: 'Ферритин', category: 'sleepRecovery', value: 22, unit: 'мкг/л', refMin: 30, refMax: 200, date: '18.09.2026', status: 'below', clinicalNote: 'Латентный дефицит железа' },
      { id: 'sb3', name: 'Гемоглобин', category: 'blood', value: 128, unit: 'г/л', refMin: 130, refMax: 160, date: '18.09.2026', status: 'below' },
      { id: 'sb4', name: 'Глюкоза', category: 'metabolism', value: 4.9, unit: 'ммоль/л', refMin: 3.9, refMax: 5.8, date: '18.09.2026', status: 'in-range' },
      { id: 'sb5', name: 'eGFR', category: 'kidney', value: 4.2, unit: 'mL/min', refMin: 3.5, refMax: 5.0, date: '18.09.2026', status: 'in-range' },
    ],
    expenses: [
      { id: 'se1', category: 'analysis', title: 'Комплекс «Энергия и сон»', amount: 5600, date: '2026-09-18', doctor: 'Инвитро' },
      { id: 'se2', category: 'doctor', title: 'Приём терапевта', amount: 3500, date: '2026-09-20', doctor: 'Иванова А.С.' },
      { id: 'se3', category: 'medicine', title: 'Препараты железа + Вит D 5000ME', amount: 3400, date: '2026-09-22' },
      { id: 'se4', category: 'procedure', title: 'ЭКГ с расшифровкой', amount: 2000, date: '2026-09-25', doctor: 'Инвитро' },
      { id: 'se5', category: 'doctor', title: 'Приём сомнологический', amount: 4000, date: '2026-09-28', doctor: 'Козлов Д.А.' },
    ],
  },
];

export const demoBiomarkers: Biomarker[] = monthsData[0].biomarkers;
export const demoHealthScore: HealthScore = monthsData[0].score;
export const demoExpenses: Expense[] = monthsData[0].expenses;

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
    specialty: 'Невролог / Сомнолог',
    totalSpent: 8450,
    visits: 2,
    lastVisit: '2026-10-25',
    avatar: '👨‍⚕️',
  },
];

export const demoHealthTrend: HealthTrend[] = [
  { date: 'Июн', score: 79.4 },
  { date: 'Июл', score: 81.1 },
  { date: 'Авг', score: 80.5 },
  { date: 'Сен', score: 81.9 },
  { date: 'Окт', score: 84.6 },
  { date: 'Ноя', score: 88.2 },
];

export const demoAnalysisResult: AnalysisResult = {
  id: '1',
  fileName: 'Анализ_крови_05.11.2026.pdf',
  date: '2026-11-05',
  biomarkers: demoBiomarkers,
  summary: 'Выявлены отклонения в 3 из 8 показателей: лейкоцитоз и СОЭ указывают на перенесенный воспалительный процесс, холестерин выше нормы. Маркеры сна и детоксикации (Вит D3, ферритин) в стабильной норме.',
  recommendations: [
    'Консультация терапевта по контролю динамики воспалительных маркеров',
    'Развернутый липидный профиль (ЛПВП, ЛПНП, триглицериды)',
    'Поддержание приема профилактической дозы Витамина D3 (2000 МЕ)',
    'Средиземноморская диета для оптимизации холестерина',
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
  medicine: '#10b981',
  procedure: '#f59e0b',
};

export const allDemoExpenses: Expense[] = monthsData.flatMap((m) => m.expenses);

