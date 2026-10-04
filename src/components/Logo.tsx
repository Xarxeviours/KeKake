import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showTagline = false }) => {
  const iconSize = size === 'sm' ? 28 : size === 'lg' ? 44 : 36;
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Visual Logo mark: circular settlement arrows + connected friends + currency */}
      <div
        className="relative flex items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 shadow-md shadow-emerald-500/20 text-white shrink-0"
        style={{ width: iconSize, height: iconSize }}
      >
        <svg
          viewBox="0 0 40 40"
          className="w-4/5 h-4/5 text-white stroke-current fill-none"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Circular settlement cycle arrows */}
          <path d="M 20 5 A 15 15 0 0 1 34 22 L 31 19 M 34 22 L 37 19" strokeWidth="2.5" />
          <path d="M 20 35 A 15 15 0 0 1 6 18 L 9 21 M 6 18 L 3 21" strokeWidth="2.5" />
          {/* Central currency rupee / dollar hybrid minimalist knot */}
          <path d="M16 14h8 M16 19h7 M17 14c0 6 6 4 6 8s-5 4-5 4" strokeWidth="2.5" />
          {/* Connected people dots */}
          <circle cx="9" cy="11" r="2.2" className="fill-emerald-200 stroke-none" />
          <circle cx="31" cy="29" r="2.2" className="fill-emerald-200 stroke-none" />
        </svg>
      </div>

      <div className="flex flex-col">
        <span className={`font-extrabold tracking-tight text-neutral-900 dark:text-white leading-none ${textSize}`}>
          Ke<span className="text-emerald-600 dark:text-emerald-400">Kake</span>
        </span>
        {showTagline && (
          <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 leading-tight mt-0.5">
            Ke kake koto debe?
          </span>
        )}
      </div>
    </div>
  );
};
