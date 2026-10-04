import React, { useState } from 'react';
import { Logo } from './Logo';
import { SUPPORTED_CURRENCIES, getCurrencyConfig } from '../utils/currencies';
import { GroupData } from '../types';
import {
  Sun,
  Moon,
  FolderOpen,
  Plus,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  Info,
} from 'lucide-react';

interface NavbarProps {
  currentGroup: GroupData | null;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenNewGroupModal: () => void;
  onOpenSavedProjectsModal: () => void;
  onExportJson: () => void;
  onImportJsonClick: () => void;
  onResetClick: () => void;
  onChangeCurrency: (currencyCode: string) => void;
  onGoHome: () => void;
  onGoToDashboard: () => void;
  activeView: 'home' | 'dashboard';
}

export const Navbar: React.FC<NavbarProps> = ({
  currentGroup,
  theme,
  onToggleTheme,
  onOpenNewGroupModal,
  onOpenSavedProjectsModal,
  onExportJson,
  onImportJsonClick,
  onResetClick,
  onChangeCurrency,
  onGoHome,
  onGoToDashboard,
  activeView,
}) => {
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [groupMenuOpen, setGroupMenuOpen] = useState(false);

  const currentCurrencyConfig = currentGroup ? getCurrencyConfig(currentGroup.currency) : SUPPORTED_CURRENCIES[0];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 dark:border-neutral-800/80 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand Logo & Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={onGoHome}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg p-1"
            title="KeKake Home"
          >
            <Logo size="md" showTagline={false} />
          </button>

          {currentGroup && (
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => setGroupMenuOpen(!groupMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200/70 dark:hover:bg-neutral-700/70 text-sm font-semibold text-neutral-800 dark:text-neutral-200 transition-colors"
              >
                <span className="truncate max-w-[150px] md:max-w-[220px]">{currentGroup.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
              </button>

              {/* Group menu dropdown */}
              {groupMenuOpen && (
                <div
                  className="absolute top-16 left-44 w-60 rounded-2xl bg-white dark:bg-neutral-900 shadow-xl border border-neutral-200 dark:border-neutral-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setGroupMenuOpen(false)}
                >
                  <div className="px-3 py-1.5 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Current Group
                  </div>
                  <button
                    onClick={onGoToDashboard}
                    className="w-full text-left px-3 py-2 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center gap-2"
                  >
                    <span>📊 Go to Dashboard</span>
                  </button>
                  <button
                    onClick={onOpenSavedProjectsModal}
                    className="w-full text-left px-3 py-2 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center gap-2"
                  >
                    <FolderOpen className="w-4 h-4 text-emerald-600" />
                    <span>Recent Projects</span>
                  </button>
                  <button
                    onClick={onOpenNewGroupModal}
                    className="w-full text-left px-3 py-2 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4 text-emerald-600" />
                    <span>Start New Group</span>
                  </button>
                  <div className="h-px bg-neutral-200 dark:bg-neutral-800 my-1" />
                  <button
                    onClick={onExportJson}
                    className="w-full text-left px-3 py-2 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4 text-blue-500" />
                    <span>Export JSON</span>
                  </button>
                  <button
                    onClick={onImportJsonClick}
                    className="w-full text-left px-3 py-2 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4 text-purple-500" />
                    <span>Import JSON</span>
                  </button>
                  <div className="h-px bg-neutral-200 dark:bg-neutral-800 my-1" />
                  <button
                    onClick={onResetClick}
                    className="w-full text-left px-3 py-2 text-sm font-medium hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4 text-rose-500" />
                    <span>Reset Group</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Controls & Privacy Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Privacy badge */}
          <div
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium"
            title="All math is calculated locally in your browser. No server storage or account."
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Local & Private</span>
          </div>

          {/* Currency Selector (when group exists) */}
          {currentGroup && (
            <div className="relative">
              <button
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 text-xs font-semibold hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors"
                title="Change Currency"
              >
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {currentCurrencyConfig.symbol}
                </span>
                <span>{currentCurrencyConfig.code}</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {currencyDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-neutral-900 shadow-xl border border-neutral-200 dark:border-neutral-800 py-1.5 z-50 max-h-64 overflow-y-auto"
                  onClick={() => setCurrencyDropdownOpen(false)}
                >
                  <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                    Select Currency
                  </div>
                  {SUPPORTED_CURRENCIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => onChangeCurrency(c.code)}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                        c.code === currentGroup.currency
                          ? 'font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                          : 'text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <span>{c.name}</span>
                      <span className="font-mono">{c.symbol}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Project Management button */}
          <button
            onClick={onOpenSavedProjectsModal}
            className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Saved Projects"
            aria-label="Saved Projects"
          >
            <FolderOpen className="w-5 h-5" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-5 h-5 text-neutral-700 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Primary CTA if on home or header */}
          {activeView === 'home' && currentGroup ? (
            <button
              onClick={onGoToDashboard}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-sm transition-all active:scale-95"
            >
              <span>Open Dashboard</span>
            </button>
          ) : (
            <button
              onClick={onOpenNewGroupModal}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Group</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
