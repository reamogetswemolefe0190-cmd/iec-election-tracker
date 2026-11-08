'use client';

import React, { useState, useMemo } from 'react';
import {
  ElectionDataResponse,
  ProvinceSummary,
  MunicipalitySummary,
  EnrichedPartyResult,
} from '@/types/election';
import { WardResult } from '@/lib/wards';
import {
  runMLElectionProjection,
  extractPartyStrongholds,
  generatePlainEnglishBrief,
  MLPartyProjection,
  CouncilStrongholdEntry,
  PlainEnglishBrief,
} from '@/lib/ml-projection-engine';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { PartyLogo } from '@/components/ui/party-logo';
import {
  ShieldAlert,
  Search,
  Check,
  TrendingUp,
  TrendingDown,
  Sparkles,
  MapPin,
  Building2,
  Users2,
  ChevronRight,
  RotateCcw,
  Landmark,
  Layers,
  ArrowUpRight,
  Target,
  BarChart3,
  HelpCircle,
  History,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Lightbulb,
  Award,
} from 'lucide-react';
import { SouthAfricaMap } from '@/components/SouthAfricaMap';

interface PartyWarRoomProps {
  data: ElectionDataResponse;
  selectedProvince: string | null;
  onSelectProvince: (prov: string | null) => void;
  selectedMunicipality: string | null;
  onSelectMunicipality: (munic: string | null) => void;
  selectedWard?: WardResult | null;
  onSelectWard?: (ward: WardResult | null) => void;
  granularWards?: Record<string, WardResult>;
  effectiveMunicipality?: MunicipalitySummary | null;
  baseline2021?: {
    parties: Record<string, { abbr: string; name: string; votes: number; percentage: number; seats: number }>;
    wards: Record<string, { wardNumber: number; winningParty: string; candidateName: string; totalVotes: number; votes: number }>;
    councilSeats: number;
  };
  onSwitchToOverview?: () => void;
}

