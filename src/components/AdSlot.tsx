import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: { push: (request: Record<string, never>) => unknown };
  }
}

const configuredAdUnitId = import.meta.env.VITE_ADSENSE_AD_SLOT?.trim() ?? '';
const adUnitId = /^\d+$/.test(configuredAdUnitId) ? configuredAdUnitId : undefined;

interface AdSlotProps {
  slotId?: string;
  variant?: 'banner' | 'compact' | 'footer';
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({
  slotId = 'default-slot',
  variant = 'banner',
  className = '',
}) => {
  const adRef = useRef<HTMLModElement>(null);
  const requestedRef = useRef(false);

  useEffect(() => {
    const adElement = adRef.current;
    if (!adUnitId || !adElement) return;

    const requestAd = () => {
      if (requestedRef.current || adElement.getBoundingClientRect().width === 0) return;
      requestedRef.current = true;
      try {
        (window.adsbygoogle = window.adsbygoogle || ([] as Record<string, never>[])).push({});
      } catch {
        adElement.style.display = 'none';
      }
    };

    const observer = new ResizeObserver(requestAd);
    observer.observe(adElement);
    requestAd();
    return () => observer.disconnect();
  }, []);

  return (
    <div
      aria-label="Advertisement"
      data-ad-placement={slotId}
      className={`relative my-6 mx-auto w-full max-w-4xl rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 p-3 transition-colors ${className}`}
    >
      <div className="flex flex-col items-center justify-center text-center">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400 dark:text-neutral-500 mb-1">
          Advertisement
        </span>
        {adUnitId ? (
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', minHeight: variant === 'compact' ? 90 : 100 }}
            data-ad-client="ca-pub-1692917081030906"
            data-ad-slot={adUnitId}
            data-ad-format="horizontal"
            data-full-width-responsive="true"
          />
        ) : (
          <div className="flex min-h-[90px] items-center justify-center text-xs text-neutral-500 dark:text-neutral-400">
            Advertisement space
          </div>
        )}
      </div>
    </div>
  );
};
