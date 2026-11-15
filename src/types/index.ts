// === TYPES ===

export interface Biomarker {
  id: string;
  name: string;
  value: number;
  unit: string;
  refMin: number;
  refMax: number;
  date: string;
  status: 'in-range' | 'below' | 'above';
}

export interface HealthScore {
  calorie: number;
  bmi: number;
  bpm: number;
  hydration: number;
  sleep: number;
  steps: number;
  overall: number;
}

export interface Expense {
  id: string;
  category: 'doctor' | 'analysis' | 'medicine' | 'procedure';
  title: string;
  amount: number;
  date: string;
  doctor?: string;
  specialty?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  totalSpent: number;
  visits: number;
  lastVisit: string;
  avatar: string;
}

export interface AnalysisResult {
  id: string;
  fileName: string;
  date: string;
  biomarkers: Biomarker[];
  summary: string;
  recommendations: string[];
}

export interface HealthTrend {
  date: string;
  score: number;
}

export type TabType = 'dashboard' | 'analyses' | 'finances' | 'settings';
export type PeriodType = '1d' | '1w' | '1m' | '1y' | 'All';
export type CategoryType = Expense['category'];
