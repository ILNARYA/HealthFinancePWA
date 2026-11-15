import React, { createContext, useContext, useState, useEffect } from 'react';
import type { FamilyMember } from '../types';

interface FamilyContextType {
  members: FamilyMember[];
  activeMember: FamilyMember;
  activeMemberId: string;
  setActiveMemberId: (id: string) => void;
  addMember: (member: Omit<FamilyMember, 'id'>) => void;
  removeMember: (id: string) => void;
  // Security
  isPinSet: boolean;
  pinCode: string;
  isLocked: boolean;
  biometricsEnabled: boolean;
  privacyMode: boolean;
  setPinCode: (pin: string) => void;
  setIsPinSet: (enabled: boolean) => void;
  setBiometricsEnabled: (enabled: boolean) => void;
  setPrivacyMode: (enabled: boolean) => void;
  lockApp: () => void;
  unlockApp: (pin: string) => boolean;
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

  const [isLocked, setIsLocked] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('app-family-members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('app-active-member-id', activeMemberId);
  }, [activeMemberId]);

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
        isPinSet,
        pinCode,
        isLocked,
        biometricsEnabled,
        privacyMode,
        setPinCode,
        setIsPinSet,
        setBiometricsEnabled,
        setPrivacyMode,
        lockApp,
        unlockApp,
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
