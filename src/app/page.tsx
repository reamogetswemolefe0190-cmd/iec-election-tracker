'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import useSWR from 'swr';
import { ElectionDataResponse, MunicipalitySummary, EnrichedPartyResult } from '@/types/election';
import { Header } from '@/components/Header';
import { GpsFilterCard } from '@/components/GpsFilterCard';
import { KpiCards } from '@/components/KpiCards';
import { SeatMajorityBar } from '@/components/SeatMajorityBar';
import { PartyLeaderboard } from '@/components/PartyLeaderboard';
import { ProvinceMatrix } from '@/components/ProvinceMatrix';
import { CoalitionBuilder } from '@/components/CoalitionBuilder';
import { ShareSnapshotModal } from '@/components/ShareSnapshotModal';
import { SouthAfricaMap } from '@/components/SouthAfricaMap';
import { LatestCountsSidebar } from '@/components/LatestCountsSidebar';
import { PlainLanguageBanner } from '@/components/PlainLanguageBanner';
import { CivicExplainerSection } from '@/components/CivicExplainerSection';
import { AskMzansiAiModal } from '@/components/AskMzansiAiModal';
import { CivicElectionContext } from '@/lib/ai-client';
import { findProvinceForMunicipality } from '@/lib/geo';
import { WardResult } from '@/lib/wards';
import municipalityCodeMap from '@/lib/municipality-code-map.json';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Landmark, Sparkles } from 'lucide-react';
import { PartyWarRoom } from '@/components/PartyWarRoom';
import {
  playLiveResultChime,
  requestNotificationPermission,
  sendElectionNotification,
} from '@/lib/notifications';

const fetcher = async (url: string): Promise<ElectionDataResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch election results');
  }
  return res.json();
};

const genericJsonFetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }
  return res.json();
};

