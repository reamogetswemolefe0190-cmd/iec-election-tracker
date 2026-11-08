'use client';

import React, { useState, useMemo } from 'react';
import { EnrichedPartyResult } from '@/types/election';
import {
  Search,
  Trophy,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  User,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PartyLogo } from '@/components/ui/party-logo';
import { calculateVoteSwing } from '@/lib/historical-data';

export interface WardCouncillorInfo {
  candidateName: string;
  partyAbbr: string;
  partyName?: string;
  partyColor?: string;
  status: 'declared' | 'counting' | 'pending';
  votes: number;
  votePercentage: number;
  turnout?: number;
}

export interface PartyLeaderboardProps {
  parties: EnrichedPartyResult[];
  totalVotes: number;
  regionLabel?: string;
  onClearFilter?: () => void;
  isPendingResults?: boolean;
  selectedLocationName?: string | null;
  parentScopeName?: string | null;
  onViewParentScope?: () => void;
  wardCouncillor?: WardCouncillorInfo | null;
}

export function PartyLeaderboard({
  parties,
  totalVotes,
  regionLabel,
  onClearFilter,
  isPendingResults = false,
  selectedLocationName,
  parentScopeName,
  onViewParentScope,
  wardCouncillor,
}: PartyLeaderboardProps) {
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'top10' | 'seats'>('top10');
  const [baselineYear, setBaselineYear] = useState<'2021' | '2024'>('2021');

  const filteredParties = useMemo(() => {
    let list = [...parties];

    // If searching, search across the entire party registry including candidate names
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return list.filter(
        (p) =>
          p.abbr.toLowerCase().includes(q) ||
          p.fullName.toLowerCase().includes(q) ||
          (p.candidate && p.candidate.toLowerCase().includes(q))
      );
    }

    if (filterMode === 'top10') {
      list = list.slice(0, 10);
    } else if (filterMode === 'seats') {
      list = list.filter((p) => p.seats > 0);
    }

    return list;
  }, [parties, search, filterMode]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-ZA').format(num);
  };

  // Dedicated "Results Not Yet Available" State (Visual Honesty Guardrail)
  if (isPendingResults) {
    const placeName = selectedLocationName || regionLabel || 'This Location';

    return (
      <Card className="p-6 border-amber-500/30 bg-card">
        <div className="flex flex-col items-center justify-center text-center py-10 px-4 max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 dark:text-amber-400">
            <Clock className="w-7 h-7 animate-pulse" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 dark:text-amber-400 font-mono text-[11px] font-bold uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Results Not Yet Available</span>
            </div>

            <h3 className="text-xl font-bold text-foreground">
              {placeName}
            </h3>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Voting stations have closed and ballot counting is in progress. The Electoral Commission (IEC) has not yet published or audited the first results slip for this municipality.
            </p>
          </div>

          {/* Visual Honesty Callout */}
          <div className="p-3.5 rounded-xl bg-muted/60 border border-border/80 text-xs text-muted-foreground text-left space-y-1 w-full">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <span>Why am I not seeing numbers?</span>
            </div>
            <p className="text-[11px] text-muted-foreground/90 leading-relaxed">
              We intentionally do <strong>not</strong> display the whole province’s results here to prevent misleading you into thinking those are {placeName}&apos;s local council numbers. As soon as the first local voting district reports, candidate and party standings will appear here automatically.
            </p>
          </div>

          {/* Navigation Escapes */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2 w-full">
            {onViewParentScope && parentScopeName && (
              <Button
                variant="outline"
                size="sm"
                onClick={onViewParentScope}
                className="text-xs font-semibold gap-1.5"
              >
                <span>View {parentScopeName} Province</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}

            {onClearFilter && (
              <Button
                variant="default"
                size="sm"
                onClick={onClearFilter}
                className="text-xs font-semibold gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to National Overview</span>
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-5 flex flex-col gap-3.5 w-full max-w-full overflow-hidden shadow-sm">
      {/* 3-Tier Multi-Row Header Architecture (ElectAI Pattern) */}
      <CardHeader className="p-0 flex flex-col gap-3 min-w-0">
        {/* TIER 1: Title & Scoped Count Status */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <Trophy className="w-4 h-4 text-yellow-500 dark:text-yellow-400 shrink-0" />
            <h3 className="font-bold text-sm sm:text-base text-foreground truncate">
              {regionLabel ? `${regionLabel} Standings` : 'Party Standings'}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {regionLabel && onClearFilter && (
              <Button
                variant="ghost"
                size="xs"
                onClick={onClearFilter}
                className="h-6 px-2 text-[11px] text-primary hover:bg-primary/10 rounded-full cursor-pointer"
              >
                Clear <X className="w-3 h-3 ml-0.5" />
              </Button>
            )}
            <Badge variant="outline" size="sm" className="font-mono text-[10px] shrink-0">
              {filteredParties.length} {filteredParties.length === 1 ? 'Party' : 'Parties'}
            </Badge>
          </div>
        </div>

        {/* Dedicated Ward Councillor Spotlight Banner (When drilled into a ward) */}
        {wardCouncillor && wardCouncillor.candidateName && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 flex items-center justify-between gap-3 text-xs transition-all">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    {wardCouncillor.status === 'declared' ? 'Elected Ward Councillor' : 'Leading Ward Candidate'}
                  </span>
                  <Badge
                    variant={wardCouncillor.status === 'declared' ? 'default' : 'outline'}
                    size="sm"
                    className="text-[9px] px-1.5 py-0 font-semibold"
                  >
                    {wardCouncillor.status === 'declared' ? 'Certified' : 'Provisional'}
                  </Badge>
                </div>
                <div className="font-bold text-sm text-foreground truncate">
                  {wardCouncillor.candidateName}
                </div>
                <div className="text-[11px] text-muted-foreground truncate">
                  {wardCouncillor.partyAbbr} • {wardCouncillor.votePercentage.toFixed(1)}% ({wardCouncillor.votes.toLocaleString('en-ZA')} votes)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TIER 2: Segmented Navigation Tabs (Full Width Grid) */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-muted/70 rounded-xl text-xs font-medium">
          <button
            type="button"
            onClick={() => setFilterMode('top10')}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${
              filterMode === 'top10'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Top 10
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('seats')}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${
              filterMode === 'seats'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Seat Winners
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${
              filterMode === 'all'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Parties ({parties.length})
          </button>
        </div>

        {/* Proportional Representation Honesty Callout when PR seats are pending */}
        {parties.some((p) => (p.wardSeats ?? 0) > 0 && (p.prSeats ?? 0) === 0) && (
          <div className="flex items-start gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-400 leading-tight">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
            <span>
              <strong>Ward vs PR Seat Notice:</strong> Listed seat figures reflect declared <strong>Ward winners</strong> only. Under statutory municipal law, <strong>PR balancing seats</strong> will be calculated and distributed to mirror popular vote percentages once all voting districts reach 100% declaration.
            </span>
          </div>
        )}

        {/* TIER 3: Search Input & Baseline Swing Controls */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search party or candidate..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs bg-muted/40 rounded-lg min-w-0"
            />
          </div>

          <div className="flex items-center gap-0.5 bg-muted/70 p-0.5 rounded-lg border border-border/60 text-[11px] shrink-0">
            <button
              type="button"
              onClick={() => setBaselineYear('2021')}
              className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                baselineYear === '2021'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              2021 LGE
            </button>
            <button
              type="button"
              onClick={() => setBaselineYear('2024')}
              className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                baselineYear === '2024'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              2024 NPE
            </button>
          </div>
        </div>
      </CardHeader>

      {/* Adaptive Stacked Rows (Zero Horizontal Overflow, ElectAI Pattern) */}
      <CardContent className="p-0 overflow-hidden w-full max-w-full">
        <ul className="flex flex-col divide-y divide-border/60 list-none m-0 p-0 w-full max-w-full">
          {filteredParties.map((party, index) => {
            const swing = calculateVoteSwing(party.abbr, party.votePercentage, baselineYear);

            return (
              <li
                key={party.id}
                className="py-3 px-1.5 flex flex-col gap-1.5 min-w-0 hover:bg-muted/40 rounded-xl transition-colors group"
              >
                {/* Top Tier: Left (Logo + Names) & Right (Vote % + Swing + Stacked Votes/Seats) */}
                <div className="flex items-center justify-between gap-2 min-w-0">
                  {/* Left Block: Rank, Logo, Names */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="w-5 text-center font-mono text-xs font-semibold text-muted-foreground shrink-0">
                      {index + 1}
                    </span>

                    <PartyLogo
                      abbr={party.abbr}
                      name={party.fullName}
                      color={party.color}
                      size="sm"
                      className="shrink-0"
                    />

                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-bold text-sm text-foreground truncate">
                          {party.abbr}
                        </span>
                        {party.isIndependent && (
                          <Badge variant="outline" size="sm" className="text-[9px] px-1 py-0 shrink-0">
                            IND
                          </Badge>
                        )}
                      </div>
                      <span
                        className="text-[11px] text-muted-foreground truncate leading-tight"
                        title={party.fullName}
                      >
                        {party.fullName}
                      </span>
                      {party.candidate && (
                        <div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium truncate mt-0.5">
                          <User className="w-3 h-3 shrink-0 opacity-80" />
                          <span className="truncate">Candidate: <strong>{party.candidate}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Block: Primary % & Swing + Stacked Raw Votes & Seats */}
                  <div className="flex flex-col items-end shrink-0 text-right tabular-nums">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-sm sm:text-base font-mono text-foreground">
                        {party.votePercentage.toFixed(2)}%
                      </span>

                      {/* Swing Indicator Pill */}
                      {swing.isNew ? (
                        <span
                          title={`New political party since ${baselineYear}`}
                          className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20 shrink-0 select-none"
                        >
                          NEW
                        </span>
                      ) : swing.delta > 0.05 ? (
                        <span
                          title={`+${swing.delta.toFixed(2)}% vs ${baselineYear} official baseline (${swing.baselinePercent.toFixed(2)}%)`}
                          className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shrink-0 select-none"
                        >
                          <TrendingUp className="w-2.5 h-2.5" /> +{swing.delta.toFixed(1)}%
                        </span>
                      ) : swing.delta < -0.05 ? (
                        <span
                          title={`${swing.delta.toFixed(2)}% vs ${baselineYear} official baseline (${swing.baselinePercent.toFixed(2)}%)`}
                          className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25 shrink-0 select-none"
                        >
                          <TrendingDown className="w-2.5 h-2.5" /> {swing.delta.toFixed(1)}%
                        </span>
                      ) : (
                        <span
                          title={`0.00% change vs ${baselineYear} baseline`}
                          className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.2 rounded-md bg-muted text-muted-foreground shrink-0 select-none"
                        >
                          <Minus className="w-2 h-2" /> 0.0%
                        </span>
                      )}
                    </div>

                    {/* Secondary Stacked Subtext */}
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono mt-0.5">
                      <span>{party.votes.toLocaleString('en-ZA')} votes</span>
                      {party.seats > 0 && (
                        <>
                          <span>•</span>
                          <span
                            className="font-semibold text-foreground"
                            title={
                              (party.wardSeats ?? 0) > 0 && (party.prSeats ?? 0) === 0
                                ? `${(party.wardSeats ?? 0).toLocaleString('en-ZA')} declared ward seats. Proportional representation (PR) balancing seats will be awarded upon 100% council declaration.`
                                : `${party.seats.toLocaleString('en-ZA')} total council seats`
                            }
                          >
                            {(party.wardSeats ?? 0) > 0 && (party.prSeats ?? 0) === 0
                              ? `${(party.wardSeats ?? 0).toLocaleString('en-ZA')} ward seats (PR pending)`
                              : `${party.seats.toLocaleString('en-ZA')} seats`}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Tier: Proportional Brand-Colored Micro Bar */}
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-0.5">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.max(1, Math.min(100, party.votePercentage))}%`,
                      backgroundColor: party.color,
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>

        {/* Expand / Collapse Toggle for viewing beyond Top 10 */}
        {parties.length > 10 && !search.trim() && (
          <div className="pt-2 px-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterMode(filterMode === 'top10' ? 'all' : 'top10')}
              className="w-full text-xs font-semibold gap-1.5 h-8.5 rounded-xl border-dashed hover:bg-muted cursor-pointer"
            >
              {filterMode === 'top10' ? (
                <>
                  <span>Show All {parties.length} Contesting Parties</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>Show Top 10 Only</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </div>
        )}

        {filteredParties.length === 0 && (
          <div className="py-10 text-center text-muted-foreground text-xs">
            No parties matching &quot;{search}&quot;
          </div>
        )}
      </CardContent>
    </Card>
  );
}
