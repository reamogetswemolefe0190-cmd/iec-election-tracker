'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { EnrichedPartyResult } from '@/types/election';
import {
  Users2,
  Check,
  AlertCircle,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Landmark,
  Newspaper,
  History,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PartyLogo } from '@/components/ui/party-logo';
import { getMunicipalDossier, MunicipalCoalitionDossier } from '@/lib/coalition-dossier';

interface CoalitionBuilderProps {
  parties: EnrichedPartyResult[];
  majorityThreshold?: number;
  totalSeats?: number;
  scopeName?: string;
  municipalityCode?: string | null;
}

export function CoalitionBuilder({
  parties,
  majorityThreshold = 201,
  totalSeats = 400,
  scopeName = 'National Assembly',
  municipalityCode = null,
}: CoalitionBuilderProps) {
  const [showDossier, setShowDossier] = useState(false);

  // Retrieve municipal political dossier (Tshwane, Joburg, Ekurhuleni, eThekwini, etc.)
  const dossier: MunicipalCoalitionDossier | null = useMemo(() => {
    return getMunicipalDossier(municipalityCode || scopeName);
  }, [municipalityCode, scopeName]);

  // Derive effective seats per party using statutory South African Largest Remainder / Hare Quota PR method
  // This completely eliminates any ~2% rounding errors and ensures sum(seats) === totalSeats
  const partiesWithSeats = useMemo(() => {
    const hasDeclaredSeats = parties.some((p) => (p.seats ?? 0) > 0);
    if (hasDeclaredSeats) {
      return parties
        .filter((p) => (p.seats ?? 0) > 0)
        .map((p) => ({
          ...p,
          simulatedSeats: p.seats,
        }))
        .sort((a, b) => b.simulatedSeats - a.simulatedSeats);
    }

    // Statutory Hare Quota Largest Remainder calculation
    const activeParties = parties.filter((p) => (p.votes || 0) > 0 || (p.votePercentage || 0) > 0);
    const totalVotes = activeParties.reduce((sum, p) => sum + (p.votes || 0), 0);
    const quota = totalVotes > 0 && totalSeats > 0 ? totalVotes / totalSeats : 1;

    let totalAllocated = 0;
    const initialList = activeParties.map((p) => {
      const exactQuotaSeats =
        totalVotes > 0 && p.votes > 0
          ? p.votes / quota
          : ((p.votePercentage || 0) / 100) * totalSeats;

      const baseSeats = Math.floor(exactQuotaSeats);
      const remainder = exactQuotaSeats - baseSeats;
      totalAllocated += baseSeats;

      return {
        ...p,
        baseSeats,
        remainder,
        simulatedSeats: baseSeats,
      };
    });

    // Allocate surplus seats to parties with largest fractional remainders
    const surplusSeats = Math.max(0, totalSeats - totalAllocated);
    const sortedByRemainder = [...initialList].sort((a, b) => b.remainder - a.remainder);
    for (let i = 0; i < surplusSeats && i < sortedByRemainder.length; i++) {
      sortedByRemainder[i].simulatedSeats += 1;
    }

    return sortedByRemainder
      .filter((p) => p.simulatedSeats > 0)
      .sort((a, b) => b.simulatedSeats - a.simulatedSeats);
  }, [parties, totalSeats]);

  // Default selection: top 2 parties
  const [selectedIds, setSelectedIds] = useState<number[]>(() => {
    return partiesWithSeats.slice(0, 2).map((p) => p.id);
  });

  // Re-sync default selection when scope changes
  useEffect(() => {
    if (partiesWithSeats.length > 0) {
      setSelectedIds(partiesWithSeats.slice(0, 2).map((p) => p.id));
    }
  }, [scopeName, municipalityCode]);

  const toggleParty = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const selectedParties = partiesWithSeats.filter((p) => selectedIds.includes(p.id));
  const combinedSeats = selectedParties.reduce((sum, p) => sum + p.simulatedSeats, 0);
  const combinedPercent = totalSeats > 0 ? ((combinedSeats / totalSeats) * 100).toFixed(1) : '0';
  const hasMajority = combinedSeats >= majorityThreshold;
  const seatGap = combinedSeats - majorityThreshold;

  // Determine chamber label (e.g. "City of Johannesburg Council", "National Assembly", "Council")
  const chamberLabel = useMemo(() => {
    if (scopeName.toLowerCase().includes('national') || scopeName.toLowerCase().includes('assembly')) {
      return 'National Assembly';
    }
    if (scopeName.toLowerCase().includes('council') || scopeName.toLowerCase().includes('metro')) {
      return scopeName;
    }
    return `${scopeName} Council`;
  }, [scopeName]);

  // Apply custom presets (either from dossier or standard national/municipal presets)
  const applyPreset = (abbrList: string[]) => {
    if (abbrList.length === 0) {
      setSelectedIds([]);
      return;
    }
    const normalize = (s: string) => s.toUpperCase().replace(/[\.\s\-]/g, '');
    const matchedIds: number[] = [];

    abbrList.forEach((abbr) => {
      const match = partiesWithSeats.find((p) => normalize(p.abbr) === normalize(abbr));
      if (match) matchedIds.push(match.id);
    });

    setSelectedIds(matchedIds);
  };

  const aiStabilityAssessment = useMemo(() => {
    if (selectedParties.length < 2) return null;
    const abbrs = selectedParties.map((p) => p.abbr.toUpperCase());

    let score = 55;
    let label = 'Moderate Stability';
    let notes = 'Governing pact requires clear coalition agreement on Mayoral Committee seats and speaker positions.';

    const hasANC = abbrs.includes('ANC');
    const hasDA = abbrs.includes('DA');
    const hasEFF = abbrs.includes('EFF');
    const hasMK = abbrs.includes('MK');
    const hasActionSA = abbrs.includes('ACTIONSA');
    const hasVFPlus = abbrs.some((a) => a.includes('VF'));
    const hasIFP = abbrs.includes('IFP');

    if (hasANC && hasDA && hasIFP) {
      score = 86;
      label = 'High Stability (GNU Alignment)';
      notes = 'Mirrors national Government of National Unity pact with constitutional and programmatic alignment.';
    } else if (hasANC && hasDA) {
      score = 78;
      label = 'Strong Grand Coalition';
      notes = 'Decisive council majority; requires compromise between center-left social policies and free-market governance.';
    } else if (hasActionSA && hasANC && hasEFF) {
      score = 64;
      label = 'Local Unity Government (GLU)';
      notes = 'Current governing arrangement in Tshwane and Joburg metros with shared mayoral and MMC portfolios.';
    } else if (hasDA && hasActionSA && hasVFPlus) {
      score = 80;
      label = 'Multi-Party Charter Pact';
      notes = 'Strong programmatic alignment on municipal service delivery, clean audits, and merit-based administrative appointments.';
    } else if (hasMK && hasEFF) {
      score = 72;
      label = 'Progressive Caucus Bloc';
      notes = 'Aligned on radical municipal interventions, land use reform, and state-led public utilities.';
    } else if ((hasDA && hasEFF) || (hasActionSA && hasEFF && !hasANC)) {
      score = 40;
      label = 'Fragile Municipal Pact';
      notes = 'Historical municipal coalitions without written governing charters have experienced frequent motions of no confidence.';
    } else {
      score = hasMajority ? 70 : 45;
      label = hasMajority ? 'Viable Multi-Party Pact' : 'Sub-Majority Bloc';
      notes = hasMajority
        ? 'Crosses the threshold, but requires formal dispute-resolution mechanisms between partner parties.'
        : 'Does not yet reach the required 50% majority threshold; additional smaller kingmaker parties required.';
    }

    return { score, label, notes };
  }, [selectedParties, hasMajority]);

  return (
    <Card className="p-4 sm:p-5 border-border/80 shadow-xs">
      <CardHeader className="p-0 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Users2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{chamberLabel} Coalition Simulator</span>
            </CardTitle>
            <Badge variant="outline" className="text-[10px] font-mono uppercase bg-muted/60">
              50% + 1 Target
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            Simulate party alliances to command a working majority ({majorityThreshold} of {totalSeats} seats)
          </CardDescription>
        </div>

        {/* Preset Selector Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {dossier ? (
            dossier.presets.map((preset, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="xs"
                onClick={() => applyPreset(preset.parties)}
                className="text-[11px] h-7 px-2.5 rounded-lg border-border/70 hover:bg-muted font-medium cursor-pointer"
                title={preset.description}
              >
                {preset.label}
              </Button>
            ))
          ) : (
            <>
              <Button
                variant="outline"
                size="xs"
                onClick={() => applyPreset(['ANC', 'DA', 'IFP', 'PA', 'GOOD'])}
                className="text-[11px] h-7 px-2.5 cursor-pointer"
              >
                GNU Alignment
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => applyPreset(['ANC', 'DA'])}
                className="text-[11px] h-7 px-2.5 cursor-pointer"
              >
                ANC + DA
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => applyPreset(['MK', 'EFF'])}
                className="text-[11px] h-7 px-2.5 cursor-pointer"
              >
                MK + EFF
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="xs"
            onClick={() => applyPreset([])}
            className="text-[11px] h-7 px-2 text-muted-foreground hover:text-foreground cursor-pointer"
            title="Reset simulation"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Clear
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 space-y-4">
        {/* Outcome Banner (Robust Mobile Re-sizing Fix) */}
        <div
          className={`rounded-xl p-3.5 sm:p-4 border transition-all ${
            hasMajority
              ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/30 text-emerald-900 dark:text-emerald-100'
              : 'bg-amber-50 dark:bg-amber-950/20 border-amber-500/30 text-amber-900 dark:text-amber-100'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg border shrink-0 mt-0.5 sm:mt-0 ${
                  hasMajority
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40'
                }`}
              >
                {hasMajority ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </div>

              <div className="min-w-0 flex-1">
                {/* Seats and Percentage (Kept clean without wrapping into each other) */}
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-xl sm:text-2xl font-black font-mono text-foreground tabular-nums whitespace-nowrap">
                    {combinedSeats.toLocaleString('en-ZA')} Seats
                  </span>
                  <span className="text-xs text-muted-foreground font-mono tabular-nums">
                    ({combinedPercent}% of {chamberLabel})
                  </span>
                </div>

                <p className="text-xs font-semibold mt-0.5 leading-snug">
                  {hasMajority ? (
                    <span className="text-emerald-700 dark:text-emerald-300">
                      Governing Majority Achieved (+{seatGap} above {majorityThreshold} threshold)
                    </span>
                  ) : (
                    <span className="text-amber-700 dark:text-amber-400">
                      Hung Council ({Math.abs(seatGap)} seats short of {majorityThreshold} majority to elect Mayor)
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Progress bar towards majority threshold */}
            <div className="sm:w-52 w-full pt-1 sm:pt-0 shrink-0">
              <div className="flex justify-between items-center text-[11px] font-mono mb-1 text-muted-foreground">
                <span>Target: {majorityThreshold}</span>
                <span className="font-bold tabular-nums">
                  {Math.round((combinedSeats / majorityThreshold) * 100)}%
                </span>
              </div>
              <Progress
                value={Math.min(100, (combinedSeats / majorityThreshold) * 100)}
                indicatorColor={hasMajority ? 'var(--status-majority)' : 'var(--status-hung)'}
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* AI Coalition Stability Assessment (Mobile Clean Stacking) */}
        {aiStabilityAssessment && (
          <div className="p-3.5 rounded-xl border border-border/80 bg-muted/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all">
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 font-bold text-foreground">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-xs">Stability Assessment:</span>
                <Badge
                  variant="outline"
                  className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/30 text-[11px] font-semibold font-mono py-0"
                >
                  {aiStabilityAssessment.label}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {aiStabilityAssessment.notes}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 bg-card px-3 py-1.5 rounded-lg border border-border/80 shadow-2xs">
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Stability Index
                </div>
                <div className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {aiStabilityAssessment.score}/100
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selectable Party Chips */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Tap parties to toggle coalition:
            </span>
            <Badge variant="outline" className="text-[11px] font-mono">
              {selectedParties.length} selected
            </Badge>
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {partiesWithSeats.map((party) => {
              const isSelected = selectedIds.includes(party.id);
              return (
                <Button
                  key={party.id}
                  variant={isSelected ? 'default' : 'outline'}
                  size="xs"
                  onClick={() => toggleParty(party.id)}
                  aria-pressed={isSelected}
                  className={`h-8 rounded-xl px-2.5 sm:px-3 text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-muted text-foreground border-emerald-500/60 shadow-xs ring-1 ring-emerald-500/30 font-semibold'
                      : 'bg-card text-muted-foreground border-border hover:text-foreground'
                  }`}
                >
                  <PartyLogo
                    abbr={party.abbr}
                    name={party.fullName}
                    color={party.color}
                    size="xs"
                  />
                  <span className="font-bold text-foreground">{party.abbr}</span>
                  <span className="font-mono text-muted-foreground text-[11px] tabular-nums">
                    ({party.simulatedSeats})
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 ml-0.5" />}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Municipal Realities, Past Coalitions & Breaking News Dossier */}
        {dossier && (
          <div className="border border-border/80 rounded-xl overflow-hidden bg-muted/20 transition-all mt-3">
            <button
              type="button"
              onClick={() => setShowDossier(!showDossier)}
              className="w-full px-4 py-3 bg-muted/40 hover:bg-muted/60 transition-colors flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-bold text-xs sm:text-sm text-foreground">
                  {dossier.councilName} Realities, Past Coalitions & Breaking News
                </span>
                <Badge variant="outline" className="text-[10px] font-mono bg-background">
                  {dossier.breakingNewsAndFlashpoints.length} Updates
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>{showDossier ? 'Hide Dossier' : 'View History & Intel'}</span>
                {showDossier ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showDossier && (
              <div className="p-4 space-y-4 border-t border-border/80">
                {/* Incumbent Leadership Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-card border border-border/80">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                      Incumbent Executive Mayor
                    </div>
                    <div className="font-bold text-xs sm:text-sm text-foreground mt-0.5">
                      {dossier.currentMayor.name} ({dossier.currentMayor.party})
                    </div>
                    {dossier.currentMayor.deputyMayor && (
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        Deputy: {dossier.currentMayor.deputyMayor} ({dossier.currentMayor.deputyParty})
                      </div>
                    )}
                  </div>
                  <div className="p-3 rounded-lg bg-card border border-border/80">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                      Current Governing Pact
                    </div>
                    <div className="font-bold text-xs sm:text-sm text-foreground mt-0.5">
                      {dossier.coalitionPactName}
                    </div>
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5 font-medium truncate">
                      {dossier.governingParties.join(' + ')}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-card border border-border/80">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                      Council Seat Realities
                    </div>
                    <div className="font-bold text-xs sm:text-sm text-foreground mt-0.5 font-mono">
                      {dossier.totalSeats} Total / {dossier.majorityThreshold} for 50%+1
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Elected: {dossier.currentMayor.electedDate}
                    </div>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="p-3 rounded-lg bg-card border border-border/80 text-xs leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">Coalition Status: </span>
                  {dossier.currentMayor.status}
                </div>

                {/* Two-Column: Past Coalitions Timeline vs Breaking News */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Past Coalitions Timeline */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <History className="w-3.5 h-3.5 text-primary" />
                      <span>Past Coalitions & Power Shifts</span>
                    </div>
                    <div className="space-y-2">
                      {dossier.pastCoalitionsTimeline.map((c, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-lg bg-card border border-border/70 space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground">{c.mayor}</span>
                            <Badge variant="outline" className="text-[10px] font-mono">
                              {c.period}
                            </Badge>
                          </div>
                          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                            Parties: {c.parties}
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-normal">
                            {c.outcome}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Breaking News & Developments */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <Newspaper className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Breaking Political & Governance News</span>
                    </div>
                    <div className="space-y-2">
                      {dossier.breakingNewsAndFlashpoints.map((news, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-lg bg-card border border-border/70 space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-foreground leading-snug">{news.title}</span>
                            <Badge variant="secondary" className="text-[10px] shrink-0 font-mono">
                              {news.tag}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-normal">
                            {news.summary}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
