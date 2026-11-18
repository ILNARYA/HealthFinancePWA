import React, { createContext, useContext, useState, useEffect } from 'react';
import type { FamilyMember, UserProfile, FamilyInvite } from '../types';
import { allDemoExpenses } from '../data/demo';
import { DEFAULT_APPS_SCRIPT_URL, getAppsScriptUrl, saveAppsScriptUrl } from '../config/api';

export interface GoogleAccountInfo {
  connected: boolean;
  email: string;
  name: string;
  sheetName: string;
  sheetId: string;
  lastSynced: string;
}

interface FamilyContextType {
  // Authentication & Session
  isAuthenticated: boolean;
  login: (credentials?: { email?: string; personalId?: string; password?: string; userData?: any }) => boolean;
  loginWithGoogle: (email?: string, name?: string) => void;
  loginAsMember: (personalIdOrId: string) => void;
  register: (registrationData: Partial<UserProfile>) => void;
  logout: () => void;
  resetToNewUser: () => void;
  loadDemoData: () => void;
  // Current Adult User Profile (Individual cabinet)
  userProfile: UserProfile;
  updateUserProfile: (data: Partial<UserProfile>) => void;
  // Family & Household Hub
  familyName: string;
  setFamilyName: (name: string) => void;
  members: FamilyMember[];
  activeMember: FamilyMember;
  activeMemberId: string;
  setActiveMemberId: (id: string) => void;
  addMember: (member: Omit<FamilyMember, 'id'>) => void;
  removeMember: (id: string) => void;
  updateMemberRole: (memberId: string, newRole: FamilyMember['role']) => void;
  addExpenseToMember: (memberId: string, amount: number) => void;
  // Invites System
  invites: FamilyInvite[];
  sendFamilyInvite: (targetPersonalId: string, role: FamilyInvite['role']) => { success: boolean; message: string };
  acceptFamilyInvite: (inviteId: string) => void;
  declineFamilyInvite: (inviteId: string) => void;
  // Fast-track Child Verification (< 20 years + same surname)
  addChildMember: (childData: {
    firstName: string;
    lastName: string;
    birthYear: number;
    gender: 'male' | 'female';
    height?: number;
    weight?: number;
    bloodType: string;
    policyOMS: string;
  }) => { success: boolean; message: string; autoApproved: boolean };
  // View scope (Личный профиль vs Семейный хаб)
  viewScope: 'personal' | 'family';
  setViewScope: (scope: 'personal' | 'family') => void;
  // Security
  isPinSet: boolean;
  pinCode: string;
  isLocked: boolean;
  privacyMode: boolean;
  twoFactorEnabled: boolean;
  totpSecret: string;
  setPinCode: (pin: string) => void;
  setIsPinSet: (enabled: boolean) => void;
  setPrivacyMode: (enabled: boolean) => void;
  setTwoFactorEnabled: (enabled: boolean) => void;
  lockApp: () => void;
  unlockApp: (pin: string) => boolean;
  unlockDirectly: () => void;
  showPinSetupModal: boolean;
  openPinSetup: () => void;
  closePinSetup: () => void;
  // Demo mode vs Clean User state
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  purgeAllDataAndReset: () => void;
  // Google Account & Sheets Sync
  googleAccount: GoogleAccountInfo;
  appsScriptUrl: string;
  setAppsScriptUrl: (url: string) => void;
  googleSheetUrl: string;
  setGoogleSheetUrl: (url: string) => void;
  lastSyncTime: number | null;
  connectGoogleAccount: () => void;
  disconnectGoogleAccount: () => void;
  syncWithGoogleSheets: () => Promise<boolean>;
}

export const defaultUserProfile: UserProfile = {
  id: 'user_head',
  personalId: 'MED-1001',
  firstName: 'Алексей',
  lastName: 'Иванов',
  middleName: '',
  email: 'alex.ivanov@example.com',
  birthDate: '1995-05-15',
  birthYear: 1995,
  gender: 'male',
  height: 180,
  weight: 76,
  bmi: 23.5,
  bloodType: 'A(II) Rh+',
  policyOMS: '1694 0000 0000 0000',
  policyDMS: 'Премиум ДМС',
  avatar: 'АИ',
  familyRole: 'head',
  familyName: 'Семья Ивановых',
  googleConnected: false,
};

export const emptyUserProfile: UserProfile = {
  id: 'user_new',
  personalId: 'MED-1000',
  firstName: '',
  lastName: '',
  middleName: '',
  email: '',
  birthDate: '1995-01-01',
  birthYear: 1995,
  gender: 'male',
  height: 175,
  weight: 70,
  bmi: 22.9,
  bloodType: 'A(II) Rh+',
  policyOMS: '',
  policyDMS: '',
  avatar: '👤',
  familyRole: 'head',
  familyName: 'Моя семья',
  googleConnected: false,
};

export const knownAdultRegistry: UserProfile[] = [
  {
    id: 'user_elena',
    personalId: 'MED-2002',
    firstName: 'Елена',
    lastName: 'Иванова',
    email: 'elena.ivanova@example.com',
    birthDate: '1997-07-20',
    birthYear: 1997,
    gender: 'female',
    height: 168,
    weight: 56,
    bmi: 19.8,
    bloodType: 'B(III) Rh+',
    policyOMS: '1694 1111 2222 3333',
    policyDMS: 'Ингосстрах Премиум',
    avatar: 'ЕИ',
    familyRole: 'spouse',
    familyName: 'Семья Ивановых',
    googleConnected: true,
  },
  {
    id: 'user_dmitriy',
    personalId: 'MED-3003',
    firstName: 'Дмитрий',
    lastName: 'Смирнов',
    middleName: 'Алексеевич',
    email: 'dmitriy.smirnov@example.com',
    birthDate: '1992-03-10',
    birthYear: 1992,
    gender: 'male',
    height: 184,
    weight: 82,
    bmi: 24.2,
    bloodType: 'A(II) Rh+',
    policyOMS: '1694 4444 5555 6666',
    avatar: 'ДС',
    familyRole: 'parent',
    familyName: 'Семья Смирновых (Родственники)',
    googleConnected: true,
  },
];

