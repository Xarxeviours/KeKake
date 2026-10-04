import React, { useState } from 'react';
import { SUPPORTED_CURRENCIES } from '../utils/currencies';
import { X, Users, AlertCircle, Plus, Trash2, Sparkles } from 'lucide-react';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (name: string, currency: string, peopleNames: string[]) => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onCreateGroup,
}) => {
  const [groupName, setGroupName] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [personInput, setPersonInput] = useState('');
  const [people, setPeople] = useState<string[]>(['Sarathi', 'Rahul', 'Sneha']);
  const [nameError, setNameError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddPerson = () => {
    const trimmed = personInput.trim();
    if (!trimmed) return;

    if (people.length >= 50) {
      setNameError("You've reached the 50-person limit.");
      return;
    }

    // Check duplicate
    let finalName = trimmed;
    const existingMatches = people.filter(
      (p) => p.toLowerCase() === trimmed.toLowerCase() || p.toLowerCase().startsWith(`${trimmed.toLowerCase()} `)
    );

    if (existingMatches.length > 0) {
      finalName = `${trimmed} ${existingMatches.length + 1}`;
    }

    setPeople([...people, finalName]);
    setPersonInput('');
    setNameError(null);
  };

  const handleRemovePerson = (index: number) => {
    setPeople(people.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddPerson();
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (people.length < 2) {
      setNameError('Please add at least 2 participants to calculate expenses.');
      return;
    }

    onCreateGroup(groupName.trim() || 'Trip Expenses', currency, people);
    onClose();
  };

  const isAtLimit = people.length >= 50;
  const isApproachingLimit = people.length >= 45 && !isAtLimit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Create New Group</h2>
              <p className="text-xs text-neutral-500">Calculate balances and settle with friends</p>
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
        <form onSubmit={handleCreate} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Group Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
              Group Name <span className="text-neutral-400 font-normal lowercase">(optional)</span>
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Goa Trip 2026, Flatmates, Dinner with Friends"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
            />
          </div>

          {/* Currency */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Section 7: Add People */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
                People in Group
              </label>
              <span
                className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full ${
                  isAtLimit
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                    : isApproachingLimit
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                {people.length} / 50
              </span>
            </div>

            {/* Input + Add button */}
            <div className="flex gap-2">
              <input
                type="text"
                value={personInput}
                onChange={(e) => {
                  setPersonInput(e.target.value);
                  if (nameError) setNameError(null);
                }}
                onKeyDown={handleKeyDown}
                disabled={isAtLimit}
                placeholder={isAtLimit ? "50-person limit reached" : "Enter a person's name"}
                className="flex-1 px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleAddPerson}
                disabled={isAtLimit || !personInput.trim()}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-sm transition-all flex items-center gap-1 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            {/* Warnings */}
            {isApproachingLimit && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                You can add up to 50 people.
              </p>
            )}

            {isAtLimit && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5 flex items-center gap-1 font-bold">
                <AlertCircle className="w-3.5 h-3.5" />
                You've reached the 50-person limit.
              </p>
            )}

            {nameError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {nameError}
              </p>
            )}

            {/* Chips list of people */}
            <div className="mt-3.5 max-h-48 overflow-y-auto pr-1">
              <div className="flex flex-wrap gap-2">
                {people.map((person, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700 text-sm font-medium text-neutral-800 dark:text-neutral-200 group"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{person}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePerson(idx)}
                      className="text-neutral-400 hover:text-rose-500 transition-colors ml-1"
                      title={`Remove ${person}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={people.length < 2}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Group & Start Adding Expenses</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
