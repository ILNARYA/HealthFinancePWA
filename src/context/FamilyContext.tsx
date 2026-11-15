import React, { createContext, useContext, useState, useEffect } from 'react';
import type { FamilyMember, UserProfile, FamilyInvite } from '../types';

export interface GoogleAccountInfo {
  connected: boolean;
  email: string;
  name: string;
  sheetName: string;
  sheetId: string;
  lastSynced: string;
}

interface FamilyContextType {
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

export const defaultUserProfile: UserProfile = {
  id: 'user_ilnar',
  personalId: 'MED-9402',
  firstName: 'Ильнар',
  lastName: 'Ямаев',
  middleName: 'Рамилевич',
  email: 'ilnar.yamaev@gmail.com',
  birthDate: '1994-06-15',
  birthYear: 1994,
  gender: 'male',
  height: 182,
  weight: 78,
  bmi: 23.5, // 78 / (1.82 * 1.82) = 23.55
  bloodType: 'A(II) Rh+',
  policyOMS: '1694 2850 1938 4810',
  policyDMS: 'СОГАЗ ДМС Эксперт',
  avatar: 'ИЯ',
  familyRole: 'head',
  familyName: 'Семья Ямаевых',
  googleConnected: true,
};

export const knownAdultRegistry: UserProfile[] = [
  {
    id: 'user_alina',
    personalId: 'MED-3910',
    firstName: 'Алина',
    lastName: 'Ямаева',
    email: 'alina.yam@gmail.com',
    birthDate: '1997-04-12',
    birthYear: 1997,
    gender: 'female',
    height: 168,
    weight: 56,
    bmi: 19.8,
    bloodType: 'B(III) Rh+',
    policyOMS: '1694 3910 8201 1294',
    policyDMS: 'Ингосстрах Премиум',
    avatar: 'АЯ',
    familyRole: 'spouse',
    familyName: 'Семья Ямаевых',
    googleConnected: true,
  },
  {
    id: 'user_rustam',
    personalId: 'MED-5812',
    firstName: 'Рустам',
    lastName: 'Ямаев',
    middleName: 'Рамилевич',
    email: 'rustam.yam@gmail.com',
    birthDate: '1991-08-20',
    birthYear: 1991,
    gender: 'male',
    height: 185,
    weight: 84,
    bmi: 24.5,
    bloodType: 'A(II) Rh+',
    policyOMS: '1694 5812 4019 3320',
    avatar: 'РЯ',
    familyRole: 'parent',
    familyName: 'Семья Ямаевых (Брат)',
    googleConnected: true,
  },
  {
    id: 'user_safina',
    personalId: 'MED-7721',
    firstName: 'Гульназ',
    lastName: 'Сафина',
    email: 'gulnaz.safina@gmail.com',
    birthDate: '1996-11-03',
    birthYear: 1996,
    gender: 'female',
    height: 165,
    weight: 58,
    bmi: 21.3,
    bloodType: 'O(I) Rh+',
    policyOMS: '1694 7721 8912 6001',
    avatar: 'ГС',
    familyRole: 'parent',
    familyName: 'Семья Сафиных',
    googleConnected: true,
  },
];

const defaultMembers: FamilyMember[] = [
  {
    id: 'ilnar',
    name: 'Ильнар',
    lastName: 'Ямаев',
    personalId: 'MED-9402',
    role: 'head',
    roleLabel: 'Глава семьи',
    birthYear: 1994,
    gender: 'male',
    height: 182,
    weight: 78,
    bmi: 23.5,
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
    inviteStatus: 'active',
  },
  {
    id: 'alina',
    name: 'Алина',
    lastName: 'Ямаева',
    personalId: 'MED-3910',
    role: 'spouse',
    roleLabel: 'Супруга',
    birthYear: 1997,
    gender: 'female',
    height: 168,
    weight: 56,
    bmi: 19.8,
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
    inviteStatus: 'active',
  },
  {
    id: 'timur',
    name: 'Тимур',
    lastName: 'Ямаев',
    personalId: 'MED-CHILD-01',
    role: 'child',
    roleLabel: 'Сын',
    birthYear: 2022,
    gender: 'male',
    height: 104,
    weight: 16,
    bmi: 14.8,
    bloodType: 'A(II) Rh+',
    policyOMS: '1694 5102 7741 9021',
    avatar: 'ТЯ',
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
    id: 'inv_rustam',
    fromUserId: 'user_rustam',
    fromUserName: 'Рустам',
    fromUserSurname: 'Ямаев',
    toPersonalId: 'MED-9402',
    familyName: 'Семья Ямаевых (Родственники)',
    role: 'parent',
    roleLabel: 'Родственник (Брат)',
    status: 'pending',
    createdAt: 'Сегодня, 10:15',
  },
];

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export const FamilyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Adult Personal Profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('app-user-profile');
    return saved ? JSON.parse(saved) : defaultUserProfile;
  });

  // Family Group Name
  const [familyName, setFamilyNameState] = useState<string>(() => {
    return localStorage.getItem('app-family-name') || 'Семья Ямаевых';
  });

  const [members, setMembers] = useState<FamilyMember[]>(() => {
    const saved = localStorage.getItem('app-family-members');
    return saved ? JSON.parse(saved) : defaultMembers;
  });

  const [invites, setInvites] = useState<FamilyInvite[]>(() => {
    const saved = localStorage.getItem('app-family-invites');
    return saved ? JSON.parse(saved) : defaultInvites;
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
    localStorage.setItem('app-user-profile', JSON.stringify(userProfile));
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
      // Recalculate BMI if height or weight changed
      if (data.height || data.weight) {
        const hMeter = updated.height / 100;
        updated.bmi = Math.round((updated.weight / (hMeter * hMeter)) * 10) / 10;
      }
      return updated;
    });

    // Also synchronize active member if it is head/ilnar
    setMembers((prev) =>
      prev.map((m) =>
        m.id === 'ilnar'
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
      email: userProfile.email,
      name: `${userProfile.firstName} ${userProfile.lastName}`,
      sheetName: `Медицинский учёт 2026 (${familyName})`,
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