const defaultMembers: FamilyMember[] = [
  {
    id: 'member_head',
    name: 'Алексей',
    lastName: 'Иванов',
    personalId: 'MED-1001',
    role: 'head',
    roleLabel: 'Глава семьи',
    birthYear: 1995,
    gender: 'male',
    height: 180,
    weight: 76,
    bmi: 23.5,
    bloodType: 'A(II) Rh+',
    policyOMS: '1694 0000 0000 0000',
    policyDMS: 'Премиум ДМС',
    avatar: 'АИ',
    color: '#7c3aed',
    healthScore: 88.2,
    analysesCount: 8,
    expensesTotal: 33050,
    allergies: ['Пенициллин'],
    chronicNotes: 'Мониторинг холестерина и СКФ (почки)',
    inviteStatus: 'active',
  },
  {
    id: 'member_spouse',
    name: 'Елена',
    lastName: 'Иванова',
    personalId: 'MED-2002',
    role: 'spouse',
    roleLabel: 'Супруга',
    birthYear: 1997,
    gender: 'female',
    height: 168,
    weight: 56,
    bmi: 19.8,
    bloodType: 'B(III) Rh+',
    policyOMS: '1694 1111 2222 3333',
    policyDMS: 'Ингосстрах Премиум',
    avatar: 'ЕИ',
    color: '#ec4899',
    healthScore: 92.4,
    analysesCount: 5,
    expensesTotal: 18400,
    allergies: ['Цветение березы'],
    chronicNotes: 'Ферритин, контроль железа и ТТГ',
    inviteStatus: 'active',
  },
  {
    id: 'member_child',
    name: 'Михаил',
    lastName: 'Иванов',
    personalId: 'MED-CH-01',
    role: 'child',
    roleLabel: 'Сын',
    birthYear: 2022,
    gender: 'male',
    height: 104,
    weight: 16,
    bmi: 14.8,
    bloodType: 'A(II) Rh+',
    policyOMS: '1694 7777 8888 9999',
    avatar: 'МИ',
    color: '#3b82f6',
    healthScore: 95.0,
    analysesCount: 3,
    expensesTotal: 12200,
    allergies: ['Арахис'],
    chronicNotes: 'Календарь детских прививок и педиатр',
    isVerifiedChild: true,
    inviteStatus: 'active',
  },
];

