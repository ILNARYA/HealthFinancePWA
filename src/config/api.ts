/**
 * Centralized API configuration & Google Apps Script backend integration
 */

export const DEFAULT_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzbT_ignkyLdWZZsCO2SLfB22GNJ4h0wl1YDgXB54yyUSOU3PIdHZPRiDMPD4p3vfxI/exec';

export const getAppsScriptUrl = (): string => {
  try {
    const saved = localStorage.getItem('app-google-script-url');
    if (saved && saved.trim().startsWith('http')) {
      return saved.trim();
    }
  } catch (e) {
    console.warn('Could not read from localStorage:', e);
  }
  return DEFAULT_APPS_SCRIPT_URL;
};

export const saveAppsScriptUrl = (url: string): void => {
  try {
    const clean = url.trim();
    if (clean) {
      localStorage.setItem('app-google-script-url', clean);
    } else {
      localStorage.setItem('app-google-script-url', DEFAULT_APPS_SCRIPT_URL);
    }
  } catch (e) {
    console.warn('Could not write to localStorage:', e);
  }
};

export interface RemoteUserRecord {
  ID_Пользователя?: string;
  Персональный_ID?: string;
  Фамилия?: string;
  Имя?: string;
  Отчество?: string;
  Роль_в_семье?: string;
  Email?: string;
  Год_рождения?: number | string;
  Пол?: string;
  Рост_см?: number | string;
  Вес_кг?: number | string;
  ИМТ?: number | string;
  Группа_крови?: string;
  Полис_ОМС?: string;
  Дата_регистрации?: string;
  [key: string]: any;
}

/**
 * Fetch all registered users from the Google Sheets backend table
 */
export async function fetchRemoteUsers(): Promise<RemoteUserRecord[]> {
  const url = getAppsScriptUrl();
  try {
    const res = await fetch(`${url}?table=users`, {
      method: 'GET',
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (data && data.success && Array.isArray(data.data)) {
      return data.data;
    }
  } catch (err) {
    console.warn('fetchRemoteUsers error:', err);
  }
  return [];
}

/**
 * Check if a user with the given email exists in remote Google Sheet or local registry
 */
export async function findUserByEmail(email: string): Promise<RemoteUserRecord | null> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return null;

  // 1. Check local registry first
  try {
    const localRegistry = JSON.parse(localStorage.getItem('app-users-registry-db') || '[]');
    const localMatch = localRegistry.find(
      (u: any) => u.email?.toLowerCase() === cleanEmail || u.personalId?.toLowerCase() === cleanEmail
    );
    if (localMatch) return localMatch;
  } catch {
    // ignore
  }

  // 2. Check remote Google Sheet
  const remoteUsers = await fetchRemoteUsers();
  const remoteMatch = remoteUsers.find((u) => {
    const uEmail = (u.Email || u.email || '').toString().toLowerCase().trim();
    return uEmail === cleanEmail;
  });

  return remoteMatch || null;
}

/**
 * Append new user record to Google Sheets table 'users'
 */
export async function appendUserToRemoteSheet(user: {
  id: string;
  personalId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  birthYear?: number;
  gender?: string;
  height?: number;
  weight?: number;
  bmi?: number;
  bloodType?: string;
  policyOMS?: string;
  familyRole?: string;
  familyName?: string;
  password?: string;
}): Promise<boolean> {
  const url = getAppsScriptUrl();
  try {
    const payload = {
      action: 'verifyAndRegister',
      email: user.email.toLowerCase().trim(),
      code: 'VERIFIED_OTP',
      table: 'users',
      data: {
        'ID_Пользователя': user.id,
        'Персональный_ID': user.personalId,
        'Фамилия': user.lastName,
        'Имя': user.firstName,
        'Отчество': user.middleName || '',
        'Роль_в_семье': user.familyRole || 'Глава семьи',
        'Email': user.email.toLowerCase().trim(),
        'Год_рождения': user.birthYear || 1995,
        'Пол': user.gender === 'female' ? 'Женский' : 'Мужской',
        'Рост_см': user.height || 175,
        'Вес_кг': user.weight || 70,
        'ИМТ': user.bmi || 22.9,
        'Группа_крови': user.bloodType || 'A(II) Rh+',
        'Полис_ОМС': user.policyOMS || '1694 0000 0000 0000',
        'Дата_регистрации': new Date().toISOString(),
      },
      profile: {
        id: user.id,
        personalId: user.personalId,
        firstName: user.firstName,
        lastName: user.lastName,
        middleName: user.middleName || '',
        email: user.email.toLowerCase().trim(),
        password: user.password || '******',
      },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return Boolean(data && data.success);
  } catch (err) {
    console.warn('appendUserToRemoteSheet error:', err);
    return false;
  }
}

/**
 * Delete a user from remote Google Sheet by email
 */
export async function deleteRemoteUser(email: string): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return false;
  const url = getAppsScriptUrl();
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'deleteUser', email: cleanEmail }),
    });
    const data = await res.json();
    return Boolean(data && data.success);
  } catch (err) {
    console.warn('deleteRemoteUser error:', err);
    return false;
  }
}

/**
 * Send 6-digit OTP code to email specifically for password recovery
 */
export async function sendPasswordResetOtp(email: string, code: string): Promise<{ success: boolean; error?: string; message?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return { success: false, error: 'INVALID_EMAIL' };
  const url = getAppsScriptUrl();
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'sendPasswordResetCode',
        email: cleanEmail,
        code,
        purpose: 'reset_password',
      }),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    console.warn('sendPasswordResetOtp error:', err);
    return { success: false, error: err.message || 'NETWORK_ERROR' };
  }
}

/**
 * Reset user password in remote Google Sheet
 */
export async function resetRemoteUserPassword(email: string, newPassword: string): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !newPassword) return false;
  const url = getAppsScriptUrl();
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'resetPassword',
        email: cleanEmail,
        newPassword,
      }),
    });
    const data = await res.json();
    return Boolean(data && data.success);
  } catch (err) {
    console.warn('resetRemoteUserPassword error:', err);
    return false;
  }
}

