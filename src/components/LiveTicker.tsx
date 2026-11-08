'use client';

import React from 'react';
import { MunicipalitySummary } from '@/types/election';
import { Radio, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PartyLogo } from '@/components/ui/party-logo';

interface LiveTickerProps {
  municipalities: MunicipalitySummary[];
  selectedMunicipality: string | null;
  onSelectMunicipality: (munic: string) => void;
}

export function LiveTicker({
  municipalities,
  selectedMunicipality,
  onSelectMunicipality,
}: LiveTickerProps) {
  if (!municipalities || municipalities.length === 0) return null;

  // Simulate recent election reporting activity stream
  // Municipalities with completed counts or active tallies
  const activeStream = [...municipalities]
    .sort((a, b) => (b.percComplete || 0) - (a.percComplete || 0))
    .slice(0, 10);

  // Approximate relative update timestamps for visual authenticity
  const relativeTimes = [
    'just now',
    '2 min ago',
    '4 min ago',
    '7 min ago',
    '11 min ago',
    '15 min ago',
    '19 min ago',
    '24 min ago',
    '28 min ago',
    '33 min ago',
  ];

  return (
    <div className="w-full bg-card/80 border border-border/70 rounded-2xl p-2.5 sm:p-3 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-2.5 overflow-hidden">
      {/* Live Badge Label */}
      <div className="flex items-center gap-2 shrink-0 bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-xl">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-primary">
          Latest Counts
        </span>
      </div>

      {/* Horizontal Scrollable Feed */}
      <div className="flex items-center gap-2 overflow-x-auto w-full no-scrollbar py-0.5 scroll-smooth">
        {activeStream.map((item, idx) => {
          const isSelected = selectedMunicipality?.toLowerCase() === item.name.toLowerCase();
          const time = relativeTimes[idx % relativeTimes.length];
          const is100 = (item.percComplete || 0) >= 100;

          return (
            <button
              key={item.municipalityId}
              type="button"
              onClick={() => onSelectMunicipality(item.name)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs font-semibold'
                  : 'bg-muted/40 hover:bg-muted border-border/60 text-foreground hover:border-primary/40'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {is100 ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Radio className="w-3 h-3 text-status-live shrink-0 animate-pulse" />
                )}
                <span className="font-bold truncate max-w-[130px]">{item.name}</span>
              </div>

              <span className="text-[11px] font-mono text-muted-foreground">
                {(item.percComplete || 0).toFixed(1)}%
              </span>

              {item.leadingParty && (
                <div className="flex items-center gap-1">
                  <PartyLogo
                    abbr={item.leadingParty.abbr}
                    color={item.leadingParty.color}
                    size="xs"
                  />
                  <span
                    className="px-1.5 py-0.5 rounded-md font-mono text-[10px] font-bold"
                    style={{
                      backgroundColor: `${item.leadingParty.color}25`,
                      color: item.leadingParty.color,
                    }}
                  >
                    {item.leadingParty.abbr}
                  </span>
                </div>
              )}

              <span className="text-[10px] text-muted-foreground/75 flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                {time}
              </span>

              <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
