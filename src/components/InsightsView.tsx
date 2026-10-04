import React from 'react';
import { GroupData, Person, PersonBalance, SpendingInsights } from '../types';
import { formatCurrency, getCategoryMeta } from '../utils/currencies';
import { TrendingUp, Award, DollarSign, PieChart, Users, Receipt } from 'lucide-react';

interface InsightsViewProps {
  group: GroupData;
  insights: SpendingInsights;
  balances: PersonBalance[];
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  group,
  insights,
  balances,
}) => {
  const {
    totalSpent,
    expenseCount,
    averageExpense,
    averagePerPerson,
    topCategory,
    highestPayer,
    largestExpense,
    categories,
  } = insights;

  // Compute SVG Donut Chart slices
  let accumulatedAngle = 0;
  const radius = 65;
  const cx = 100;
  const cy = 100;
  const strokeWidth = 26;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Top Category */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
            <PieChart className="w-4 h-4 text-emerald-500" />
            <span>Top Category</span>
          </div>
          <div className="text-xl font-extrabold text-neutral-900 dark:text-white truncate">
            {topCategory ? topCategory.category : 'N/A'}
          </div>
          <div className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
            {topCategory ? formatCurrency(topCategory.amount, group.currency) : '—'}
          </div>
        </div>

        {/* Highest Payer */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Highest Payer</span>
          </div>
          <div className="text-xl font-extrabold text-neutral-900 dark:text-white truncate">
            {highestPayer ? highestPayer.personName : 'N/A'}
          </div>
          <div className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
            {highestPayer ? formatCurrency(highestPayer.amount, group.currency) : '—'}
          </div>
        </div>

        {/* Largest Expense */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span>Largest Expense</span>
          </div>
          <div className="text-xl font-extrabold text-neutral-900 dark:text-white truncate">
            {largestExpense ? largestExpense.title : 'N/A'}
          </div>
          <div className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
            {largestExpense ? formatCurrency(largestExpense.amount, group.currency) : '—'}
          </div>
        </div>

        {/* Average Expense */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
            <DollarSign className="w-4 h-4 text-purple-500" />
            <span>Average Expense</span>
          </div>
          <div className="text-xl font-extrabold font-mono text-neutral-900 dark:text-white">
            {formatCurrency(averageExpense, group.currency)}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            ~{formatCurrency(averagePerPerson, group.currency)} / person
          </div>
        </div>
      </div>

      {/* Category Breakdown (Donut Chart + Accessible List) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Category Breakdown</h3>
          <p className="text-xs text-neutral-500">Distribution of spending across categories</p>
        </div>

        {categories.length === 0 ? (
          <div className="p-8 text-center text-sm text-neutral-500">
            No expenses recorded yet to show category distribution.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* SVG Donut Chart */}
            <div className="relative flex items-center justify-center">
              <svg className="w-56 h-56 transform -rotate-90" viewBox="0 0 200 200">
                <circle
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  className="text-neutral-100 dark:text-neutral-800"
                />
                {categories.map((cat, idx) => {
                  const meta = getCategoryMeta(cat.category);
                  const pct = totalSpent > 0 ? cat.total / totalSpent : 0;
                  const strokeDasharray = `${pct * circumference} ${circumference}`;
                  const strokeDashoffset = -accumulatedAngle * circumference;
                  accumulatedAngle += pct;

                  return (
                    <circle
                      key={idx}
                      cx={cx}
                      cy={cy}
                      r={radius}
                      fill="transparent"
                      stroke={meta.color}
                      strokeWidth={strokeWidth}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-500 hover:opacity-90 cursor-pointer"
                    />
                  );
                })}
              </svg>

              {/* Center Total in Donut */}
              <div className="absolute text-center">
                <span className="text-[11px] uppercase font-bold text-neutral-400 tracking-wider block">
                  Total Spent
                </span>
                <span className="text-xl font-extrabold font-mono text-neutral-900 dark:text-white">
                  {formatCurrency(totalSpent, group.currency)}
                </span>
              </div>
            </div>

            {/* Accessible List alongside chart */}
            <div className="space-y-3">
              {categories.map((cat) => {
                const meta = getCategoryMeta(cat.category);
                return (
                  <div key={cat.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: meta.color }}
                        />
                        <span className="text-neutral-900 dark:text-white">{cat.category}</span>
                        <span className="text-neutral-400">({cat.count})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-neutral-900 dark:text-white">
                          {formatCurrency(cat.total, group.currency)}
                        </span>
                        <span className="font-mono text-neutral-400 text-[11px] w-10 text-right">
                          {cat.percentage}%
                        </span>
                      </div>
                    </div>
                    {/* Bar */}
                    <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${cat.percentage}%`, backgroundColor: meta.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Individual Breakdown Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
        <div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
            Individual Breakdown
          </h3>
          <p className="text-xs text-neutral-500">
            Comparison of total paid vs fair share consumed by each person
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 font-bold uppercase tracking-wider">
                <th className="pb-3 pl-2">Participant</th>
                <th className="pb-3 text-right">Total Paid</th>
                <th className="pb-3 text-right">Fair Share</th>
                <th className="pb-3 text-right pr-2">Net Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 font-medium">
              {balances.map((b) => (
                <tr key={b.personId} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                  <td className="py-3 pl-2 flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: b.avatarColor }}
                    />
                    <span>{b.personName}</span>
                  </td>
                  <td className="py-3 text-right font-mono text-neutral-700 dark:text-neutral-300">
                    {formatCurrency(b.totalPaid, group.currency)}
                  </td>
                  <td className="py-3 text-right font-mono text-neutral-500">
                    {formatCurrency(b.totalShare, group.currency)}
                  </td>
                  <td className="py-3 text-right font-mono font-bold pr-2">
                    {b.status === 'settled' ? (
                      <span className="text-neutral-400">0.00</span>
                    ) : b.status === 'gets' ? (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(b.netBalance, group.currency)}
                      </span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400">
                        -{formatCurrency(Math.abs(b.netBalance), group.currency)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
