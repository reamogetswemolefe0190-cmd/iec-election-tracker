'use client';

import React, { useState } from 'react';
import { EnrichedPartyResult, MunicipalitySummary, ProvinceSummary } from '@/types/election';
import { WardResult } from '@/lib/wards';
import { Info, ShieldAlert, Clock, ArrowRight, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PartyLogo } from '@/components/ui/party-logo';

interface PlainLanguageBannerProps {
  year: '2026' | '2024';
  activeMunicipality?: MunicipalitySummary | null;
  activeProvince?: ProvinceSummary | null;
  selectedWard?: WardResult | null;
  displayParties: EnrichedPartyResult[];
  percComplete: number;
  vdsComplete: number;
  vdExpected: number;
  totalVotes: number;
  isResultsPending?: boolean;
  selectedLocationName?: string | null;
  parentProvinceName?: string | null;
  onViewParentProvince?: () => void;
}

export function PlainLanguageBanner({
  year,
  activeMunicipality,
  activeProvince,
  selectedWard,
  displayParties,
  percComplete,
  vdsComplete,
  vdExpected,
  totalVotes,
  isResultsPending = false,
  selectedLocationName,
  parentProvinceName,
  onViewParentProvince,
}: PlainLanguageBannerProps) {
  const formatNum = (n: number) => new Intl.NumberFormat('en-ZA').format(n);
  const [lang, setLang] = useState<'EN' | 'ZU' | 'XH' | 'AF' | 'ST'>('EN');

  // Dedicated "Results Not Yet Available" Banner (Visual Honesty Guardrail)
  if (isResultsPending) {
    const placeName = selectedLocationName || 'This Location';

    return (
      <div className="rounded-2xl border border-amber-500/30 bg-card p-4 sm:p-5 shadow-xs space-y-3.5 transition-all">
        {/* Top Advisory Pill */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2.5">
          <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400 font-semibold text-xs">
            <Clock className="w-4 h-4 shrink-0 animate-pulse" />
            <span>AWAITING LOCAL RETURNS • {placeName.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
            <span>0 of {vdExpected > 0 ? formatNum(vdExpected) : '—'} VDs Counted</span>
          </div>
        </div>

        {/* Main Narrative */}
        <div className="space-y-1.5">
          <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
            Results for {placeName} are not yet available
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Ballot counting at local voting stations across {placeName} {parentProvinceName ? `(${parentProvinceName})` : ''} is currently underway. No official results slips have been scanned and verified into the IEC central results system yet.
          </p>
        </div>

        {/* Visual Honesty Callout & Escape Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border/40 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400/90">
            <Info className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>
              <strong>Visual Honesty Guardrail:</strong> Provincial numbers are intentionally hidden to prevent confusion with local council contests.
            </span>
          </div>

          {onViewParentProvince && parentProvinceName && (
            <Button
              variant="outline"
              size="xs"
              onClick={onViewParentProvince}
              className="text-[11px] font-semibold text-primary border-primary/30 hover:bg-primary/10 shrink-0 self-start sm:self-auto gap-1"
            >
              <span>View {parentProvinceName} Province</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  const topParty = displayParties[0];
  const runnerUp = displayParties[1];

  const leadMargin =
    topParty && runnerUp
      ? (topParty.votePercentage - runnerUp.votePercentage).toFixed(1)
      : null;

  // Derive plain language narrative based on election scope
  let scopeHeadline = '';
  let analysisNarrative = '';
  let coalitionNarrative = '';

  if (selectedWard) {
    if (topParty) {
      scopeHeadline = `${topParty.abbr} leads in ${selectedWard.name} (${topParty.votePercentage.toFixed(1)}%)`;
      if (selectedWard.councillorCandidate) {
        scopeHeadline += ` • Candidate: ${selectedWard.councillorCandidate}`;
      }
    } else {
      scopeHeadline = `Counting in progress in ${selectedWard.name}`;
    }
    analysisNarrative = `${formatNum(vdsComplete)} of ${formatNum(vdExpected)} Voting Districts counted (${percComplete.toFixed(1)}%). Total votes cast: ${formatNum(totalVotes)}.`;
    coalitionNarrative = selectedWard.status === 'declared' ? 'Official ward councillor outcome certified.' : 'Provisional ward voting district returns.';
  } else if (activeMunicipality) {
    const totalSeats = activeMunicipality.seatsExpected || 0;
    const majorityThreshold = totalSeats > 0 ? Math.ceil((totalSeats + 1) / 2) : 0;

    if (topParty) {
      if (topParty.votePercentage >= 50) {
        scopeHeadline = `${topParty.fullName || topParty.abbr} holds a projected majority in ${activeMunicipality.name}`;
      } else {
        scopeHeadline = `${topParty.abbr} is ahead in ${activeMunicipality.name} (${topParty.votePercentage.toFixed(1)}%), but short of an outright majority`;
      }
    } else {
      scopeHeadline = `Counting in progress in ${activeMunicipality.name}`;
    }

    // Council math narrative
    if (totalSeats > 0) {
      if (activeMunicipality.majorityWon) {
        coalitionNarrative = `The council has ${totalSeats} seats. ${topParty?.abbr || 'The leading party'} has passed the ${majorityThreshold}-seat threshold to govern alone without coalition partners.`;
      } else if (activeMunicipality.hungCouncil || (topParty && topParty.votePercentage < 50)) {
        coalitionNarrative = `The council has ${totalSeats} seats, so ${majorityThreshold} seats are needed to elect an Executive Mayor and Council Speaker. A coalition between 2 or more parties will be required.`;
      } else {
        coalitionNarrative = `The council has ${totalSeats} seats (${majorityThreshold} needed for outright control). Early counts can shift significantly as urban wards report.`;
      }
    }

    // Counting progress narrative
    if (percComplete >= 100) {
      analysisNarrative = `All ${formatNum(vdExpected)} Voting Districts have been tabulated (${formatNum(totalVotes)} valid ballots processed). Awaiting official IEC sign-off and declaration.`;
    } else {
      analysisNarrative = `${formatNum(vdsComplete)} of ${formatNum(vdExpected)} VDs counted (${percComplete.toFixed(1)}%). ${
        runnerUp ? `${topParty?.abbr} leads ${runnerUp.abbr} by ${leadMargin} percentage points.` : ''
      }`;
    }
  } else if (activeProvince) {
    if (topParty && runnerUp) {
      scopeHeadline = `${topParty.abbr} leads in ${activeProvince.name} with ${topParty.votePercentage.toFixed(1)}% of counted votes`;
      analysisNarrative = `${topParty.fullName || topParty.abbr} leads ${runnerUp.fullName || runnerUp.abbr} by ${leadMargin}% across ${activeProvince.name}. ${formatNum(vdsComplete)} of ${formatNum(vdExpected)} VDs reported (${percComplete.toFixed(1)}%).`;
    } else {
      scopeHeadline = `Provincial tally for ${activeProvince.name}`;
      analysisNarrative = `${percComplete.toFixed(1)}% of voting districts counted across ${activeProvince.name}.`;
    }
    coalitionNarrative = `Seat counts during ongoing tallies reflect declared Ward winners only. Proportional Representation (PR) balancing seats will be awarded to mirror overall popular vote share once all voting districts in ${activeProvince.name} reach 100% declaration.`;
  } else {
    // National Overview
    if (topParty && runnerUp) {
      scopeHeadline = `${topParty.abbr} leads nationally at ${topParty.votePercentage.toFixed(1)}%, followed by ${runnerUp.abbr} (${runnerUp.votePercentage.toFixed(1)}%)`;
      analysisNarrative = `With ${percComplete.toFixed(1)}% of the country counted (${formatNum(vdsComplete)} of ${formatNum(vdExpected)} VDs), ${formatNum(totalVotes)} total ballots have been processed across all 9 provinces.`;
    } else {
      scopeHeadline = `National South African Election Count`;
      analysisNarrative = `Real-time counting progress across all 23,292 Voting Districts in South Africa.`;
    }
    coalitionNarrative =
      year === '2026'
        ? 'Local government election outcomes will determine council control across all 213 local municipalities and 8 metropolitan councils.'
        : 'National Assembly representation requires 201 of 400 seats for an outright majority or coalition government.';
  }

  // Multilingual synthesis for official South African languages
  if (lang === 'ZU') {
    if (topParty && runnerUp) {
      scopeHeadline = `U-${topParty.abbr} uhola ngamaphesenti angama-${topParty.votePercentage.toFixed(1)}%, kulandele i-${runnerUp.abbr} (${runnerUp.votePercentage.toFixed(1)}%)`;
      analysisNarrative = `Kukalwe amavoti eziteshi ezingama-${formatNum(vdsComplete)} kwezingama-${formatNum(vdExpected)} (${percComplete.toFixed(1)}%). Amavoti asabalwe wonke ayizi-${formatNum(totalVotes)}.`;
      coalitionNarrative = 'Ukuphatha umkhandlu kudinga ingxenye enkulu yamavoti (50% + 1 seat) noma isivumelwano sokubambisana phakathi kwamaqembu.';
    }
  } else if (lang === 'XH') {
    if (topParty && runnerUp) {
      scopeHeadline = `I-${topParty.abbr} ikhokhele ngama-${topParty.votePercentage.toFixed(1)}%, ilandelwa yi-${runnerUp.abbr} (${runnerUp.votePercentage.toFixed(1)}%)`;
      analysisNarrative = `Kubalwe izikhululo zokuvota ezingama-${formatNum(vdsComplete)} kwezingama-${formatNum(vdExpected)} (${percComplete.toFixed(1)}%). Isimbuku samavoti amukelweyo siyi-${formatNum(totalVotes)}.`;
      coalitionNarrative = 'Ulawulo loomasipala lufuna isivumelwano sobumbano ukuba akukho qela lifumene isininzi esipheleleyo.';
    }
  } else if (lang === 'AF') {
    if (topParty && runnerUp) {
      scopeHeadline = `${topParty.abbr} loop voor met ${topParty.votePercentage.toFixed(1)}%, gevolg deur die ${runnerUp.abbr} (${runnerUp.votePercentage.toFixed(1)}%)`;
      analysisNarrative = `Met ${percComplete.toFixed(1)}% van die stemdistrikte getel (${formatNum(vdsComplete)} van ${formatNum(vdExpected)} stemdistrikte), is ${formatNum(totalVotes)} stembriewe verwerk.`;
      coalitionNarrative = 'Koalisie-ooreenkomste sal vereis word waar geen enkele party \'n volstrekte meerderheid (50% + 1) behaal nie.';
    }
  } else if (lang === 'ST') {
    if (topParty && runnerUp) {
      scopeHeadline = `${topParty.abbr} e eteletse pele ka ${topParty.votePercentage.toFixed(1)}%, e latelwa ke ${runnerUp.abbr} (${runnerUp.votePercentage.toFixed(1)}%)`;
      analysisNarrative = `Ho balilwe ditsi tsa dikgetho tse ${formatNum(vdsComplete)} ho tse ${formatNum(vdExpected)} (${percComplete.toFixed(1)}%). Palo yohle ya dibalate ke ${formatNum(totalVotes)}.`;
      coalitionNarrative = 'Mmuso wa kopanelo o tla hlokahala moo ho seng mokgatlo o fihlelang boholo ba 50% + 1.';
    }
  }

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-card p-4 sm:p-5 shadow-xs space-y-3.5 transition-all">
      {/* Top Advisory Pill: Misinformation Guardrail & Language Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2.5">
        <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400 font-semibold text-xs">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-500 dark:text-amber-400" />
          <span>PROVISIONAL IEC COUNT</span>
          <span className="text-zinc-500 hidden sm:inline">•</span>
          <span className="text-muted-foreground font-normal hidden sm:inline">
            Preliminary until officially certified
          </span>
        </div>

        {/* Multilingual Selector */}
        <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/60 text-[10px] font-semibold">
          <Globe className="w-3 h-3 text-muted-foreground ml-1" />
          {(['EN', 'ZU', 'XH', 'AF', 'ST'] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={`px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                lang === l
                  ? 'bg-card text-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title={
                l === 'EN'
                  ? 'English'
                  : l === 'ZU'
                  ? 'isiZulu'
                  : l === 'XH'
                  ? 'isiXhosa'
                  : l === 'AF'
                  ? 'Afrikaans'
                  : 'Sesotho'
              }
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Main Narrative Block */}
      <div className="space-y-1.5">
        <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
          {topParty && (
            <PartyLogo
              abbr={topParty.abbr}
              name={topParty.fullName}
              color={topParty.color}
              size="sm"
            />
          )}
          <span>{scopeHeadline}</span>
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {analysisNarrative} {coalitionNarrative}
        </p>
      </div>

      {/* Visual Honesty Note */}
      <div className="flex items-center gap-1.5 text-[11px] text-zinc-400/90 pt-1 border-t border-border/30">
        <Info className="w-3 h-3 text-primary shrink-0" />
        <span>
          <strong>Visual Honesty Note:</strong> Early returns often represent smaller, rural voting districts that count first. Metro ward tallies report later in the cycle.
        </span>
      </div>
    </div>
  );
}
