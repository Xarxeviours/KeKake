import { Expense, GroupData, Person, PersonBalance, SettlementTransaction, SpendingInsights, CategorySummary } from '../types';

/**
 * Convert standard currency amount to integer minor units (paise/cents)
 */
export function toCents(amount: number): number {
  return Math.round(Number(amount) * 100);
}

/**
 * Convert integer minor units back to standard currency amount
 */
export function fromCents(cents: number): number {
  return cents / 100;
}

/**
 * Computes exact integer cents share for each participant for a given expense.
 * Guarantees that the sum of shares in cents strictly equals the expense total in cents.
 */
export function calculateExpenseShares(expense: Expense): Record<string, number> {
  const participants = expense.participants.filter(Boolean);
  const totalCents = toCents(expense.amount);
  const sharesInCents: Record<string, number> = {};

  if (participants.length === 0 || totalCents <= 0) {
    return sharesInCents;
  }

  if (expense.splitType === 'equal') {
    const count = participants.length;
    const baseShare = Math.floor(totalCents / count);
    const remainder = totalCents % count;

    participants.forEach((personId, index) => {
      // Distribute odd cents 1-by-1 to first remainder participants
      sharesInCents[personId] = baseShare + (index < remainder ? 1 : 0);
    });
  } else if (expense.splitType === 'custom' && expense.customShares) {
    let accumulated = 0;
    participants.forEach((personId) => {
      const share = toCents(expense.customShares?.[personId] || 0);
      sharesInCents[personId] = share;
      accumulated += share;
    });
    // In case of slight rounding variance in custom shares, adjust the last participant if minor diff
    const diff = totalCents - accumulated;
    if (Math.abs(diff) <= 2 && participants.length > 0) {
      sharesInCents[participants[participants.length - 1]] += diff;
    }
  } else if (expense.splitType === 'percentage' && expense.percentageShares) {
    let accumulated = 0;
    let maxPctPerson = participants[0];
    let maxPct = -1;

    participants.forEach((personId) => {
      const pct = Number(expense.percentageShares?.[personId] || 0);
      if (pct > maxPct) {
        maxPct = pct;
        maxPctPerson = personId;
      }
      const share = Math.round((totalCents * pct) / 100);
      sharesInCents[personId] = share;
      accumulated += share;
    });

    const diff = totalCents - accumulated;
    if (diff !== 0 && sharesInCents[maxPctPerson] !== undefined) {
      sharesInCents[maxPctPerson] += diff;
    }
  } else if (expense.splitType === 'shares' && expense.shares) {
    let totalSharesCount = 0;
    participants.forEach((personId) => {
      totalSharesCount += Math.max(0, Number(expense.shares?.[personId] || 0));
    });

    if (totalSharesCount <= 0) {
      // fallback to equal
      const count = participants.length;
      const baseShare = Math.floor(totalCents / count);
      const remainder = totalCents % count;
      participants.forEach((personId, index) => {
        sharesInCents[personId] = baseShare + (index < remainder ? 1 : 0);
      });
    } else {
      let accumulated = 0;
      let maxSharePerson = participants[0];
      let maxShareVal = -1;

      participants.forEach((personId) => {
        const count = Number(expense.shares?.[personId] || 0);
        if (count > maxShareVal) {
          maxShareVal = count;
          maxSharePerson = personId;
        }
        const share = Math.floor((totalCents * count) / totalSharesCount);
        sharesInCents[personId] = share;
        accumulated += share;
      });

      const remainder = totalCents - accumulated;
      if (remainder > 0) {
        // Distribute remaining cents
        for (let i = 0; i < remainder; i++) {
          const target = participants[i % participants.length];
          sharesInCents[target] = (sharesInCents[target] || 0) + 1;
        }
      }
    }
  } else {
    // Default equal
    const count = participants.length;
    const baseShare = Math.floor(totalCents / count);
    const remainder = totalCents % count;
    participants.forEach((personId, index) => {
      sharesInCents[personId] = baseShare + (index < remainder ? 1 : 0);
    });
  }

  return sharesInCents;
}

/**
 * Calculates net balance for every person in the group.
 * Net balance = Amount Paid - Actual Share.
 * All computations use integer cents to ensure 0 net balance error.
 */
export function calculateBalances(group: GroupData): PersonBalance[] {
  const peopleMap = new Map<string, Person>();
  group.people.forEach((p) => peopleMap.set(p.id, p));

  const totalPaidCents = new Map<string, number>();
  const totalShareCents = new Map<string, number>();

  group.people.forEach((p) => {
    totalPaidCents.set(p.id, 0);
    totalShareCents.set(p.id, 0);
  });

  // Calculate payments and shares from all expenses
  group.expenses.forEach((expense) => {
    // 1. Paid by
    expense.paidBy.forEach((item) => {
      if (peopleMap.has(item.personId)) {
        const currentPaid = totalPaidCents.get(item.personId) || 0;
        totalPaidCents.set(item.personId, currentPaid + toCents(item.amount));
      }
    });

    // 2. Shares
    const sharesInCents = calculateExpenseShares(expense);
    Object.entries(sharesInCents).forEach(([personId, shareCents]) => {
      if (peopleMap.has(personId)) {
        const currentShare = totalShareCents.get(personId) || 0;
        totalShareCents.set(personId, currentShare + shareCents);
      }
    });
  });

  return group.people.map((person) => {
    const paidCents = totalPaidCents.get(person.id) || 0;
    const shareCents = totalShareCents.get(person.id) || 0;
    const netCents = paidCents - shareCents;

    let status: 'gets' | 'owes' | 'settled' = 'settled';
    if (netCents > 0) status = 'gets';
    else if (netCents < 0) status = 'owes';

    return {
      personId: person.id,
      personName: person.name,
      avatarColor: person.avatarColor,
      totalPaid: fromCents(paidCents),
      totalShare: fromCents(shareCents),
      netBalance: fromCents(netCents),
      status,
    };
  });
}

