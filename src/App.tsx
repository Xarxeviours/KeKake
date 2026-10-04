import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GroupData, Person, Expense } from './types';
import {
  loadActiveGroup,
  saveActiveGroup,
  createDefaultGroup,
  createBlankGroup,
  clearActiveGroup,
  exportGroupToJson,
  validateAndParseImportedJson,
  getSavedTheme,
  setSavedTheme,
  generateId,
} from './utils/storage';
import { calculateBalances, calculateSmartSettlements, calculateInsights } from './utils/calculationEngine';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { CreateGroupModal } from './components/CreateGroupModal';
import { PeopleManagerModal } from './components/PeopleManagerModal';
import { ExpenseModal } from './components/ExpenseModal';
import { SavedProjectsModal } from './components/SavedProjectsModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';

export default function App() {
  const hiddenFileInputRef = useRef<HTMLInputElement>(null);

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => getSavedTheme());

  // Active group data (initialize with saved active group, or default demo group)
  const [group, setGroup] = useState<GroupData>(() => {
    const loaded = loadActiveGroup();
    if (loaded) return loaded;
    return createDefaultGroup('Weekend Trip', 'INR');
  });

  // Navigation view: 'home' or 'dashboard'
  const [view, setView] = useState<'home' | 'dashboard'>('dashboard');

  // Dashboard tab: 'overview' | 'expenses' | 'people' | 'settle' | 'insights'
  const [dashboardTab, setDashboardTab] = useState<'overview' | 'expenses' | 'people' | 'settle' | 'insights'>('overview');

  // Modals state
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isPeopleModalOpen, setIsPeopleModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isSavedProjectsOpen, setIsSavedProjectsOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Sync theme with DOM and localStorage
  useEffect(() => {
    setSavedTheme(theme);
  }, [theme]);

  // Sync active group to localStorage on any change
  useEffect(() => {
    saveActiveGroup(group);
  }, [group]);

  // Derived calculations via pure calculation engine (instant, zero-lag, no floating precision errors)
  const balances = useMemo(() => {
    return calculateBalances(group);
  }, [group]);

  const settlements = useMemo(() => {
    return calculateSmartSettlements(balances);
  }, [balances]);

  const insights = useMemo(() => {
    return calculateInsights(group, balances);
  }, [group, balances]);

  // Theme toggle
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Group creation handler
  const handleCreateNewGroup = (name: string, currency: string, peopleNames: string[]) => {
    const newGroup = createBlankGroup(name, currency, peopleNames);
    setGroup(newGroup);
    setView('dashboard');
    setDashboardTab('overview');
  };

  // Currency change
  const handleChangeCurrency = (newCurrency: string) => {
    setGroup((prev) => ({
      ...prev,
      currency: newCurrency,
      updatedAt: Date.now(),
    }));
  };

  // People operations
  const handleAddPerson = (newPerson: Person) => {
    setGroup((prev) => ({
      ...prev,
      people: [...prev.people, newPerson],
      updatedAt: Date.now(),
    }));
  };

  const handleUpdatePerson = (personId: string, newName: string) => {
    setGroup((prev) => ({
      ...prev,
      people: prev.people.map((p) => (p.id === personId ? { ...p, name: newName } : p)),
      updatedAt: Date.now(),
    }));
  };

  const handleRemovePerson = (personId: string) => {
    setGroup((prev) => {
      // Clean up references in expenses
      const cleanedExpenses = prev.expenses.map((e) => ({
        ...e,
        paidBy: e.paidBy.filter((pb) => pb.personId !== personId),
        participants: e.participants.filter((id) => id !== personId),
      }));

      return {
        ...prev,
        people: prev.people.filter((p) => p.id !== personId),
        expenses: cleanedExpenses,
        updatedAt: Date.now(),
      };
    });
  };

  // Expense operations
  const handleSaveExpense = (savedExpense: Expense) => {
    setGroup((prev) => {
      const exists = prev.expenses.some((e) => e.id === savedExpense.id);
      let updatedExpenses: Expense[];
      if (exists) {
        updatedExpenses = prev.expenses.map((e) => (e.id === savedExpense.id ? savedExpense : e));
      } else {
        updatedExpenses = [savedExpense, ...prev.expenses];
      }

      return {
        ...prev,
        expenses: updatedExpenses,
        updatedAt: Date.now(),
      };
    });
    setEditingExpense(null);
  };

  const handleDuplicateExpense = (expenseToDuplicate: Expense) => {
    const duplicated: Expense = {
      ...expenseToDuplicate,
      id: generateId('exp'),
      title: `${expenseToDuplicate.title} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setGroup((prev) => ({
      ...prev,
      expenses: [duplicated, ...prev.expenses],
      updatedAt: Date.now(),
    }));
  };

  const handleDeleteExpense = (expenseId: string) => {
    setGroup((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== expenseId),
      updatedAt: Date.now(),
    }));
  };

  // Settlement progress toggle (Mark as Paid)
  const handleTogglePaymentPaid = (txId: string) => {
    setGroup((prev) => {
      const current = prev.settlementProgress[txId];
      return {
        ...prev,
        settlementProgress: {
          ...prev.settlementProgress,
          [txId]: !current,
        },
        updatedAt: Date.now(),
      };
    });
  };

  const handleResetProgress = () => {
    setGroup((prev) => ({
      ...prev,
      settlementProgress: {},
      updatedAt: Date.now(),
    }));
  };

  // Reset group handler
  const handleConfirmReset = () => {
    const freshGroup = createBlankGroup('New Group', group.currency, ['Sarathi', 'Rahul', 'Sneha']);
    setGroup(freshGroup);
    clearActiveGroup();
    setDashboardTab('overview');
  };

  // JSON Import trigger
  const handleNavImportClick = () => {
    hiddenFileInputRef.current?.click();
  };

  const handleHiddenFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = validateAndParseImportedJson(content);
      if (res.success && res.data) {
        setGroup(res.data);
        setView('dashboard');
        setDashboardTab('overview');
      } else {
        alert(res.error || 'Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    if (hiddenFileInputRef.current) hiddenFileInputRef.current.value = '';
  };

  return (
    <div className={`min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Hidden File Input for JSON import */}
      <input
        type="file"
        ref={hiddenFileInputRef}
        onChange={handleHiddenFileInputChange}
        accept=".json"
        className="hidden"
      />

      {/* Main Navbar */}
      <Navbar
        currentGroup={group}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenNewGroupModal={() => setIsCreateGroupOpen(true)}
        onOpenSavedProjectsModal={() => setIsSavedProjectsOpen(true)}
        onExportJson={() => exportGroupToJson(group)}
        onImportJsonClick={handleNavImportClick}
        onResetClick={() => setIsResetConfirmOpen(true)}
        onChangeCurrency={handleChangeCurrency}
        onGoHome={() => setView('home')}
        onGoToDashboard={() => setView('dashboard')}
        activeView={view}
      />

      {/* Main Views */}
      <main className="flex-1">
        {view === 'home' ? (
          <LandingPage
            onStartNewGroup={() => setIsCreateGroupOpen(true)}
            onOpenSavedProjects={() => setIsSavedProjectsOpen(true)}
            onOpenExistingGroup={() => setView('dashboard')}
            hasExistingGroup={!!group}
            groupName={group?.name}
          />
        ) : (
          <Dashboard
            group={group}
            balances={balances}
            settlements={settlements}
            insights={insights}
            onAddExpense={() => {
              setEditingExpense(null);
              setIsExpenseModalOpen(true);
            }}
            onEditExpense={(expense) => {
              setEditingExpense(expense);
              setIsExpenseModalOpen(true);
            }}
            onDuplicateExpense={handleDuplicateExpense}
            onDeleteExpense={handleDeleteExpense}
            onOpenPeopleManager={() => setIsPeopleModalOpen(true)}
            onTogglePaymentPaid={handleTogglePaymentPaid}
            onResetProgress={handleResetProgress}
            activeTab={dashboardTab}
            onChangeTab={setDashboardTab}
          />
        )}
      </main>

      {/* Modals */}
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onCreateGroup={handleCreateNewGroup}
      />

      <PeopleManagerModal
        isOpen={isPeopleModalOpen}
        onClose={() => setIsPeopleModalOpen(false)}
        people={group.people}
        expenses={group.expenses}
        onAddPerson={handleAddPerson}
        onUpdatePerson={handleUpdatePerson}
        onRemovePerson={handleRemovePerson}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSaveExpense={handleSaveExpense}
        people={group.people}
        currency={group.currency}
        initialExpense={editingExpense}
      />

      <SavedProjectsModal
        isOpen={isSavedProjectsOpen}
        onClose={() => setIsSavedProjectsOpen(false)}
        activeGroup={group}
        onSelectProject={(selectedGroup) => {
          setGroup(selectedGroup);
          setView('dashboard');
          setDashboardTab('overview');
        }}
        onImportSuccess={(importedGroup) => {
          setGroup(importedGroup);
          setView('dashboard');
          setDashboardTab('overview');
        }}
      />

      <ResetConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirmReset={handleConfirmReset}
        groupName={group.name}
      />
    </div>
  );
}
