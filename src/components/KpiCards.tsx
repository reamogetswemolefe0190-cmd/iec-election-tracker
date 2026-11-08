'use client';

import React from 'react';
import { ElectionDataResponse, ProvinceSummary, MunicipalitySummary } from '@/types/election';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PartyLogo } from '@/components/ui/party-logo';
import { CheckCircle2, Users, Vote, Trophy, Building2, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WardResult } from '@/lib/wards';

interface KpiCardsProps {
  data: ElectionDataResponse;
  activeProvince?: ProvinceSummary | null;
  activeMunicipality?: MunicipalitySummary | null;
  selectedWard?: WardResult | null;
  onClearFilter?: () => void;
  onOpenShare?: () => void;
  isPendingResults?: boolean;
  selectedLocationName?: string | null;
  parentScopeName?: string | null;
}

export function KpiCards({
  data,
  activeProvince,
  activeMunicipality,
  selectedWard,
  onClearFilter,
  onOpenShare,
  isPendingResults = false,
  selectedLocationName,
  parentScopeName,
}: KpiCardsProps) {
  const { stats, leadingParty: nationalLeadingParty, electionYear } = data;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-ZA').format(num);
  };

  const isLge = electionYear === '2026';
  const isFiltered = Boolean(activeMunicipality || activeProvince);

  // Compute metrics based on active filter scope
  let scopeTitle = 'National Aggregate Count';
  let countingProgress = stats.percComplete;
  let vdsComplete = stats.vdsComplete;
  let vdExpected = stats.vdExpected;
  let card1Title = 'National Counting Progress';
  let card1Subtitle = (
    <span>
      <b className="text-foreground">{formatNumber(vdsComplete)}</b> of{' '}
      {formatNumber(vdExpected)} National VDs counted
    </span>
  );

  let card2Title = isLge ? 'National Registered Voters' : 'National Voter Turnout';
  let card2Value = formatNumber(stats.registeredVoters);
  let card2Subtitle = isLge ? (
    <span>
      Across <b className="text-foreground">{formatNumber(stats.wardsExpected || 4485)}</b> Wards
    </span>
  ) : (
    <span>
      <b className="text-foreground">{formatNumber(stats.totalVotesCast)}</b> total votes cast
    </span>
  );
  let card2Secondary = (
    <span>
      Turnout:{' '}
      <b className="text-foreground">
        {stats.percentagePoll > 0 ? `${stats.percentagePoll.toFixed(2)}%` : 'Pending'}
      </b>
    </span>
  );

  let card3Title = isLge ? 'National Municipalities' : 'National Vote Integrity';
  let card3Value = isLge ? `${formatNumber(stats.municsExpected)}` : formatNumber(stats.validVotesCast);
  let card3Icon = isLge ? <Building2 className="w-4 h-4" /> : <Vote className="w-4 h-4" />;
  let card3Subtitle = (
    <span className="text-status-completed font-semibold">
      {isLge ? `${formatNumber(stats.municsComplete)} Councils Declared` : '✓ Valid Ballots Processed'}
    </span>
  );
  let card3Footer = isLge ? (
    <div className="flex items-center justify-between">
      <span>Wards: {formatNumber(stats.wardsExpected)}</span>
      <span>Seats: {formatNumber(stats.seatsExpected)}</span>
    </div>
  ) : (
    <div className="flex items-center justify-between">
      <span>Spoilt: {formatNumber(stats.spoiltVotes)}</span>
      <span>Special: {formatNumber(stats.specialVotes)}</span>
    </div>
  );

  let card4Title = isLge ? 'National Contesting Status' : 'National Leading Party';
  let displayLeadingParty = nationalLeadingParty;
  let card4Value = displayLeadingParty ? displayLeadingParty.abbr : 'Live Feed';
  let card4Subtitle = displayLeadingParty ? (
    <div className="flex items-center gap-2">
      <PartyLogo
        abbr={displayLeadingParty.abbr}
        name={displayLeadingParty.fullName}
        color={displayLeadingParty.color}
        size="sm"
      />
      <span className="font-bold text-foreground truncate">{displayLeadingParty.fullName}</span>
    </div>
  ) : (
    'Feed connected'
  );
  let card4Secondary = displayLeadingParty ? (
    <div className="flex items-center gap-2 text-status-live font-bold">
      <span>
        {displayLeadingParty.votePercentage > 0
          ? `${displayLeadingParty.votePercentage.toFixed(2)}%`
          : 'Active'}
      </span>
      <span className="text-muted-foreground font-normal">
        {isLge
          ? `(${formatNumber(stats.seatsExpected)} seats)`
          : `(${formatNumber(displayLeadingParty.votes)} votes)`}
      </span>
    </div>
  ) : undefined;
  let card4Footer = displayLeadingParty ? (
    <div className="flex items-center justify-between">
      <span>{isLge ? '8,825 Municipal Seats' : `Seats: ${displayLeadingParty.seats}`}</span>
      <Badge variant="outline" size="sm">
        {isLge ? 'Contested' : 'Allocated'}
      </Badge>
    </div>
  ) : undefined;

  // OVERRIDE FOR PENDING RESULTS SCOPE (VISUAL HONESTY GUARDRAIL)
  if (isPendingResults && selectedLocationName) {
    scopeTitle = `${selectedLocationName} Municipal Count`;
    countingProgress = 0;
    vdsComplete = activeMunicipality?.vdsComplete || 0;
    vdExpected = activeMunicipality?.vdExpected || 0;

    card1Title = `${selectedLocationName} Progress`;
    card1Subtitle = (
      <span>
        <b className="text-foreground">0</b> of{' '}
        {vdExpected > 0 ? formatNumber(vdExpected) : '—'} local VDs counted
      </span>
    );

    card2Title = 'Local Registered Voters';
    card2Value = activeMunicipality?.registeredVoters
      ? formatNumber(activeMunicipality.registeredVoters)
      : 'Pending';
    card2Subtitle = <span>Awaiting local ballot tallies</span>;
    card2Secondary = (
      <span>
        Turnout: <b className="text-foreground">Pending</b>
      </span>
    );

    card3Title = 'Council Seats & Status';
    card3Value = activeMunicipality?.seatsExpected
      ? `0 / ${formatNumber(activeMunicipality.seatsExpected)}`
      : 'Pending';
    card3Icon = <Building2 className="w-4 h-4" />;
    card3Subtitle = <span className="text-amber-500 font-semibold">⏳ Awaiting First Returns</span>;
    card3Footer = (
      <div className="flex items-center justify-between gap-1.5 min-w-0">
        <span className="truncate">Declaration: Pending</span>
        <Badge variant="outline" size="sm" className="shrink-0">
          Awaiting Count
        </Badge>
      </div>
    );

    card4Title = `Leading in ${selectedLocationName}`;
    card4Value = 'Pending';
    card4Subtitle = 'Awaiting ballot tallies';
    card4Secondary = (
      <div className="text-xs text-muted-foreground font-mono">
        First returns pending
      </div>
    );
    card4Footer = (
      <div className="flex items-center justify-between">
        <span>{parentScopeName || 'Local Council'}</span>
        <Badge variant="outline" size="sm">
          Municipal
        </Badge>
      </div>
    );
  }
  // OVERRIDE FOR WARD SCOPE
  else if (selectedWard) {
    scopeTitle = `${selectedWard.name} (${selectedLocationName || 'Local Ward'})`;
    countingProgress = selectedWard.percComplete;
    vdsComplete = selectedWard.vdsCounted;
    vdExpected = selectedWard.totalVds;

    card1Title = `${selectedWard.name} Progress`;
    card1Subtitle = (
      <span>
        <b className="text-foreground">{formatNumber(vdsComplete)}</b> of{' '}
        {formatNumber(vdExpected)} Ward VDs counted
      </span>
    );

    card2Title = 'Ward Turnout & Ballots';
    card2Value = `${selectedWard.turnout}%`;
    card2Subtitle = (
      <span>
        <b className="text-foreground">{formatNumber(selectedWard.totalVotes)}</b> ballots cast
      </span>
    );
    card2Secondary = (
      <span>
        Voters: <b className="text-foreground">{formatNumber(selectedWard.registeredVoters)}</b>
      </span>
    );

    card3Title = 'Ward Councillor Status';
    card3Value = selectedWard.status === 'declared' ? '✓ Declared' : 'Counting';
    card3Icon = <Vote className="w-4 h-4" />;
    card3Subtitle = (
      <span className={selectedWard.status === 'declared' ? 'text-status-completed font-semibold' : 'text-primary font-semibold'}>
        {selectedWard.councillorCandidate ? `Candidate: ${selectedWard.councillorCandidate}` : 'Ward Seat Contest'}
      </span>
    );
    card3Footer = (
      <div className="flex items-center justify-between text-xs">
        <span>Leading: {selectedWard.leadingParty.abbr}</span>
        <Badge variant="outline" size="sm">Ward Race</Badge>
      </div>
    );

    card4Title = `Leading in ${selectedWard.name}`;
    card4Value = selectedWard.leadingParty.abbr;
    card4Subtitle = (
      <div className="flex items-center gap-2">
        <PartyLogo
          abbr={selectedWard.leadingParty.abbr}
          name={selectedWard.leadingParty.abbr}
          color={selectedWard.leadingParty.color}
          size="sm"
        />
        <span className="font-bold text-foreground truncate">{selectedWard.leadingParty.abbr}</span>
      </div>
    );
    card4Secondary = (
      <div className="flex items-center gap-2 text-status-live font-bold">
        <span>{selectedWard.leadingParty.percentage.toFixed(1)}%</span>
        <span className="text-muted-foreground font-normal">({formatNumber(selectedWard.leadingParty.votes)} votes)</span>
      </div>
    );
    card4Footer = (
      <div className="flex items-center justify-between">
        <span>{parentScopeName || 'Municipality'}</span>
        <Badge variant="outline" size="sm">Ward Level</Badge>
      </div>
    );
  }
  // OVERRIDE FOR MUNICIPALITY SCOPE
  else if (activeMunicipality) {
    scopeTitle = `${activeMunicipality.name} Municipal Count`;
    countingProgress = activeMunicipality.percComplete;
    vdsComplete = activeMunicipality.vdsComplete;
    vdExpected = activeMunicipality.vdExpected;

    card1Title = `${activeMunicipality.name} Progress`;
    card1Subtitle = (
      <span>
        <b className="text-foreground">{formatNumber(vdsComplete)}</b> of{' '}
        {formatNumber(vdExpected)} local VDs counted
      </span>
    );

    const localVotes = activeMunicipality.totalVotesCast || activeMunicipality.validVotesCast || 0;
    const localReg = activeMunicipality.registeredVoters || 0;
    const localTurnout = localReg > 0 ? (localVotes / localReg) * 100 : 0;

    card2Title = localReg > 0 ? 'Local Registered Voters' : 'Local Ballots Processed';
    card2Value = localReg > 0 ? formatNumber(localReg) : formatNumber(localVotes);
    card2Subtitle = (
      <span>
        <b className="text-foreground">{formatNumber(localVotes)}</b> total votes in {activeMunicipality.name}
      </span>
    );
    card2Secondary = (
      <span>
        Turnout:{' '}
        <b className="text-foreground">
          {localTurnout > 0 ? `${localTurnout.toFixed(2)}%` : 'Pending'}
        </b>
      </span>
    );

    card3Title = 'Council Seats & Status';
    card3Value = `${formatNumber(activeMunicipality.seatsComplete)} / ${formatNumber(activeMunicipality.seatsExpected)}`;
    card3Icon = <Building2 className="w-4 h-4" />;
    card3Subtitle = activeMunicipality.majorityWon ? (
      <span className="text-status-completed font-semibold">✓ Majority Council Declared</span>
    ) : activeMunicipality.hungCouncil ? (
      <span className="text-amber-400 font-semibold">⚠ Hung Council (Coalition Needed)</span>
    ) : activeMunicipality.seatsComplete > 0 ? (
      <span className="text-blue-400 font-semibold">Seats Being Allocated</span>
    ) : (
      <span className="text-muted-foreground font-semibold">Declaration Pending</span>
    );
    card3Footer = (
      <div className="flex items-center justify-between gap-1.5 min-w-0">
        <span className="truncate">Majority: {Math.ceil((activeMunicipality.seatsExpected || 1) / 2)} seats</span>
        <Badge variant={activeMunicipality.majorityWon ? 'completed' : 'outline'} size="sm" className="shrink-0 max-w-[120px] truncate">
          {activeMunicipality.provinceName}
        </Badge>
      </div>
    );

    const municLeading = activeMunicipality.leadingParty
      ? {
          abbr: activeMunicipality.leadingParty.abbr,
          fullName: activeMunicipality.leadingParty.abbr,
          color: activeMunicipality.leadingParty.color,
          votes: activeMunicipality.leadingParty.votes,
          percentage: activeMunicipality.leadingParty.percentage,
        }
      : activeMunicipality.allParties && activeMunicipality.allParties.length > 0
      ? {
          abbr: activeMunicipality.allParties[0].abbr,
          fullName: activeMunicipality.allParties[0].fullName,
          color: activeMunicipality.allParties[0].color,
          votes: activeMunicipality.allParties[0].votes,
          percentage: activeMunicipality.allParties[0].votePercentage,
        }
      : null;

    card4Title = `Leading in ${activeMunicipality.name}`;
    card4Value = municLeading ? municLeading.abbr : 'Pending';
    card4Subtitle = municLeading ? (
      <div className="flex items-center gap-2">
        <PartyLogo
          abbr={municLeading.abbr}
          name={municLeading.fullName}
          color={municLeading.color}
          size="sm"
        />
        <span className="font-bold text-foreground truncate">{municLeading.fullName}</span>
      </div>
    ) : (
      'Awaiting local counts'
    );
    card4Secondary = municLeading ? (
      <div className="flex items-center gap-2 text-status-live font-bold">
        <span>{municLeading.percentage.toFixed(2)}%</span>
        <span className="text-muted-foreground font-normal">
          ({formatNumber(municLeading.votes)} votes)
        </span>
      </div>
    ) : undefined;
    card4Footer = (
      <div className="flex items-center justify-between">
        <span>Local Municipal Contests</span>
        <Badge variant="outline" size="sm" className="text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 font-mono">
          Official IEC Source
        </Badge>
      </div>
    );
  }
  // OVERRIDE FOR PROVINCE SCOPE
  else if (activeProvince) {
    scopeTitle = `${activeProvince.name} Provincial Count`;
    countingProgress = activeProvince.percComplete ?? 0;
    vdsComplete = activeProvince.vdsComplete ?? 0;
    vdExpected = activeProvince.vdExpected ?? 0;

    card1Title = `${activeProvince.name} Progress`;
    card1Subtitle = (
      <span>
        <b className="text-foreground">{formatNumber(vdsComplete)}</b> of{' '}
        {formatNumber(vdExpected)} VDs counted in {activeProvince.name}
      </span>
    );

    const provVotes = (activeProvince.allParties || []).reduce((sum, p) => sum + p.votes, 0);
    const sumAllProvVotes = (data.provinces || []).reduce(
      (sum, p) => sum + (p.allParties || []).reduce((s, party) => s + (party.votes || 0), 0),
      0
    );
    const natTotal = Math.max(stats.validVotesCast || stats.totalVotesCast || 0, sumAllProvVotes, provVotes, 1);
    const provShare = provVotes > 0 && natTotal > 0 ? Math.min((provVotes / natTotal) * 100, 100) : 0;

    card2Title = 'Provincial Votes Processed';
    card2Value = formatNumber(provVotes);
    card2Subtitle = (
      <span>
        Across <b className="text-foreground">{formatNumber(vdsComplete)}</b> counted VDs
      </span>
    );
    card2Secondary = (
      <span>
        Share of National:{' '}
        <b className="text-foreground">{provVotes > 0 ? `${provShare.toFixed(1)}%` : '0.0%'}</b>
      </span>
    );

    const provMunicsCount = activeProvince.municipalities?.length || 0;
    const provMunicsComplete = activeProvince.municipalities?.filter((m) => m.percComplete >= 100).length || 0;

    card3Title = isLge ? `Municipalities in ${activeProvince.name}` : 'Provincial Ballots';
    card3Value = isLge ? `${provMunicsCount}` : `${formatNumber(vdsComplete)} VDs`;
    card3Icon = isLge ? <Building2 className="w-4 h-4" /> : <Vote className="w-4 h-4" />;
    card3Subtitle = isLge ? (
      <span className="text-status-completed font-semibold">
        {provMunicsComplete} of {provMunicsCount} Councils Certified
      </span>
    ) : (
      <span className="text-status-completed font-semibold">Provincial Legislature Ballots</span>
    );
    card3Footer = (
      <div className="flex items-center justify-between gap-1.5 min-w-0">
        <span className="truncate">Total VDs: {formatNumber(vdExpected)}</span>
        <Badge variant="outline" size="sm" className="shrink-0 max-w-[120px] truncate">
          {activeProvince.name}
        </Badge>
      </div>
    );

    const provLeading = activeProvince.leadingParty
      ? {
          abbr: activeProvince.leadingParty.abbr,
          fullName: activeProvince.leadingParty.abbr,
          color: activeProvince.leadingParty.color,
          votes: activeProvince.leadingParty.votes,
          percentage: activeProvince.leadingParty.percentage,
        }
      : activeProvince.allParties && activeProvince.allParties.length > 0
      ? {
          abbr: activeProvince.allParties[0].abbr,
          fullName: activeProvince.allParties[0].fullName,
          color: activeProvince.allParties[0].color,
          votes: activeProvince.allParties[0].votes,
          percentage: activeProvince.allParties[0].votePercentage,
        }
      : null;

    card4Title = `Leading in ${activeProvince.name}`;
    card4Value = provLeading ? provLeading.abbr : 'Pending';
    card4Subtitle = provLeading ? (
      <div className="flex items-center gap-2">
        <PartyLogo
          abbr={provLeading.abbr}
          name={provLeading.fullName}
          color={provLeading.color}
          size="sm"
        />
        <span className="font-bold text-foreground truncate">{provLeading.fullName}</span>
      </div>
    ) : (
      'Awaiting provincial counts'
    );
    card4Secondary = provLeading ? (
      <div className="flex items-center gap-2 text-status-live font-bold">
        <span>{provLeading.percentage.toFixed(2)}%</span>
        <span className="text-muted-foreground font-normal">
          ({formatNumber(provLeading.votes)} votes)
        </span>
      </div>
    ) : undefined;
    card4Footer = (
      <div className="flex items-center justify-between">
        <span>Provincial Contests</span>
        <Badge variant="outline" size="sm">
          Provincial
        </Badge>
      </div>
    );
  }

  const badgeVariant =
    countingProgress >= 100 ? 'completed' : countingProgress > 0 ? 'live' : 'outline';
  const badgeText =
    countingProgress === 0
      ? '0% Initial'
      : countingProgress >= 100
      ? 'Certified'
      : 'Live Counting';
  const progressPercent = Math.min(100, Math.max(countingProgress === 0 ? 2 : 0, countingProgress));

  return (
    <div className="space-y-3">
      {/* Scope Context & Disclosure Bar (hidden on mobile to preserve vertical screen space) */}
      <div
        className={cn(
          'hidden sm:flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl border transition-colors shadow-xs',
          isFiltered
            ? 'bg-card dark:bg-primary/10 border-primary/40 text-foreground'
            : 'bg-card border-border/80 text-muted-foreground'
        )}
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          <Badge
            variant={isFiltered ? 'live' : 'outline'}
            className={cn(
              'font-mono uppercase tracking-wider text-[10px] font-bold px-2 py-0.5',
              !isFiltered && 'bg-muted/80 text-muted-foreground border-border'
            )}
          >
            {activeMunicipality
              ? 'Local Municipal Count'
              : activeProvince
              ? 'Provincial Count'
              : 'National Aggregate Count'}
          </Badge>
          <span className="text-xs sm:text-sm font-bold text-foreground">
            {activeMunicipality
              ? `${activeMunicipality.name} (${activeMunicipality.provinceName})`
              : activeProvince
              ? activeProvince.name
              : 'All 9 Provinces (National)'}
          </span>
          <span className="text-border hidden sm:inline">•</span>
          <span className="text-xs text-muted-foreground">
            {isFiltered ? (
              <span>
                Counting progress & metrics below reflect{' '}
                <b className="text-foreground">
                  {activeMunicipality ? activeMunicipality.name : activeProvince?.name}
                </b>
                , isolated from the national aggregate.
              </span>
            ) : (
              <span>
                Displaying official nationwide tally across{' '}
                <b className="text-foreground">23,696 voting districts</b>.
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenShare && (
            <Button
              variant="outline"
              size="xs"
              onClick={onOpenShare}
              className="h-6 px-2.5 text-[11px] rounded-lg border-primary/40 hover:bg-primary/20 text-foreground font-medium shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3 h-3 text-primary" />
              Share Snapshot
            </Button>
          )}

          {isFiltered && onClearFilter && (
            <Button
              variant="outline"
              size="xs"
              onClick={onClearFilter}
              className="h-6 px-2.5 text-[11px] rounded-lg border-primary/40 hover:bg-primary/20 text-foreground font-medium shrink-0 cursor-pointer"
            >
              Reset to National Count
            </Button>
          )}
        </div>
      </div>

      {/* The 4 Scoped KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4">
        {/* 1. Voting District Counting Progress */}
        <StatCard
          title={card1Title}
          value={`${countingProgress.toFixed(1)}%`}
          icon={<CheckCircle2 className="w-4 h-4" />}
          iconVariant="emerald"
          statusBadge={
            <Badge variant={badgeVariant} size="sm" className="shrink-0">
              {badgeText}
            </Badge>
          }
          subtitle={card1Subtitle}
          progressPercent={progressPercent}
        />

        {/* 2. Registered Voters / Turnout */}
        <StatCard
          title={card2Title}
          value={card2Value}
          icon={<Users className="w-4 h-4" />}
          iconVariant="blue"
          subtitle={card2Subtitle}
          secondaryMetric={card2Secondary}
        />

        {/* 3. Municipalities & Wards / Vote Integrity */}
        <StatCard
          title={card3Title}
          value={card3Value}
          icon={card3Icon}
          iconVariant="amber"
          subtitle={card3Subtitle}
          footer={card3Footer}
        />

        {/* 4. Leading Party Card */}
        <StatCard
          title={card4Title}
          value={card4Value}
          icon={<Trophy className="w-4 h-4" />}
          iconVariant="yellow"
          subtitle={card4Subtitle}
          secondaryMetric={card4Secondary}
          footer={card4Footer}
        />
      </div>
    </div>
  );
}