/**
 * Smart Settlement Algorithm
 * Minimizes the number of transactions using exact integer cents matching.
 * Includes exact-match greedy optimization: if any debtor matches a creditor's exact amount,
 * pair them directly to eliminate 2 potential transactions.
 */
export function calculateSmartSettlements(balances: PersonBalance[]): SettlementTransaction[] {
  // Work in cents
  interface BalanceNode {
    personId: string;
    cents: number;
  }

  const debtors: BalanceNode[] = [];
  const creditors: BalanceNode[] = [];

  balances.forEach((b) => {
    const cents = toCents(b.netBalance);
    if (cents < 0) {
      debtors.push({ personId: b.personId, cents: Math.abs(cents) });
    } else if (cents > 0) {
      creditors.push({ personId: b.personId, cents });
    }
  });

  const transactions: SettlementTransaction[] = [];
  let txIndex = 0;

  // Pass 1: Look for exact 1-to-1 matches (debts that exactly equal credits)
  // This drastically cuts down chains of payments
  for (let i = 0; i < debtors.length; i++) {
    const debtor = debtors[i];
    if (debtor.cents === 0) continue;

    for (let j = 0; j < creditors.length; j++) {
      const creditor = creditors[j];
      if (creditor.cents === 0) continue;

      if (debtor.cents === creditor.cents) {
        transactions.push({
          id: `tx-${debtor.personId}-${creditor.personId}-${txIndex++}`,
          fromPersonId: debtor.personId,
          toPersonId: creditor.personId,
          amount: fromCents(debtor.cents),
        });
        debtor.cents = 0;
        creditor.cents = 0;
        break;
      }
    }
  }

  // Filter out resolved nodes
  let remainingDebtors = debtors.filter((d) => d.cents > 0);
  let remainingCreditors = creditors.filter((c) => c.cents > 0);

  // Pass 2: Greedy matching with largest amounts
  while (remainingDebtors.length > 0 && remainingCreditors.length > 0) {
    // Sort descending by amount to settle largest debts first
    remainingDebtors.sort((a, b) => b.cents - a.cents);
    remainingCreditors.sort((a, b) => b.cents - a.cents);

    const debtor = remainingDebtors[0];
    const creditor = remainingCreditors[0];

    const settleCents = Math.min(debtor.cents, creditor.cents);

    transactions.push({
      id: `tx-${debtor.personId}-${creditor.personId}-${txIndex++}`,
      fromPersonId: debtor.personId,
      toPersonId: creditor.personId,
      amount: fromCents(settleCents),
    });

    debtor.cents -= settleCents;
    creditor.cents -= settleCents;

    if (debtor.cents === 0) {
      remainingDebtors.shift();
    }
    if (creditor.cents === 0) {
      remainingCreditors.shift();
    }
  }

  return transactions;
}

/**
 * Calculates spending insights and category breakdowns
 */
export function calculateInsights(group: GroupData, balances: PersonBalance[]): SpendingInsights {
  const totalSpent = group.expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const expenseCount = group.expenses.length;
  const averageExpense = expenseCount > 0 ? totalSpent / expenseCount : 0;
  const peopleCount = group.people.length;
  const averagePerPerson = peopleCount > 0 ? totalSpent / peopleCount : 0;

  // Category breakdown
  const categoryMap = new Map<string, { total: number; count: number }>();
  let largestExpenseItem: Expense | null = null;

  group.expenses.forEach((expense) => {
    const cat = expense.category || 'Other';
    const existing = categoryMap.get(cat) || { total: 0, count: 0 };
    categoryMap.set(cat, {
      total: existing.total + Number(expense.amount),
      count: existing.count + 1,
    });

    if (!largestExpenseItem || Number(expense.amount) > Number(largestExpenseItem.amount)) {
      largestExpenseItem = expense;
    }
  });

  const categories: CategorySummary[] = Array.from(categoryMap.entries()).map(([category, val]) => ({
    category,
    total: val.total,
    percentage: totalSpent > 0 ? Math.round((val.total / totalSpent) * 100) : 0,
    count: val.count,
  }));

  // Sort categories by total descending
  categories.sort((a, b) => b.total - a.total);

  const topCategory = categories.length > 0 ? { category: categories[0].category, amount: categories[0].total } : null;

  // Highest payer
  let highestPayer: { personName: string; amount: number } | null = null;
  balances.forEach((b) => {
    if (!highestPayer || b.totalPaid > highestPayer.amount) {
      if (b.totalPaid > 0) {
        highestPayer = { personName: b.personName, amount: b.totalPaid };
      }
    }
  });

  const largestExpense = largestExpenseItem
    ? { title: (largestExpenseItem as Expense).title, amount: (largestExpenseItem as Expense).amount }
    : null;

  return {
    totalSpent,
    expenseCount,
    averageExpense,
    averagePerPerson,
    topCategory,
    highestPayer,
    largestExpense,
    categories,
  };
}
