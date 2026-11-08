'use client';

import React, { useState } from 'react';
import { EnrichedPartyResult } from '@/types/election';
import { ShieldCheck, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { PartyLogo } from '@/components/ui/party-logo';

interface SeatMajorityBarProps {
  parties: EnrichedPartyResult[];
  majorityThreshold?: number;
  totalSeats?: number;
  scopeLabel?: string;
}

export function SeatMajorityBar({
  parties,
  majorityThreshold = 201,
  totalSeats = 400,
  scopeLabel,
}: SeatMajorityBarProps) {
  const [hoveredParty, setHoveredParty] = useState<EnrichedPartyResult | null>(null);

  // Parties that won at least 1 seat
  const seatParties = parties.filter((p) => p.seats > 0);
  const totalAllocatedSeats = seatParties.reduce((sum, p) => sum + p.seats, 0);

  const majorityPercentage = (majorityThreshold / totalSeats) * 100;
  const isNational400 = totalSeats === 400;

  return (
    <Card className="p-5">
      <CardHeader className="p-0 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <CardTitle>
            <ShieldCheck className="w-5 h-5 text-status-live" />
            {scopeLabel
              ? scopeLabel
              : isNational400
              ? 'National Assembly 400-Seat Distribution'
              : `Council Seat Distribution (${totalSeats.toLocaleString('en-ZA')} Seats)`}
          </CardTitle>
          <CardDescription>
            {totalAllocatedSeats === 0 ? (
              <span>
                0 of {totalSeats.toLocaleString('en-ZA')} seats allocated •{' '}
                <b className="text-foreground">
                  {majorityThreshold.toLocaleString('en-ZA')} seats needed for majority (Awaiting local counts)
                </b>
              </span>
            ) : (
              <span>
                {totalAllocatedSeats.toLocaleString('en-ZA')} of {totalSeats.toLocaleString('en-ZA')} seats allocated •{' '}
                <b className="text-foreground">
                  {majorityThreshold.toLocaleString('en-ZA')} seats needed for majority governance
                </b>
              </span>
            )}
          </CardDescription>
        </div>

        {hoveredParty ? (
          <div className="text-xs font-mono bg-muted/80 border border-border px-3 py-1 rounded-xl flex items-center gap-2 max-w-full min-w-0 overflow-hidden">
            <PartyLogo
              abbr={hoveredParty.abbr}
              name={hoveredParty.fullName}
              color={hoveredParty.color}
              size="xs"
            />
            <span className="font-bold text-foreground truncate min-w-0">{hoveredParty.abbr}:</span>
            <span className="text-status-live font-semibold shrink-0">{hoveredParty.seats.toLocaleString('en-ZA')} seats</span>
            <span className="text-muted-foreground shrink-0">
              ({((hoveredParty.seats / totalSeats) * 100).toFixed(1)}%)
            </span>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground font-mono hidden sm:flex items-center gap-1.5 shrink-0">
            <Info className="w-3.5 h-3.5" />
            Hover over segments for details
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {/* The Proportional Segmented Bar */}
        <div className="relative w-full h-9 bg-muted/80 rounded-xl overflow-visible flex shadow-inner border border-border/60">
          <div className="w-full h-full rounded-xl overflow-hidden flex relative">
            {seatParties.length === 0 && (
              <div className="w-full h-full flex items-center justify-center text-[11px] font-mono text-muted-foreground select-none">
                0 of {totalSeats.toLocaleString('en-ZA')} seats allocated (Awaiting local counts)
              </div>
            )}
            {seatParties.map((party) => {
              const widthPercent = (party.seats / totalSeats) * 100;
              if (widthPercent <= 0) return null;

              return (
                <Tooltip key={party.id}>
                  <TooltipTrigger
                    onMouseEnter={() => setHoveredParty(party)}
                    onMouseLeave={() => setHoveredParty(null)}
                    className="h-full transition-all duration-200 cursor-pointer hover:opacity-90 hover:brightness-110 relative group"
                    style={{
                      width: `${widthPercent}%`,
                      backgroundColor: party.color,
                    }}
                  >
                    {widthPercent >= 8 && (
                      <div className="w-full h-full flex items-center justify-center text-[10px] sm:text-[11px] font-bold text-white drop-shadow-md select-none px-1 overflow-hidden truncate pointer-events-none">
                        {party.abbr} ({party.seats.toLocaleString('en-ZA')})
                      </div>
                    )}
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <div className="flex items-center gap-2">
                      <PartyLogo
                        abbr={party.abbr}
                        name={party.fullName}
                        color={party.color}
                        size="xs"
                      />
                      <span className="font-bold text-foreground">{party.abbr}</span>
                      <span className="text-border">•</span>
                      <span className="text-status-live font-mono font-bold">
                        {party.seats.toLocaleString('en-ZA')} seats
                      </span>
                      <span className="text-muted-foreground font-mono">
                        ({((party.seats / totalSeats) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          {/* Majority Threshold Marker */}
          <Tooltip>
            <TooltipTrigger
              className="absolute top-0 bottom-0 z-20 w-1 bg-foreground shadow-[0_0_8px_rgba(255,255,255,0.8)] cursor-pointer"
              style={{ left: `${majorityPercentage}%` }}
            >
              <div className="absolute -top-6 -translate-x-1/2 bg-foreground text-background font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                {majorityThreshold} Majority
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <span className="font-semibold">
                Majority Threshold: {majorityThreshold} of {totalSeats} seats (50% + 1)
              </span>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Quick Party Legend Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-border/50">
          {seatParties.slice(0, 10).map((party) => (
            <Badge
              key={party.id}
              variant="outline"
              size="sm"
              onMouseEnter={() => setHoveredParty(party)}
              onMouseLeave={() => setHoveredParty(null)}
              className="cursor-pointer transition-colors hover:bg-muted gap-1.5"
            >
              <PartyLogo
                abbr={party.abbr}
                name={party.fullName}
                color={party.color}
                size="xs"
              />
              <span className="font-semibold text-foreground">{party.abbr}</span>
              <span className="font-mono text-muted-foreground font-bold">
                {party.seats.toLocaleString('en-ZA')}
              </span>
            </Badge>
          ))}

          {seatParties.length > 10 && (
            <span className="text-xs text-muted-foreground font-mono">
              +{seatParties.length - 10} more parties
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
