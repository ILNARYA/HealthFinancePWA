/**
 * Russian pluralization and number formatting utility
 */

export function pluralize(n: number, one: string, few: string, many: string): string {
  const absN = Math.abs(Math.floor(n));
  const mod10 = absN % 10;
  const mod100 = absN % 100;

  if (mod100 >= 11 && mod100 <= 19) {
    return `${n} ${many}`;
  }
  if (mod10 === 1) {
    return `${n} ${one}`;
  }
  if (mod10 >= 2 && mod10 <= 4) {
    return `${n} ${few}`;
  }
  return `${n} ${many}`;
}

/**
 * Format years with correct Russian grammar:
 * 1 год, 2-4 года, 5-20 лет, 21 год, 31 год, 34 года, etc.
 */
export function formatYears(years: number): string {
  return pluralize(years, 'год', 'года', 'лет');
}

/**
 * Format currency in Russian Rubles
 */
export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('ru-RU')} ₽`;
}
