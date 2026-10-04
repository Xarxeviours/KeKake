import { CurrencyConfig } from '../types';

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR)', locale: 'en-IN' },
  { code: 'USD', symbol: '$', name: 'US Dollar (USD)', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro (EUR)', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound (GBP)', locale: 'en-GB' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham (AED)', locale: 'ar-AE' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka (BDT)', locale: 'bn-BD' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CAD)', locale: 'en-CA' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (AUD)', locale: 'en-AU' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar (SGD)', locale: 'en-SG' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (JPY)', locale: 'ja-JP' },
];

export function getCurrencyConfig(code: string): CurrencyConfig {
  return SUPPORTED_CURRENCIES.find((c) => c.code === code) || SUPPORTED_CURRENCIES[0];
}

export function formatCurrency(amount: number, currencyCode: string = 'INR', showSign: boolean = false): string {
  const config = getCurrencyConfig(currencyCode);
  const absAmount = Math.abs(amount);
  
  // Format with 2 decimal places if has decimals or standard
  const hasDecimals = absAmount % 1 !== 0;
  const formattedNumber = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(absAmount);

  let signPrefix = '';
  if (showSign) {
    if (amount > 0.001) signPrefix = '+';
    else if (amount < -0.001) signPrefix = '-';
  }

  // Symbol placement
  if (config.code === 'AED') {
    return `${signPrefix}${formattedNumber} ${config.symbol}`;
  }
  return `${signPrefix}${config.symbol}${formattedNumber}`;
}

// 16 refined, tasteful avatar colors that look great in both dark and light modes
export const AVATAR_PALETTE = [
  '#059669', // Emerald
  '#2563eb', // Blue
  '#7c3aed', // Purple
  '#db2777', // Pink
  '#d97706', // Amber
  '#0d9488', // Teal
  '#4f46e5', // Indigo
  '#e11d48', // Rose
  '#0284c7', // Sky
  '#65a30d', // Lime
  '#9333ea', // Violet
  '#ea580c', // Orange
  '#0891b2', // Cyan
  '#c026d3', // Fuchsia
  '#16a34a', // Green
  '#475569', // Slate
];

export function getAvatarColor(index: number): string {
  return AVATAR_PALETTE[index % AVATAR_PALETTE.length];
}

export const EXPENSE_CATEGORIES = [
  { id: 'Food', label: 'Food & Dining', icon: '🍕', color: '#f97316' },
  { id: 'Transport', label: 'Transport & Cab', icon: '🚕', color: '#eab308' },
  { id: 'Hotel', label: 'Hotel & Stay', icon: '🏨', color: '#3b82f6' },
  { id: 'Entertainment', label: 'Entertainment', icon: '🎬', color: '#ec4899' },
  { id: 'Shopping', label: 'Shopping', icon: '🛍', color: '#8b5cf6' },
  { id: 'Drinks', label: 'Drinks & Coffee', icon: '☕', color: '#10b981' },
  { id: 'Tickets', label: 'Tickets & Passes', icon: '🎟', color: '#06b6d4' },
  { id: 'Stay', label: 'Rent & Accommodation', icon: '🏠', color: '#6366f1' },
  { id: 'Groceries', label: 'Groceries', icon: '🛒', color: '#84cc16' },
  { id: 'Other', label: 'Other', icon: '💊', color: '#64748b' },
];

export function getCategoryMeta(categoryId: string) {
  return EXPENSE_CATEGORIES.find((c) => c.id.toLowerCase() === categoryId.toLowerCase()) || {
    id: categoryId,
    label: categoryId,
    icon: '🧾',
    color: '#64748b',
  };
}
