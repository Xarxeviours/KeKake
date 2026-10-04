import React, { useState } from 'react';
import { GroupData, Person, PersonBalance, SettlementTransaction } from '../types';
import { formatCurrency } from '../utils/currencies';
import { exportSummaryAsPng } from '../utils/imageExport';
import { AdSlot } from './AdSlot';
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  Share2,
  Download,
  MessageCircle,
  Sparkles,
  Users,
  Check,
  RotateCcw,
  UserCheck,
} from 'lucide-react';

interface SettlementViewProps {
  group: GroupData;
  people: Person[];
  balances: PersonBalance[];
  settlements: SettlementTransaction[];
  totalSpent: number;
  settlementProgress: Record<string, boolean>;
  onTogglePaymentPaid: (transactionId: string) => void;
  onResetProgress: () => void;
}

export const SettlementView: React.FC<SettlementViewProps> = ({
  group,
  people,
  balances,
  settlements,
  totalSpent,
  settlementProgress,
  onTogglePaymentPaid,
  onResetProgress,
}) => {
  const [selectedMyPersonId, setSelectedMyPersonId] = useState<string>(people[0]?.id || '');
  const [copied, setCopied] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);

  const peopleMap = new Map<string, Person>();
  people.forEach((p) => peopleMap.set(p.id, p));

  // Progress metrics
  const totalPayments = settlements.length;
  const completedPayments = settlements.filter(
    (tx) => settlementProgress[tx.id] === true
  ).length;
  const isEverythingSettled =
    totalPayments === 0 || (totalPayments > 0 && completedPayments === totalPayments);

  // Personalized "You Owe" perspective
  const myPerson = peopleMap.get(selectedMyPersonId);
  const myBalance = balances.find((b) => b.personId === selectedMyPersonId);
  const myPaymentsToMake = settlements.filter(
    (tx) => tx.fromPersonId === selectedMyPersonId
  );
  const myPaymentsToReceive = settlements.filter(
    (tx) => tx.toPersonId === selectedMyPersonId
  );

  // Generate clean share text
  const generateShareText = () => {
    let text = `💸 ${group.name} — KeKake\n\n`;
    text += `Total spent: ${formatCurrency(totalSpent, group.currency)}\n\n`;

    if (settlements.length === 0) {
      text += `🎉 All Settled! Nobody owes anyone anything.\n\n`;
    } else {
      text += `Final settlement plan:\n\n`;
      settlements.forEach((tx) => {
        const from = peopleMap.get(tx.fromPersonId)?.name || 'Unknown';
        const to = peopleMap.get(tx.toPersonId)?.name || 'Unknown';
        const isPaid = settlementProgress[tx.id];
        text += `${from} → ${to} ${formatCurrency(tx.amount, group.currency)}${isPaid ? ' (Paid ✅)' : ''}\n`;
      });
      text += `\nOnly ${settlements.length} payments needed to settle everyone.\n\n`;
    }

    text += `Calculated by KeKake: Group expenses without the math headache.`;
    return text;
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleNativeShare = async () => {
    const text = generateShareText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${group.name} Settlement`,
          text,
        });
      } catch (e) {
        // user cancelled or unsupported
      }
    } else {
      handleCopyText();
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(generateShareText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleDownloadPng = async () => {
    setIsExportingPng(true);
    try {
      await exportSummaryAsPng(group, settlements, peopleMap, totalSpent);
    } catch (err) {
      console.error('Download PNG failed', err);
    } finally {
      setIsExportingPng(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Flagship Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Optimal Settlement Engine</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {isEverythingSettled ? '🎉 All Settled!' : '💸 Time to Settle'}
          </h2>
          <p className="text-emerald-100 text-sm sm:text-base mt-1.5 max-w-xl">
            {totalPayments === 0
              ? 'Nobody owes anyone anything in this group.'
              : `${totalPayments} ${totalPayments === 1 ? 'payment' : 'payments'} will settle everyone with zero unnecessary transactions.`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleCopyText}
            className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-bold text-xs transition-all flex items-center gap-1.5 active:scale-95"
            title="Copy text to clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={handleNativeShare}
            className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-bold text-xs transition-all flex items-center gap-1.5 active:scale-95"
            title="Share via device"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            title="Share directly to WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handleDownloadPng}
            disabled={isExportingPng}
            className="px-3.5 py-2 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs transition-all flex items-center gap-1.5 shadow-md active:scale-95"
            title="Download PNG summary receipt"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingPng ? 'Generating...' : 'Download Image'}</span>
          </button>
        </div>
      </div>

      {/* Section 26: Settlement Progress (when payments exist) */}
      {totalPayments > 0 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-neutral-700 dark:text-neutral-300">
              Settlement Progress: {completedPayments} of {totalPayments} payments completed
            </span>
            {completedPayments > 0 && (
              <button
                onClick={onResetProgress}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Progress</span>
              </button>
            )}
          </div>
          <div className="w-full h-3 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 rounded-full"
              style={{ width: `${(completedPayments / totalPayments) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Section 24: FINAL SETTLEMENT CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
            Final Settlement Plan
          </h3>
          <span className="text-xs text-neutral-500">
            Intelligently minimized transactions
          </span>
        </div>

        {totalPayments === 0 ? (
          <div className="p-8 sm:p-12 text-center rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h4 className="text-2xl font-extrabold text-neutral-900 dark:text-white mb-2">
              🎉 All Settled!
            </h4>
            <p className="text-sm text-neutral-500 max-w-sm mx-auto mb-4">
              Group expenses are officially balanced. Nobody owes anyone anything.
            </p>
            <div className="inline-flex items-center gap-4 text-xs font-mono font-semibold px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
              <span>Total spent: {formatCurrency(totalSpent, group.currency)}</span>
              <span>•</span>
              <span>People: {people.length}</span>
              <span>•</span>
              <span>Payments: 0</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settlements.map((tx) => {
              const fromPerson = peopleMap.get(tx.fromPersonId);
              const toPerson = peopleMap.get(tx.toPersonId);
              const isPaid = settlementProgress[tx.id] === true;

              return (
                <div
                  key={tx.id}
                  className={`p-5 rounded-3xl border transition-all ${
                    isPaid
                      ? 'bg-neutral-50/80 dark:bg-neutral-900/40 border-neutral-200/60 dark:border-neutral-800/60 opacity-65'
                      : 'bg-white dark:bg-neutral-900 border-neutral-200/90 dark:border-neutral-800 hover:border-emerald-500/50 shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-4">
                    {/* From Debtor */}
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm"
                        style={{ backgroundColor: fromPerson?.avatarColor || '#64748b' }}
                      >
                        {fromPerson?.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                          Pays
                        </span>
                        <span className="font-bold text-base text-neutral-900 dark:text-white truncate block">
                          {fromPerson?.name}
                        </span>
                      </div>
                    </div>

                    {/* Directional arrow icon */}
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 shrink-0">
                      <ArrowRight className="w-4 h-4" />
                    </div>

                    {/* To Creditor */}
                    <div className="flex items-center gap-2.5 flex-1 justify-end min-w-0 text-right">
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                          Receives
                        </span>
                        <span className="font-bold text-base text-emerald-700 dark:text-emerald-400 truncate block">
                          {toPerson?.name}
                        </span>
                      </div>
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm"
                        style={{ backgroundColor: toPerson?.avatarColor || '#64748b' }}
                      >
                        {toPerson?.name.charAt(0)}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Amount & Mark as Paid */}
                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-neutral-400 block">
                        Settlement Amount
                      </span>
                      <span className="font-mono font-extrabold text-2xl text-neutral-900 dark:text-white">
                        {formatCurrency(tx.amount, group.currency)}
                      </span>
                    </div>

                    <button
                      onClick={() => onTogglePaymentPaid(tx.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
                        isPaid
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                          : 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 shadow-sm'
                      }`}
                    >
                      {isPaid ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Paid</span>
                        </>
                      ) : (
                        <span>Mark as Paid</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 23: Personalized "YOUR SETTLEMENT" View */}
      {people.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                Personalized: Your Settlement
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 font-semibold">I am:</span>
              <select
                value={selectedMyPersonId}
                onChange={(e) => setSelectedMyPersonId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {myPerson && myBalance && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* You Need to Pay */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-800">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block mb-2">
                  You need to pay
                </span>
                {myPaymentsToMake.length === 0 ? (
                  <p className="text-xs text-neutral-500 italic">No payments to make!</p>
                ) : (
                  <div className="space-y-2">
                    {myPaymentsToMake.map((tx) => {
                      const to = peopleMap.get(tx.toPersonId)?.name || 'Unknown';
                      return (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between text-xs font-semibold"
                        >
                          <span className="text-neutral-700 dark:text-neutral-300">
                            Pay {to}
                          </span>
                          <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">
                            {formatCurrency(tx.amount, group.currency)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* You Should Receive */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-800">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-2">
                  You should receive
                </span>
                {myPaymentsToReceive.length === 0 ? (
                  <p className="text-xs text-neutral-500 italic">No incoming payments.</p>
                ) : (
                  <div className="space-y-2">
                    {myPaymentsToReceive.map((tx) => {
                      const from = peopleMap.get(tx.fromPersonId)?.name || 'Unknown';
                      return (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between text-xs font-semibold"
                        >
                          <span className="text-neutral-700 dark:text-neutral-300">
                            From {from}
                          </span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                            {formatCurrency(tx.amount, group.currency)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* After these payments */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block mb-1">
                    After these payments
                  </span>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Your balance becomes <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">0.00</span>
                  </p>
                </div>
                <div className="pt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>100% Squared Away</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Section 21: BALANCE DASHBOARD ("Who's Settled?") */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
          Who's Settled? (Individual Balances)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {balances.map((b) => {
            const isSettled = b.status === 'settled';
            const isGets = b.status === 'gets';

            return (
              <div
                key={b.personId}
                className="p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 flex flex-col gap-1.5"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: isSettled ? '#10b981' : isGets ? '#059669' : '#e11d48',
                    }}
                  />
                  <span className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                    {b.personName}
                  </span>
                </div>

                <div className="text-xs font-semibold mt-1">
                  {isSettled ? (
                    <span className="text-emerald-600 dark:text-emerald-400">Settled</span>
                  ) : isGets ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                      Gets {formatCurrency(b.netBalance, group.currency)}
                    </span>
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400 font-mono">
                      Owes {formatCurrency(Math.abs(b.netBalance), group.currency)}
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-neutral-400">
                  Paid {formatCurrency(b.totalPaid, group.currency)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ad slot below final settlement results */}
      <AdSlot slotId="settlement-below-results" />
    </div>
  );
};
