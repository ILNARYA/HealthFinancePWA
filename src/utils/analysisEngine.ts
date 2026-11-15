import type { AnalysisResult, Biomarker } from '../types';

const mockBiomarkers: Biomarker[] = [
  { id: 'a1', name: 'Гемоглобин', category: 'blood', value: 145, unit: 'г/л', refMin: 130, refMax: 160, date: '', status: 'in-range', clinicalNote: 'Транспорт кислорода к тканям в оптимуме' },
  { id: 'a2', name: 'Эритроциты', category: 'blood', value: 4.8, unit: '×10¹²/л', refMin: 4.0, refMax: 5.5, date: '', status: 'in-range' },
  { id: 'a3', name: 'Лейкоциты', category: 'immune', value: 11.2, unit: '×10⁹/л', refMin: 4.0, refMax: 9.0, date: '', status: 'above', clinicalNote: 'Маркер перенесенного воспаления' },
  { id: 'a4', name: 'Тромбоциты', category: 'blood', value: 220, unit: '×10⁹/л', refMin: 180, refMax: 320, date: '', status: 'in-range' },
  { id: 'a5', name: 'СОЭ', category: 'immune', value: 18, unit: 'мм/ч', refMin: 2, refMax: 15, date: '', status: 'above' },
  { id: 'a6', name: 'Глюкоза', category: 'metabolism', value: 5.1, unit: 'ммоль/л', refMin: 3.9, refMax: 5.8, date: '', status: 'in-range', clinicalNote: 'Углеводный обмен стабилен' },
  { id: 'a7', name: 'Холестерин общий', category: 'metabolism', value: 6.8, unit: 'ммоль/л', refMin: 3.6, refMax: 5.2, date: '', status: 'above', clinicalNote: 'Липидный баланс требует коррекции рациона' },
  { id: 'a8', name: 'Витамин D3 (25-OH)', category: 'sleepRecovery', value: 38, unit: 'нг/мл', refMin: 30, refMax: 80, date: '', status: 'in-range', clinicalNote: 'Оптимум для регуляции циркадных ритмов и фаз сна' },
  { id: 'a9', name: 'Креатинин', category: 'kidney', value: 78, unit: 'мкмоль/л', refMin: 62, refMax: 106, date: '', status: 'in-range' },
];

export function simulateAnalysis(fileName: string): Promise<AnalysisResult> {
  const dateStr = new Date().toISOString().split('T')[0];
  return new Promise((resolve) => {
    setTimeout(() => {
      const biomarkers = mockBiomarkers.map((b) => ({
        ...b,
        date: dateStr,
        value: +(b.value * (0.96 + Math.random() * 0.08)).toFixed(1),
      })).map((b) => ({
        ...b,
        status: (b.value < b.refMin ? 'below' : b.value > b.refMax ? 'above' : 'in-range') as Biomarker['status'],
      }));

      resolve({
        id: crypto.randomUUID(),
        fileName,
        date: dateStr,
        biomarkers,
        summary: `Анализ бланка "${fileName}" завершён. ИИ извлек ${biomarkers.length} биомаркеров крови. Выявлены отклонения в ${biomarkers.filter((b) => b.status !== 'in-range').length} показателях. Оценены ключевые профили: метаболизм, маркеры сна, воспаление и почечный баланс.`,
        recommendations: [
          'Обратиться к терапевту для оценки динамики воспалительных маркеров',
          'Контроль липидограммы (ЛПНП, ЛПВП) через 1 месяц',
          'Соблюдение режима сна и продолжение приема витамина D3',
        ],
      });
    }, 1800);
  });
}
