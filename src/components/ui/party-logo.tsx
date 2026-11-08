'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface PartyLogoProps {
  abbr: string;
  name?: string;
  color?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const PARTY_LOGO_MAP: Record<string, string> = {
  anc: '/parties/anc.svg',
  da: '/parties/da.svg',
  mk: '/parties/mk.png',
  mkp: '/parties/mk.png',
  eff: '/parties/eff.svg',
  ifp: '/parties/ifp.svg',
  pa: '/parties/pa.png',
  'vf-plus': '/parties/vf-plus.svg',
  'vf plus': '/parties/vf-plus.svg',
  'ff+': '/parties/vf-plus.svg',
  'ff plus': '/parties/vf-plus.svg',
  vfplus: '/parties/vf-plus.svg',
  actionsa: '/parties/actionsa.svg',
  'action sa': '/parties/actionsa.svg',
  acdp: '/parties/acdp.svg',
  udm: '/parties/udm.svg',
  bosa: '/parties/bosa.svg',
  rise: '/parties/rise.svg',
  atm: '/parties/atm.svg',
  good: '/parties/good.svg',
  pac: '/parties/pac.svg',
  'al-jama-ah': '/parties/al-jama-ah.svg',
  'al jama-ah': '/parties/al-jama-ah.svg',
  aljama: '/parties/al-jama-ah.svg',
};

const SIZE_STYLES = {
  xs: 'w-4 h-4 text-[9px] rounded-sm',
  sm: 'w-5 h-5 text-[10px] rounded-md',
  md: 'w-7 h-7 text-xs rounded-lg',
  lg: 'w-9 h-9 text-sm rounded-xl',
  xl: 'w-12 h-12 text-base rounded-2xl',
};

export function PartyLogo({
  abbr,
  name,
  color = '#475569',
  size = 'md',
  className,
}: PartyLogoProps) {
  const [hasError, setHasError] = useState(false);

  const cleanKey = abbr.trim().toLowerCase().replace(/[^a-z0-9\-+ ]/g, '');
  const logoSrc = PARTY_LOGO_MAP[cleanKey] || PARTY_LOGO_MAP[cleanKey.replace(/\s+/g, '-')];

  const sizeClass = SIZE_STYLES[size] || SIZE_STYLES.md;

  if (!logoSrc || hasError) {
    // Elegant fallback: badge with brand color & first 3-4 letters
    return (
      <div
        className={cn(
          'inline-flex items-center justify-center font-bold text-white shadow-xs shrink-0 select-none overflow-hidden border border-white/20',
          sizeClass,
          className
        )}
        style={{ backgroundColor: color }}
        title={name || abbr}
        aria-label={`${abbr} logo badge`}
      >
        <span className="scale-[0.85] truncate font-mono tracking-tighter">
          {abbr.slice(0, 3).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center bg-white/95 dark:bg-zinc-900 border border-border/80 shadow-xs shrink-0 select-none overflow-hidden p-0.5 transition-transform',
        sizeClass,
        className
      )}
      title={name || `${abbr} party logo`}
    >
      <img
        src={logoSrc}
        alt={`${abbr} logo`}
        className="w-full h-full object-contain"
        loading="lazy"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
