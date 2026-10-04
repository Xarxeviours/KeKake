export type SplitType = 'equal' | 'custom' | 'percentage' | 'shares';

export interface PaidByItem {
  personId: string;
  amount: number; // in standard currency units (e.g. 500.50)
}

export interface Person {
  id: string;
  name: string;
  avatarColor: string;
  createdAt: number;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string; // ISO date string YYYY-MM-DD
  time?: string; // HH:mm
  paidBy: PaidByItem[]; // supports single or multiple payers
  splitType: SplitType;
  participants: string[]; // personIds of who shared
  customShares?: Record<string, number>; // personId -> exact amount
  percentageShares?: Record<string, number>; // personId -> percentage (0-100)
  shares?: Record<string, number>; // personId -> number of shares (e.g. 1, 2)
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface SettlementTransaction {
  id: string;
  fromPersonId: string;
  toPersonId: string;
  amount: number;
  isPaid?: boolean;
}

export interface GroupData {
  id: string;
  name: string;
  currency: string; // 'INR', 'USD', etc.
  people: Person[];
  expenses: Expense[];
  settlementProgress: Record<string, boolean>; // transactionKey (from-to) -> isPaid
  createdAt: number;
  updatedAt: number;
}

export interface PersonBalance {
  personId: string;
  personName: string;
  avatarColor: string;
  totalPaid: number;
  totalShare: number;
  netBalance: number; // positive = gets back, negative = owes
  status: 'gets' | 'owes' | 'settled';
}

export interface CategorySummary {
  category: string;
  total: number;
  percentage: number;
  count: number;
}

export interface SpendingInsights {
  totalSpent: number;
  expenseCount: number;
  averageExpense: number;
  averagePerPerson: number;
  topCategory: { category: string; amount: number } | null;
  highestPayer: { personName: string; amount: number } | null;
  largestExpense: { title: string; amount: number } | null;
  categories: CategorySummary[];
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}
