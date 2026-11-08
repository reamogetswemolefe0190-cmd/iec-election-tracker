'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Radio, Sun, Moon, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HeaderProps {
  year: '2026' | '2024';
  onYearChange: (y: '2026' | '2024') => void;
  ballotType: string;
  onBallotChange: (type: 'National' | 'Regional') => void;
  lastUpdated?: string;
  isValidating: boolean;
  onRefresh: () => void;
  countdown: number;
  onOpenShare?: () => void;
}

export function Header({
  year,
  onYearChange,
  ballotType,
  onBallotChange,
  lastUpdated,
  isValidating,
  onRefresh,
  countdown,
  onOpenShare,
}: HeaderProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      setIsDark(document.documentElement.classList.contains('dark'));
    }
  }, []);

  const toggleTheme = () => {
    const isCurrentDark = typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : isDark;
    const nextDark = !isCurrentDark;
    setIsDark(nextDark);
    if (typeof document !== 'undefined') {
      if (nextDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('iec-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('iec-theme', 'light');
      }
    }
  };

  const formattedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString('en-ZA', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '--:--:--';

  return (
    <header className="relative md:sticky top-0 z-40 w-full border-b border-border bg-card/85 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-4">
        {/* Brand & Live Status */}
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-6 sm:w-10 sm:h-7 rounded-md overflow-hidden shadow-xs ring-1 ring-white/20 select-none shrink-0 bg-neutral-900">
              <img
                src="/za.svg"
                alt="South Africa Flag"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-1.5">
                  IEC Live Election Tracker
                </h1>
                <Badge variant="live" pulse={year === '2026'} className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0">
                  {year === '2026' ? '2026 LIVE' : '2024'}
                </Badge>
              </div>
              <p className="hidden sm:block text-xs text-muted-foreground mt-0.5">
                {year === '2026'
                  ? 'Official 2026 Local Government Elections Feed (EEID 1887)'
                  : `2024 National & Provincial Elections • Certified ${ballotType}`}
              </p>
            </div>
          </div>

          {/* Quick Share, Refresh & Theme Toggle on Mobile */}
          <div className="flex sm:hidden items-center gap-1">
            {onOpenShare && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenShare}
                title="Share live snapshot"
                aria-label="Share live snapshot"
                className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <Share2 className="w-3.5 h-3.5 text-primary" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              disabled={isValidating}
              title="Refresh live data now"
              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isValidating ? 'animate-spin text-status-live' : ''}`}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-zinc-700" />}
            </Button>
          </div>
        </div>

        {/* Election Selector, Ballot Switcher, Sync & Theme Controls */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2">
          {/* Year Switcher (Tabs) */}
          <Tabs
            value={year}
            onValueChange={(val) => onYearChange(val as '2026' | '2024')}
            className="w-auto"
          >
            <TabsList className="h-7 sm:h-9">
              <TabsTrigger value="2026" className="text-xs px-2.5">2026 LGE (Live)</TabsTrigger>
              <TabsTrigger value="2024" className="text-xs px-2.5">2024 NPE</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* 2024 Ballot Type Toggle (National vs Regional) */}
          {year === '2024' && (
            <div className="inline-flex rounded-xl bg-muted/60 p-0.5 border border-border/60">
              <Button
                variant={ballotType === 'National' ? 'default' : 'ghost'}
                size="xs"
                onClick={() => onBallotChange('National')}
                className="rounded-lg h-6 px-2 text-[11px]"
              >
                National
              </Button>
              <Button
                variant={ballotType === 'Regional' ? 'default' : 'ghost'}
                size="xs"
                onClick={() => onBallotChange('Regional')}
                className="rounded-lg h-6 px-2 text-[11px]"
              >
                Regional
              </Button>
            </div>
          )}

          {/* Sync Status Countdown (Desktop/Tablet) */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-card/60 border border-border px-3 py-1.5 rounded-xl shadow-xs">
            <Radio className="w-3.5 h-3.5 text-status-live animate-pulse" />
            <span>
              Sync: <b className="text-foreground font-mono tabular-nums">{countdown}s</b>
            </span>
            <span className="text-border">•</span>
            <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
              {formattedTime}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              disabled={isValidating}
              title="Refresh live data now"
              className="h-6 w-6 ml-0.5 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isValidating ? 'animate-spin text-status-live' : ''}`}
              />
            </Button>
          </div>

          {/* Share Button (Desktop/Tablet) */}
          {onOpenShare && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenShare}
              title="Share live election snapshot"
              className="hidden sm:inline-flex items-center gap-1.5 h-8 px-2.5 text-xs font-semibold rounded-xl border-border bg-card/60 text-foreground hover:bg-muted/80 shadow-xs cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-primary" />
              Share
            </Button>
          )}

          {/* Theme Toggle (Desktop/Tablet) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="hidden sm:inline-flex h-8 w-8 rounded-xl border border-border bg-card/60 text-muted-foreground hover:text-foreground"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
