import { GroupData, Person, Expense } from '../types';
import { getAvatarColor } from './currencies';

const ACTIVE_GROUP_KEY = 'kekake_active_group_v1';
const RECENT_PROJECTS_KEY = 'kekake_recent_projects_v1';
const THEME_KEY = 'kekake_theme_mode';

export interface SavedProjectMeta {
  id: string;
  name: string;
  currency: string;
  peopleCount: number;
  expensesCount: number;
  totalSpent: number;
  updatedAt: number;
}

export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

export function createDefaultGroup(name: string = 'Goa Trip 2026', currency: string = 'INR'): GroupData {
  const initialNames = ['Sarathi', 'Rahul', 'Sneha', 'Amit', 'Rohit'];
  const people: Person[] = initialNames.map((n, i) => ({
    id: generateId('p'),
    name: n,
    avatarColor: getAvatarColor(i),
    createdAt: Date.now() - (initialNames.length - i) * 60000,
  }));

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  // Provide initial authentic demo expenses matching the prompt example if first-time user
  const expenses: Expense[] = [
    {
      id: generateId('exp'),
      title: 'Dinner at Peter Cat',
      amount: 4500,
      category: 'Food',
      date: dateStr,
      time: '20:30',
      paidBy: [{ personId: people[0].id, amount: 4500 }], // Sarathi paid
      splitType: 'equal',
      participants: people.map((p) => p.id), // all 5
      notes: 'Delicious chelo kebab and drinks',
      createdAt: Date.now() - 3600000 * 4,
      updatedAt: Date.now() - 3600000 * 4,
    },
    {
      id: generateId('exp'),
      title: 'Airport Cab',
      amount: 1450,
      category: 'Transport',
      date: dateStr,
      time: '11:15',
      paidBy: [{ personId: people[1].id, amount: 1450 }], // Rahul paid
      splitType: 'equal',
      participants: [people[0].id, people[1].id, people[2].id], // Sarathi, Rahul, Sneha
      notes: 'Shared cab from Dabolim airport',
      createdAt: Date.now() - 3600000 * 8,
      updatedAt: Date.now() - 3600000 * 8,
    },
    {
      id: generateId('exp'),
      title: 'Beach Shacks & Drinks',
      amount: 2500,
      category: 'Drinks',
      date: dateStr,
      time: '17:00',
      paidBy: [{ personId: people[2].id, amount: 2500 }], // Sneha paid
      splitType: 'equal',
      participants: people.map((p) => p.id),
      notes: 'Sunset refreshments',
      createdAt: Date.now() - 3600000 * 2,
      updatedAt: Date.now() - 3600000 * 2,
    },
  ];

  return {
    id: generateId('grp'),
    name,
    currency,
    people,
    expenses,
    settlementProgress: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function createBlankGroup(name: string, currency: string, initialPeopleNames: string[] = []): GroupData {
  const people: Person[] = initialPeopleNames.map((name, idx) => ({
    id: generateId('p'),
    name: name.trim(),
    avatarColor: getAvatarColor(idx),
    createdAt: Date.now() + idx,
  }));

  return {
    id: generateId('grp'),
    name: name.trim() || 'New Group',
    currency,
    people,
    expenses: [],
    settlementProgress: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function loadActiveGroup(): GroupData | null {
  try {
    const raw = localStorage.getItem(ACTIVE_GROUP_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.people) && Array.isArray(parsed.expenses)) {
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load active group from localStorage', e);
  }
  return null;
}

export function saveActiveGroup(group: GroupData): void {
  try {
    const updated = { ...group, updatedAt: Date.now() };
    localStorage.setItem(ACTIVE_GROUP_KEY, JSON.stringify(updated));

    // Also update in recent projects list
    updateRecentProjectsIndex(updated);
  } catch (e) {
    console.error('Failed to save active group', e);
  }
}

export function getRecentProjects(): SavedProjectMeta[] {
  try {
    const raw = localStorage.getItem(RECENT_PROJECTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function updateRecentProjectsIndex(group: GroupData): void {
  try {
    const totalSpent = group.expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const meta: SavedProjectMeta = {
      id: group.id,
      name: group.name,
      currency: group.currency,
      peopleCount: group.people.length,
      expensesCount: group.expenses.length,
      totalSpent,
      updatedAt: group.updatedAt,
    };

    // Also store the full project data by id for switching
    localStorage.setItem(`kekake_project_${group.id}`, JSON.stringify(group));

    const recents = getRecentProjects().filter((p) => p.id !== group.id);
    recents.unshift(meta);
    // Keep max 20 projects
    const capped = recents.slice(0, 20);
    localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(capped));
  } catch (e) {
    console.error('Failed to update recent projects index', e);
  }
}

export function loadProjectById(id: string): GroupData | null {
  try {
    const raw = localStorage.getItem(`kekake_project_${id}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function deleteProject(id: string): void {
  try {
    localStorage.removeItem(`kekake_project_${id}`);
    const recents = getRecentProjects().filter((p) => p.id !== id);
    localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(recents));
  } catch (e) {
    console.error('Failed to delete project', e);
  }
}

export function clearActiveGroup(): void {
  try {
    localStorage.removeItem(ACTIVE_GROUP_KEY);
  } catch (e) {
    console.error('Failed to clear active group', e);
  }
}

/**
 * Export group data as JSON file download
 */
export function exportGroupToJson(group: GroupData): void {
  const exportPayload = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    group,
  };
  const jsonString = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = group.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'kekake-group';
  a.href = url;
  a.download = `${safeName}.kekake.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Validate and parse imported JSON file
 */
export function validateAndParseImportedJson(jsonString: string): { success: boolean; data?: GroupData; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    const candidate: GroupData = parsed.group ? parsed.group : parsed;

    if (!candidate || typeof candidate !== 'object') {
      return { success: false, error: 'Invalid JSON file format: root object missing.' };
    }

    if (!candidate.name || typeof candidate.name !== 'string') {
      return { success: false, error: 'Invalid project: Group name is missing.' };
    }

    if (!Array.isArray(candidate.people)) {
      return { success: false, error: 'Invalid project: People array is missing.' };
    }

    if (!Array.isArray(candidate.expenses)) {
      return { success: false, error: 'Invalid project: Expenses array is missing.' };
    }

    // Sanitize and ensure valid IDs
    const sanitizedPeople: Person[] = candidate.people.map((p: any, idx: number) => ({
      id: p.id || generateId('p'),
      name: (p.name || `Person ${idx + 1}`).trim(),
      avatarColor: p.avatarColor || getAvatarColor(idx),
      createdAt: p.createdAt || Date.now(),
    }));

    const validPersonIds = new Set(sanitizedPeople.map((p) => p.id));

    const sanitizedExpenses: Expense[] = candidate.expenses.map((e: any) => {
      // Validate paidBy
      let paidBy = Array.isArray(e.paidBy) ? e.paidBy : [];
      if (paidBy.length === 0 && e.paidByPersonId) {
        paidBy = [{ personId: e.paidByPersonId, amount: Number(e.amount || 0) }];
      }
      paidBy = paidBy.filter((pb: any) => validPersonIds.has(pb.personId));

      // Validate participants
      let participants = Array.isArray(e.participants) ? e.participants : [];
      participants = participants.filter((pId: string) => validPersonIds.has(pId));
      if (participants.length === 0) {
        participants = sanitizedPeople.map((p) => p.id);
      }

      return {
        id: e.id || generateId('exp'),
        title: (e.title || 'Expense').trim(),
        amount: Math.max(0, Number(e.amount) || 0),
        category: e.category || 'Other',
        date: e.date || new Date().toISOString().split('T')[0],
        time: e.time || '12:00',
        paidBy,
        splitType: ['equal', 'custom', 'percentage', 'shares'].includes(e.splitType) ? e.splitType : 'equal',
        participants,
        customShares: e.customShares || {},
        percentageShares: e.percentageShares || {},
        shares: e.shares || {},
        notes: e.notes || '',
        createdAt: e.createdAt || Date.now(),
        updatedAt: e.updatedAt || Date.now(),
      };
    });

    const validGroup: GroupData = {
      id: candidate.id || generateId('grp'),
      name: candidate.name,
      currency: candidate.currency || 'INR',
      people: sanitizedPeople,
      expenses: sanitizedExpenses,
      settlementProgress: candidate.settlementProgress || {},
      createdAt: candidate.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    return { success: true, data: validGroup };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Could not parse JSON file.' };
  }
}

export function getSavedTheme(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {}
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function setSavedTheme(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body?.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.body?.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  } catch {}
}