const defaultInvites: FamilyInvite[] = [
  {
    id: 'inv_dmitriy',
    fromUserId: 'user_dmitriy',
    fromUserName: 'Дмитрий',
    fromUserSurname: 'Смирнов',
    toPersonalId: 'MED-1001',
    familyName: 'Семья Смирновых (Родственники)',
    role: 'parent',
    roleLabel: 'Родственник',
    status: 'pending',
    createdAt: 'Сегодня, 10:15',
  },
];

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export const FamilyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Demo Mode tracker: MUST NEVER be true if the user is registered with a real email
  const [isDemoMode, setIsDemoModeState] = useState<boolean>(() => {
    try {
      const savedProfile = JSON.parse(localStorage.getItem('app-user-profile') || '{}');
      if (savedProfile.email && savedProfile.email !== 'alex.ivanov@example.com') {
        localStorage.setItem('app-is-demo', 'false');
        return false;
      }
    } catch {}
    return localStorage.getItem('app-is-demo') === 'true';
  });
  const setIsDemoMode = (val: boolean) => {
    setIsDemoModeState(val);
    localStorage.setItem('app-is-demo', String(val));
  };

  // View Scope: 'personal' (Только мои данные) vs 'family' (Сводный семейный бюджет и анализы)
  const [viewScope, setViewScopeState] = useState<'personal' | 'family'>(() => {
    return (localStorage.getItem('app-view-scope') as 'personal' | 'family') || 'family';
  });
  const setViewScope = (scope: 'personal' | 'family') => {
    setViewScopeState(scope);
    localStorage.setItem('app-view-scope', scope);
  };

  const [showPinSetupModal, setShowPinSetupModal] = useState<boolean>(false);
  const openPinSetup = () => setShowPinSetupModal(true);
  const closePinSetup = () => setShowPinSetupModal(false);

  const [googleSheetUrl, setGoogleSheetUrlState] = useState<string>(() => {
    return localStorage.getItem('app-google-sheet-url') || '';
  });
  const setGoogleSheetUrl = (url: string) => {
    setGoogleSheetUrlState(url);
    localStorage.setItem('app-google-sheet-url', url);
  };

  const [lastSyncTime, setLastSyncTime] = useState<number | null>(() => {
    const saved = localStorage.getItem('app-last-sync-time');
    return saved ? Number(saved) : null;
  });

  // Authentication & Session
  const [isAuthenticated, setIsAuthenticatedState] = useState<boolean>(() => {
    return localStorage.getItem('app-is-authenticated') === 'true';
  });

  // Adult Personal Profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('app-user-profile');
    if (saved) return JSON.parse(saved);
    const isDemo = localStorage.getItem('app-is-demo') === 'true';
    return isDemo ? defaultUserProfile : emptyUserProfile;
  });

  // Family Group Name
  const [familyName, setFamilyNameState] = useState<string>(() => {
    const saved = localStorage.getItem('app-family-name');
    if (saved) return saved;
    const isDemo = localStorage.getItem('app-is-demo') === 'true';
    return isDemo ? 'Семья Ивановых' : 'Моя семья';
  });

  const [members, setMembers] = useState<FamilyMember[]>(() => {
    const saved = localStorage.getItem('app-family-members');
    if (saved) return JSON.parse(saved);
    const isDemo = localStorage.getItem('app-is-demo') === 'true';
    return isDemo ? defaultMembers : [];
  });

  const [invites, setInvites] = useState<FamilyInvite[]>(() => {
    const saved = localStorage.getItem('app-family-invites');
    if (saved) return JSON.parse(saved);
    const isDemo = localStorage.getItem('app-is-demo') === 'true';
    return isDemo ? defaultInvites : [];
  });

  const [activeMemberId, setActiveMemberId] = useState<string>(() => {
    return localStorage.getItem('app-active-member-id') || '';
  });

  // Security state
  const [pinCode, setPinCodeState] = useState<string>(() => {
    return localStorage.getItem('app-pin-code') || '';
  });

  const [isPinSet, setIsPinSetState] = useState<boolean>(() => {
    const code = localStorage.getItem('app-pin-code');
    return localStorage.getItem('app-pin-enabled') === 'true' && !!code;
  });

  const [privacyMode, setPrivacyModeState] = useState<boolean>(() => {
    return localStorage.getItem('app-privacy-mode') === 'true';
  });

  const [twoFactorEnabled, setTwoFactorEnabledState] = useState<boolean>(() => {
    return localStorage.getItem('app-2fa-enabled') === 'true';
  });

  const totpSecret = 'JBSWY3DPEHPK3PXP'; // Standard Base32 TOTP demo secret key

  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Google Account state
  const [googleAccount, setGoogleAccount] = useState<GoogleAccountInfo>(() => {
    const saved = localStorage.getItem('app-google-account');
    return saved
      ? JSON.parse(saved)
      : {
          connected: false,
          email: '',
          name: '',
          sheetName: 'Семейная база (Google Sheets)',
          sheetId: '',
          lastSynced: 'Не подключено',
        };
  });

  const [appsScriptUrl, setAppsScriptUrlState] = useState<string>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const hashQuery = window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '';
      const hashParams = new URLSearchParams(hashQuery);
      const incomingUrl =
        urlParams.get('syncUrl') ||
        urlParams.get('scriptUrl') ||
        hashParams.get('syncUrl') ||
        hashParams.get('scriptUrl');
      if (incomingUrl) {
        const decoded = decodeURIComponent(incomingUrl).trim();
        if (decoded.startsWith('http')) {
          saveAppsScriptUrl(decoded);
          return decoded;
        }
      }
    } catch {
      // fallback
    }
    return getAppsScriptUrl();
  });

  const setAppsScriptUrl = (url: string) => {
    const clean = url.trim();
    setAppsScriptUrlState(clean || DEFAULT_APPS_SCRIPT_URL);
    saveAppsScriptUrl(clean || DEFAULT_APPS_SCRIPT_URL);
  };

  useEffect(() => {
    localStorage.setItem('app-user-profile', JSON.stringify(userProfile));
    // If the active profile has a real email (not Ivanov demo), guarantee demo mode is false and purge demo expenses
    if (userProfile.email && userProfile.email !== 'alex.ivanov@example.com') {
      setIsDemoModeState(false);
      localStorage.setItem('app-is-demo', 'false');
      try {
        const savedExpenses = localStorage.getItem('app-expenses-list');
        if (savedExpenses) {
          const parsed = JSON.parse(savedExpenses);
          if (Array.isArray(parsed)) {
            const demoIds = new Set(['e1','e2','e3','e4','e5','e6','e7','oe1','oe2','oe3','oe4','oe5','oe6','oe7','se1','se2','se3','se4','se5']);
            const clean = parsed.filter((e: any) => !demoIds.has(e.id));
            if (clean.length !== parsed.length) {
              localStorage.setItem('app-expenses-list', JSON.stringify(clean));
            }
          }
        }
      } catch {}

      // If members array still contains Ivanov demo members, replace with the real user's profile member
      if (members.some((m) => m.id === 'member_head' || m.name === 'Алексей' || m.id === 'member_spouse')) {
        const userMember: FamilyMember = {
          id: userProfile.id || 'head_user',
          name: userProfile.firstName || 'Пользователь',
          lastName: userProfile.lastName || '',
          personalId: userProfile.personalId || 'MED-NEW',
          role: 'head',
          roleLabel: 'Глава семьи',
          birthYear: userProfile.birthYear,
          gender: userProfile.gender,
          height: userProfile.height,
          weight: userProfile.weight,
          bmi: userProfile.bmi,
          bloodType: userProfile.bloodType,
          policyOMS: userProfile.policyOMS,
          avatar: userProfile.avatar || '👤',
          color: '#7c3aed',
          healthScore: 0,
          analysesCount: 0,
          expensesTotal: 0,
          inviteStatus: 'active',
        };
        setMembers([userMember]);
        setActiveMemberId(userMember.id);
        localStorage.setItem('app-family-members', JSON.stringify([userMember]));
        localStorage.setItem('app-active-member-id', userMember.id);
      }
    }
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('app-family-name', familyName);
  }, [familyName]);

  useEffect(() => {
    localStorage.setItem('app-family-members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('app-family-invites', JSON.stringify(invites));
  }, [invites]);

  useEffect(() => {
    localStorage.setItem('app-active-member-id', activeMemberId);
  }, [activeMemberId]);

  useEffect(() => {
    localStorage.setItem('app-google-account', JSON.stringify(googleAccount));
  }, [googleAccount]);

  const setFamilyName = (name: string) => {
    setFamilyNameState(name);
    setUserProfile((prev) => ({ ...prev, familyName: name }));
  };

  const updateUserProfile = (data: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const updated = { ...prev, ...data };
      // Recalculate BMI and record weight history if height or weight changed
      if (data.height || data.weight) {
        const hMeter = updated.height / 100;
        updated.bmi = Math.round((updated.weight / (hMeter * hMeter)) * 10) / 10;
        const currentHist = prev.metricsHistory || [];
        const todayStr = new Date().toLocaleDateString('ru-RU');
        const newRecord = {
          date: todayStr,
          weight: updated.weight,
          height: updated.height,
          bmi: updated.bmi,
          timestamp: Date.now(),
        };
        updated.metricsHistory = [newRecord, ...currentHist.filter(h => h.date !== todayStr)].slice(0, 20);
      }
      return updated;
    });

    // Also synchronize active member if it is head
    setMembers((prev) =>
      prev.map((m) =>
        m.id === 'member_head' || m.role === 'head'
          ? {
              ...m,
              name: data.firstName || m.name,
              lastName: data.lastName || m.lastName,
              birthYear: data.birthYear || m.birthYear,
              bloodType: data.bloodType || m.bloodType,
              policyOMS: data.policyOMS || m.policyOMS,
              height: data.height || m.height,
              weight: data.weight || m.weight,
              bmi: data.height && data.weight ? Math.round((data.weight / ((data.height / 100) ** 2)) * 10) / 10 : m.bmi,
            }
          : m
      )
    );
  };

  const sendFamilyInvite = (targetPersonalId: string, role: FamilyInvite['role']) => {
    const cleanId = targetPersonalId.trim().toUpperCase();
    if (!cleanId) {
      return { success: false, message: 'Введите персональный ID личного кабинета.' };
    }
    if (cleanId === userProfile.personalId) {
      return { success: false, message: 'Вы не можете отправить приглашение самому себе.' };
    }

    // Check if member already in family
    const existing = members.find((m) => m.personalId?.toUpperCase() === cleanId);
    if (existing) {
      return { success: false, message: `Пользователь с ID ${cleanId} уже состоит в вашей семье.` };
    }

    // Search registry
    const foundUser = knownAdultRegistry.find((u) => u.personalId.toUpperCase() === cleanId);
    const targetName = foundUser ? `${foundUser.firstName} ${foundUser.lastName}` : `Пользователь ${cleanId}`;

    const roleLabels: Record<FamilyInvite['role'], string> = {
      spouse: 'Супруг(а)',
      parent: 'Родственник / Родитель',
      head: 'Со-руководитель семьи',
    };

    const newInvite: FamilyInvite = {
      id: crypto.randomUUID(),
      fromUserId: userProfile.id,
      fromUserName: userProfile.firstName,
      fromUserSurname: userProfile.lastName,
      toPersonalId: cleanId,
      familyName,
      role,
      roleLabel: roleLabels[role],
      status: 'pending',
      createdAt: 'Только что',
    };

    setInvites((prev) => [newInvite, ...prev]);

    // If it's a known demo user (like Alina or Rustam), automatically simulate member addition with invite pending/active
    if (foundUser) {
      const newMember: FamilyMember = {
        id: foundUser.id,
        name: foundUser.firstName,
        lastName: foundUser.lastName,
        personalId: foundUser.personalId,
        role: role as FamilyMember['role'],
        roleLabel: roleLabels[role],
        birthYear: foundUser.birthYear,
        gender: foundUser.gender,
        height: foundUser.height,
        weight: foundUser.weight,
        bmi: foundUser.bmi,
        bloodType: foundUser.bloodType,
        policyOMS: foundUser.policyOMS,
        avatar: foundUser.avatar,
        color: role === 'spouse' ? '#ec4899' : '#10b981',
        healthScore: 91.0,
        analysesCount: 4,
        expensesTotal: 14500,
        inviteStatus: 'active',
      };
      setMembers((prev) => [...prev.filter((m) => m.id !== foundUser.id), newMember]);
    }

    return {
      success: true,
      message: `Приглашение для ${targetName} (${cleanId}) успешно отправлено! Роль: «${roleLabels[role]}».`,
    };
  };

  const acceptFamilyInvite = (inviteId: string) => {
    setInvites((prev) =>
      prev.map((inv) => (inv.id === inviteId ? { ...inv, status: 'accepted' } : inv))
    );
  };

  const declineFamilyInvite = (inviteId: string) => {
    setInvites((prev) =>
      prev.map((inv) => (inv.id === inviteId ? { ...inv, status: 'declined' } : inv))
    );
  };

  const addChildMember = (childData: {
    firstName: string;
    lastName: string;
    birthYear: number;
    gender: 'male' | 'female';
    height?: number;
    weight?: number;
    bloodType: string;
    policyOMS: string;
  }) => {
    const isSameSurname = childData.lastName.trim().toLowerCase() === userProfile.lastName.trim().toLowerCase();
    const age = 2026 - childData.birthYear;
    const isUnder20 = age < 20;

    if (!isSameSurname) {
      return {
        success: false,
        message: `Фамилия «${childData.lastName}» не совпадает с фамилией главы семьи («${userProfile.lastName}»). Согласно регламенту, автодобавление разрешено только детям с единой фамилией. Для других родственников используйте инвайт по ID.`,
        autoApproved: false,
      };
    }

    if (!isUnder20) {
      return {
        success: false,
        message: `Возраст кандидата ${age} лет (≥ 20 лет). Взрослые дееспособные члены семьи регистрируют собственный личный кабинет через Google и добавляются по персональному ID с подтверждением.`,
        autoApproved: false,
      };
    }

    const newChild: FamilyMember = {
      id: crypto.randomUUID(),
      name: childData.firstName.trim(),
      lastName: childData.lastName.trim(),
      personalId: `MED-CH-${Math.floor(1000 + Math.random() * 9000)}`,
      role: 'child',
      roleLabel: childData.gender === 'male' ? 'Сын' : 'Дочь',
      birthYear: childData.birthYear,
      gender: childData.gender,
      height: childData.height || 110,
      weight: childData.weight || 20,
      bmi: childData.height && childData.weight
        ? Math.round((childData.weight / ((childData.height / 100) ** 2)) * 10) / 10
        : 15.2,
      bloodType: childData.bloodType || 'A(II) Rh+',
      policyOMS: childData.policyOMS || '1694 0000 0000 0000',
      avatar: childData.firstName.slice(0, 2).toUpperCase(),
      color: childData.gender === 'male' ? '#3b82f6' : '#f43f5e',
      healthScore: 94.0,
      analysesCount: 2,
      expensesTotal: 8400,
      isVerifiedChild: true,
      inviteStatus: 'active',
    };

    setMembers((prev) => [...prev, newChild]);

    return {
      success: true,
      message: `Ребёнок ${childData.firstName} ${childData.lastName} (${age} лет) успешно добавлен в семейный кабинет без подтверждения! Проверка родства пройдена (общая фамилия «${childData.lastName}», возраст < 20 лет).`,
      autoApproved: true,
    };
  };

  const updateMemberRole = (memberId: string, newRole: FamilyMember['role']) => {
    const roleLabels: Record<FamilyMember['role'], string> = {
      head: 'Глава семьи',
      spouse: 'Супруг(а)',
      child: 'Ребёнок',
      parent: 'Родственник / Родитель',
    };

    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? { ...m, role: newRole, roleLabel: roleLabels[newRole] }
          : m
      )
    );
  };

  const setIsPinSet = (enabled: boolean) => {
    setIsPinSetState(enabled);
    localStorage.setItem('app-pin-enabled', String(enabled));
  };

  const setPinCode = (pin: string) => {
    setPinCodeState(pin);
    localStorage.setItem('app-pin-code', pin);
  };

  const setPrivacyMode = (enabled: boolean) => {
    setPrivacyModeState(enabled);
    localStorage.setItem('app-privacy-mode', String(enabled));
  };

  const setTwoFactorEnabled = (enabled: boolean) => {
    setTwoFactorEnabledState(enabled);
    localStorage.setItem('app-2fa-enabled', String(enabled));
    if (userProfile && userProfile.email) {
      localStorage.setItem(`app-2fa-${userProfile.email.toLowerCase().trim()}`, String(enabled));
    }
    setUserProfile((prev) => ({ ...prev, twoFactorEnabled: enabled }));
    try {
      const db = JSON.parse(localStorage.getItem('app-users-registry-db') || '[]');
      const updated = db.map((u: any) => {
        if (
          (userProfile.email && u.email?.toLowerCase() === userProfile.email.toLowerCase()) ||
          (userProfile.personalId && u.personalId === userProfile.personalId)
        ) {
          return { ...u, twoFactorEnabled: enabled };
        }
        return u;
      });
      localStorage.setItem('app-users-registry-db', JSON.stringify(updated));
    } catch {}
  };

  const lockApp = () => {
    if (!pinCode) {
      setShowPinSetupModal(true);
      return;
    }
    setIsLocked(true);
  };

  const unlockApp = (pin: string) => {
    if (pin === pinCode) {
      setIsLocked(false);
      return true;
    }
    return false;
  };

  const unlockDirectly = () => {
    setIsLocked(false);
  };

  const addMember = (member: Omit<FamilyMember, 'id'>) => {
    const newMember: FamilyMember = {
      ...member,
      id: crypto.randomUUID(),
    };
    setMembers((prev) => [...prev, newMember]);
  };

  const removeMember = (id: string) => {
    if (members.length <= 1) return;
    setMembers((prev) => prev.filter((m) => m.id !== id));
    if (activeMemberId === id) {
      setActiveMemberId(members[0].id);
    }
  };

  const addExpenseToMember = (memberId: string, amount: number) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? { ...m, expensesTotal: m.expensesTotal + amount }
          : m
      )
    );
  };

  const connectGoogleAccount = () => {
    const extractedId = googleSheetUrl.includes('/d/')
      ? googleSheetUrl.split('/d/')[1].split('/')[0]
      : googleSheetUrl;
    setGoogleAccount({
      connected: true,
      email: userProfile.email || 'user@gmail.com',
      name: `${userProfile.firstName} ${userProfile.lastName}`.trim() || 'Пользователь',
      sheetName: userProfile.lastName ? `Здоровье — ${userProfile.lastName}` : 'Семейная база (Google Sheets)',
      sheetId: extractedId,
      lastSynced: 'Только что',
    });
  };

  const disconnectGoogleAccount = () => {
    setGoogleAccount({
      connected: false,
      email: '',
      name: '',
      sheetName: '',
      sheetId: '',
      lastSynced: '',
    });
  };

  const syncWithGoogleSheets = async (): Promise<boolean> => {
    const now = Date.now();
    setLastSyncTime(now);
    localStorage.setItem('app-last-sync-time', String(now));

    if (!appsScriptUrl) {
      await new Promise((r) => setTimeout(r, 600));
      setGoogleAccount((prev) => ({
        ...prev,
        lastSynced: 'Только что (локально)',
      }));
      return true;
    }

    try {
      const res = await fetch(`${appsScriptUrl}?table=expenses`);
      const json = await res.json();
      if (json && json.data && Array.isArray(json.data)) {
        const synced = json.data.map((r: any) => ({
          id: String(r['ID_Траты'] || crypto.randomUUID()),
          date: String(r['Дата'] || new Date().toISOString().split('T')[0]),
          category: r['Категория_расхода'] || 'doctor',
          title: String(r['Название_услуги_или_лекарства'] || 'Медицинская услуга'),
          amount: Number(r['Сумма_руб'] || 0),
          doctor: r['Клиника_или_Врач'] ? String(r['Клиника_или_Врач']) : undefined,
          specialty: r['Специальность'] ? String(r['Специальность']) : undefined,
        }));
        if (synced.length > 0) {
          localStorage.setItem('app-expenses-list', JSON.stringify(synced));
        }
      }

      setGoogleAccount((prev) => ({
        ...prev,
        lastSynced: 'Только что (Google Sheets API)',
      }));
      return true;
    } catch (err) {
      console.error('Apps Script Sync failed:', err);
      setGoogleAccount((prev) => ({
        ...prev,
        lastSynced: 'Ошибка связи с Apps Script',
      }));
      return false;
    }
  };

  const login = (credentials?: { email?: string; personalId?: string; password?: string; userData?: any }): boolean => {
    // 1. If explicit verified user profile is passed (from AuthPage)
    if (credentials?.userData) {
      const u = credentials.userData;
      const profile: UserProfile = {
        id: u.id || `user_${Date.now()}`,
        personalId: u.personalId || `MED-${Math.floor(1000 + Math.random() * 9000)}`,
        firstName: u.firstName || u.name?.split(' ')[0] || 'Пользователь',
        lastName: u.lastName || u.name?.split(' ').slice(1).join(' ') || '',
        middleName: u.middleName || '',
        email: u.email || credentials.email || 'user@family.local',
        birthDate: u.birthDate || '1995-01-01',
        birthYear: u.birthYear || 1995,
        gender: u.gender || 'male',
        height: u.height || 178,
        weight: u.weight || 75,
        bmi: u.bmi || 23.7,
        bloodType: u.bloodType || 'A(II) Rh+',
        policyOMS: u.policyOMS || '1694 0000 0000 0000',
        policyDMS: u.policyDMS || '',
        avatar: `${(u.firstName || u.name || 'П').slice(0, 1)}${(u.lastName || '').slice(0, 1)}`.toUpperCase() || 'ЯИ',
        familyRole: u.familyRole || 'head',
        familyName: u.familyName || 'Моя семья',
        googleConnected: u.registeredMethod === 'google',
      };

      const member: FamilyMember = {
        id: profile.id,
        name: profile.firstName,
        lastName: profile.lastName,
        personalId: profile.personalId,
        role: 'head',
        roleLabel: 'Глава семьи',
        birthYear: profile.birthYear,
        gender: profile.gender,
        height: profile.height,
        weight: profile.weight,
        bmi: profile.bmi,
        bloodType: profile.bloodType,
        policyOMS: profile.policyOMS,
        avatar: profile.avatar,
        color: '#7c3aed',
        healthScore: 0,
        analysesCount: 0,
        expensesTotal: 0,
        inviteStatus: 'active',
      };

      setUserProfile(profile);
      setMembers([member]);
      setActiveMemberId(member.id);
      setFamilyNameState(profile.familyName);
      setIsAuthenticatedState(true);
      setIsDemoModeState(false);
      localStorage.setItem('app-is-demo', 'false');
      localStorage.setItem('app-is-authenticated', 'true');
      localStorage.setItem('app-user-profile', JSON.stringify(profile));
      localStorage.setItem('app-family-members', JSON.stringify([member]));
      localStorage.setItem('app-family-invites', JSON.stringify([]));
      localStorage.setItem('app-family-name', profile.familyName);
      localStorage.setItem('app-active-member-id', member.id);
      localStorage.setItem('app-expenses-list', JSON.stringify([]));
      localStorage.removeItem('app-last-analysis');
      const user2fa = Boolean(profile.twoFactorEnabled) || localStorage.getItem(`app-2fa-${profile.email.toLowerCase()}`) === 'true';
      setTwoFactorEnabledState(user2fa);
      localStorage.setItem('app-2fa-enabled', String(user2fa));
      return true;
    }

    if (!credentials?.personalId && !credentials?.email) {
      return false;
    }

    const clean = (credentials.personalId || credentials.email || '').trim().toLowerCase();

    // 2. Check knownAdultRegistry (Aleksey Ivanov, Alina, etc.)
    const foundAdult = knownAdultRegistry.find(
      (u) => u.personalId.toLowerCase() === clean || u.email.toLowerCase() === clean
    );
    if (foundAdult) {
      loginAsMember(foundAdult.personalId);
      return true;
    }

    // 3. Check persistent database of registered users in localStorage
    try {
      const existingUsers = JSON.parse(localStorage.getItem('app-users-registry-db') || '[]');
      const registeredUser = existingUsers.find(
        (u: any) => u.email?.toLowerCase() === clean || u.personalId?.toLowerCase() === clean
      );
      if (registeredUser) {
        return login({ email: clean, userData: registeredUser });
      }
    } catch (e) {
      console.warn('Failed reading users registry:', e);
    }

    // 4. Check currently saved profile in localStorage
    try {
      const savedProfile = JSON.parse(localStorage.getItem('app-user-profile') || '{}');
      if (savedProfile.email && savedProfile.email.toLowerCase() === clean) {
        return login({ email: clean, userData: savedProfile });
      }
    } catch {}

    // STRICT: Unknown user -> REJECT login! Never fabricate a phantom session!
    return false;
  };

  const loginAsMember = (personalIdOrId: string) => {
    const clean = personalIdOrId.trim().toUpperCase();
    const foundRegistry = knownAdultRegistry.find(
      (u) => u.personalId.toUpperCase() === clean || u.id.toLowerCase() === personalIdOrId.toLowerCase()
    );
    if (foundRegistry) {
      setUserProfile(foundRegistry);
      const correspondingMember = members.find(
        (m) => m.personalId?.toUpperCase() === clean || m.name.toLowerCase() === foundRegistry.firstName.toLowerCase()
      );
      if (correspondingMember) {
        setActiveMemberId(correspondingMember.id);
      }
      setIsAuthenticatedState(true);
      localStorage.setItem('app-is-authenticated', 'true');
    }
  };

  const register = (data: Partial<UserProfile>) => {
    const personalId = `MED-${Math.floor(1000 + Math.random() * 9000)}`;
    const heightM = (data.height || 170) / 100;
    const bmiVal = data.height && data.weight
      ? Math.round((data.weight / (heightM * heightM)) * 10) / 10
      : 22.0;

    const newProfile: UserProfile = {
      id: `user_${Date.now()}`,
      personalId,
      firstName: data.firstName || 'Новый',
      lastName: data.lastName || 'Пользователь',
      middleName: data.middleName || '',
      email: data.email || 'user@gmail.com',
      birthDate: data.birthDate || '1995-01-01',
      birthYear: data.birthYear || 1995,
      gender: data.gender || 'male',
      height: data.height || 175,
      weight: data.weight || 70,
      bmi: bmiVal,
      bloodType: data.bloodType || 'A(II) Rh+',
      policyOMS: data.policyOMS || '1694 0000 0000 0000',
      policyDMS: data.policyDMS || '',
      avatar: `${(data.firstName || 'Н').slice(0, 1)}${(data.lastName || 'П').slice(0, 1)}`.toUpperCase(),
      familyRole: 'head',
      familyName: 'Моя семья',
      googleConnected: true,
    };

    setUserProfile(newProfile);

    // Also add to members
    const newMember: FamilyMember = {
      id: newProfile.id,
      name: newProfile.firstName,
      lastName: newProfile.lastName,
      personalId: newProfile.personalId,
      role: 'head',
      roleLabel: 'Глава семьи',
      birthYear: newProfile.birthYear,
      gender: newProfile.gender,
      height: newProfile.height,
      weight: newProfile.weight,
      bmi: newProfile.bmi,
      bloodType: newProfile.bloodType,
      policyOMS: newProfile.policyOMS,
      avatar: newProfile.avatar,
      color: '#7c3aed',
      healthScore: 0,
      analysesCount: 0,
      expensesTotal: 0,
      inviteStatus: 'active',
    };
    setMembers([newMember]);
    setActiveMemberId(newMember.id);
    setFamilyNameState('Моя семья');
    setIsAuthenticatedState(true);
    setIsDemoModeState(false);
    localStorage.setItem('app-is-demo', 'false');
    localStorage.setItem('app-is-authenticated', 'true');
    localStorage.setItem('app-user-profile', JSON.stringify(newProfile));
    localStorage.setItem('app-family-members', JSON.stringify([newMember]));
    localStorage.setItem('app-family-invites', JSON.stringify([]));
    localStorage.setItem('app-family-name', newProfile.familyName);
    localStorage.setItem('app-active-member-id', newMember.id);
    localStorage.setItem('app-expenses-list', JSON.stringify([]));
    localStorage.removeItem('app-last-analysis');
  };

  const loginWithGoogle = (emailParam?: string, nameParam?: string) => {
    const email = emailParam || 'demo.family@gmail.com';
    const fullName = nameParam || (emailParam ? 'Пользователь' : 'Алексей Иванов');
    const parts = fullName.trim().split(' ');
    const firstName = parts[0] || 'Пользователь';
    const lastName = parts.length > 1 ? parts.slice(1).join(' ') : 'Иванов';

    const googleProfile: UserProfile = {
      id: `user_google_${Date.now()}`,
      personalId: `MED-${Math.floor(1000 + Math.random() * 9000)}`,
      firstName,
      lastName,
      middleName: '',
      email,
      birthDate: '1995-05-15',
      birthYear: 1995,
      gender: 'male',
      height: 180,
      weight: 76,
      bmi: 23.5,
      bloodType: 'A(II) Rh+',
      policyOMS: '',
      policyDMS: '',
      avatar: `${firstName.slice(0, 1)}${lastName.slice(0, 1)}`.toUpperCase(),
      familyRole: 'head',
      familyName: 'Моя семья',
      googleConnected: true,
    };

    const googleMember: FamilyMember = {
      id: googleProfile.id,
      name: googleProfile.firstName,
      lastName: googleProfile.lastName,
      personalId: googleProfile.personalId,
      role: googleProfile.familyRole as FamilyMember['role'],
      roleLabel: 'Глава семьи',
      birthYear: googleProfile.birthYear,
      gender: googleProfile.gender,
      height: googleProfile.height,
      weight: googleProfile.weight,
      bmi: googleProfile.bmi,
      bloodType: googleProfile.bloodType,
      policyOMS: googleProfile.policyOMS,
      avatar: googleProfile.avatar,
      color: '#7c3aed',
      healthScore: 0,
      analysesCount: 0,
      expensesTotal: 0,
      inviteStatus: 'active',
    };

    setUserProfile(googleProfile);
    setMembers([googleMember]);
    setInvites([]);
    setActiveMemberId(googleMember.id);
    setFamilyNameState(googleProfile.familyName);
    setIsAuthenticatedState(true);
    setIsDemoModeState(false);
    localStorage.setItem('app-is-demo', 'false');
    localStorage.setItem('app-is-authenticated', 'true');
    localStorage.setItem('app-user-profile', JSON.stringify(googleProfile));
    localStorage.setItem('app-family-members', JSON.stringify([googleMember]));
    localStorage.setItem('app-family-invites', JSON.stringify([]));
    localStorage.setItem('app-family-name', googleProfile.familyName);
    localStorage.setItem('app-active-member-id', googleMember.id);
    localStorage.setItem('app-expenses-list', JSON.stringify([]));
    localStorage.removeItem('app-last-analysis');
  };

  const resetToNewUser = () => {
    localStorage.setItem('app-is-demo', 'false');
    setIsDemoModeState(false);
    localStorage.removeItem('app-user-profile');
    localStorage.removeItem('app-family-members');
    localStorage.removeItem('app-family-invites');
    localStorage.removeItem('app-family-name');
    localStorage.removeItem('app-active-member-id');
    localStorage.setItem('app-expenses-list', JSON.stringify([]));
    localStorage.removeItem('app-last-analysis');
    localStorage.setItem('app-is-authenticated', 'false');

    setIsAuthenticatedState(false);
    setUserProfile(emptyUserProfile);
    setMembers([]);
    setInvites([]);
    setActiveMemberId('');
    setFamilyNameState('Моя семья');
  };

  const purgeAllDataAndReset = () => {
    localStorage.removeItem('app-users-registry-db');
    resetToNewUser();
  };

  const loadDemoData = () => {
    localStorage.setItem('app-is-demo', 'true');
    setIsDemoModeState(true);
    localStorage.setItem('app-is-authenticated', 'true');
    localStorage.setItem('app-user-profile', JSON.stringify(defaultUserProfile));
    localStorage.setItem('app-family-members', JSON.stringify(defaultMembers));
    localStorage.setItem('app-family-invites', JSON.stringify(defaultInvites));
    localStorage.setItem('app-family-name', 'Семья Ивановых');
    localStorage.setItem('app-active-member-id', 'member_head');
    localStorage.setItem('app-expenses-list', JSON.stringify(allDemoExpenses));

    setIsAuthenticatedState(true);
    setUserProfile(defaultUserProfile);
    setMembers(defaultMembers);
    setInvites(defaultInvites);
    setActiveMemberId('member_head');
    setFamilyNameState('Семья Ивановых');
  };

  const logout = () => {
    setIsAuthenticatedState(false);
    localStorage.setItem('app-is-authenticated', 'false');
  };

  const activeMember: FamilyMember = members.find((m) => m.id === activeMemberId) || members[0] || {
    id: userProfile?.id || 'head_user',
    name: userProfile?.firstName || 'Пользователь',
    lastName: userProfile?.lastName || '',
    personalId: userProfile?.personalId || 'MED-NEW',
    role: 'head' as const,
    roleLabel: 'Глава семьи',
    birthYear: userProfile?.birthYear || 1995,
    gender: userProfile?.gender || ('male' as const),
    avatar: userProfile?.avatar || 'Я',
    color: '#7c3aed',
    healthScore: 0,
    analysesCount: 0,
    expensesTotal: 0,
    inviteStatus: 'active' as const,
  };

  return (
    <FamilyContext.Provider
      value={{
        isAuthenticated,
        login,
        loginWithGoogle,
        loginAsMember,
        register,
        logout,
        resetToNewUser,
        loadDemoData,
        userProfile,
        updateUserProfile,
        familyName,
        setFamilyName,
        members,
        activeMember,
        activeMemberId,
        setActiveMemberId,
        addMember,
        removeMember,
        updateMemberRole,
        addExpenseToMember,
        invites,
        sendFamilyInvite,
        acceptFamilyInvite,
        declineFamilyInvite,
        addChildMember,
        viewScope,
        setViewScope,
        isPinSet,
        pinCode,
        isLocked,
        privacyMode,
        twoFactorEnabled,
        totpSecret,
        setPinCode,
        setIsPinSet,
        setPrivacyMode,
        setTwoFactorEnabled,
        lockApp,
        unlockApp,
        unlockDirectly,
        showPinSetupModal,
        openPinSetup,
        closePinSetup,
        isDemoMode,
        setIsDemoMode,
        purgeAllDataAndReset,
        googleAccount,
        connectGoogleAccount,
        disconnectGoogleAccount,
        syncWithGoogleSheets,
        appsScriptUrl,
        setAppsScriptUrl,
        googleSheetUrl,
        setGoogleSheetUrl,
        lastSyncTime,
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
};

export const useFamily = () => {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error('useFamily must be used within FamilyProvider');
  }
  return context;
};
