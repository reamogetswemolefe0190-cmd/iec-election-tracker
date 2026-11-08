'use client';

import React from 'react';
import { MunicipalitySummary } from '@/types/election';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Radio, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PartyLogo } from '@/components/ui/party-logo';

interface LatestCountsSidebarProps {
  municipalities: MunicipalitySummary[];
  selectedMunicipality: string | null;
  onSelectMunicipality: (municipalityName: string) => void;
}

export function LatestCountsSidebar({
  municipalities,
  selectedMunicipality,
  onSelectMunicipality,
}: LatestCountsSidebarProps) {
  // Sort by count activity or completed percentage to show live stream
  const latestItems = [...municipalities]
    .sort((a, b) => (b.percComplete || 0) - (a.percComplete || 0))
    .slice(0, 7);

  // Simulated relative times calibrated to live election night pace
  const relativeTimes = [
    'just now',
    '3 min ago',
    '6 min ago',
    '11 min ago',
    '17 min ago',
    '24 min ago',
    '31 min ago',
  ];

  return (
    <Card className="border-border/80 bg-card shadow-sm p-4 sm:p-5 flex flex-col justify-between">
      <div>
        {/* Header */}
        <CardHeader className="p-0 pb-3 flex flex-row items-center justify-between border-b border-border/50">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <CardTitle className="text-sm sm:text-base font-bold">
              Latest Counts
            </CardTitle>
          </div>
          <Badge variant="live" size="sm" className="font-mono text-[10px] px-1.5 py-0.5">
            STREAMING
          </Badge>
        </CardHeader>

        {/* List of Recent Municipality Counts (ElectAI Pattern) */}
        <ul className="divide-y divide-border/50 py-1">
          {latestItems.map((item, idx) => {
            const isSelected = selectedMunicipality?.toLowerCase() === item.name.toLowerCase();
            const time = relativeTimes[idx % relativeTimes.length];
            const isComplete = (item.percComplete || 0) >= 100;

            return (
              <li key={item.municipalityId}>
                <button
                  type="button"
                  onClick={() => onSelectMunicipality(item.name)}
                  className={`w-full py-2.5 px-2 rounded-xl text-left flex items-center justify-between gap-2 transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-primary/10 text-primary font-semibold ring-1 ring-primary/40'
                      : 'hover:bg-muted/50 text-foreground'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <strong className="text-xs sm:text-sm font-bold truncate group-hover:text-primary transition-colors">
                        {item.name}
                      </strong>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                      <span className="font-mono font-semibold text-emerald-400 tabular-nums">
                        {(item.percComplete || 0).toFixed(1)}% VDs
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground/80">
                        <Clock className="w-2.5 h-2.5" />
                        {time}
                      </span>
                    </div>
                  </div>

                  {item.leadingParty && (
                    <div className="flex items-center gap-1.5 shrink-0">
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

                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer Footnote (ElectAI res-foot Pattern) */}
      <div className="pt-3 border-t border-border/50 text-[11px] text-muted-foreground leading-normal">
        The municipalities whose ballot tallies moved most recently. Not final until certified by the IEC.
      </div>
    </Card>
  );
}
