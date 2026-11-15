import type { AnalysisResult, Biomarker } from '../types';

const mockBiomarkers: Biomarker[] = [
  { id: 'a1', name: 'Гемоглобин', value: 145, unit: 'г/л', refMin: 130, refMax: 160, date: '', status: 'in-range' },
  { id: 'a2', name: 'Эритроциты', value: 4.8, unit: '×10¹²/л', refMin: 4.0, refMax: 5.5, date: '', status: 'in-range' },
  { id: 'a3', name: 'Лейкоциты', value: 11.2, unit: '×10⁹/л', refMin: 4.0, refMax: 9.0, date: '', status: 'above' },
  { id: 'a4', name: 'Тромбоциты', value: 220, unit: '×10⁹/л', refMin: 180, refMax: 320, date: '', status: 'in-range' },
  { id: 'a5', name: 'СОЭ', value: 18, unit: 'мм/ч', refMin: 2, refMax: 15, date: '', status: 'above' },
  { id: 'a6', name: 'Глюкоза', value: 5.1, unit: 'ммоль/л', refMin: 3.9, refMax: 5.8, date: '', status: 'in-range' },
  { id: 'a7', name: 'Холестерин общий', value: 6.8, unit: 'ммоль/л', refMin: 3.6, refMax: 5.2, date: '', status: 'above' },
  { id: 'a8', name: 'Креатинин', value: 78, unit: 'мкмоль/л', refMin: 62, refMax: 106, date: '', status: 'in-range' },
];

export function simulateAnalysis(fileName: string): Promise<AnalysisResult> {
  const dateStr = new Date().toISOString().split('T')[0];
  return new Promise((resolve) => {
    setTimeout(() => {
      const biomarkers = mockBiomarkers.map((b) => ({
        ...b,
        date: dateStr,
        // Add slight random variation
        value: +(b.value * (0.95 + Math.random() * 0.1)).toFixed(1),
      })).map((b) => ({
        ...b,
        status: (b.value < b.refMin ? 'below' : b.value > b.refMax ? 'above' : 'in-range') as Biomarker['status'],
      }));

      resolve({
        id: crypto.randomUUID(),
        fileName,
        date: dateStr,
        biomarkers,
        summary: `Анализ файла "${fileName}" завершён. Выявлены отклонения в ${biomarkers.filter((b) => b.status !== 'in-range').length} из ${biomarkers.length} показателей.`,
        recommendations: [
          'Обратиться к лечащему врачу для интерпретации результатов',
          'При наличии отклонений — повторный контроль через 2-4 недели',
          'Рекомендуется сбалансированная диета и умеренная физическая активность',
        ],
      });
    }, 2500); // simulate processing time
  });
}
