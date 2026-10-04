import React from 'react';

interface AdSlotProps {
  slotId?: string;
  variant?: 'banner' | 'compact' | 'footer';
  className?: string;
}

/**
 * Reusable, non-intrusive ad slot placeholder prepared for future monetization.
 * Strictly positioned outside of forms, calculation cards, and sticky areas.
 */
export const AdSlot: React.FC<AdSlotProps> = ({
  slotId = 'default-slot',
  variant = 'banner',
  className = '',
}) => {
  return (
    <div
      aria-label="Sponsored Space"
      data-ad-slot={slotId}
      className={`relative my-6 mx-auto w-full max-w-4xl overflow-hidden rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 p-3 transition-colors ${className}`}
    >
      <div className="flex flex-col items-center justify-center text-center">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400 dark:text-neutral-500 mb-1">
          Sponsored Space
        </span>
        <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500/60 animate-pulse" />
          <span>KeKake is free and privacy-first. Reserved for non-intrusive partner sponsors.</span>
        </div>
      </div>
    </div>
  );
};
