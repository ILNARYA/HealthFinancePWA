// === TYPES ===

export type BiomarkerCategory =
  | 'metabolism'    // Диета и метаболизм
  | 'sleepRecovery' // Сон и клеточное восстановление (Вит D, ферритин)
  | 'immune'        // Иммунитет и воспаление
  | 'kidney'        // Почки и водно-электролитный баланс
  | 'liver'         // Печень и детоксикация
  | 'blood';        // Кроветворение и кислородный обмен

export interface Biomarker {
  id: string;
  name: string;
  category: BiomarkerCategory;
  value: number;
  unit: string;
  refMin: number;
  refMax: number;
  date: string;
  status: 'in-range' | 'below' | 'above';
  clinicalNote?: string;
}

export interface HealthScore {
  metabolism: number;    // Диета & Метаболизм (Глюкоза, Холестерин, Мочевая к-та)
  sleepRecovery: number; // Сон & Восстановление (Вит D3, Ферритин, Магний)
  immune: number;        // Иммунитет & Воспаление (Лейкоциты, СОЭ, СРБ)
  kidney: number;        // Почки & Электролиты (Креатинин, eGFR, Мочевина)
  liver: number;         // Печень & Детокс (АЛТ, АСТ, Билирубин)
  blood: number;         // Кроветворение & O2 (Гемоглобин, Эритроциты, Тромбоциты)
  overall: number;       // Композитный индекс здоровья (0 - 100)
}

export interface Expense {
  id: string;
  category: 'doctor' | 'analysis' | 'medicine' | 'procedure';
  title: string;
  amount: number;
  date: string;
  doctor?: string;
  specialty?: string;
  memberId?: string;
  memberName?: string;
  receiptImage?: string;
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

export interface MonthData {
  id: string;
  label: string;
  score: HealthScore;
  biomarkers: Biomarker[];
  expenses: Expense[];
  notes: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  lastName?: string;
  personalId?: string;
  role: 'head' | 'spouse' | 'child' | 'parent';
  roleLabel: string;
  birthYear: number;
  gender: 'male' | 'female';
  height?: number; // cm
  weight?: number; // kg
  bmi?: number;
  bloodType: string;
  policyOMS: string;
  policyDMS?: string;
  avatar: string;
  color: string;
  healthScore: number;
  analysesCount: number;
  expensesTotal: number;
  allergies?: string[];
  chronicNotes?: string;
  isVerifiedChild?: boolean;
  inviteStatus?: 'active' | 'pending' | 'declined';
}

export interface UserProfile {
  id: string;
  personalId: string; // e.g. "MED-1001"
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  birthDate: string;
  birthYear: number;
  gender: 'male' | 'female';
  height: number; // cm
  weight: number; // kg
  bmi: number; // weight / (height/100)^2
  bloodType: string;
  policyOMS: string;
  policyDMS?: string;
  avatar: string;
  familyRole: 'head' | 'spouse' | 'parent' | 'child';
  familyName: string;
  googleConnected: boolean;
  twoFactorEnabled?: boolean;
  metricsHistory?: Array<{ date: string; weight: number; height: number; bmi: number; timestamp?: number }>;
}

export interface FamilyInvite {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserSurname: string;
  toPersonalId: string;
  familyName: string;
  role: 'spouse' | 'parent' | 'head';
  roleLabel: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export type TabType = 'dashboard' | 'analyses' | 'finances' | 'settings';
export type PeriodType = '1d' | '1w' | '1m' | '1y' | 'All';
export type CategoryType = Expense['category'];
