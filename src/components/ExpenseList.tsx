import React, { useState, useMemo } from 'react';
import { Expense, Person } from '../types';
import { getCategoryMeta, formatCurrency } from '../utils/currencies';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Copy,
  Trash2,
  Calendar,
  Receipt,
  Users,
  ChevronDown,
  X,
} from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  people: Person[];
  currency: string;
  onAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onDuplicateExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  people,
  currency,
  onAddExpense,
  onEditExpense,
  onDuplicateExpense,
  onDeleteExpense,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPayer, setSelectedPayer] = useState<string>('all');

  const peopleMap = useMemo(() => {
    const map = new Map<string, Person>();
    people.forEach((p) => map.set(p.id, p));
    return map;
  }, [people]);

  // Filtered & sorted newest first
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((expense) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = expense.title.toLowerCase().includes(q);
          const matchNotes = expense.notes ? expense.notes.toLowerCase().includes(q) : false;
          const matchCategory = expense.category.toLowerCase().includes(q);
          const matchAmount = expense.amount.toString().includes(q);
          if (!matchTitle && !matchNotes && !matchCategory && !matchAmount) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'all') {
          if (expense.category.toLowerCase() !== selectedCategory.toLowerCase()) {
            return false;
          }
        }

        // Payer filter
        if (selectedPayer !== 'all') {
          const isPayer = expense.paidBy.some((pb) => pb.personId === selectedPayer);
          if (!isPayer) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Sort by date + time descending
        const dateA = new Date(`${a.date}T${a.time || '12:00'}`).getTime();
        const dateB = new Date(`${b.date}T${b.time || '12:00'}`).getTime();
        return dateB - dateA || b.createdAt - a.createdAt;
      });
  }, [expenses, searchQuery, selectedCategory, selectedPayer]);

  // Format date header helper (Today, Yesterday, or Formatted Date)
  const formatFriendlyDate = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (dateStr === today) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';

    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getPayerDescription = (expense: Expense) => {
    if (expense.paidBy.length === 0) return 'No payer recorded';
    if (expense.paidBy.length === 1) {
      const p = peopleMap.get(expense.paidBy[0].personId);
      return (
        <span className="font-semibold text-neutral-800 dark:text-neutral-200">
          {p ? p.name : 'Unknown'}
        </span>
      );
    }
    const names = expense.paidBy
      .map((pb) => peopleMap.get(pb.personId)?.name || 'Unknown')
      .slice(0, 2)
      .join(', ');
    const extra = expense.paidBy.length > 2 ? ` +${expense.paidBy.length - 2}` : '';
    return (
      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
        {names}
        {extra} (jointly)
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expenses..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Categories</option>
            {Array.from(new Set(expenses.map((e) => e.category))).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Payer Filter */}
          <select
            value={selectedPayer}
            onChange={(e) => setSelectedPayer(e.target.value)}
            className="px-2.5 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Payers</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                Paid by {p.name}
              </option>
            ))}
          </select>

          {/* Add Expense Quick Action */}
          <button
            onClick={onAddExpense}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredExpenses.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4">
            <Receipt className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">
            {expenses.length === 0 ? 'No expenses yet' : 'No matching expenses'}
          </h3>
          <p className="text-sm text-neutral-500 max-w-sm mx-auto mb-6">
            {expenses.length === 0
              ? 'Add your first expense and let KeKake handle the math.'
              : 'Try changing your search query or filters to find what you are looking for.'}
          </p>
          {expenses.length === 0 ? (
            <button
              onClick={onAddExpense}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all inline-flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Expense</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedPayer('all');
              }}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        /* Expenses Timeline Cards */
        <div className="space-y-3">
          {filteredExpenses.map((expense) => {
            const catMeta = getCategoryMeta(expense.category);
            const friendlyDate = formatFriendlyDate(expense.date);
            const participantCount = expense.participants.length;
            const avgPerPerson = participantCount > 0 ? expense.amount / participantCount : 0;

            return (
              <div
                key={expense.id}
                className="group p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left: Category Icon + Title + Meta */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-sm"
                    style={{ backgroundColor: `${catMeta.color}15`, border: `1px solid ${catMeta.color}30` }}
                  >
                    {catMeta.icon}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-base text-neutral-900 dark:text-white truncate">
                        {expense.title}
                      </h4>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium">
                        {friendlyDate}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 flex items-center gap-2 flex-wrap">
                      <span>Paid by {getPayerDescription(expense)}</span>
                      <span>•</span>
                      <span>
                        Split between {participantCount}{' '}
                        {participantCount === 1 ? 'person' : 'people'}
                      </span>
                      {expense.splitType !== 'equal' && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                          {expense.splitType}
                        </span>
                      )}
                    </div>

                    {expense.notes && (
                      <p className="text-xs text-neutral-500 italic mt-1.5 flex items-center gap-1">
                        <span>💬</span>
                        <span>{expense.notes}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100 dark:border-neutral-800">
                  <div className="text-left sm:text-right">
                    <div className="font-mono font-extrabold text-lg text-neutral-900 dark:text-white">
                      {formatCurrency(expense.amount, currency)}
                    </div>
                    {participantCount > 0 && expense.splitType === 'equal' && (
                      <div className="text-[11px] font-mono text-neutral-400">
                        {formatCurrency(avgPerPerson, currency)}/person
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditExpense(expense)}
                      className="p-2 text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      title="Edit expense"
                      aria-label="Edit expense"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDuplicateExpense(expense)}
                      className="p-2 text-neutral-400 hover:text-emerald-600 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                      title="Duplicate expense"
                      aria-label="Duplicate expense"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteExpense(expense.id)}
                      className="p-2 text-neutral-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete expense"
                      aria-label="Delete expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
