import React, { useState } from 'react';
import { GroupData, Person, Expense, PersonBalance, SettlementTransaction, SpendingInsights } from '../types';
import { formatCurrency } from '../utils/currencies';
import { ExpenseList } from './ExpenseList';
import { SettlementView } from './SettlementView';
import { InsightsView } from './InsightsView';
import { AdSlot } from './AdSlot';
import {
  Users,
  Receipt,
  CheckCircle2,
  TrendingUp,
  Plus,
  ArrowRight,
  ShieldCheck,
  Edit2,
  PieChart,
  UserCheck,
  CreditCard,
  Sparkles,
} from 'lucide-react';

interface DashboardProps {
  group: GroupData;
  balances: PersonBalance[];
  settlements: SettlementTransaction[];
  insights: SpendingInsights;
  onAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onDuplicateExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
  onOpenPeopleManager: () => void;
  onTogglePaymentPaid: (txId: string) => void;
  onResetProgress: () => void;
  activeTab: 'overview' | 'expenses' | 'people' | 'settle' | 'insights';
  onChangeTab: (tab: 'overview' | 'expenses' | 'people' | 'settle' | 'insights') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  group,
  balances,
  settlements,
  insights,
  onAddExpense,
  onEditExpense,
  onDuplicateExpense,
  onDeleteExpense,
  onOpenPeopleManager,
  onTogglePaymentPaid,
  onResetProgress,
  activeTab,
  onChangeTab,
}) => {
  const [currentUserPersonId, setCurrentUserPersonId] = useState<string>(group.people[0]?.id || '');

  const { totalSpent, averagePerPerson } = insights;
  const currentPersonBalance = balances.find((b) => b.personId === currentUserPersonId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-12 space-y-6">
      {/* Top Group Banner & Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200/80 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 mb-1">
            <span>Group Dashboard</span>
            <span>•</span>
            <span className="font-mono">{group.currency}</span>
            <span>•</span>
            <span>{group.people.length} / 50 participants</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            {group.name}
          </h1>
        </div>

        {/* Desktop View Navigation Tabs (Section 52: Overview, Expenses, People, Settle, Insights) */}
        <div className="flex items-center bg-neutral-100 dark:bg-neutral-800/80 p-1 rounded-2xl text-xs font-bold self-start md:self-auto overflow-x-auto max-w-full">
          {(
            [
              { id: 'overview' as const, label: 'Overview', icon: Receipt },
              { id: 'expenses' as const, label: 'Expenses', icon: CreditCard, count: group.expenses.length },
              { id: 'people' as const, label: 'People', icon: Users, count: group.people.length },
              { id: 'settle' as const, label: 'Settle', icon: CheckCircle2, badge: settlements.length },
              { id: 'insights' as const, label: 'Insights', icon: PieChart },
            ] as Array<{
              id: 'overview' | 'expenses' | 'people' | 'settle' | 'insights';
              label: string;
              icon: any;
              count?: number;
              badge?: number;
            }>
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-mono">
                    {tab.count}
                  </span>
                )}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-600 text-white font-mono font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Stat Cards (Section 9: Total Spent, Per Person, You Paid, Your Balance) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Spent */}
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                Total Spent
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-neutral-900 dark:text-white">
                {formatCurrency(totalSpent, group.currency)}
              </div>
              <div className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                <span>{group.expenses.length} expenses recorded</span>
              </div>
            </div>

            {/* Average Per Person */}
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                Per Person
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-neutral-900 dark:text-white">
                {formatCurrency(averagePerPerson, group.currency)}
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                Split across {group.people.length} friends
              </div>
            </div>

            {/* You Paid */}
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  You Paid
                </span>
                <select
                  value={currentUserPersonId}
                  onChange={(e) => setCurrentUserPersonId(e.target.value)}
                  className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-transparent border-none p-0 cursor-pointer focus:outline-none"
                  title="Switch current user"
                >
                  {group.people.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-neutral-900 dark:text-white">
                {formatCurrency(currentPersonBalance?.totalPaid || 0, group.currency)}
              </div>
              <div className="text-xs text-neutral-500 mt-1 truncate">
                for {currentPersonBalance?.personName}
              </div>
            </div>

            {/* Your Balance */}
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                Your Balance
              </span>
              <div
                className={`text-2xl sm:text-3xl font-extrabold font-mono ${
                  !currentPersonBalance || currentPersonBalance.status === 'settled'
                    ? 'text-neutral-900 dark:text-white'
                    : currentPersonBalance.status === 'gets'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {currentPersonBalance?.status === 'settled'
                  ? '0.00'
                  : currentPersonBalance?.status === 'gets'
                  ? `+${formatCurrency(currentPersonBalance.netBalance, group.currency)}`
                  : `-${formatCurrency(Math.abs(currentPersonBalance?.netBalance || 0), group.currency)}`}
              </div>
              <div className="text-xs font-semibold mt-1">
                {!currentPersonBalance || currentPersonBalance.status === 'settled' ? (
                  <span className="text-neutral-500">Settled</span>
                ) : currentPersonBalance.status === 'gets' ? (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Gets {formatCurrency(currentPersonBalance.netBalance, group.currency)}
                  </span>
                ) : (
                  <span className="text-rose-600 dark:text-rose-400">
                    Owes {formatCurrency(Math.abs(currentPersonBalance.netBalance), group.currency)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Settlement Preview Banner */}
          <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-emerald-950 dark:text-emerald-200">
                  {settlements.length === 0
                    ? 'All Balances Settled'
                    : `${settlements.length} ${settlements.length === 1 ? 'payment' : 'payments'} to settle everyone`}
                </h3>
                <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80">
                  KeKake simplifies circular debts into the minimum number of payments.
                </p>
              </div>
            </div>

            <button
              onClick={() => onChangeTab('settle')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 self-start sm:self-auto active:scale-95"
            >
              <span>View Settlement Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Ad slot below summary */}
          <AdSlot slotId="dashboard-below-summary" />

          {/* Desktop 2-Column: Left People Sidebar + Right Expenses Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: People & Balances (Section 8 & 9) */}
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider">
                      People ({group.people.length}/50)
                    </h3>
                  </div>
                  <button
                    onClick={onOpenPeopleManager}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Manage</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  {balances.map((b) => (
                    <div
                      key={b.personId}
                      className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm"
                          style={{ backgroundColor: b.avatarColor }}
                        >
                          {b.personName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-sm text-neutral-900 dark:text-white truncate block">
                            {b.personName}
                          </span>
                          <span className="text-[11px] text-neutral-400 block font-mono">
                            {formatCurrency(b.totalPaid, group.currency)} paid
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {b.status === 'settled' ? (
                          <span className="text-xs font-semibold text-neutral-400">Settled</span>
                        ) : b.status === 'gets' ? (
                          <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            Gets {formatCurrency(b.netBalance, group.currency)}
                          </div>
                        ) : (
                          <div className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                            Owes {formatCurrency(Math.abs(b.netBalance), group.currency)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={onOpenPeopleManager}
                  className="w-full py-2.5 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-emerald-500 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add / Edit People</span>
                </button>
              </div>
            </div>

            {/* Right Column: Recent Expenses (Section 9) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                  Expenses Timeline
                </h3>
                <button
                  onClick={onAddExpense}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Expense</span>
                </button>
              </div>

              <ExpenseList
                expenses={group.expenses}
                people={group.people}
                currency={group.currency}
                onAddExpense={onAddExpense}
                onEditExpense={onEditExpense}
                onDuplicateExpense={onDuplicateExpense}
                onDeleteExpense={onDeleteExpense}
              />
            </div>
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">All Expenses</h2>
            <button
              onClick={onAddExpense}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>

          <ExpenseList
            expenses={group.expenses}
            people={group.people}
            currency={group.currency}
            onAddExpense={onAddExpense}
            onEditExpense={onEditExpense}
            onDuplicateExpense={onDuplicateExpense}
            onDeleteExpense={onDeleteExpense}
          />
        </div>
      )}

      {/* People Tab */}
      {activeTab === 'people' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                Participants ({group.people.length}/50)
              </h2>
              <p className="text-xs text-neutral-500">
                Individual totals and balance calculations
              </p>
            </div>
            <button
              onClick={onOpenPeopleManager}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Person</span>
            </button>
          </div>

          {/* Participant Cards Grid (Section 8) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {balances.map((b) => (
              <div
                key={b.personId}
                className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex flex-col justify-between gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
                      style={{ backgroundColor: b.avatarColor }}
                    >
                      {b.personName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                        {b.personName}
                      </h3>
                      <span className="text-xs text-neutral-400 font-mono">
                        {formatCurrency(b.totalPaid, group.currency)} paid
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-400">Balance</span>
                  <div className="text-right">
                    {b.status === 'settled' ? (
                      <span className="text-xs font-bold text-neutral-500">Settled (0.00)</span>
                    ) : b.status === 'gets' ? (
                      <span className="text-sm font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                        Gets {formatCurrency(b.netBalance, group.currency)}
                      </span>
                    ) : (
                      <span className="text-sm font-mono font-extrabold text-rose-600 dark:text-rose-400">
                        Owes {formatCurrency(Math.abs(b.netBalance), group.currency)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settle Tab */}
      {activeTab === 'settle' && (
        <SettlementView
          group={group}
          people={group.people}
          balances={balances}
          settlements={settlements}
          totalSpent={totalSpent}
          settlementProgress={group.settlementProgress}
          onTogglePaymentPaid={onTogglePaymentPaid}
          onResetProgress={onResetProgress}
        />
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <InsightsView group={group} insights={insights} balances={balances} />
      )}

      {/* Dashboard Footer */}
      <footer className="pt-8 pb-4 text-center border-t border-neutral-200/60 dark:border-neutral-800/60">
        <div className="flex flex-col items-center justify-center gap-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span>...Made by Sarathi with love</span>
            <span className="text-rose-500">❤️</span>
          </div>
          <div className="text-[11px] text-neutral-400 dark:text-neutral-500">
            KeKake • Group expenses without the group-math headache
          </div>
        </div>
      </footer>

      {/* Section 10: Mobile Bottom Sticky Navigation & Sticky Add Button */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 px-4 py-2 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => onChangeTab('overview')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold py-1 ${
            activeTab === 'overview'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-neutral-400 hover:text-neutral-700'
          }`}
        >
          <Receipt className="w-5 h-5" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => onChangeTab('expenses')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold py-1 ${
            activeTab === 'expenses'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-neutral-400 hover:text-neutral-700'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span>Expenses</span>
        </button>

        {/* Center Sticky Add Expense Button */}
        <button
          onClick={onAddExpense}
          className="-mt-5 w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/40 active:scale-95 transition-transform"
          title="Add Expense"
          aria-label="Add Expense"
        >
          <Plus className="w-6 h-6" />
        </button>

        <button
          onClick={() => onChangeTab('people')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold py-1 ${
            activeTab === 'people'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-neutral-400 hover:text-neutral-700'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>People</span>
        </button>

        <button
          onClick={() => onChangeTab('settle')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold py-1 ${
            activeTab === 'settle'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-neutral-400 hover:text-neutral-700'
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Settle</span>
        </button>
      </div>
    </div>
  );
};
