import React, { useState } from 'react';
import { Logo } from './Logo';
import { AdSlot } from './AdSlot';
import {
  Users,
  Receipt,
  Calculator,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  Plus,
  CheckCircle2,
  Share2,
} from 'lucide-react';

interface LandingPageProps {
  onStartNewGroup: () => void;
  onOpenSavedProjects: () => void;
  onOpenExistingGroup?: () => void;
  hasExistingGroup: boolean;
  groupName?: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartNewGroup,
  onOpenSavedProjects,
  onOpenExistingGroup,
  hasExistingGroup,
  groupName,
}) => {
  const [showSimplified, setShowSimplified] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How many people can I add?',
      a: 'Up to 50 people in a single group! KeKake handles calculations seamlessly whether you have 2 friends or 50 participants.',
    },
    {
      q: 'Do I need an account or login?',
      a: 'No! There is zero signup, zero login, and no passwords. Just open KeKake and start calculating right away.',
    },
    {
      q: 'Is my financial data stored online in a database?',
      a: 'No. The entire application runs directly on your device inside your browser. Nothing is sent to our servers or saved in a remote database.',
    },
    {
      q: 'Can one person pay for everyone?',
      a: 'Yes, easily! Or if multiple friends jointly paid for a dinner or hotel booking, KeKake supports split multi-payer expenses too.',
    },
    {
      q: 'Can I split an expense unequally or by percentage/shares?',
      a: 'Yes. KeKake supports Equal splits, Custom monetary amounts (with live balance check), Percentages (totaling 100%), and weighted Shares (e.g. 2 shares vs 1 share).',
    },
    {
      q: 'Can I use different currencies?',
      a: 'Yes! KeKake supports INR (₹), USD ($), EUR (€), GBP (£), AED (د.إ), BDT (৳), CAD, AUD, SGD, JPY and more.',
    },
    {
      q: 'Can I export or backup my group?',
      a: 'Yes. You can export your entire group data as a `.kekake.json` file anytime and re-import it whenever you want. You can also save projects locally on your device.',
    },
    {
      q: 'How can I share the final settlement with my friends?',
      a: 'You can copy a clean summary text, share natively on mobile, send directly to WhatsApp with one click, or download a beautiful high-res receipt image (PNG).',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 max-w-6xl mx-auto">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center relative z-10 max-w-3xl mx-auto">
          {/* Bengali Catchphrase / Tagline badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300/60 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-semibold mb-6 animate-in fade-in slide-in-from-top-3 duration-500">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Ke kake koto debe? We’ll figure it out.</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-neutral-950 dark:text-white leading-[1.15] mb-6">
            Group expenses without the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              group-math headache.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-300 font-normal leading-relaxed mb-8 max-w-2xl mx-auto">
            Split group expenses, track who paid for what, and get the simplest possible settlement plan — no login
            required.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-6">
            <button
              onClick={onStartNewGroup}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-base shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Start a New Group</span>
            </button>

            {hasExistingGroup && onOpenExistingGroup && (
              <button
                onClick={onOpenExistingGroup}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:border-emerald-500 dark:hover:border-emerald-500 text-neutral-800 dark:text-neutral-100 font-semibold text-base transition-all flex items-center justify-center gap-2"
              >
                <span>Continue: {groupName || 'Current Group'}</span>
                <ArrowRight className="w-4 h-4 text-emerald-600" />
              </button>
            )}

            <button
              onClick={onOpenSavedProjects}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200/80 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-semibold text-base transition-all flex items-center justify-center gap-2"
            >
              <FolderOpen className="w-5 h-5 text-neutral-500" />
              <span>Open Saved Project</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>🔒 No account • No database • Your calculations stay on your device</span>
          </div>
        </div>

        {/* Ad slot below hero */}
        <AdSlot slotId="landing-below-hero" className="mt-10" />

        {/* Section 5: Interactive Quick Example Card */}
        <div className="mt-12 max-w-xl mx-auto">
          <div className="rounded-3xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl overflow-hidden p-6 sm:p-8 transition-all">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌴</span>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Weekend Trip</h3>
                </div>
                <span className="text-xs text-neutral-500 font-medium">5 people • Goa Beach Getaway</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
                  Total Spent
                </span>
                <span className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                  ₹8,450
                </span>
              </div>
            </div>

            {/* Toggle demo */}
            <div className="flex items-center justify-between bg-neutral-100 dark:bg-neutral-800/60 p-1.5 rounded-xl mb-5 text-xs font-semibold">
              <button
                onClick={() => setShowSimplified(true)}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  showSimplified
                    ? 'bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                ✨ KeKake Smart Plan (3 payments)
              </button>
              <button
                onClick={() => setShowSimplified(false)}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  !showSimplified
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                Complex Raw Debts (8 payments)
              </button>
            </div>

            {/* Transactions List */}
            {showSimplified ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800/80">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span className="text-neutral-800 dark:text-neutral-200">Rahul</span>
                    <span className="text-neutral-400">→</span>
                    <span className="text-emerald-600 dark:text-emerald-400">Sarathi</span>
                  </div>
                  <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">₹420</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800/80">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span className="text-neutral-800 dark:text-neutral-200">Amit</span>
                    <span className="text-neutral-400">→</span>
                    <span className="text-emerald-600 dark:text-emerald-400">Sneha</span>
                  </div>
                  <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">₹280</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800/80">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span className="text-neutral-800 dark:text-neutral-200">Rohit</span>
                    <span className="text-neutral-400">→</span>
                    <span className="text-emerald-600 dark:text-emerald-400">Sarathi</span>
                  </div>
                  <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">₹150</span>
                </div>

                <div className="pt-3 text-center">
                  <div className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>3 payments to settle everyone.</span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    KeKake automatically simplifies unnecessary transactions.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2 opacity-85">
                <div className="text-xs text-rose-500 font-semibold mb-2">
                  Without simplification: Everyone owes multiple people back and forth!
                </div>
                <div className="text-xs font-mono text-neutral-600 dark:text-neutral-400 space-y-1">
                  <div>• Rahul pays Sarathi ₹250</div>
                  <div>• Sneha pays Rahul ₹120</div>
                  <div>• Amit pays Sarathi ₹300</div>
                  <div>• Rohit pays Sneha ₹180</div>
                  <div>• Amit pays Sneha ₹100</div>
                  <div>• Rohit pays Rahul ₹90</div>
                  <div>• Rahul pays Amit ₹120</div>
                  <div>• Sarathi pays Sneha ₹60</div>
                </div>
                <div className="pt-2 text-center text-xs text-rose-500 font-medium">
                  8 chaotic micro-payments instead of just 3.
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section 50: How KeKake Works */}
      <section className="py-16 bg-white dark:bg-neutral-900/60 border-y border-neutral-200/80 dark:border-neutral-800/80 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-extrabold text-neutral-900 dark:text-white">How KeKake Works</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2">
              Four simple steps from group chaos to a clean, stress-free settlement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/70 dark:border-neutral-800 flex flex-col items-start">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Add your friends</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Support for up to 50 people. Fast name entry with duplicate detection and cute avatars.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/70 dark:border-neutral-800 flex flex-col items-start">
              <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xl mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Record expenses</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Tell us who paid and who shared. Split equally, by custom amounts, percentages, or shares.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/70 dark:border-neutral-800 flex flex-col items-start">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xl mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Let KeKake do math</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Exact integer-unit calculations prevent any decimal penny errors. See who owes and who gets.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/70 dark:border-neutral-800 flex flex-col items-start">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xl mb-4">
                4
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Settle with fewer</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                We cancel circular debts to yield the minimum number of payments. Share via WhatsApp or image card!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ad slot between sections */}
      <div className="max-w-4xl mx-auto px-4">
        <AdSlot slotId="landing-between-sections" />
      </div>

      {/* Section 51: FAQ */}
      <section className="py-16 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-neutral-900 dark:text-white">Frequently Asked Questions</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Everything you need to know about calculating group expenses with KeKake.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full text-left p-5 flex items-center justify-between font-bold text-base text-neutral-900 dark:text-neutral-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-neutral-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-neutral-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed border-t border-neutral-100 dark:border-neutral-800 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-10 px-4 sm:px-6 bg-white dark:bg-neutral-900 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-4">
          <Logo size="md" showTagline={true} />
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md">
            “You enter the expenses. KeKake figures out the rest.” • 100% Privacy-first client side calculator.
          </p>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span>...Made by Sarathi with love</span>
            <span className="text-rose-500">❤️</span>
          </div>
          <div className="text-xs text-neutral-400 dark:text-neutral-600">
            © {new Date().getFullYear()} KeKake. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