export default function HomePage() {
  const [year, setYear] = useState<'2026' | '2024'>('2026');
  const [ballotType, setBallotType] = useState<'National' | 'Regional'>('National');
  const [activeViewMode, setActiveViewMode] = useState<'overview' | 'warroom'>('overview');
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(null);
  const [selectedWard, setSelectedWard] = useState<WardResult | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const prevVotesRef = useRef<number | null>(null);

  // Sync initial view mode from URL params if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view') || params.get('tab');
      if (viewParam === 'warroom') {
        setActiveViewMode('warroom');
      }
    }
  }, []);

  const { data, error, isLoading, isValidating, mutate } = useSWR<ElectionDataResponse>(
    `/api/election-results?year=${year}&ballot=${ballotType}`,
    fetcher,
    {
      refreshInterval: 30000, // Background revalidation every 30s
      revalidateOnFocus: true,
      dedupingInterval: 5000,
      onSuccess: () => {
        setCountdown(30);
      },
    }
  );

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 30));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Live vote change detection & alerts
  useEffect(() => {
    if (!data) return;
    const currentVotes = data.stats.totalVotesCast;
    if (prevVotesRef.current !== null && currentVotes > prevVotesRef.current) {
      const diff = currentVotes - prevVotesRef.current;
      if (alertsEnabled) {
        playLiveResultChime();
        sendElectionNotification(
          'IEC Live Election Update',
          `${new Intl.NumberFormat('en-ZA').format(diff)} new votes processed! Counting is now at ${data.stats.percComplete.toFixed(1)}%.`
        );
      }
    }
    prevVotesRef.current = currentVotes;
  }, [data, alertsEnabled]);

  const handleToggleAlerts = async () => {
    if (!alertsEnabled) {
      await requestNotificationPermission();
      playLiveResultChime();
      setAlertsEnabled(true);
    } else {
      setAlertsEnabled(false);
    }
  };

  // Deduce parent province if selectedMunicipality is set
  const parentProvince = selectedProvince
    ? selectedProvince
    : selectedMunicipality
    ? findProvinceForMunicipality(selectedMunicipality)
    : null;

  // Compute active province details if selected
  const activeProvince = parentProvince && data
    ? data.provinces.find(
        (p) => p.name.toLowerCase() === parentProvince.toLowerCase()
      )
    : null;

  // Selected municipality map code lookup
  const selectedMunicipalityCode = useMemo(() => {
    if (!selectedMunicipality) return null;
    const clean = selectedMunicipality.toLowerCase().trim();
    const mapDict = municipalityCodeMap as Record<string, string>;
    if (mapDict[clean]) return mapDict[clean];
    const stripped = clean
      .replace(/local municipality|metropolitan municipality|municipality/g, '')
      .replace(/\(.*\)/g, '')
      .trim();
    if (mapDict[stripped]) return mapDict[stripped];
    for (const [k, code] of Object.entries(mapDict)) {
      if (clean.includes(k) || k.includes(clean)) return code;
    }
    return null;
  }, [selectedMunicipality]);

  // Fetch complete live granular results (all 80+ parties in councils like Tshwane, and all wards)
  const { data: granularMunicData } = useSWR<{
    municipalityId: string;
    name: string;
    vdsCounted: number;
    vdsTotal: number;
    percComplete: number;
    declared: boolean;
    totalVotesCast: number;
    seatsTotal?: number;
    seatsMajority?: number;
    parties: any[];
    wards: Record<string, WardResult>;
    baseline2021?: {
      parties: Record<string, { abbr: string; name: string; votes: number; percentage: number; seats: number }>;
      wards: Record<string, { wardNumber: number; winningParty: string; candidateName: string; totalVotes: number; votes: number }>;
      councilSeats: number;
    };
  }>(
    selectedMunicipalityCode ? `/api/municipality-results?code=${selectedMunicipalityCode}` : null,
    genericJsonFetcher,
    { revalidateOnFocus: false, dedupingInterval: 15000 }
  );

  // Compute active municipality details if selected
  const activeMunicipality = selectedMunicipality && data?.municipalities
    ? data.municipalities.find(
        (m) =>
          m.name.toLowerCase() === selectedMunicipality.toLowerCase() ||
          selectedMunicipality.toLowerCase().includes(m.name.toLowerCase()) ||
          m.name.toLowerCase().includes(selectedMunicipality.toLowerCase())
      )
    : null;

  // Effective municipality data (incorporates full 80-party live feed when available)
  const effectiveMunicipality: MunicipalitySummary | null = useMemo(() => {
    if (!selectedMunicipality) return null;
    const base = activeMunicipality;
    if (granularMunicData && granularMunicData.parties && granularMunicData.parties.length > 0) {
      // Monotonic Guardrail: Never allow municipal returns to regress below official statutory IEC live feed
      const safeVdsComplete = Math.max(granularMunicData.vdsCounted ?? 0, base?.vdsComplete ?? 0);
      const safeVdExpected = granularMunicData.vdsTotal || base?.vdExpected || 0;
      const safePerc = safeVdExpected > 0
        ? Math.round((safeVdsComplete / safeVdExpected) * 100)
        : (granularMunicData.percComplete ?? base?.percComplete ?? 0);
      const safeVotes = Math.max(
        granularMunicData.totalVotesCast ?? 0,
        base?.validVotesCast ?? 0,
        base?.totalVotesCast ?? 0
      );

      return {
        municipalityId: base?.municipalityId || 3004,
        name: granularMunicData.name || selectedMunicipality,
        code: selectedMunicipalityCode || base?.code,
        provinceId: base?.provinceId || 0,
        provinceName: base?.provinceName || parentProvince || '',
        vdsComplete: safeVdsComplete,
        vdExpected: safeVdExpected,
        percComplete: safePerc,
        seatsComplete: (granularMunicData as any).seatsFilled ?? granularMunicData.parties.reduce((sum: number, p: any) => sum + (p.seats || 0), 0) ?? base?.seatsComplete ?? 0,
        seatsExpected: granularMunicData.seatsTotal || base?.seatsExpected || 214,
        validVotesCast: safeVotes,
        totalVotesCast: safeVotes,
        registeredVoters: base?.registeredVoters || 0,
        leadingParty: granularMunicData.parties[0] ? {
          abbr: granularMunicData.parties[0].abbr,
          color: granularMunicData.parties[0].color,
          votes: granularMunicData.parties[0].votes,
          percentage: granularMunicData.parties[0].votePercentage,
        } : base?.leadingParty,
        topParties: granularMunicData.parties.slice(0, 5),
        allParties: granularMunicData.parties,
      };
    }
    return base || null;
  }, [selectedMunicipality, activeMunicipality, granularMunicData, selectedMunicipalityCode, parentProvince]);

  // Check if the selected municipality has results in the IEC feed yet
  const isMunicipalitySelected = Boolean(selectedMunicipality);
  const hasMunicipalityResults = Boolean(
    (granularMunicData && granularMunicData.parties && granularMunicData.parties.length > 0) ||
    (activeMunicipality &&
      (activeMunicipality.vdsComplete > 0 ||
        (activeMunicipality.validVotesCast ?? 0) > 0 ||
        (activeMunicipality.allParties &&
          activeMunicipality.allParties.length > 0 &&
          activeMunicipality.allParties.some((p) => p.votes > 0))))
  );
  const isMunicipalityPending = isMunicipalitySelected && !hasMunicipalityResults;

  // Check if a selected province (without municipality) has results
  const isProvinceSelected = Boolean(selectedProvince && !selectedMunicipality);
  const hasProvinceResults = Boolean(
    activeProvince &&
      ((activeProvince.percComplete ?? 0) > 0 ||
        (activeProvince.vdsComplete ?? 0) > 0 ||
        (activeProvince.allParties &&
          activeProvince.allParties.length > 0 &&
          activeProvince.allParties.some((p) => p.votes > 0)))
  );
  const isProvincePending = isProvinceSelected && !hasProvinceResults;

  // Check if a selected ward has results in the IEC feed yet
  const isWardSelected = Boolean(selectedWard);
  const hasWardResults = Boolean(
    selectedWard &&
      (selectedWard.vdsCounted > 0 ||
        selectedWard.totalVotes > 0 ||
        (selectedWard.parties && selectedWard.parties.some((p) => p.votes > 0)))
  );
  const isWardPending = isWardSelected && !hasWardResults;

  const isResultsPending = isWardPending || isMunicipalityPending || isProvincePending;

  // CRITICAL VISUAL HONESTY RULE:
  // Shows all 80+ parties in councils like Tshwane, or ward-specific parties when a ward is selected
  const displayParties: EnrichedPartyResult[] = isResultsPending
    ? []
    : selectedWard && selectedWard.parties && selectedWard.parties.length > 0
    ? selectedWard.parties.map((p, idx) => ({
        id: idx + 1,
        abbr: p.abbr || 'IND',
        fullName: p.name || p.abbr || 'Independent',
        color: p.color || '#64748B',
        logoUrl: '',
        votes: p.votes || 0,
        votePercentage: p.percentage || 0,
        seats: 0,
        wardSeats: idx === 0 && selectedWard.status === 'declared' ? 1 : 0,
        prSeats: 0,
        councilsWon: 0,
        isLeading: idx === 0 && p.votes > 0,
        isIndependent: (p.name || '').toUpperCase().includes('INDEPENDENT'),
        candidate: p.candidate,
      }))
    : effectiveMunicipality && effectiveMunicipality.allParties && effectiveMunicipality.allParties.length > 0
    ? effectiveMunicipality.allParties
    : activeProvince && hasProvinceResults && activeProvince.allParties && activeProvince.allParties.length > 0
    ? activeProvince.allParties
    : data?.parties || [];

  const displayTotalVotes = isResultsPending
    ? 0
    : selectedWard
    ? (selectedWard.totalVotes || displayParties.reduce((s: number, p: EnrichedPartyResult) => s + p.votes, 0))
    : effectiveMunicipality
    ? (effectiveMunicipality.validVotesCast || displayParties.reduce((s: number, p: EnrichedPartyResult) => s + p.votes, 0))
    : activeProvince
    ? displayParties.reduce((s: number, p: EnrichedPartyResult) => s + p.votes, 0)
    : data?.stats.validVotesCast || 0;

  const regionLabel = selectedWard
    ? `${selectedWard.name} • ${selectedMunicipality || ''}${parentProvince ? ` (${parentProvince})` : ''}`
    : selectedMunicipality
    ? `${selectedMunicipality}${parentProvince ? ` (${parentProvince})` : ''}`
    : selectedProvince
    ? selectedProvince
    : year === '2026'
    ? '2026 Municipal Council Contests'
    : undefined;

  // Ward Councillor Spotlight Info
  const wardCouncillorInfo = useMemo(() => {
    if (!selectedWard) return null;
    const topParty = selectedWard.parties?.[0];
    const topCandidate =
      selectedWard.councillorCandidate ||
      topParty?.candidate ||
      'Candidate Name on Record with IEC';
    return {
      candidateName: topCandidate,
      partyAbbr: selectedWard.leadingParty?.abbr || topParty?.abbr || 'IND',
      status: selectedWard.status === 'declared' ? ('declared' as const) : ('counting' as const),
      votes: topParty?.votes || selectedWard.leadingParty?.votes || 0,
      votePercentage: topParty?.percentage || selectedWard.leadingParty?.percentage || 0,
    };
  }, [selectedWard]);

  // Memoized Civic AI Context for Ask Mzansi Copilot
  const civicAiContext: CivicElectionContext = useMemo(() => {
    const scope = selectedWard
      ? 'ward'
      : selectedMunicipality
      ? 'municipality'
      : selectedProvince
      ? 'province'
      : 'national';

    const scopeName = selectedWard
      ? selectedWard.name
      : selectedMunicipality || selectedProvince || 'South Africa (National)';

    const vdsCounted = selectedWard
      ? selectedWard.vdsCounted
      : effectiveMunicipality
      ? effectiveMunicipality.vdsComplete
      : activeProvince
      ? (activeProvince.vdsComplete ?? 0)
      : data?.stats.vdsComplete || 0;

    const vdsTotal = selectedWard
      ? selectedWard.totalVds
      : effectiveMunicipality
      ? effectiveMunicipality.vdExpected
      : activeProvince
      ? (activeProvince.vdExpected ?? 0)
      : data?.stats.vdExpected || 23696;

    const percComplete = vdsTotal > 0 ? (vdsCounted / vdsTotal) * 100 : 0;

    return {
      scope,
      scopeName,
      parentScopeName: (selectedWard ? selectedMunicipality || parentProvince : parentProvince) || undefined,
      percComplete,
      vdsCounted,
      vdsTotal,
      totalVotes: displayTotalVotes,
      status: percComplete >= 100 ? 'declared' : 'provisional',
      topParties: displayParties.slice(0, 10).map((p) => ({
        abbr: p.abbr,
        fullName: p.fullName,
        votes: p.votes,
        votePercentage: p.votePercentage,
        seats: p.seats,
        color: p.color,
      })),
      councilMath:
        effectiveMunicipality && effectiveMunicipality.seatsExpected > 0
          ? {
              seatsTotal: effectiveMunicipality.seatsExpected,
              seatsMajority: Math.ceil((effectiveMunicipality.seatsExpected + 1) / 2),
              hungCouncil: Boolean(
                effectiveMunicipality.hungCouncil ||
                  (displayParties[0] && displayParties[0].votePercentage < 50)
              ),
              majorityWon: Boolean(
                effectiveMunicipality.majorityWon ||
                  (displayParties[0] && displayParties[0].votePercentage >= 50)
              ),
            }
          : undefined,
      wardDetails: selectedWard
        ? {
            wardNumber: selectedWard.wardNumber,
            councillorCandidate: selectedWard.councillorCandidate,
            leadingParty: selectedWard.leadingParty.abbr,
            turnout: selectedWard.turnout,
          }
        : undefined,
    };
  }, [
    selectedWard,
    selectedMunicipality,
    selectedProvince,
    parentProvince,
    effectiveMunicipality,
    activeProvince,
    data?.stats,
    displayTotalVotes,
    displayParties,
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* Sticky Header with Live Status & Controls */}
      <Header
        year={year}
        onYearChange={(newYear) => {
          setYear(newYear);
          setSelectedProvince(null);
          setSelectedMunicipality(null);
          setSelectedWard(null);
          setCountdown(30);
        }}
        ballotType={ballotType}
        onBallotChange={(type) => {
          setBallotType(type);
          setCountdown(30);
        }}
        lastUpdated={data?.lastUpdated}
        isValidating={isValidating}
        onRefresh={() => {
          mutate();
          setCountdown(30);
        }}
        countdown={countdown}
        onOpenShare={() => setIsShareModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error Notification */}
        {error && (
          <div className="rounded-2xl bg-destructive/10 border border-destructive/30 p-4 flex items-center justify-between gap-3 text-destructive">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold">Live connection interrupted</p>
                <p className="text-xs opacity-90">
                  Could not reach the IEC {year} data stream. Attempting to reconnect...
                </p>
              </div>
            </div>
            <Button
              variant="destructive"
              size="xs"
              onClick={() => mutate()}
            >
              Retry
            </Button>
          </div>
        )}

        {/* GPS Ward & Municipality Filter Card - Rendered statically for instant LCP render */}
        <div className="relative z-30">
          <GpsFilterCard
            provinces={data?.provinces || []}
            selectedProvince={selectedProvince}
            onSelectProvince={(p) => {
              setSelectedProvince(p);
              setSelectedMunicipality(null);
              setSelectedWard(null);
            }}
            municipalities={data?.municipalities || []}
            selectedMunicipality={selectedMunicipality}
            onSelectMunicipality={(m) => {
              setSelectedMunicipality(m);
              setSelectedWard(null);
            }}
            alertsEnabled={alertsEnabled}
            onToggleAlerts={handleToggleAlerts}
          />
        </div>

        {/* View Mode Switcher: Council & Map Overview vs Party War Room & ML Projections */}
        {data && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-1.5 bg-muted/60 dark:bg-card/80 border border-border rounded-2xl shadow-xs">
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setActiveViewMode('overview');
                  if (typeof window !== 'undefined') {
                    const url = new URL(window.location.href);
                    url.searchParams.delete('view');
                    window.history.replaceState({}, '', url.toString());
                  }
                }}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeViewMode === 'overview'
                    ? 'bg-card text-foreground shadow-xs border border-border'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Landmark className="w-4 h-4 text-primary" />
                <span>Council &amp; Map Overview</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveViewMode('warroom');
                  if (typeof window !== 'undefined') {
                    const url = new URL(window.location.href);
                    url.searchParams.set('view', 'warroom');
                    window.history.replaceState({}, '', url.toString());
                  }
                }}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeViewMode === 'warroom'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Party War Room &amp; ML Projections</span>
                <span className="ml-1 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-primary-foreground/20 text-primary-foreground">
                  AI Model
                </span>
              </button>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground pr-3 font-mono">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Turnout-Weighted Bayesian Model</span>
            </div>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading && !data && (
          <div className="space-y-6">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-36 rounded-2xl" />
              ))}
            </div>
            <Skeleton className="h-28 w-full rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton className="lg:col-span-2 h-96 rounded-2xl" />
              <Skeleton className="h-96 rounded-2xl" />
            </div>
          </div>
        )}

        {/* View Mode: Party War Room & Machine Learning Projections */}
        {data && activeViewMode === 'warroom' && (
          <PartyWarRoom
            data={data}
            selectedProvince={selectedProvince}
            onSelectProvince={(prov) => {
              setSelectedProvince(prov);
              setSelectedMunicipality(null);
              setSelectedWard(null);
            }}
            selectedMunicipality={selectedMunicipality}
            onSelectMunicipality={(m) => {
              setSelectedMunicipality(m);
              setSelectedWard(null);
              if (m) {
                const prov = findProvinceForMunicipality(m);
                if (prov) setSelectedProvince(prov);
              }
            }}
            selectedWard={selectedWard}
            onSelectWard={setSelectedWard}
            granularWards={granularMunicData?.wards}
            effectiveMunicipality={effectiveMunicipality}
            baseline2021={granularMunicData?.baseline2021}
            onSwitchToOverview={() => setActiveViewMode('overview')}
          />
        )}

        {/* Live Data Visualizations (Council Overview Mode) */}
        {data && activeViewMode === 'overview' && (
          <div className="relative z-10 space-y-6">
            {/* 1. Full-Width 4-Metric Hero Deck across all 12 columns */}
            <KpiCards
              data={data}
              activeProvince={activeProvince}
              activeMunicipality={effectiveMunicipality}
              selectedWard={selectedWard}
              isPendingResults={isResultsPending}
              selectedLocationName={selectedWard ? selectedWard.name : selectedMunicipality || selectedProvince}
              parentScopeName={selectedWard ? selectedMunicipality || parentProvince : parentProvince}
              onClearFilter={() => {
                setSelectedWard(null);
                setSelectedMunicipality(null);
                setSelectedProvince(null);
              }}
              onOpenShare={() => setIsShareModalOpen(true)}
            />

            {/* 2. ElectAI Command Triad (Leaderboard | Interactive Map | Latest Counts Window) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Column 1 (Left 4 cols / ~33%): Civic AI Summary & Real-Time Party Leaderboard */}
              <div className="lg:col-span-4 space-y-4">
                <PlainLanguageBanner
                  year={year}
                  activeMunicipality={effectiveMunicipality}
                  activeProvince={activeProvince}
                  selectedWard={selectedWard}
                  displayParties={displayParties}
                  percComplete={
                    isResultsPending
                      ? 0
                      : selectedWard
                      ? selectedWard.percComplete
                      : effectiveMunicipality
                      ? effectiveMunicipality.percComplete
                      : activeProvince
                      ? (activeProvince.percComplete ?? 0)
                      : data.stats.percComplete
                  }
                  vdsComplete={
                    isResultsPending
                      ? 0
                      : selectedWard
                      ? selectedWard.vdsCounted
                      : effectiveMunicipality
                      ? effectiveMunicipality.vdsComplete
                      : activeProvince
                      ? (activeProvince.vdsComplete ?? 0)
                      : data.stats.vdsComplete
                  }
                  vdExpected={
                    selectedWard
                      ? selectedWard.totalVds
                      : effectiveMunicipality
                      ? effectiveMunicipality.vdExpected
                      : activeProvince
                      ? (activeProvince.vdExpected ?? 0)
                      : data.stats.vdExpected
                  }
                  totalVotes={displayTotalVotes}
                  isResultsPending={isResultsPending}
                  selectedLocationName={selectedWard ? selectedWard.name : selectedMunicipality || selectedProvince}
                  parentProvinceName={selectedWard ? selectedMunicipality || parentProvince : parentProvince}
                  onViewParentProvince={
                    parentProvince
                      ? () => {
                          setSelectedWard(null);
                          setSelectedMunicipality(null);
                          setSelectedProvince(parentProvince);
                        }
                      : undefined
                  }
                />

                <PartyLeaderboard
                  parties={displayParties}
                  totalVotes={displayTotalVotes}
                  regionLabel={regionLabel}
                  isPendingResults={isResultsPending}
                  selectedLocationName={selectedWard ? selectedWard.name : selectedMunicipality || selectedProvince}
                  parentScopeName={selectedWard ? selectedMunicipality || parentProvince : parentProvince}
                  wardCouncillor={wardCouncillorInfo}
                  onViewParentScope={
                    parentProvince
                      ? () => {
                          setSelectedWard(null);
                          setSelectedMunicipality(null);
                          setSelectedProvince(parentProvince);
                        }
                      : undefined
                  }
                  onClearFilter={() => {
                    setSelectedWard(null);
                    setSelectedMunicipality(null);
                    setSelectedProvince(null);
                  }}
                />
              </div>

              {/* Column 2 (Center 5 cols / ~42%): Interactive Vector Map of South Africa */}
              <div className="lg:col-span-5 space-y-4">
                <SouthAfricaMap
                  provinces={data.provinces}
                  selectedProvince={selectedProvince}
                  onSelectProvince={(prov) => {
                    setSelectedProvince(prov);
                    setSelectedMunicipality(null);
                    setSelectedWard(null);
                  }}
                  selectedMunicipality={selectedMunicipality}
                  onSelectMunicipality={(m) => {
                    setSelectedMunicipality(m);
                    setSelectedWard(null);
                    if (m) {
                      const prov = findProvinceForMunicipality(m);
                      if (prov) setSelectedProvince(prov);
                    }
                  }}
                  selectedWard={selectedWard}
                  onSelectWard={setSelectedWard}
                  granularWards={granularMunicData?.wards}
                  municipalities={data.municipalities || []}
                  parties={effectiveMunicipality?.allParties || data.parties || []}
                />
              </div>

              {/* Column 3 (Right 3 cols / ~25%): Latest Counts Window on the Side */}
              <div className="lg:col-span-3">
                <LatestCountsSidebar
                  municipalities={data.municipalities || []}
                  selectedMunicipality={selectedMunicipality}
                  onSelectMunicipality={(m) => {
                    setSelectedMunicipality(m);
                    const prov = findProvinceForMunicipality(m);
                    if (prov) setSelectedProvince(prov);
                  }}
                />
              </div>
            </div>

            {/* 3. 400-Seat Parliamentary Majority Balance Bar (National) or Council Balance (LGE) */}
            <SeatMajorityBar
              parties={
                isResultsPending
                  ? []
                  : effectiveMunicipality && effectiveMunicipality.allParties && effectiveMunicipality.allParties.length > 0
                  ? effectiveMunicipality.allParties
                  : data.parties
              }
              majorityThreshold={
                granularMunicData?.seatsMajority ||
                (effectiveMunicipality?.seatsExpected
                  ? Math.ceil((effectiveMunicipality.seatsExpected + 1) / 2)
                  : data.coalitionStats.majorityThreshold)
              }
              totalSeats={
                granularMunicData?.seatsTotal ||
                effectiveMunicipality?.seatsExpected ||
                (data.stats.seatsExpected || 400)
              }
              scopeLabel={
                isResultsPending && selectedMunicipality
                  ? `${selectedMunicipality} Council Seats (${granularMunicData?.seatsTotal || effectiveMunicipality?.seatsExpected || 45} Seats)`
                  : effectiveMunicipality && effectiveMunicipality.seatsExpected && effectiveMunicipality.seatsExpected > 0
                  ? `${effectiveMunicipality.name} Council Seat Distribution (${granularMunicData?.seatsTotal || effectiveMunicipality.seatsExpected} Seats)`
                  : activeProvince
                  ? `${activeProvince.name} Provincial View • (National Assembly / Council Balance)`
                  : undefined
              }
            />

            {/* 4. Coalition Simulator */}
            <CoalitionBuilder
              parties={effectiveMunicipality?.allParties || data.parties}
              majorityThreshold={
                granularMunicData?.seatsMajority ||
                (effectiveMunicipality?.seatsExpected
                  ? Math.ceil((effectiveMunicipality.seatsExpected + 1) / 2)
                  : data.coalitionStats.majorityThreshold)
              }
              totalSeats={
                granularMunicData?.seatsTotal ||
                effectiveMunicipality?.seatsExpected ||
                activeMunicipality?.seatsExpected ||
                data.stats.seatsExpected ||
                400
              }
              scopeName={selectedMunicipality || activeProvince?.name || 'National Assembly'}
              municipalityCode={selectedMunicipalityCode}
            />

            {/* 5. Province Matrix */}
            <ProvinceMatrix
              provinces={data.provinces}
              selectedProvince={selectedProvince}
              onSelectProvince={(p) => {
                setSelectedProvince(p);
                setSelectedMunicipality(null);
              }}
            />

            {/* Civic Explainer & Electoral FAQ Guide (ElectAI Pattern) */}
            <CivicExplainerSection />
          </div>
        )}

        {/* Share Snapshot Modal */}
        {data && (
          <ShareSnapshotModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            year={year}
            scopeTitle={
              selectedMunicipality
                ? `${selectedMunicipality}${parentProvince ? ` (${parentProvince})` : ''}`
                : activeProvince
                ? activeProvince.name
                : 'All 9 Provinces (National)'
            }
            scopeType={
              selectedMunicipality ? 'Municipal' : activeProvince ? 'Provincial' : 'National'
            }
            countingProgress={
              isResultsPending
                ? 0
                : activeMunicipality
                ? activeMunicipality.percComplete
                : activeProvince
                ? (activeProvince.percComplete ?? 0)
                : data.stats.percComplete
            }
            vdsComplete={
              isResultsPending
                ? 0
                : activeMunicipality
                ? activeMunicipality.vdsComplete
                : activeProvince
                ? (activeProvince.vdsComplete ?? 0)
                : data.stats.vdsComplete
            }
            vdExpected={
              activeMunicipality
                ? activeMunicipality.vdExpected
                : activeProvince
                ? (activeProvince.vdExpected ?? 0)
                : data.stats.vdExpected
            }
            topParties={displayParties}
            totalVotes={displayTotalVotes}
            councilStatus={
              isResultsPending
                ? 'Results Pending (Awaiting First Returns)'
                : activeMunicipality
                ? activeMunicipality.majorityWon
                  ? `Majority Won (${activeMunicipality.leadingParty?.abbr || 'Leading Party'})`
                  : activeMunicipality.hungCouncil
                  ? 'Hung Council (Coalition Needed)'
                  : activeMunicipality.seatsComplete > 0
                  ? 'Allocating Seats'
                  : activeMunicipality.percComplete === 100
                  ? 'Awaiting Final IEC Declaration'
                  : 'Counting In Progress'
                : activeProvince
                ? `Provincial Count (${activeProvince.name})`
                : 'National Count (All 9 Provinces)'
            }
          />
        )}
      </main>

      {/* Ask Mzansi AI Civic Copilot Modal */}
      <AskMzansiAiModal context={civicAiContext} />

      {/* Footer */}
      <footer className="border-t border-border bg-card/60 py-6 mt-12 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Data sourced live from the{' '}
            <a
              href="https://www.elections.org.za"
              target="_blank"
              rel="noreferrer"
              className="text-foreground hover:underline underline-offset-2 font-medium"
            >
              Electoral Commission of South Africa (IEC)
            </a>
            .
          </p>
          <p className="flex items-center gap-1.5 text-muted-foreground">
            <span>Built for Vercel deployment</span>
            <span>•</span>
            <span className="font-mono text-status-live font-semibold">Auto-refresh: 30s</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