export function PartyWarRoom({
  data,
  selectedProvince,
  onSelectProvince,
  selectedMunicipality,
  onSelectMunicipality,
  selectedWard,
  onSelectWard,
  granularWards,
  effectiveMunicipality,
  baseline2021,
  onSwitchToOverview,
}: PartyWarRoomProps) {
  // 1. Party Selector State
  const defaultParty = 'ANC';
  const [activePartyAbbr, setActivePartyAbbr] = useState<string>(defaultParty);
  const [partySearchQuery, setPartySearchQuery] = useState('');
  const [strongholdFilter, setStrongholdFilter] = useState<'all' | 'majority' | 'plurality' | 'battleground'>('all');
  const [wardSearchQuery, setWardSearchQuery] = useState('');
  const [wardFilterTab, setWardFilterTab] = useState<'all' | 'leading' | 'defending' | 'battleground'>('all');
  const [mlViewMode, setMlViewMode] = useState<'plain' | 'stats'>('plain');

  // List of primary South African parties
  const primaryParties = useMemo(() => {
    return [
      { abbr: 'ANC', name: 'African National Congress', color: '#007A3D' },
      { abbr: 'DA', name: 'Democratic Alliance', color: '#005BA6' },
      { abbr: 'EFF', name: 'Economic Freedom Fighters', color: '#DE0000' },
      { abbr: 'MK', name: 'uMkhonto weSizwe Party', color: '#004727' },
      { abbr: 'ActionSA', name: 'ActionSA', color: '#00B050' },
      { abbr: 'VF Plus', name: 'Freedom Front Plus', color: '#8B4513' },
      { abbr: 'IFP', name: 'Inkatha Freedom Party', color: '#DA251D' },
      { abbr: 'PA', name: 'Patriotic Alliance', color: '#F58220' },
      { abbr: 'Rise Mzansi', name: 'Rise Mzansi', color: '#008A44' },
      { abbr: 'BOSA', name: 'Build One South Africa', color: '#292C5B' },
      { abbr: 'ACDP', name: 'African Christian Democratic Party', color: '#1E398B' },
      { abbr: 'UDM', name: 'United Democratic Movement', color: '#E30613' },
      { abbr: 'Al Jama-ah', name: 'Al Jama-ah', color: '#009639' },
      { abbr: 'ATM', name: 'African Transformation Movement', color: '#1B365D' },
      { abbr: 'GOOD', name: 'GOOD', color: '#E56A10' },
      { abbr: 'PAC', name: 'Pan Africanist Congress', color: '#008751' },
    ];
  }, []);

  // Filtered party list for search
  const filteredParties = useMemo(() => {
    if (!partySearchQuery.trim()) return primaryParties;
    const q = partySearchQuery.toLowerCase();
    return primaryParties.filter(
      (p) => p.abbr.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)
    );
  }, [primaryParties, partySearchQuery]);

  // Current active party metadata
  const currentPartyMeta = useMemo(() => {
    const found = primaryParties.find(
      (p) => p.abbr.toUpperCase() === activePartyAbbr.toUpperCase()
    );
    return found || { abbr: activePartyAbbr, name: activePartyAbbr, color: '#007A3D' };
  }, [activePartyAbbr, primaryParties]);

  // Determine active scope context
  const activeScopeName = selectedMunicipality || selectedProvince || 'South Africa';
  const activeScopeType: 'national' | 'province' | 'municipality' = selectedMunicipality
    ? 'municipality'
    : selectedProvince
    ? 'province'
    : 'national';

  // Granular wards for currently selected municipality
  const municipalWards = useMemo(() => {
    if (!selectedMunicipality || !granularWards) return [];
    const list = Object.values(granularWards);
    return list.sort((a, b) => a.wardNumber - b.wardNumber);
  }, [selectedMunicipality, granularWards]);

  // Filtered ward list based on search and selected party status
  const filteredMunicipalWards = useMemo(() => {
    let result = municipalWards;
    const query = wardSearchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (w) =>
          String(w.wardNumber).includes(query) ||
          w.name.toLowerCase().includes(query) ||
          w.wardCode.toLowerCase().includes(query)
      );
    }

    if (wardFilterTab === 'leading') {
      result = result.filter(
        (w) => w.leadingParty?.abbr.toUpperCase() === activePartyAbbr.toUpperCase()
      );
    } else if (wardFilterTab === 'defending') {
      result = result.filter((w) => {
        const hist = baseline2021?.wards?.[w.wardNumber] || baseline2021?.wards?.[String(w.wardNumber)];
        return hist?.winningParty?.toUpperCase() === activePartyAbbr.toUpperCase();
      });
    } else if (wardFilterTab === 'battleground') {
      result = result.filter((w) => {
        if (!w.runnerUp) return false;
        const diff = Math.abs((w.leadingParty?.percentage || 0) - (w.runnerUp?.percentage || 0));
        return diff < 10;
      });
    }

    return result;
  }, [municipalWards, wardSearchQuery, wardFilterTab, activePartyAbbr, baseline2021]);

  // Determine parties for ML simulation based on current scope
  const scopedParties: EnrichedPartyResult[] = useMemo(() => {
    if (selectedMunicipality && effectiveMunicipality?.allParties) {
      return effectiveMunicipality.allParties;
    }
    if (selectedProvince) {
      const provObj = data.provinces.find(
        (p) => p.name.toLowerCase() === selectedProvince.toLowerCase()
      );
      if (provObj?.allParties && provObj.allParties.length > 0) {
        return provObj.allParties;
      }
    }
    return data.parties;
  }, [selectedMunicipality, effectiveMunicipality, selectedProvince, data]);

  // Total seats for active scope
  const scopedTotalSeats = useMemo(() => {
    if (selectedMunicipality) {
      return effectiveMunicipality?.seatsExpected || 45;
    }
    if (selectedProvince) {
      return 80;
    }
    return data.stats.seatsExpected || 400;
  }, [selectedMunicipality, effectiveMunicipality, selectedProvince, data]);

  // VDs for active scope
  const { scopedVdsCounted, scopedVdsTotal } = useMemo(() => {
    if (selectedMunicipality && effectiveMunicipality) {
      return {
        scopedVdsCounted: effectiveMunicipality.vdsComplete || 0,
        scopedVdsTotal: effectiveMunicipality.vdExpected || 1,
      };
    }
    if (selectedProvince) {
      const provObj = data.provinces.find(
        (p) => p.name.toLowerCase() === selectedProvince.toLowerCase()
      );
      return {
        scopedVdsCounted: provObj?.vdsComplete || 0,
        scopedVdsTotal: provObj?.vdExpected || 1,
      };
    }
    return {
      scopedVdsCounted: data.stats.vdsComplete || 0,
      scopedVdsTotal: data.stats.vdExpected || 23696,
    };
  }, [selectedMunicipality, effectiveMunicipality, selectedProvince, data]);

  // Scoped historical baselines from municipality API if available
  const scopedHistoricalBaselines = useMemo(() => {
    if (selectedMunicipality && baseline2021?.parties) {
      const baselines: Record<string, { percentage21?: number; percentage24?: number; votes21?: number; seats21?: number }> = {};
      for (const [abbr, pData] of Object.entries(baseline2021.parties)) {
        baselines[abbr.toUpperCase()] = {
          percentage21: pData.percentage,
          votes21: pData.votes,
          seats21: pData.seats,
        };
      }
      return baselines;
    }
    return undefined;
  }, [selectedMunicipality, baseline2021]);

  // Run ML Projection Engine
  const mlSimulation = useMemo(() => {
    return runMLElectionProjection(
      scopedParties,
      scopedTotalSeats,
      scopedVdsCounted,
      scopedVdsTotal,
      activeScopeName,
      activeScopeType,
      scopedHistoricalBaselines
    );
  }, [scopedParties, scopedTotalSeats, scopedVdsCounted, scopedVdsTotal, activeScopeName, activeScopeType, scopedHistoricalBaselines]);

  // Active party projection result
  const partyProjection: MLPartyProjection = useMemo(() => {
    const found = mlSimulation.projections.find(
      (p) => p.abbr.toUpperCase() === activePartyAbbr.toUpperCase()
    );
    if (found) return found;

    return {
      abbr: activePartyAbbr,
      fullName: currentPartyMeta.name,
      color: currentPartyMeta.color,
      countedVotes: 0,
      countedPercentage: 0,
      projectedPercentage: 0,
      marginOfError: 0.5,
      projectedRange: [0, 0],
      projectedSeats: 0,
      baseline2021Percentage: 0,
      baseline2024Percentage: 0,
      swingVs2021: 0,
      swingVs2024: 0,
      majorityProbability: 0,
      isProjectedWinner: false,
      isProjectedMajority: false,
      strongholdClassification: 'Minor',
    };
  }, [mlSimulation, activePartyAbbr, currentPartyMeta]);

  // Plain-English Voter Intelligence Brief
  const plainEnglishBrief: PlainEnglishBrief | null = useMemo(() => {
    if (!partyProjection) return null;
    return generatePlainEnglishBrief(mlSimulation, partyProjection, currentPartyMeta);
  }, [mlSimulation, partyProjection, currentPartyMeta]);

  // Stronghold councils across the country or in selected province
  const strongholds = useMemo(() => {
    return extractPartyStrongholds(
      activePartyAbbr,
      data.municipalities || [],
      selectedProvince
    );
  }, [activePartyAbbr, data.municipalities, selectedProvince]);

  // Filtered strongholds list
  const filteredStrongholds = useMemo(() => {
    if (strongholdFilter === 'majority') {
      return strongholds.filter((s) => s.countedVotePercentage >= 50);
    }
    if (strongholdFilter === 'plurality') {
      return strongholds.filter((s) => s.rank === 1 && s.countedVotePercentage < 50);
    }
    if (strongholdFilter === 'battleground') {
      return strongholds.filter((s) => s.classification === 'Battleground Swing');
    }
    return strongholds;
  }, [strongholds, strongholdFilter]);

  // Summary counts for strongholds
  const majoritiesCount = useMemo(() => strongholds.filter((s) => s.countedVotePercentage >= 50).length, [strongholds]);
  const pluralitiesCount = useMemo(() => strongholds.filter((s) => s.rank === 1 && s.countedVotePercentage < 50).length, [strongholds]);
  const battlegroundsCount = useMemo(() => strongholds.filter((s) => s.classification === 'Battleground Swing').length, [strongholds]);

  const handleInspectWard = (w: WardResult) => {
    if (onSelectWard) onSelectWard(w);
    setTimeout(() => {
      const el = document.getElementById('ward-inspector-dossier');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Dynamic Party Selector */}
      <Card className="p-4 sm:p-5 border-border/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="text-[10px] font-mono uppercase tracking-wider py-0 px-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-500/30"
              >
                LIVE ML WAR ROOM
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                Model Confidence: <strong>{mlSimulation.modelConfidence}%</strong> ({mlSimulation.percComplete}% counted)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
              <span>{currentPartyMeta.name}</span>
              <span className="text-muted-foreground font-medium text-lg">({currentPartyMeta.abbr})</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Tracking performance, strongholds, and ML projected final outcomes across {activeScopeName}
            </p>
          </div>

          {/* Quick Party Selector Pills */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Find party..."
                value={partySearchQuery}
                onChange={(e) => setPartySearchQuery(e.target.value)}
                className="h-8 pl-8 pr-2 text-xs w-full sm:w-36 rounded-lg"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 max-w-full">
              {filteredParties.slice(0, 7).map((p) => {
                const isSelected = p.abbr.toUpperCase() === activePartyAbbr.toUpperCase();
                return (
                  <Button
                    key={p.abbr}
                    size="xs"
                    variant={isSelected ? 'default' : 'outline'}
                    onClick={() => setActivePartyAbbr(p.abbr)}
                    className={`h-8 px-2.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'bg-card hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    <PartyLogo abbr={p.abbr} name={p.name} color={p.color} size="xs" />
                    <span>{p.abbr}</span>
                    {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Breadcrumb Navigation Bar */}
        <div className="flex flex-wrap items-center gap-1.5 pt-3 mt-3 border-t border-border/70 text-xs">
          <span className="text-muted-foreground font-semibold">Active Scope:</span>
          <button
            type="button"
            onClick={() => {
              onSelectProvince(null);
              onSelectMunicipality(null);
              if (onSelectWard) onSelectWard(null);
            }}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
              !selectedProvince && !selectedMunicipality
                ? 'bg-primary/10 text-primary font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            South Africa (National)
          </button>

          {selectedProvince && (
            <>
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
              <button
                type="button"
                onClick={() => {
                  onSelectMunicipality(null);
                  if (onSelectWard) onSelectWard(null);
                }}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                  selectedProvince && !selectedMunicipality
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {selectedProvince}
              </button>
            </>
          )}

          {selectedMunicipality && (
            <>
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold">
                {selectedMunicipality}
              </span>
            </>
          )}

          {(selectedProvince || selectedMunicipality) && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => {
                onSelectProvince(null);
                onSelectMunicipality(null);
                if (onSelectWard) onSelectWard(null);
              }}
              className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground ml-auto cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset to National
            </Button>
          )}
        </div>
      </Card>

      {/* 2. Plain-English Election Intelligence Brief ("What This Means For You") */}
      {plainEnglishBrief && (
        <Card className="p-4 sm:p-6 border-border/80 shadow-sm bg-gradient-to-br from-card via-card to-primary/5 space-y-4">
          {/* Header Row: Title + Scope + Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <PartyLogo
                  abbr={currentPartyMeta.abbr}
                  name={currentPartyMeta.name}
                  color={currentPartyMeta.color}
                  size="sm"
                  className="shrink-0 shadow-xs"
                />
                <h2 className="font-extrabold text-base sm:text-lg text-foreground flex flex-wrap items-center gap-2">
                  <span>{currentPartyMeta.abbr} Municipal Election Outlook</span>
                  <span className="text-xs font-normal text-muted-foreground font-sans">
                    (2026 Local Government Elections)
                  </span>
                </h2>
                <Badge
                  variant="outline"
                  className={`text-xs font-semibold px-2.5 py-0.5 ${
                    plainEnglishBrief.verdictBadge.variant === 'emerald'
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-500/30'
                      : plainEnglishBrief.verdictBadge.variant === 'amber'
                      ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-500/30'
                      : plainEnglishBrief.verdictBadge.variant === 'purple'
                      ? 'bg-purple-50 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300 border-purple-500/30'
                      : 'bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-500/30'
                  }`}
                >
                  {plainEnglishBrief.verdictBadge.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {activeScopeType === 'municipality'
                  ? `Local municipal council intelligence for ${activeScopeName} (${scopedTotalSeats} statutory council seats)`
                  : activeScopeType === 'province'
                  ? `Provincial overview of all local and district municipal councils across ${activeScopeName}`
                  : 'Nationwide municipal council intelligence across South Africa (all 257 local and metropolitan municipalities)'}
              </p>
            </div>

            {/* View Mode Toggle: Plain English vs Data Science */}
            <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-xl self-start sm:self-auto text-xs font-semibold">
              <button
                type="button"
                onClick={() => setMlViewMode('plain')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                  mlViewMode === 'plain'
                    ? 'bg-card text-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>🗣️ Plain English</span>
              </button>
              <button
                type="button"
                onClick={() => setMlViewMode('stats')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                  mlViewMode === 'stats'
                    ? 'bg-card text-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>🔬 Data &amp; Math</span>
              </button>
            </div>
          </div>

          {/* Headline Banner */}
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-1">
            <div className="text-sm sm:text-base font-extrabold text-foreground leading-snug">
              {plainEnglishBrief.headline}
            </div>
            <div className="text-xs text-muted-foreground leading-relaxed">
              {plainEnglishBrief.summarySentence}
            </div>
          </div>

          {/* 4 Plain-English Questions & Answers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {plainEnglishBrief.keyQuestions.map((q, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-border/80 bg-muted/20 flex flex-col justify-between space-y-2"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      {q.question}
                    </span>
                    {q.badgeText && (
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-mono shrink-0 ${
                          q.isPositive
                            ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-500/30'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {q.badgeText}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {q.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 2.1 Top-Level Machine Learning KPI Dashboard (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: ML Projected Final Vote Share */}
        <Card className="p-4 border-border/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                {mlViewMode === 'plain' ? 'Expected Final Result' : 'ML Projected Final Share'}
              </span>
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black font-mono text-foreground tabular-nums">
                {partyProjection.projectedPercentage.toFixed(1)}%
              </span>
              <span className="text-xs font-mono text-muted-foreground tabular-nums">
                (±{partyProjection.marginOfError}%)
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {mlViewMode === 'plain'
                ? `Likely range: ${partyProjection.projectedRange[0]}% to ${partyProjection.projectedRange[1]}%`
                : `95% Credible Interval: [${partyProjection.projectedRange[0]}% – ${partyProjection.projectedRange[1]}%]`}
            </p>
          </div>
          <div className="mt-3">
            <Progress
              value={partyProjection.projectedPercentage}
              indicatorColor={currentPartyMeta.color}
              size="sm"
            />
          </div>
        </Card>

        {/* KPI 2: Progressive Counted Share & Swings */}
        <Card className="p-4 border-border/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                {mlViewMode === 'plain' ? 'Ballots Counted So Far' : 'Counted Share & Swings'}
              </span>
              <BarChart3 className="w-4 h-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black font-mono text-foreground tabular-nums">
                {partyProjection.countedPercentage.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">
                ({partyProjection.countedVotes.toLocaleString('en-ZA')} votes)
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-[11px] font-mono">
              <span className={`inline-flex items-center gap-0.5 font-bold ${partyProjection.swingVs2021 >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {partyProjection.swingVs2021 >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {partyProjection.swingVs2021 >= 0 ? '+' : ''}{partyProjection.swingVs2021}% vs 2021
              </span>
              <span className="text-muted-foreground">•</span>
              <span className={`inline-flex items-center gap-0.5 font-bold ${partyProjection.swingVs2024 >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {partyProjection.swingVs2024 >= 0 ? '+' : ''}{partyProjection.swingVs2024}% vs 2024
              </span>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-muted-foreground">
            {mlSimulation.percComplete}% of voting districts counted in {activeScopeName}
          </div>
        </Card>

        {/* KPI 3: Projected Seats & Majority Target */}
        <Card className="p-4 border-border/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                {mlViewMode === 'plain' ? 'Projected Council Seats' : 'Projected Seats (Hare Quota)'}
              </span>
              <Landmark className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black font-mono text-foreground tabular-nums">
                {partyProjection.projectedSeats}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                / {scopedTotalSeats} Total Seats
              </span>
            </div>
            <div className="flex items-center justify-between mt-2 text-[11px]">
              <span className="text-muted-foreground">
                Majority Target: <strong>{mlSimulation.majorityThreshold}</strong> seats
              </span>
              <Badge
                variant="outline"
                className={`text-[10px] font-mono py-0 ${
                  partyProjection.isProjectedMajority
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-500/30'
                    : 'bg-amber-50 text-amber-700 border-amber-500/30'
                }`}
              >
                {partyProjection.isProjectedMajority
                  ? 'Outright Majority'
                  : `${Math.max(0, mlSimulation.majorityThreshold - partyProjection.projectedSeats)} seats short`}
              </Badge>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-muted-foreground">
            {partyProjection.isProjectedMajority
              ? 'Can govern alone without coalitions'
              : 'Coalition partner required to form government'}
          </div>
        </Card>

        {/* KPI 4: Strongholds & Classification */}
        <Card className="p-4 border-border/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                {mlViewMode === 'plain' ? 'Council Role' : 'Electoral Standing'}
              </span>
              <PartyLogo
                abbr={currentPartyMeta.abbr}
                name={currentPartyMeta.name}
                color={currentPartyMeta.color}
                size="xs"
                className="shrink-0"
              />
            </div>
            <div className="text-xl sm:text-2xl font-black text-foreground">
              {plainEnglishBrief?.verdictBadge.label.replace(/^[^\w\s]+/, '').trim() || partyProjection.strongholdClassification}
            </div>
            <div className="grid grid-cols-3 gap-1 mt-2 text-center text-[10px] font-mono">
              <div className="p-1 rounded bg-muted/60">
                <div className="font-bold text-foreground text-xs">{majoritiesCount}</div>
                <div className="text-muted-foreground">Majorities</div>
              </div>
              <div className="p-1 rounded bg-muted/60">
                <div className="font-bold text-foreground text-xs">{pluralitiesCount}</div>
                <div className="text-muted-foreground">Leads</div>
              </div>
              <div className="p-1 rounded bg-muted/60">
                <div className="font-bold text-foreground text-xs">{battlegroundsCount}</div>
                <div className="text-muted-foreground">Battles</div>
              </div>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-muted-foreground">
            {majoritiesCount > 0 ? 'Controls outright councils' : 'Active contender across councils'}
          </div>
        </Card>
      </div>

      {/* 2.5 Election-over-Election Historical Performance Tracker (2026 vs 2021 vs 2024) */}
      <Card className="p-4 sm:p-5 border-border/80 shadow-xs bg-gradient-to-br from-card via-card to-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm sm:text-base text-foreground flex items-center gap-2">
                <span>Election-over-Election Performance Tracker</span>
              </h3>
              <Badge variant="outline" className="text-[10px] font-mono font-bold bg-primary/10 border-primary/20 text-primary">
                {activeScopeName}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Benchmarking {currentPartyMeta.abbr}'s 2026 live returns against 2021 Local Government Elections (LGE) and 2024 National &amp; Provincial Elections (NPE)
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${
              partyProjection.swingVs2021 >= 0
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-500/30'
                : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border-rose-500/30'
            }`}>
              {partyProjection.swingVs2021 >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{partyProjection.swingVs2021 >= 0 ? '+' : ''}{partyProjection.swingVs2021}% vs 2021 LGE</span>
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${
              partyProjection.swingVs2024 >= 0
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-500/30'
                : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border-rose-500/30'
            }`}>
              {partyProjection.swingVs2024 >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{partyProjection.swingVs2024 >= 0 ? '+' : ''}{partyProjection.swingVs2024}% vs 2024 NPE</span>
            </span>
          </div>
        </div>

        {/* 3-Election Comparative Deck */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4">
          {/* Election 1: 2021 LGE */}
          <div className="p-3.5 rounded-xl border border-border/80 bg-muted/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                  1. 2021 Local Elections (LGE)
                </span>
                <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded">Municipal Base</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-foreground tabular-nums">
                {partyProjection.baseline2021Percentage > 0 ? `${partyProjection.baseline2021Percentage.toFixed(1)}%` : '—'}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1 font-mono">
                {partyProjection.baseline2021Seats ? `${partyProjection.baseline2021Seats} seats won in council` : 'Historical baseline'}
                {partyProjection.baseline2021Votes ? ` • ${partyProjection.baseline2021Votes.toLocaleString('en-ZA')} votes` : ''}
              </div>
            </div>
            <div className="mt-3">
              <Progress value={partyProjection.baseline2021Percentage} indicatorColor="#64748b" size="xs" />
            </div>
          </div>

          {/* Election 2: 2024 NPE */}
          <div className="p-3.5 rounded-xl border border-border/80 bg-muted/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                  2. 2024 National &amp; Prov (NPE)
                </span>
                <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded">Prov / Nat Base</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-foreground tabular-nums">
                {partyProjection.baseline2024Percentage > 0 ? `${partyProjection.baseline2024Percentage.toFixed(1)}%` : '—'}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1 font-mono">
                General Election Alignment
              </div>
            </div>
            <div className="mt-3">
              <Progress value={partyProjection.baseline2024Percentage} indicatorColor="#64748b" size="xs" />
            </div>
          </div>

          {/* Election 3: 2026 Progressive Live / ML Projection */}
          <div className="p-3.5 rounded-xl border-2 border-primary/40 bg-primary/5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between text-xs text-primary mb-1 font-bold">
                <span className="font-bold text-[11px] uppercase tracking-wider flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  3. 2026 Live Count &amp; ML Proj
                </span>
                <span className="text-[10px] font-mono bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold">
                  {mlSimulation.percComplete}% Counted
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl sm:text-3xl font-black font-mono text-foreground tabular-nums">
                  {partyProjection.countedPercentage.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  (ML: {partyProjection.projectedPercentage.toFixed(1)}%)
                </div>
              </div>
              <div className="text-[11px] text-muted-foreground mt-1 font-mono">
                {partyProjection.countedVotes.toLocaleString('en-ZA')} votes counted so far
              </div>
            </div>
            <div className="mt-3">
              <Progress value={partyProjection.countedPercentage} indicatorColor={currentPartyMeta.color} size="xs" />
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Interactive Map & Strongholds Drill-down Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Interactive Geospatial Map */}
        <div className="lg:col-span-7 space-y-4">
          <Card id="party-war-room-map" className="p-4 border-border/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <PartyLogo
                    abbr={currentPartyMeta.abbr}
                    name={currentPartyMeta.name}
                    color={currentPartyMeta.color}
                    size="sm"
                    className="shrink-0 shadow-xs"
                  />
                  <span>{currentPartyMeta.abbr} Geographic Footprint & Support Map</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Select a province or council to isolate {currentPartyMeta.abbr}'s municipal strongholds
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono self-start sm:self-auto">
                {selectedProvince || 'National View (9 Provinces)'}
              </Badge>
            </div>

            <div className="pt-4">
              <SouthAfricaMap
                provinces={data.provinces}
                selectedProvince={selectedProvince}
                onSelectProvince={(prov) => {
                  onSelectProvince(prov);
                  onSelectMunicipality(null);
                  if (onSelectWard) onSelectWard(null);
                }}
                selectedMunicipality={selectedMunicipality}
                onSelectMunicipality={(m) => {
                  onSelectMunicipality(m);
                  if (onSelectWard) onSelectWard(null);
                }}
                selectedWard={selectedWard}
                onSelectWard={onSelectWard}
                granularWards={granularWards}
                municipalities={data.municipalities || []}
                parties={scopedParties}
              />
            </div>
          </Card>

          {/* Plain-English How It Works Explainer Card */}
          <Card className="p-4 border-border/80 bg-muted/20 text-xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                <span>How This AI Model Predicts The Outcome</span>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono bg-background">
                {mlSimulation.percComplete}% Counted
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Instead of waiting days for all counting to finish, this model forecasts the finish line by blending historical voting records with the ballot boxes opened today.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
              <div className="p-2.5 rounded-lg bg-card border border-border/80 space-y-1">
                <div className="font-bold text-foreground flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black shrink-0">1</span>
                  <span>Past Voting Memory</span>
                </div>
                <div className="text-[10px] text-muted-foreground leading-tight">
                  Anchored in how this area voted in 2021 local and 2024 national elections.
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-card border border-border/80 space-y-1">
                <div className="font-bold text-foreground flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black shrink-0">2</span>
                  <span>Live Swing Detection</span>
                </div>
                <div className="text-[10px] text-muted-foreground leading-tight">
                  Detects whether voters are shifting toward or away from each party in real time.
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-card border border-border/80 space-y-1">
                <div className="font-bold text-foreground flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black shrink-0">3</span>
                  <span>Real Council Seats</span>
                </div>
                <div className="text-[10px] text-muted-foreground leading-tight">
                  Converts votes into statutory council seats using the official IEC Hare Quota.
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (5 cols): Strongholds & Battlegrounds Leaderboard */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-4 border-border/80 shadow-xs flex flex-col h-full max-h-[750px]">
            <CardHeader className="p-0 pb-3 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <PartyLogo
                    abbr={currentPartyMeta.abbr}
                    name={currentPartyMeta.name}
                    color={currentPartyMeta.color}
                    size="sm"
                    className="shrink-0 shadow-xs"
                  />
                  <span>{currentPartyMeta.abbr} Municipal Strongholds</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  {selectedProvince ? `Ranked councils in ${selectedProvince}` : 'Top councils nationwide'}
                </CardDescription>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setStrongholdFilter('all')}
                  className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                    strongholdFilter === 'all'
                      ? 'bg-primary text-primary-foreground font-bold'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  All ({strongholds.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStrongholdFilter('majority')}
                  className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                    strongholdFilter === 'majority'
                      ? 'bg-primary text-primary-foreground font-bold'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  &gt;50% ({majoritiesCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStrongholdFilter('battleground')}
                  className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                    strongholdFilter === 'battleground'
                      ? 'bg-primary text-primary-foreground font-bold'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  Battles ({battlegroundsCount})
                </button>
              </div>
            </CardHeader>

            {/* Scrollable Strongholds List */}
            <CardContent className="p-0 pt-3 flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredStrongholds.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-xs space-y-1">
                  <p className="font-semibold">No councils matching this filter.</p>
                  <p className="text-[11px]">Try switching filters or selecting a different province.</p>
                </div>
              ) : (
                filteredStrongholds.map((c) => {
                  const isSelected = selectedMunicipality && selectedMunicipality.toLowerCase() === c.municipalityName.toLowerCase();
                  return (
                    <div
                      key={c.municipalityId}
                      onClick={() => onSelectMunicipality(c.municipalityName)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer text-xs ${
                        isSelected
                          ? 'bg-primary/10 border-primary shadow-xs'
                          : 'bg-card border-border/80 hover:bg-muted/50 hover:border-border'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-foreground text-xs sm:text-sm truncate">
                              {c.municipalityName}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[9px] px-1.5 py-0 font-mono ${
                                c.classification === 'Safe Stronghold'
                                  ? 'bg-emerald-50 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
                                  : c.classification === 'Competitive Plurality'
                                  ? 'bg-blue-50 text-blue-800 dark:text-blue-300 border-blue-500/30'
                                  : c.classification === 'Battleground Swing'
                                  ? 'bg-amber-50 text-amber-800 dark:text-amber-300 border-amber-500/30'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {c.classification}
                            </Badge>
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                            {c.provinceName} • Rank #{c.rank} • {c.projectedSeats} / {c.totalSeats} seats
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-base font-black font-mono text-foreground tabular-nums">
                            {c.countedVotePercentage.toFixed(1)}%
                          </div>
                          <div className="text-[10px] font-mono">
                            {c.rank === 1 ? (
                              <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                                +{Math.abs(c.voteGapToLeaderOrRunnerUp)}% lead {c.leaderOrRunnerAbbr ? `over ${c.leaderOrRunnerAbbr}` : ''}
                              </span>
                            ) : (
                              <span className="text-muted-foreground font-medium">
                                -{Math.abs(c.voteGapToLeaderOrRunnerUp)}% behind {c.leaderOrRunnerAbbr || 'leader'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Mini Progress Bar */}
                      <div className="mt-2">
                        <Progress
                          value={c.countedVotePercentage}
                          indicatorColor={currentPartyMeta.color}
                          size="xs"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 4. Active Ward Inspector Dossier Card (Auto-scrolls here when any ward is inspected) */}
      {selectedMunicipality && selectedWard && (
        <Card
          id="ward-inspector-dossier"
          className="p-5 sm:p-6 border-2 border-primary/50 shadow-md bg-gradient-to-br from-card via-card to-primary/5 space-y-5 animate-in fade-in-50 duration-200"
        >
          {/* Top Header Row with Ward Identity & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-primary text-primary-foreground font-bold px-2 py-0.5 text-xs">
                  Active Ward Inspection
                </Badge>
                <h3 className="font-extrabold text-lg sm:text-xl text-foreground flex items-center gap-2">
                  <span>{selectedWard.name}</span>
                  <span className="text-xs text-muted-foreground font-mono font-normal">
                    ({selectedWard.wardCode})
                  </span>
                </h3>
                <Badge
                  variant="outline"
                  className={`text-xs font-mono font-bold ${
                    selectedWard.status === 'declared'
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-500/30'
                      : selectedWard.status === 'counting'
                      ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-500/30'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {selectedWard.status === 'declared'
                    ? 'Official Result Declared'
                    : selectedWard.status === 'counting'
                    ? `Counting (${selectedWard.vdsCounted}/${selectedWard.totalVds} VDs • ${selectedWard.percComplete}%)`
                    : 'Awaiting Ballot Verification'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedMunicipality} • Turnout: <strong>{selectedWard.turnout}%</strong> ({selectedWard.totalVotes.toLocaleString()} votes cast of {selectedWard.registeredVoters.toLocaleString()} registered voters)
              </p>
            </div>

            {/* Quick Actions Header */}
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const mapEl = document.getElementById('party-war-room-map');
                  if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="h-8 text-xs cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 mr-1 text-primary" />
                View on Map ↑
              </Button>
              {onSwitchToOverview && (
                <Button
                  size="sm"
                  onClick={() => {
                    onSwitchToOverview();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="h-8 text-xs bg-primary text-primary-foreground font-semibold cursor-pointer shadow-xs"
                >
                  <Landmark className="w-3.5 h-3.5 mr-1" />
                  Full Council Overview →
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectWard && onSelectWard(null)}
                className="h-8 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕ Close Inspector
              </Button>
            </div>
          </div>

          {/* 3 Comparative Key Highlights: Councillor on Record + 2021 Baseline + Live Leader */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Box 1: Councillor Candidate on Record */}
            <div className="p-4 rounded-xl border border-border/80 bg-muted/30 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Users2 className="w-3.5 h-3.5 text-primary" />
                <span>Ward Councillor on Record</span>
              </span>
              <div className="text-base font-extrabold text-foreground truncate">
                {selectedWard.councillorCandidate || selectedWard.parties?.[0]?.candidate || selectedWard.leadingParty.candidate || 'Candidate on record'}
              </div>
              <div className="flex items-center gap-2 pt-0.5">
                <PartyLogo
                  abbr={selectedWard.leadingParty.abbr}
                  size="xs"
                  className="shrink-0"
                />
                <span className="text-xs font-semibold text-foreground">
                  {selectedWard.leadingParty.abbr}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  ({selectedWard.status === 'declared' ? 'Elected' : 'Leading'})
                </span>
              </div>
            </div>

            {/* Box 2: 2021 LGE Baseline Winner */}
            <div className="p-4 rounded-xl border border-border/80 bg-muted/30 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-primary" />
                <span>2021 LGE Baseline Winner</span>
              </span>
              {(() => {
                const hist = baseline2021?.wards?.[selectedWard.wardNumber] || baseline2021?.wards?.[String(selectedWard.wardNumber)];
                if (!hist) {
                  return <div className="text-xs text-muted-foreground italic">No historical record available for this ward</div>;
                }
                return (
                  <div>
                    <div className="text-base font-extrabold text-foreground truncate">
                      {hist.winningParty}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {hist.candidateName || 'Candidate on record'} • {hist.votes.toLocaleString()} votes ({hist.totalVotes > 0 ? ((hist.votes / hist.totalVotes) * 100).toFixed(1) : 0}%)
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Box 3: 2026 Live Winner & Margin */}
            <div className="p-4 rounded-xl border border-border/80 bg-muted/30 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-primary" />
                <span>2026 Live Leader &amp; Margin</span>
              </span>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-base font-extrabold text-foreground">
                  {selectedWard.leadingParty.abbr} ({selectedWard.leadingParty.percentage.toFixed(1)}%)
                </span>
                <span className="text-xs font-mono font-bold text-foreground">
                  {selectedWard.leadingParty.votes.toLocaleString()} votes
                </span>
              </div>
              <div className="text-xs font-mono">
                {selectedWard.runnerUp ? (
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                    +{(selectedWard.leadingParty.percentage - selectedWard.runnerUp.percentage).toFixed(1)}% lead over {selectedWard.runnerUp.abbr} ({selectedWard.runnerUp.percentage.toFixed(1)}%)
                  </span>
                ) : (
                  <span className="text-muted-foreground">Uncontested or single reporting party</span>
                )}
              </div>
            </div>
          </div>

          {/* Complete Ballot Breakdown: Every Party Contesting This Ward */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">
                All Contesting Parties in {selectedWard.name} ({selectedWard.parties?.length || 0} Parties)
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">
                Sorted by votes cast
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border text-[11px]">
                  <tr>
                    <th className="py-2 px-3 w-12 text-center">Rank</th>
                    <th className="py-2 px-3">Party &amp; Candidate</th>
                    <th className="py-2 px-3 text-right">Votes</th>
                    <th className="py-2 px-3 text-right">Share %</th>
                    <th className="py-2 px-3 w-36">Visual Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-mono text-[11px]">
                  {(selectedWard.parties || [selectedWard.leadingParty]).map((p, pIdx) => {
                    const isTargetParty = p.abbr.toUpperCase() === activePartyAbbr.toUpperCase();
                    return (
                      <tr
                        key={p.abbr + pIdx}
                        className={isTargetParty ? 'bg-primary/10 font-bold' : 'hover:bg-muted/30'}
                      >
                        <td className="py-2.5 px-3 text-center text-muted-foreground">
                          #{pIdx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-sans">
                          <div className="flex items-center gap-2">
                            <PartyLogo abbr={p.abbr} size="xs" color={p.color} className="shrink-0" />
                            <div>
                              <div className="font-bold text-foreground flex items-center gap-1.5">
                                <span>{p.abbr}</span>
                                {isTargetParty && (
                                  <Badge className="text-[9px] px-1 py-0 bg-primary text-primary-foreground font-sans">
                                    Tracked
                                  </Badge>
                                )}
                              </div>
                              {p.candidate && (
                                <div className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                                  {p.candidate}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums">
                          {p.votes.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold tabular-nums">
                          {p.percentage.toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-3">
                          <Progress
                            value={p.percentage}
                            indicatorColor={p.color || '#475569'}
                            size="xs"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* 4.1 Ward-by-Ward Historical Performance & 2026 Count Explorer */}
      {selectedMunicipality && (
        <Card className="p-4 sm:p-6 border-border/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <PartyLogo
                  abbr={currentPartyMeta.abbr}
                  name={currentPartyMeta.name}
                  color={currentPartyMeta.color}
                  size="sm"
                  className="shrink-0 shadow-xs"
                />
                <h3 className="font-bold text-base sm:text-lg text-foreground">
                  Every Ward in {selectedMunicipality}: {currentPartyMeta.abbr} vs 2021 LGE Baseline
                </h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Comparing {currentPartyMeta.abbr}'s live 2026 tally against 2021 Local Government Election results across all {municipalWards.length} wards
              </p>
            </div>

            {/* Ward Search & Count */}
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <div className="relative w-44 sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Filter ward #..."
                  value={wardSearchQuery}
                  onChange={(e) => setWardSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-xs bg-background/50 border-border"
                />
              </div>
              {selectedWard && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectWard && onSelectWard(null)}
                  className="h-8 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Clear Ward
                </Button>
              )}
            </div>
          </div>

          {/* Ward Quick Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setWardFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                wardFilterTab === 'all'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted'
              }`}
            >
              All Wards ({municipalWards.length})
            </button>
            <button
              type="button"
              onClick={() => setWardFilterTab('leading')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                wardFilterTab === 'leading'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted'
              }`}
            >
              {currentPartyMeta.abbr} Leading ({municipalWards.filter(w => w.leadingParty?.abbr.toUpperCase() === activePartyAbbr.toUpperCase()).length})
            </button>
            <button
              type="button"
              onClick={() => setWardFilterTab('defending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                wardFilterTab === 'defending'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted'
              }`}
            >
              2021 {currentPartyMeta.abbr} Wards ({municipalWards.filter(w => {
                const hist = baseline2021?.wards?.[w.wardNumber] || baseline2021?.wards?.[String(w.wardNumber)];
                return hist?.winningParty?.toUpperCase() === activePartyAbbr.toUpperCase();
              }).length})
            </button>
            <button
              type="button"
              onClick={() => setWardFilterTab('battleground')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                wardFilterTab === 'battleground'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted'
              }`}
            >
              Battlegrounds (&lt;10% gap)
            </button>
          </div>

          {/* Wards Table */}
          {filteredMunicipalWards.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-xs space-y-1">
              <p className="font-semibold">No wards matching this filter in {selectedMunicipality}.</p>
              <p className="text-[11px]">Clear search query or select another filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Ward</th>
                    <th className="py-2.5 px-3">2021 LGE Baseline Winner</th>
                    <th className="py-2.5 px-3">2026 Live Leader</th>
                    <th className="py-2.5 px-3">{currentPartyMeta.abbr} 2026 Share</th>
                    <th className="py-2.5 px-3">Status &amp; Trend</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredMunicipalWards.map((w) => {
                    const histWard = baseline2021?.wards?.[w.wardNumber] || baseline2021?.wards?.[String(w.wardNumber)];
                    const partyInWard = w.parties?.find(
                      (p) => p.abbr.toUpperCase() === activePartyAbbr.toUpperCase()
                    ) || (w.leadingParty.abbr.toUpperCase() === activePartyAbbr.toUpperCase() ? w.leadingParty : null);

                    const isSelected = selectedWard?.wardNumber === w.wardNumber;
                    const isLeading = w.leadingParty.abbr.toUpperCase() === activePartyAbbr.toUpperCase();
                    const won2021 = histWard?.winningParty?.toUpperCase() === activePartyAbbr.toUpperCase();

                    return (
                      <tr
                        key={w.wardCode || w.wardNumber}
                        onClick={() => handleInspectWard(w)}
                        className={`transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-primary/10 font-medium'
                            : 'hover:bg-muted/40'
                        }`}
                      >
                        <td className="py-3 px-3">
                          <div className="font-bold text-foreground flex items-center gap-1.5">
                            <span>Ward {w.wardNumber}</span>
                            {isSelected && (
                              <Badge variant="outline" className="text-[9px] bg-primary/20 text-primary border-primary/30">
                                Selected
                              </Badge>
                            )}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {w.vdsCounted} of {w.totalVds} VDs counted ({w.percComplete}%)
                          </div>
                        </td>

                        {/* 2021 LGE Baseline */}
                        <td className="py-3 px-3">
                          {histWard ? (
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <PartyLogo
                                  abbr={histWard.winningParty}
                                  size="xs"
                                  className="shrink-0"
                                />
                                <span className="font-bold text-foreground">
                                  {histWard.winningParty}
                                </span>
                              </div>
                              {histWard.candidateName && (
                                <div className="text-[10px] text-muted-foreground truncate max-w-[140px]">
                                  {histWard.candidateName}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-[11px] italic">No 2021 record</span>
                          )}
                        </td>

                        {/* 2026 Live Leader */}
                        <td className="py-3 px-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <PartyLogo
                                abbr={w.leadingParty.abbr}
                                size="xs"
                                className="shrink-0"
                              />
                              <span className="font-bold text-foreground">
                                {w.leadingParty.abbr}
                              </span>
                              <span className="font-mono text-muted-foreground text-[11px]">
                                {w.leadingParty.percentage.toFixed(1)}%
                              </span>
                            </div>
                            <div className="text-[10px] font-mono text-muted-foreground">
                              {w.leadingParty.votes.toLocaleString()} votes
                            </div>
                          </div>
                        </td>

                        {/* Selected Party Standing */}
                        <td className="py-3 px-3">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-mono font-bold">
                              <span className={isLeading ? 'text-emerald-700 dark:text-emerald-400' : 'text-foreground'}>
                                {partyInWard ? `${partyInWard.percentage.toFixed(1)}%` : '0.0%'}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-normal">
                                {partyInWard ? `${partyInWard.votes.toLocaleString()} votes` : '0 votes'}
                              </span>
                            </div>
                            <Progress
                              value={partyInWard ? partyInWard.percentage : 0}
                              indicatorColor={currentPartyMeta.color}
                              size="xs"
                            />
                          </div>
                        </td>

                        {/* Status & Trend */}
                        <td className="py-3 px-3">
                          {isLeading && won2021 ? (
                            <Badge className="text-[10px] font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-500/30">
                              Retained Lead
                            </Badge>
                          ) : isLeading && !won2021 ? (
                            <Badge className="text-[10px] font-mono bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-500/30">
                              Flipped / Gain
                            </Badge>
                          ) : !isLeading && won2021 ? (
                            <Badge className="text-[10px] font-mono bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-500/30">
                              Trailing (Held in 2021)
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">
                              Challenger
                            </Badge>
                          )}
                        </td>

                        {/* Action */}
                        <td className="py-3 px-3 text-right">
                          <Button
                            variant="default"
                            size="sm"
                            className="h-7 px-2.5 text-[11px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInspectWard(w);
                            }}
                          >
                            <span>Inspect</span>
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* 5. War Room Legal Copyright & Non-Partisan IEC Attribution Footer */}
      <footer className="pt-6 mt-6 border-t border-border/80 text-center text-xs text-muted-foreground space-y-2">
        <p className="font-semibold text-foreground/90">
          © 2026 Mzansi Civic Election Tracker • Independent &amp; Non-Partisan Public Civic Platform
        </p>
        <p className="text-[11px] max-w-3xl mx-auto leading-relaxed">
          Election returns and voting district tallies officially sourced from the Electoral Commission of South Africa (IEC). Municipal seat allocations and battleground projections calculated via statutory Hare Quota Largest Remainder algorithm. This tracker is an independent public voter education platform and does not endorse or promote any political party, candidate, or coalition.
        </p>
        <p className="text-[10px] text-muted-foreground/80 font-mono">
          All party trademarks, emblems, and candidate names remain the copyright and intellectual property of their respective registered political entities and the IEC.
        </p>
      </footer>
    </div>
  );
}
