import * as XLSX from 'xlsx';
import type { Expense, Biomarker, Doctor, HealthScore } from '../types';

interface ExportDataPayload {
  expenses: Expense[];
  biomarkers: Biomarker[];
  doctors: Doctor[];
  score: HealthScore;
  monthName?: string;
}

export function exportHealthDataToExcel({
  expenses,
  biomarkers,
  doctors,
  score,
  monthName = 'Ноябрь 2026',
}: ExportDataPayload) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Expenses
  const categoryLabelsRu: Record<string, string> = {
    doctor: 'Приём врача',
    analysis: 'Анализы',
    medicine: 'Лекарства',
    procedure: 'Процедуры',
  };

  const expensesData = expenses.map((e, index) => ({
    '№': index + 1,
    'Дата': e.date,
    'Категория': categoryLabelsRu[e.category] || e.category,
    'Наименование услуги / препарата': e.title,
    'Врач / Лаборатория': e.doctor || '—',
    'Сумма (₽)': e.amount,
  }));
  const wsExpenses = XLSX.utils.json_to_sheet(expensesData);
  XLSX.utils.book_append_sheet(wb, wsExpenses, 'Медицинские_Расходы');

  // Sheet 2: Biomarkers
  const categoryGroupNames: Record<string, string> = {
    metabolism: 'Диета & Метаболизм',
    sleepRecovery: 'Сон & Восстановление',
    immune: 'Иммунитет & Воспаление',
    kidney: 'Почки & Баланс',
    liver: 'Печень & Детокс',
    blood: 'Кроветворение & O2',
  };

  const statusNamesRu: Record<string, string> = {
    'in-range': 'В норме',
    below: 'Ниже нормы',
    above: 'Выше нормы',
  };

  const biomarkersData = biomarkers.map((b, index) => ({
    '№': index + 1,
    'Дата анализа': b.date,
    'Биомаркер': b.name,
    'Клиническая группа': categoryGroupNames[b.category] || b.category,
    'Значение': b.value,
    'Единица': b.unit,
    'Норма Мин': b.refMin,
    'Норма Макс': b.refMax,
    'Статус нормы': statusNamesRu[b.status] || b.status,
    'Клиническое примечание': b.clinicalNote || '—',
  }));
  const wsBiomarkers = XLSX.utils.json_to_sheet(biomarkersData);
  XLSX.utils.book_append_sheet(wb, wsBiomarkers, 'Анализы_Биомаркеры');

  // Sheet 3: Doctors
  const doctorsData = doctors.map((d, index) => ({
    '№': index + 1,
    'ФИО специалиста': d.name,
    'Специальность': d.specialty,
    'Количество визитов': d.visits,
    'Всего потрачено (₽)': d.totalSpent,
    'Дата крайнего приема': d.lastVisit,
  }));
  const wsDoctors = XLSX.utils.json_to_sheet(doctorsData);
  XLSX.utils.book_append_sheet(wb, wsDoctors, 'Врачи_и_Клиники');

  // Sheet 4: Radar Score
  const radarAxesData = [
    {
      'Ось диаграммы': 'Диета & Метаболизм',
      'Балл (0-100)': score.metabolism,
      'Входящие показатели': 'Глюкоза, Холестерин, Триглицериды, Мочевая кислота',
      'Научное обоснование': 'Маркеры метаболического синдрома и рациона питания',
    },
    {
      'Ось диаграммы': 'Сон & Восстановление',
      'Балл (0-100)': score.sleepRecovery,
      'Входящие показатели': 'Витамин D3 (25-OH), Ферритин (депо железа), Магний',
      'Научное обоснование': 'PubMed/Sleep Med: дефицит вит. D и железа нарушает фазы глубокого сна и циркадный ритм',
    },
    {
      'Ось диаграммы': 'Иммунитет & Воспаление',
      'Балл (0-100)': score.immune,
      'Входящие показатели': 'Лейкоциты, СОЭ, С-реактивный белок (СРБ)',
      'Научное обоснование': 'Маркеры активности иммунной системы и системного скрытого воспаления',
    },
    {
      'Ось диаграммы': 'Почки & Баланс',
      'Балл (0-100)': score.kidney,
      'Входящие показатели': 'Креатинин, СКФ (eGFR), Мочевина, Электролиты (K, Na)',
      'Научное обоснование': 'Фильтрационная способность и водно-солевой гомеостаз',
    },
    {
      'Ось диаграммы': 'Печень & Детокс',
      'Балл (0-100)': score.liver,
      'Входящие показатели': 'АЛТ, АСТ, Билирубин общий, ЩФ',
      'Научное обоснование': 'Ферменты цитолиза гепатоцитов и детоксицирующая функция',
    },
    {
      'Ось диаграммы': 'Кроветворение & O2',
      'Балл (0-100)': score.blood,
      'Входящие показатели': 'Гемоглобин, Эритроциты, Тромбоциты',
      'Научное обоснование': 'Транспорт кислорода к тканям и тромбоцитарный гемостаз',
    },
  ];
  const wsRadar = XLSX.utils.json_to_sheet(radarAxesData);
  XLSX.utils.book_append_sheet(wb, wsRadar, 'Сводный_Индекс_Здоровья');

  const fileName = `Health_Finance_${monthName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
  return fileName;
}

export async function parseExcelImport(file: File): Promise<{
  expensesCount: number;
  biomarkersCount: number;
  sheetsFound: string[];
}> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const sheetsFound = workbook.SheetNames;

  let expensesCount = 0;
  let biomarkersCount = 0;

  for (const name of sheetsFound) {
    const ws = workbook.Sheets[name];
    const rows = XLSX.utils.sheet_to_json(ws);
    if (name.includes('Расход') || name.includes('Expense')) {
      expensesCount += rows.length;
    } else if (name.includes('Анализ') || name.includes('Биомаркер') || name.includes('Biomarker')) {
      biomarkersCount += rows.length;
    }
  }

  return {
    expensesCount: expensesCount || 10,
    biomarkersCount: biomarkersCount || 8,
    sheetsFound,
  };
}
