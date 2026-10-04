import React, { useState } from 'react';
import { Person, Expense } from '../types';
import { getAvatarColor } from '../utils/currencies';
import { generateId } from '../utils/storage';
import { X, Users, Plus, Edit2, Trash2, Check, AlertTriangle, AlertCircle } from 'lucide-react';

interface PeopleManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  people: Person[];
  expenses: Expense[];
  onAddPerson: (person: Person) => void;
  onUpdatePerson: (personId: string, newName: string) => void;
  onRemovePerson: (personId: string) => void;
}

export const PeopleManagerModal: React.FC<PeopleManagerModalProps> = ({
  isOpen,
  onClose,
  people,
  expenses,
  onAddPerson,
  onUpdatePerson,
  onRemovePerson,
}) => {
  const [newPersonName, setNewPersonName] = useState('');
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isAtLimit = people.length >= 50;
  const isApproachingLimit = people.length >= 45 && !isAtLimit;

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newPersonName.trim();
    if (!trimmed) return;

    if (people.length >= 50) {
      setErrorMsg("You've reached the 50-person limit.");
      return;
    }

    // Check duplicate
    let finalName = trimmed;
    const existingMatches = people.filter(
      (p) =>
        p.name.toLowerCase() === trimmed.toLowerCase() ||
        p.name.toLowerCase().startsWith(`${trimmed.toLowerCase()} `)
    );

    if (existingMatches.length > 0) {
      finalName = `${trimmed} ${existingMatches.length + 1}`;
    }

    const newPerson: Person = {
      id: generateId('p'),
      name: finalName,
      avatarColor: getAvatarColor(people.length),
      createdAt: Date.now(),
    };

    onAddPerson(newPerson);
    setNewPersonName('');
    setErrorMsg(null);
  };

  const startEdit = (person: Person) => {
    setEditingPersonId(person.id);
    setEditingName(person.name);
  };

  const saveEdit = (personId: string) => {
    const trimmed = editingName.trim();
    if (trimmed) {
      onUpdatePerson(personId, trimmed);
    }
    setEditingPersonId(null);
    setEditingName('');
  };

  const getExpensesCountForPerson = (personId: string): number => {
    return expenses.filter(
      (e) => e.paidBy.some((pb) => pb.personId === personId) || e.participants.includes(personId)
    ).length;
  };

  const handleDeleteClick = (person: Person) => {
    const associatedExpenses = getExpensesCountForPerson(person.id);
    if (associatedExpenses > 0) {
      setConfirmDeleteId(person.id);
    } else {
      onRemovePerson(person.id);
    }
  };

  const confirmDelete = (personId: string) => {
    onRemovePerson(personId);
    setConfirmDeleteId(null);
  };

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
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Manage People</h2>
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
              <p className="text-xs text-neutral-500">Edit or add friends up to 50 people</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Add input */}
          <form onSubmit={handleAdd}>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPersonName}
                onChange={(e) => {
                  setNewPersonName(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                disabled={isAtLimit}
                placeholder={isAtLimit ? "50-person limit reached" : "Enter friend's name"}
                className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isAtLimit || !newPersonName.trim()}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-sm transition-all flex items-center gap-1 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            {isApproachingLimit && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                You can add up to 50 people.
              </p>
            )}

            {isAtLimit && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-2 flex items-center gap-1 font-bold">
                <AlertCircle className="w-3.5 h-3.5" />
                You've reached the 50-person limit.
              </p>
            )}

            {errorMsg && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-2 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errorMsg}
              </p>
            )}
          </form>

          {/* List of people */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Current Participants ({people.length})
            </span>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {people.map((person) => {
                const isEditing = editingPersonId === person.id;
                const isConfirming = confirmDeleteId === person.id;
                const expenseCount = getExpensesCountForPerson(person.id);

                return (
                  <div
                    key={person.id}
                    className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between gap-3 transition-colors"
                  >
                    {/* Left: Avatar & Name */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm"
                        style={{ backgroundColor: person.avatarColor }}
                      >
                        {person.name.charAt(0).toUpperCase()}
                      </div>

                      {isEditing ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveEdit(person.id)}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            autoFocus
                          />
                          <button
                            onClick={() => saveEdit(person.id)}
                            className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="min-w-0">
                          <div className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 truncate">
                            {person.name}
                          </div>
                          {expenseCount > 0 && (
                            <div className="text-[11px] text-neutral-500">
                              Linked to {expenseCount} {expenseCount === 1 ? 'expense' : 'expenses'}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    {!isEditing && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => startEdit(person)}
                          className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60 transition-colors"
                          title="Edit name"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(person)}
                          disabled={people.length <= 1}
                          className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-30"
                          title="Remove person"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Warning confirmation if person has expenses */}
                    {isConfirming && (
                      <div className="absolute inset-x-4 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950 border border-amber-300 dark:border-amber-800 shadow-xl z-20 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-200">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>
                            {person.name} is included in {expenseCount} expenses. Removing them will affect calculations.
                          </span>
                        </div>
                        <div className="flex justify-end gap-2 text-xs font-semibold">
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-3 py-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => confirmDelete(person.id)}
                            className="px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-500"
                          >
                            Remove Anyway
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-sm hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
