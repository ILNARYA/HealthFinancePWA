import React, { createContext, useContext, useState, useEffect } from 'react';
import type { FamilyMember } from '../types';

export interface GoogleAccountInfo {
  connected: boolean;
  email: string;
  name: string;
  sheetName: string;
  sheetId: string;
  lastSynced: string;
}

interface FamilyContextType {
  members: FamilyMember[];
  activeMember: FamilyMember;
  activeMemberId: string;
  setActiveMemberId: (id: string) => void;
  addMember: (member: Omit<FamilyMember, 'id'>) => void;
  removeMember: (id: string) => void;
  addExpenseToMember: (memberId: string, amount: number) => void;
  // Security
  isPinSet: boolean;
  pinCode: string;
  isLocked: boolean;
  biometricsEnabled: boolean;
  privacyMode: boolean;
  twoFactorEnabled: boolean;
  totpSecret: string;
  setPinCode: (pin: string) => void;
  setIsPinSet: (enabled: boolean) => void;
  setBiometricsEnabled: (enabled: boolean) => void;
  setPrivacyMode: (enabled: boolean) => void;
  setTwoFactorEnabled: (enabled: boolean) => void;
  lockApp: () => void;
  unlockApp: (pin: string) => boolean;
  // Google Account & Sheets Sync
  googleAccount: GoogleAccountInfo;
  connectGoogleAccount: () => void;
  disconnectGoogleAccount: () => void;
  syncWithGoogleSheets: () => Promise<boolean>;
}

const defaultMembers: FamilyMember[] = [
  {
    id: 'ilnar',
    name: 'Ильнар',
    role: 'head',
    roleLabel: 'Глава семьи',
    birthYear: 1994,
    gender: 'male',
    bloodType: 'A(II) Rh+',
    policyOMS: '1694 2850 1938 4810',
    policyDMS: 'СОГАЗ ДМС Эксперт',
    avatar: 'ИЯ',
    color: '#7c3aed',
    healthScore: 88.2,
    analysesCount: 8,
    expensesTotal: 33050,
    allergies: ['Пенициллин'],
    chronicNotes: 'Мониторинг холестерина и СКФ (почки)',
  },
  {
    id: 'alina',
    name: 'Алина',
    role: 'spouse',
    roleLabel: 'Супруга',
    birthYear: 1997,
    gender: 'female',
    bloodType: 'B(III) Rh+',
    policyOMS: '1694 3910 8201 1294',
    policyDMS: 'Ингосстрах Премиум',
    avatar: 'АЯ',
    color: '#ec4899',
    healthScore: 92.4,
    analysesCount: 5,
    expensesTotal: 18400,
    allergies: ['Цветение березы'],
    chronicNotes: 'Ферритин, контроль железа и ТТГ',
  },
  {
    id: 'timur',
    name: 'Тимур',
    role: 'child',
    roleLabel: 'Сын',
    birthYear: 2022,
    gender: 'male',
    bloodType: 'A(II) Rh+',
    policyOMS: '1694 5102 7741 9021',
    avatar: 'ТЯ',
    color: '#3b82f6',
    healthScore: 95.0,
    analysesCount: 3,
    expensesTotal: 12200,
    allergies: ['Арахис'],
    chronicNotes: 'Календарь детских прививок и педиатр',
  },
];

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export const FamilyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<FamilyMember[]>(() => {
    const saved = localStorage.getItem('app-family-members');
    return saved ? JSON.parse(saved) : defaultMembers;
  });

  const [activeMemberId, setActiveMemberId] = useState<string>(() => {
    return localStorage.getItem('app-active-member-id') || 'ilnar';
  });

  // Security state
  const [isPinSet, setIsPinSetState] = useState<boolean>(() => {
    return localStorage.getItem('app-pin-enabled') === 'true';
  });

  const [pinCode, setPinCodeState] = useState<string>(() => {
    return localStorage.getItem('app-pin-code') || '1234';
  });

  const [biometricsEnabled, setBiometricsEnabledState] = useState<boolean>(() => {
    return localStorage.getItem('app-biometrics-enabled') === 'true';
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
          connected: true,
          email: 'ilnar.yamaev@gmail.com',
          name: 'Ильнар Ямаев',
          sheetName: 'Медицинский учёт 2026 (Семейный)',
          sheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
          lastSynced: 'Только что',
        };
  });

  useEffect(() => {
    localStorage.setItem('app-family-members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('app-active-member-id', activeMemberId);
  }, [activeMemberId]);

  useEffect(() => {
    localStorage.setItem('app-google-account', JSON.stringify(googleAccount));
  }, [googleAccount]);

  const setIsPinSet = (enabled: boolean) => {
    setIsPinSetState(enabled);
    localStorage.setItem('app-pin-enabled', String(enabled));
  };

  const setPinCode = (pin: string) => {
    setPinCodeState(pin);
    localStorage.setItem('app-pin-code', pin);
  };

  const setBiometricsEnabled = (enabled: boolean) => {
    setBiometricsEnabledState(enabled);
    localStorage.setItem('app-biometrics-enabled', String(enabled));
  };

  const setPrivacyMode = (enabled: boolean) => {
    setPrivacyModeState(enabled);
    localStorage.setItem('app-privacy-mode', String(enabled));
  };

  const setTwoFactorEnabled = (enabled: boolean) => {
    setTwoFactorEnabledState(enabled);
    localStorage.setItem('app-2fa-enabled', String(enabled));
  };

  const lockApp = () => {
    setIsLocked(true);
  };

  const unlockApp = (pin: string) => {
    if (pin === pinCode || pin === 'faceid') {
      setIsLocked(false);
      return true;
    }
    return false;
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
    setGoogleAccount({
      connected: true,
      email: 'ilnar.yamaev@gmail.com',
      name: 'Ильнар Ямаев',
      sheetName: 'Медицинский учёт 2026 (Семейный)',
      sheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
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
    await new Promise((r) => setTimeout(r, 1000));
    setGoogleAccount((prev) => ({
      ...prev,
      lastSynced: 'Только что',
    }));
    return true;
  };

  const activeMember = members.find((m) => m.id === activeMemberId) || members[0];

  return (
    <FamilyContext.Provider
      value={{
        members,
        activeMember,
        activeMemberId,
        setActiveMemberId,
        addMember,
        removeMember,
        addExpenseToMember,
        isPinSet,
        pinCode,
        isLocked,
        biometricsEnabled,
        privacyMode,
        twoFactorEnabled,
        totpSecret,
        setPinCode,
        setIsPinSet,
        setBiometricsEnabled,
        setPrivacyMode,
        setTwoFactorEnabled,
        lockApp,
        unlockApp,
        googleAccount,
        connectGoogleAccount,
        disconnectGoogleAccount,
        syncWithGoogleSheets,
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
