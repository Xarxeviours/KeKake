import React, { useState, useEffect } from 'react';
import { Expense, Person, SplitType, PaidByItem } from '../types';
import { EXPENSE_CATEGORIES, formatCurrency } from '../utils/currencies';
import { generateId } from '../utils/storage';
import { toCents, fromCents } from '../utils/calculationEngine';
import {
  X,
  Receipt,
  Users,
  Check,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  Plus,
  Trash2,
} from 'lucide-react';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExpense: (expense: Expense) => void;
  people: Person[];
  currency: string;
  initialExpense?: Expense | null;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSaveExpense,
  people,
  currency,
  initialExpense,
}) => {
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [category, setCategory] = useState('Food');
  const [customCategory, setCustomCategory] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isMultiplePayers, setIsMultiplePayers] = useState(false);
  const [singlePayerId, setSinglePayerId] = useState('');
  const [multiPayers, setMultiPayers] = useState<Record<string, string>>({}); // personId -> amount string
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [customShares, setCustomShares] = useState<Record<string, string>>({});
  const [percentageShares, setPercentageShares] = useState<Record<string, string>>({});
  const [sharesMap, setSharesMap] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Initialize or reset form state when modal opens or initialExpense changes
  useEffect(() => {
    if (!isOpen) return;

    if (initialExpense) {
      setTitle(initialExpense.title);
      setAmountStr(initialExpense.amount.toString());
      setCategory(initialExpense.category);
      setDate(initialExpense.date || new Date().toISOString().split('T')[0]);
      setTime(initialExpense.time || '12:00');
      setNotes(initialExpense.notes || '');
      setSplitType(initialExpense.splitType || 'equal');
      setSelectedParticipants(
        initialExpense.participants.length > 0 ? initialExpense.participants : people.map((p) => p.id)
      );

      // Paid by
      if (initialExpense.paidBy.length > 1) {
        setIsMultiplePayers(true);
        const map: Record<string, string> = {};
        initialExpense.paidBy.forEach((pb) => {
          map[pb.personId] = pb.amount.toString();
        });
        setMultiPayers(map);
        setSinglePayerId(people[0]?.id || '');
      } else {
        setIsMultiplePayers(false);
        setSinglePayerId(initialExpense.paidBy[0]?.personId || people[0]?.id || '');
        setMultiPayers({});
      }

      // Splits
      if (initialExpense.customShares) {
        const cMap: Record<string, string> = {};
        Object.entries(initialExpense.customShares).forEach(([k, v]) => (cMap[k] = v.toString()));
        setCustomShares(cMap);
      }
      if (initialExpense.percentageShares) {
        const pMap: Record<string, string> = {};
        Object.entries(initialExpense.percentageShares).forEach(([k, v]) => (pMap[k] = v.toString()));
        setPercentageShares(pMap);
      }
      if (initialExpense.shares) {
        const sMap: Record<string, string> = {};
        Object.entries(initialExpense.shares).forEach(([k, v]) => (sMap[k] = v.toString()));
        setSharesMap(sMap);
      }
    } else {
      // Default new expense
      const now = new Date();
      setTitle('');
      setAmountStr('');
      setCategory('Food');
      setCustomCategory('');
      setDate(now.toISOString().split('T')[0]);
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hours}:${mins}`);
      setIsMultiplePayers(false);
      setSinglePayerId(people[0]?.id || '');
      setMultiPayers({});
      setSelectedParticipants(people.map((p) => p.id));
      setSplitType('equal');
      setCustomShares({});
      setPercentageShares({});
      setSharesMap({});
      setNotes('');
    }
    setFormError(null);
  }, [isOpen, initialExpense, people]);

  if (!isOpen) return null;

  const totalAmount = parseFloat(amountStr) || 0;
  const totalAmountCents = toCents(totalAmount);

  // Helper calculations for split validations
  // 1. Multi payers validation
  let multiPayerTotalCents = 0;
  Object.values(multiPayers).forEach((val) => {
    multiPayerTotalCents += toCents(parseFloat(val) || 0);
  });
  const multiPayerDiffCents = totalAmountCents - multiPayerTotalCents;

  // 2. Custom split validation
  let customAllocatedCents = 0;
  selectedParticipants.forEach((pid) => {
    customAllocatedCents += toCents(parseFloat(customShares[pid] || '0') || 0);
  });
  const customRemainingCents = totalAmountCents - customAllocatedCents;

  // 3. Percentage validation
  let percentageTotal = 0;
  selectedParticipants.forEach((pid) => {
    percentageTotal += parseFloat(percentageShares[pid] || '0') || 0;
  });
  const percentageDiff = 100 - percentageTotal;

  // 4. Shares validation
  let totalSharesCount = 0;
  selectedParticipants.forEach((pid) => {
    totalSharesCount += parseFloat(sharesMap[pid] || '0') || 0;
  });

  const handleSelectAllParticipants = () => {
    setSelectedParticipants(people.map((p) => p.id));
  };

  const handleClearAllParticipants = () => {
    setSelectedParticipants([]);
  };

  const toggleParticipant = (personId: string) => {
    if (selectedParticipants.includes(personId)) {
      setSelectedParticipants(selectedParticipants.filter((id) => id !== personId));
    } else {
      setSelectedParticipants([...selectedParticipants, personId]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setFormError('Please enter what the expense was for.');
      return;
    }

    if (totalAmount <= 0) {
      setFormError('Please enter a valid expense amount greater than 0.');
      return;
    }

    if (selectedParticipants.length === 0) {
      setFormError('Please select at least one person who shared this expense.');
      return;
    }

    // Build paidBy list
    let paidBy: PaidByItem[] = [];
    if (isMultiplePayers) {
      if (Math.abs(multiPayerDiffCents) > 1) {
        setFormError(
          `Sum of payer amounts (${formatCurrency(fromCents(multiPayerTotalCents), currency)}) must equal total expense (${formatCurrency(totalAmount, currency)}). Difference: ${formatCurrency(fromCents(Math.abs(multiPayerDiffCents)), currency)}`
        );
        return;
      }
      paidBy = Object.entries(multiPayers)
        .map(([personId, val]) => ({
          personId,
          amount: parseFloat(val) || 0,
        }))
        .filter((item) => item.amount > 0);

      if (paidBy.length === 0) {
        setFormError('Please enter who paid and how much.');
        return;
      }
    } else {
      if (!singlePayerId) {
        setFormError('Please select who paid for this expense.');
        return;
      }
      paidBy = [{ personId: singlePayerId, amount: totalAmount }];
    }

    // Split validation
    let finalCustomShares: Record<string, number> | undefined;
    let finalPercentageShares: Record<string, number> | undefined;
    let finalShares: Record<string, number> | undefined;

    if (splitType === 'custom') {
      if (Math.abs(customRemainingCents) > 1) {
        setFormError(
          `Custom shares must match total expense (${formatCurrency(totalAmount, currency)}). Remaining: ${formatCurrency(fromCents(Math.abs(customRemainingCents)), currency)}`
        );
        return;
      }
      finalCustomShares = {};
      selectedParticipants.forEach((pid) => {
        finalCustomShares![pid] = parseFloat(customShares[pid] || '0') || 0;
      });
    } else if (splitType === 'percentage') {
      if (Math.abs(percentageDiff) > 0.05) {
        setFormError(`Percentages must total exactly 100%. Currently: ${percentageTotal.toFixed(1)}%`);
        return;
      }
      finalPercentageShares = {};
      selectedParticipants.forEach((pid) => {
        finalPercentageShares![pid] = parseFloat(percentageShares[pid] || '0') || 0;
      });
    } else if (splitType === 'shares') {
      if (totalSharesCount <= 0) {
        setFormError('Total shares must be greater than 0.');
        return;
      }
      finalShares = {};
      selectedParticipants.forEach((pid) => {
        finalShares![pid] = parseFloat(sharesMap[pid] || '1') || 1;
      });
    }

    const finalCategory = category === 'Custom' ? customCategory.trim() || 'Other' : category;

    const newExpense: Expense = {
      id: initialExpense ? initialExpense.id : generateId('exp'),
      title: trimmedTitle,
      amount: totalAmount,
      category: finalCategory,
      date: date || new Date().toISOString().split('T')[0],
      time: time || '12:00',
      paidBy,
      splitType,
      participants: selectedParticipants,
      customShares: finalCustomShares,
      percentageShares: finalPercentageShares,
      shares: finalShares,
      notes: notes.trim(),
      createdAt: initialExpense ? initialExpense.createdAt : Date.now(),
      updatedAt: Date.now(),
    };

    onSaveExpense(newExpense);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                {initialExpense ? 'Edit Expense' : 'Add Expense'}
              </h2>
              <p className="text-xs text-neutral-500">Record who paid and who shared the cost</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {formError && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-2 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Section 11: What was the expense & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
                What was the expense?
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Dinner at Peter Cat, Cab to Airport, Airbnb"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
                Amount ({currency})
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(0, currency).replace(/[0-9.,\s]/g, '') || '$'}
                </span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  placeholder="2500"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base font-bold font-mono"
                />
              </div>
            </div>
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-2">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {EXPENSE_CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-sm'
                        : 'border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-800/40 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span className="truncate">{cat.id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                <span>Date</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>Time (optional)</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Section 12: WHO PAID? */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                Paid by
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                <input
                  type="checkbox"
                  checked={isMultiplePayers}
                  onChange={(e) => {
                    setIsMultiplePayers(e.target.checked);
                    if (e.target.checked && Object.keys(multiPayers).length === 0 && singlePayerId) {
                      setMultiPayers({ [singlePayerId]: amountStr || '0' });
                    }
                  }}
                  className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Multiple people paid</span>
              </label>
            </div>

            {!isMultiplePayers ? (
              <select
                value={singlePayerId}
                onChange={(e) => setSinglePayerId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs text-neutral-500 pb-1">
                  <span>Enter amount paid by each person</span>
                  <span
                    className={`font-mono font-bold ${
                      Math.abs(multiPayerDiffCents) <= 1
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-500'
                    }`}
                  >
                    Total: {formatCurrency(fromCents(multiPayerTotalCents), currency)} /{' '}
                    {formatCurrency(totalAmount, currency)}
                  </span>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {people.map((person) => (
                    <div key={person.id} className="flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 flex-1">
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-white font-bold text-[10px]"
                          style={{ backgroundColor: person.avatarColor }}
                        >
                          {person.name.charAt(0)}
                        </div>
                        <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
                          {person.name}
                        </span>
                      </div>
                      <div className="w-32">
                        <input
                          type="number"
                          step="any"
                          min="0"
                          placeholder="0"
                          value={multiPayers[person.id] || ''}
                          onChange={(e) =>
                            setMultiPayers({
                              ...multiPayers,
                              [person.id]: e.target.value,
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-right font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {Math.abs(multiPayerDiffCents) > 1 && totalAmount > 0 && (
                  <p className="text-xs text-rose-500 font-medium">
                    {multiPayerDiffCents > 0
                      ? `${formatCurrency(fromCents(multiPayerDiffCents), currency)} remaining to assign.`
                      : `Exceeded by ${formatCurrency(fromCents(Math.abs(multiPayerDiffCents)), currency)}.`}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Section 13: WHO SHARED THIS EXPENSE? */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Split between
                </label>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold ml-2">
                  ({selectedParticipants.length} {selectedParticipants.length === 1 ? 'person' : 'people'} selected)
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleSelectAllParticipants}
                  className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                >
                  Select All
                </button>
                <span className="text-neutral-300 dark:text-neutral-700">•</span>
                <button
                  type="button"
                  onClick={handleClearAllParticipants}
                  className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 font-semibold"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Checkbox chips grid */}
            <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto pr-1">
              {people.map((person) => {
                const isChecked = selectedParticipants.includes(person.id);
                return (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => toggleParticipant(person.id)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      isChecked
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{
                        backgroundColor: isChecked ? 'rgba(255,255,255,0.25)' : person.avatarColor,
                        color: isChecked ? '#fff' : '#fff',
                      }}
                    >
                      {person.name.charAt(0)}
                    </span>
                    <span>{person.name}</span>
                    {isChecked && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 14: SPLIT METHODS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
                Split Method
              </label>
            </div>

            {/* Segmented Control */}
            <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-2xl text-xs font-bold">
              {(['equal', 'custom', 'percentage', 'shares'] as SplitType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSplitType(type)}
                  className={`flex-1 py-2 rounded-xl capitalize transition-all ${
                    splitType === type
                      ? 'bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                >
                  {type === 'shares' ? 'Shares' : type}
                </button>
              ))}
            </div>

            {/* Split Details by Method */}
            {splitType === 'equal' && (
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-800 text-xs">
                {selectedParticipants.length > 0 && totalAmount > 0 ? (
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      {formatCurrency(totalAmount, currency)} / {selectedParticipants.length}{' '}
                      {selectedParticipants.length === 1 ? 'person' : 'people'}
                    </span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      ~ {formatCurrency(totalAmount / selectedParticipants.length, currency)} / person
                    </span>
                  </div>
                ) : (
                  <span className="text-neutral-500">
                    Split equally among {selectedParticipants.length} selected people.
                  </span>
                )}
              </div>
            )}

            {splitType === 'custom' && (
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs pb-1 border-b border-neutral-200 dark:border-neutral-700">
                  <span className="font-semibold text-neutral-600 dark:text-neutral-400">Custom exact amounts</span>
                  <span
                    className={`font-mono font-bold ${
                      Math.abs(customRemainingCents) <= 1
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-500'
                    }`}
                  >
                    Allocated: {formatCurrency(fromCents(customAllocatedCents), currency)} /{' '}
                    {formatCurrency(totalAmount, currency)}
                  </span>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedParticipants.map((pid) => {
                    const person = people.find((p) => p.id === pid);
                    if (!person) return null;
                    return (
                      <div key={pid} className="flex items-center justify-between gap-3 text-xs">
                        <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
                          {person.name}
                        </span>
                        <div className="w-32">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            placeholder="0"
                            value={customShares[pid] || ''}
                            onChange={(e) =>
                              setCustomShares({
                                ...customShares,
                                [pid]: e.target.value,
                              })
                            }
                            className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-right font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {Math.abs(customRemainingCents) > 1 && (
                  <p className="text-xs text-rose-500 font-medium">
                    {customRemainingCents > 0
                      ? `${formatCurrency(fromCents(customRemainingCents), currency)} remaining to allocate.`
                      : `Exceeded total by ${formatCurrency(fromCents(Math.abs(customRemainingCents)), currency)}.`}
                  </p>
                )}
              </div>
            )}

            {splitType === 'percentage' && (
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs pb-1 border-b border-neutral-200 dark:border-neutral-700">
                  <span className="font-semibold text-neutral-600 dark:text-neutral-400">Percentage Split</span>
                  <span
                    className={`font-mono font-bold ${
                      Math.abs(percentageDiff) <= 0.05
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-500'
                    }`}
                  >
                    {percentageTotal.toFixed(1)}% / 100% allocated
                  </span>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedParticipants.map((pid) => {
                    const person = people.find((p) => p.id === pid);
                    if (!person) return null;
                    const pctVal = parseFloat(percentageShares[pid] || '0') || 0;
                    const calcAmount = (totalAmount * pctVal) / 100;
                    return (
                      <div key={pid} className="flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
                            {person.name}
                          </span>
                          <span className="text-[11px] text-neutral-400 font-mono">
                            (~{formatCurrency(calcAmount, currency)})
                          </span>
                        </div>
                        <div className="w-24 relative">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            max="100"
                            placeholder="0"
                            value={percentageShares[pid] || ''}
                            onChange={(e) =>
                              setPercentageShares({
                                ...percentageShares,
                                [pid]: e.target.value,
                              })
                            }
                            className="w-full pr-6 pl-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-right font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400">%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {Math.abs(percentageDiff) > 0.05 && (
                  <p className="text-xs text-rose-500 font-medium">
                    Percentages must total 100%. (Current diff: {percentageDiff > 0 ? `+${percentageDiff.toFixed(1)}% needed` : `${percentageDiff.toFixed(1)}% overflow`})
                  </p>
                )}
              </div>
            )}

            {splitType === 'shares' && (
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs pb-1 border-b border-neutral-200 dark:border-neutral-700">
                  <span className="font-semibold text-neutral-600 dark:text-neutral-400">Relative Shares</span>
                  <span className="font-mono font-bold text-neutral-700 dark:text-neutral-300">
                    Total: {totalSharesCount} shares
                  </span>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedParticipants.map((pid) => {
                    const person = people.find((p) => p.id === pid);
                    if (!person) return null;
                    const shares = parseFloat(sharesMap[pid] || '1') || 0;
                    const calculatedShareAmount =
                      totalSharesCount > 0 ? (totalAmount * shares) / totalSharesCount : 0;
                    return (
                      <div key={pid} className="flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
                            {person.name}
                          </span>
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                            (~{formatCurrency(calculatedShareAmount, currency)})
                          </span>
                        </div>
                        <div className="w-24">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            placeholder="1"
                            value={sharesMap[pid] !== undefined ? sharesMap[pid] : '1'}
                            onChange={(e) =>
                              setSharesMap({
                                ...sharesMap,
                                [pid]: e.target.value,
                              })
                            }
                            className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-right font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Section 15: Optional Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-neutral-400" />
              <span>Add a note (optional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Rahul didn't have dessert, or Hotel room for first night only"
              className="w-full px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{initialExpense ? 'Save Changes' : 'Add Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
