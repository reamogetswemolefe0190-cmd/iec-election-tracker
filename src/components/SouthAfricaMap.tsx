'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ProvinceSummary, MunicipalitySummary, EnrichedPartyResult } from '@/types/election';
import {
  SA_PROVINCES_GEO,
  getCompletionBand,
  ProvinceMapFeature,
} from '@/lib/sa-map-data';
import { generateWardsForMunicipality, WardResult } from '@/lib/wards';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PartyLogo } from '@/components/ui/party-logo';
import {
  RotateCcw,
  Info,
  Map as MapIcon,
  ChevronRight,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  Search,
  Users,
  Vote,
  Sparkles,
  Layers,
} from 'lucide-react';

import municipalityCodeMap from '@/lib/municipality-code-map.json';

export interface MapArea {
  id: string;
  name: string;
  label?: string;
  d: string;
  x: number;
  y: number;
  labelled?: boolean;
}

export interface MapGeoData {
  width: number;
  height: number;
  areas: MapArea[];
}

interface SouthAfricaMapProps {
  provinces: ProvinceSummary[];
  selectedProvince: string | null;
  onSelectProvince: (provinceName: string | null) => void;
  selectedMunicipality?: string | null;
  onSelectMunicipality?: (municipalityName: string | null) => void;
  selectedWard?: WardResult | null;
  onSelectWard?: (ward: WardResult | null) => void;
  granularWards?: Record<string, WardResult>;
  municipalities?: MunicipalitySummary[];
  parties?: EnrichedPartyResult[];
}

export function SouthAfricaMap({
  provinces,
  selectedProvince,
  onSelectProvince,
  selectedMunicipality,
  onSelectMunicipality,
  selectedWard,
  onSelectWard,
  granularWards,
  municipalities = [],
  parties = [],
}: SouthAfricaMapProps) {
  const [shadingMode, setShadingMode] = useState<'progress' | 'party'>('progress');
  const [hoveredProvinceId, setHoveredProvinceId] = useState<string | null>(null);
  const [hoveredMunicId, setHoveredMunicId] = useState<string | null>(null);
  const [hoveredWardId, setHoveredWardId] = useState<string | null>(null);

  const [provinceGeo, setProvinceGeo] = useState<MapGeoData | null>(null);
  const [wardGeo, setWardGeo] = useState<MapGeoData | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);

  // Internal ward state if external prop not supplied
  const [internalSelectedWard, setInternalSelectedWard] = useState<WardResult | null>(null);
  const activeWard = selectedWard !== undefined ? selectedWard : internalSelectedWard;

  const handleSelectWard = (ward: WardResult | null) => {
    setInternalSelectedWard(ward);
    if (onSelectWard) {
      onSelectWard(ward);
    }
  };

  // Map province summary statistics by province name (case-insensitive)
  const provinceStatsMap = useMemo(() => {
    const map = new Map<string, ProvinceSummary>();
    provinces.forEach((p) => {
      map.set(p.name.toLowerCase(), p);
    });
    return map;
  }, [provinces]);

  // Current active province object
  const activeProvinceObj = useMemo(() => {
    if (!selectedProvince) return null;
    return provinces.find(
      (p) => p.name.toLowerCase() === selectedProvince.toLowerCase()
    ) || null;
  }, [provinces, selectedProvince]);

  // Current active municipality object
  const activeMunicipalityObj = useMemo(() => {
    if (!selectedMunicipality) return null;
    const clean = selectedMunicipality.toLowerCase();
    return municipalities.find((m) => m.name.toLowerCase() === clean) || null;
  }, [municipalities, selectedMunicipality]);

  // List of municipalities in the active province
  const provinceMunicipalities = useMemo(() => {
    if (!selectedProvince) return [];
    const cleanProv = selectedProvince.toLowerCase();
    const fromProv = activeProvinceObj?.municipalities || [];
    if (fromProv.length > 0) return fromProv;
    return municipalities.filter((m) => m.provinceName.toLowerCase() === cleanProv);
  }, [selectedProvince, activeProvinceObj, municipalities]);

  // Active municipality code for ward map resolution (instant via pre-compiled index)
  const activeMunicipalityCode = useMemo(() => {
    if (!selectedMunicipality) return null;
    const clean = selectedMunicipality.toLowerCase().trim();
    const mapDict = municipalityCodeMap as Record<string, string>;

    // 1. Direct match in dictionary
    if (mapDict[clean]) return mapDict[clean];

    // 2. Stripped name (without "local municipality", "metropolitan municipality", etc.)
    const stripped = clean
      .replace(/local municipality|metropolitan municipality|municipality/g, '')
      .replace(/\(.*\)/g, '')
      .trim();
    if (mapDict[stripped]) return mapDict[stripped];

    // 3. Partial check in keys
    for (const [k, code] of Object.entries(mapDict)) {
      if (clean.includes(k) || k.includes(clean)) {
        return code;
      }
    }

    // 4. Look up in provinceGeo if loaded
    if (provinceGeo) {
      const area = provinceGeo.areas.find(
        (a) =>
          a.name.toLowerCase() === clean ||
          clean.includes(a.name.toLowerCase()) ||
          a.name.toLowerCase().includes(clean)
      );
      if (area) return area.id;
    }

    if (activeMunicipalityObj?.code) {
      return activeMunicipalityObj.code;
    }

    return null;
  }, [selectedMunicipality, provinceGeo, activeMunicipalityObj]);

  // Wards for Level 3 & Level 4 view (prefers live granular data, with geometric fallback)
  const municipalityWards = useMemo(() => {
    if (granularWards && Object.keys(granularWards).length > 0) {
      return Object.values(granularWards);
    }
    const targetMunic: MunicipalitySummary = activeMunicipalityObj || {
      municipalityId: 3004,
      name: selectedMunicipality || 'Municipality',
      provinceId: 0,
      provinceName: selectedProvince || '',
      vdsComplete: 10,
      vdExpected: 50,
      percComplete: 24,
      seatsComplete: 0,
      seatsExpected: 100,
      topParties: [],
    };
    return generateWardsForMunicipality(targetMunic, parties, wardGeo?.areas);
  }, [granularWards, activeMunicipalityObj, selectedMunicipality, selectedProvince, parties, wardGeo]);

  // 1. Fetch Province Geometry Map when selectedProvince changes
  useEffect(() => {
    if (!selectedProvince) {
      setProvinceGeo(null);
      return;
    }

    const slug = selectedProvince.toLowerCase().replace(/\s+/g, '-');
    setGeoLoading(true);

    fetch(`/maps/province-${slug}.json`)
      .then((r) => {
        if (r.ok) return r.json();
        throw new Error(`Failed to load local /maps/province-${slug}.json`);
      })
      .then((data: MapGeoData) => {
        setProvinceGeo(data);
        setGeoLoading(false);
      })
      .catch((err) => {
        console.warn('Province map geometry load warning:', err);
        setGeoLoading(false);
      });
  }, [selectedProvince]);

  // 2. Fetch Ward Geometry Map when activeMunicipalityCode changes
  useEffect(() => {
    if (!activeMunicipalityCode) {
      setWardGeo(null);
      handleSelectWard(null);
      return;
    }

    setGeoLoading(true);

    fetch(`/maps/ward-${activeMunicipalityCode}.json`)
      .then((r) => {
        if (r.ok) return r.json();
        throw new Error(`Failed to load local /maps/ward-${activeMunicipalityCode}.json`);
      })
      .then((data: MapGeoData) => {
        setWardGeo(data);
        setGeoLoading(false);
      })
      .catch((err) => {
        console.warn('Ward map geometry load warning:', err);
        setGeoLoading(false);
      });
  }, [activeMunicipalityCode]);

  // Sort ward areas so the selected ward is painted on top in SVG for crisp black outline
  const sortedWardAreas = useMemo(() => {
    if (!wardGeo) return [];
    if (!activeWard) return wardGeo.areas;
    const targetNo = activeWard.wardNumber;
    return [...wardGeo.areas].sort((a, b) => {
      const aNo = parseInt(a.label || a.name.replace(/\D/g, ''), 10) || 0;
      const bNo = parseInt(b.label || b.name.replace(/\D/g, ''), 10) || 0;
      if (aNo === targetNo) return 1;
      if (bNo === targetNo) return -1;
      return 0;
    });
  }, [wardGeo, activeWard]);

  // Helper to match map area with election municipality object
  const matchMunicipality = (areaName: string, areaId: string): MunicipalitySummary | undefined => {
    const cleanAreaName = areaName.toLowerCase().replace(/local municipality|metropolitan municipality|municipality/g, '').trim();
    const cleanAreaId = areaId.toLowerCase();

    return provinceMunicipalities.find((m) => {
      const cleanMName = m.name.toLowerCase().replace(/local municipality|metropolitan municipality|municipality/g, '').trim();
      return (
        cleanMName === cleanAreaName ||
        m.name.toLowerCase().includes(cleanAreaName) ||
        cleanAreaName.includes(cleanMName) ||
        String(m.municipalityId).toLowerCase() === cleanAreaId
      );
    });
  };

  const handleSelectMunicipality = (name: string) => {
    if (onSelectMunicipality) {
      onSelectMunicipality(name);
    }
  };

  // Drill-down level: 'national' | 'province' | 'wards' | 'ward-detail'
  const drillDownLevel: 'national' | 'province' | 'wards' | 'ward-detail' = activeWard
    ? 'ward-detail'
    : selectedMunicipality
    ? 'wards'
    : selectedProvince
    ? 'province'
    : 'national';

  // Current level completion metrics for ElectAI progress bar
  const { currentPerc, currentVdsCounted, currentVdsExpected } = useMemo(() => {
    if (activeWard) {
      return {
        currentPerc: activeWard.percComplete,
        currentVdsCounted: activeWard.vdsCounted,
        currentVdsExpected: activeWard.totalVds,
      };
    }
    if (selectedMunicipality) {
      const vds = activeMunicipalityObj?.vdsComplete ?? 0;
      const expected = activeMunicipalityObj?.vdExpected ?? (wardGeo ? wardGeo.areas.length * 4 : 100);
      const perc = activeMunicipalityObj?.percComplete ?? (expected > 0 ? (vds / expected) * 100 : 0);
      return {
        currentPerc: perc,
        currentVdsCounted: vds,
        currentVdsExpected: expected,
      };
    }
    if (selectedProvince) {
      const vds = activeProvinceObj?.vdsComplete ?? 0;
      const expected = activeProvinceObj?.vdExpected ?? 2836;
      const perc = activeProvinceObj?.percComplete ?? (expected > 0 ? (vds / expected) * 100 : 0);
      return {
        currentPerc: perc,
        currentVdsCounted: vds,
        currentVdsExpected: expected,
      };
    }
    // National
    const totalVds = provinces.reduce((sum, p) => sum + (p.vdsComplete || 0), 0);
    const totalExp = provinces.reduce((sum, p) => sum + (p.vdExpected || 0), 0) || 23292;
    const nationalPerc = totalExp > 0 ? (totalVds / totalExp) * 100 : 100;
    return {
      currentPerc: nationalPerc,
      currentVdsCounted: totalVds,
      currentVdsExpected: totalExp,
    };
  }, [activeWard, selectedMunicipality, selectedProvince, activeMunicipalityObj, activeProvinceObj, provinces, wardGeo]);

  return (
    <Card className="p-4 sm:p-5 border-border/80 bg-card shadow-xs flex flex-col justify-between overflow-hidden relative min-h-[520px] rounded-2xl">
      {/* 1. Header with ElectAI Breadcrumb Controls and Progress Bar */}
      <CardHeader className="p-0 pb-3 flex flex-col gap-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {/* Breadcrumb Hierarchy */}
          <div className="flex items-center gap-2 flex-wrap">
            {selectedProvince ? (
              <button
                type="button"
                onClick={() => {
                  onSelectProvince(null);
                  if (onSelectMunicipality) onSelectMunicipality(null);
                  handleSelectWard(null);
                }}
                className="px-3.5 py-1 rounded-full border border-border/80 bg-background hover:bg-muted text-foreground text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              >
                South Africa
              </button>
            ) : (
              <span className="font-bold text-sm text-foreground">
                South Africa
              </span>
            )}

            {selectedProvince && !selectedMunicipality && (
              <span className="font-bold text-sm text-foreground">
                {selectedProvince}
              </span>
            )}

            {selectedProvince && selectedMunicipality && (
              <button
                type="button"
                onClick={() => {
                  if (onSelectMunicipality) onSelectMunicipality(null);
                  handleSelectWard(null);
                }}
                className="px-3.5 py-1 rounded-full border border-border/80 bg-background hover:bg-muted text-foreground text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              >
                {selectedProvince}
              </button>
            )}

            {selectedMunicipality && !activeWard && (
              <span className="font-bold text-sm text-foreground">
                {selectedMunicipality} wards
              </span>
            )}

            {selectedMunicipality && activeWard && (
              <>
                <button
                  type="button"
                  onClick={() => handleSelectWard(null)}
                  className="px-3.5 py-1 rounded-full border border-border/80 bg-background hover:bg-muted text-foreground text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                >
                  {selectedMunicipality}
                </button>
                <span className="font-bold text-sm text-primary">
                  {activeWard.name}
                </span>
              </>
            )}
          </div>

          {/* Shading Mode Toggle & Ward Jumper */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {drillDownLevel === 'wards' && wardGeo && wardGeo.areas.length > 0 && (
              <select
                value={activeWard ? String(activeWard.wardNumber) : ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) {
                    handleSelectWard(null);
                    return;
                  }
                  const num = parseInt(val, 10);
                  const target = municipalityWards.find((w) => w.wardNumber === num);
                  if (target) {
                    handleSelectWard(target);
                  }
                }}
                className="h-7 text-[11px] rounded-lg border border-border bg-card px-2 text-foreground font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
                aria-label="Jump directly to ward"
              >
                <option value="">Jump to Ward...</option>
                {wardGeo.areas.map((wa) => {
                  const num = parseInt(wa.label || wa.name.replace(/\D/g, ''), 10) || 1;
                  return (
                    <option key={wa.id} value={num}>
                      Ward {num}
                    </option>
                  );
                })}
              </select>
            )}

            <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/60 text-[11px]">
              <button
                type="button"
                onClick={() => setShadingMode('progress')}
                className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                  shadingMode === 'progress'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Counting %
              </button>
              <button
                type="button"
                onClick={() => setShadingMode('party')}
                className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                  shadingMode === 'party'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Leading Party
              </button>
            </div>
          </div>
        </div>

        {/* ElectAI Progress Bar Indicator */}
        <div className="space-y-1.5 pt-1">
          <div className="text-xs text-muted-foreground">
            <strong className="text-foreground">{currentPerc.toFixed(2)}%</strong> of voting districts counted ({currentVdsCounted.toLocaleString()} of {currentVdsExpected.toLocaleString()})
          </div>
          <div className="w-full h-1.5 bg-blue-100/70 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0047b9] rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, currentPerc))}%` }}
            />
          </div>
        </div>
      </CardHeader>

      {/* 2. Main Body Content Based on Drill-Down Level */}
      <CardContent className="p-0 flex-1 flex flex-col justify-between">
        {/* ================= LEVEL 1: NATIONAL 9 PROVINCES VECTOR MAP ================= */}
        {drillDownLevel === 'national' && (
          <div className="space-y-3">
            <div className="relative w-full aspect-[640/561] bg-card rounded-xl border border-border/40 overflow-hidden flex items-center justify-center p-2">
              <svg
                viewBox="0 0 640 561"
                className="w-full h-full drop-shadow-xs select-none"
                role="group"
                aria-label="Official interactive map of South Africa's 9 provinces"
              >
                {SA_PROVINCES_GEO.map((feature: ProvinceMapFeature) => {
                  const summary = provinceStatsMap.get(feature.name.toLowerCase());
                  const perc = summary?.percComplete ?? 0;
                  const isHovered = hoveredProvinceId === feature.id;
                  const band = getCompletionBand(perc);

                  let fillColor = band.fillColor;
                  if (shadingMode === 'party') {
                    fillColor = summary?.leadingParty?.color || '#334155';
                  }

                  const tooltipText = `${feature.name}: ${perc.toFixed(1)}% VDs counted (${summary?.vdsComplete || 0} of ${summary?.vdExpected || 0})${
                    summary?.leadingParty ? ` • Leading: ${summary.leadingParty.abbr}` : ''
                  }`;

                  return (
                    <g
                      key={feature.id}
                      className="cursor-pointer transition-transform"
                      onClick={() => onSelectProvince(feature.name)}
                      onMouseEnter={() => setHoveredProvinceId(feature.id)}
                      onMouseLeave={() => setHoveredProvinceId(null)}
                    >
                      <path
                        d={feature.path}
                        fill={fillColor}
                        stroke={isHovered ? '#0047b9' : '#8cb5ec'}
                        strokeWidth={isHovered ? 2.5 : 1}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        className="transition-all duration-150"
                        style={{ fillOpacity: isHovered ? 0.98 : 0.9 }}
                      >
                        <title>{tooltipText}</title>
                      </path>

                      <text
                        x={feature.centroid.x}
                        y={feature.centroid.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="pointer-events-none font-bold select-none"
                        style={{
                          fontSize: feature.id === 'gauteng' ? '12px' : '13px',
                          fill: '#0f172a',
                          paintOrder: 'stroke',
                          stroke: '#ffffff',
                          strokeWidth: '3px',
                          strokeLinejoin: 'round',
                        }}
                      >
                        <tspan x={feature.centroid.x} dy="-0.3em">
                          {feature.id === 'gauteng'
                            ? 'GP'
                            : feature.id === 'kwazulu-natal'
                            ? 'KwaZulu-Natal'
                            : feature.id === 'western-cape'
                            ? 'W. Cape'
                            : feature.id === 'eastern-cape'
                            ? 'E. Cape'
                            : feature.id === 'northern-cape'
                            ? 'N. Cape'
                            : feature.id === 'north-west'
                            ? 'NW'
                            : feature.name}
                        </tspan>
                        <tspan
                          x={feature.centroid.x}
                          dy="1.2em"
                          className="font-mono text-[10px] font-semibold"
                        >
                          {perc.toFixed(0)}%
                        </tspan>
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Legend & Visual Honesty Footnote */}
            <div className="pt-3 border-t border-border/40 flex flex-col gap-2 text-xs text-muted-foreground">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-[#edf3fa] border border-[#cbd5e1]" /> No results yet</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-[#cfe2ff]" /> Under 25%</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-[#96bcf2]" /> 25 to 49%</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-[#5f97e8]" /> 50 to 74%</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-[#2563eb]" /> 75 to 99%</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-[#0047b9]" /> All counted</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Tap a province for its results. Colour shows how much is counted, not who’s ahead.
              </p>
            </div>
          </div>
        )}

        {/* ================= LEVEL 2: PROVINCIAL METROS & MUNICIPALITIES MAP ================= */}
        {drillDownLevel === 'province' && (
          <div className="space-y-3">
            {/* Province Map SVG */}
            {provinceGeo ? (
              <div className="relative w-full aspect-[640/560] max-h-[460px] bg-card rounded-xl border border-border/40 overflow-hidden flex items-center justify-center p-2">
                <svg
                  viewBox={`-2 -2 ${provinceGeo.width + 4} ${provinceGeo.height + 4}`}
                  className="w-full h-full drop-shadow-xs select-none"
                  role="group"
                  aria-label={`Interactive map of ${selectedProvince} municipalities`}
                >
                  {provinceGeo.areas.map((area) => {
                    const matchedMunic = matchMunicipality(area.name, area.id);
                    const perc = matchedMunic?.percComplete ?? 0;
                    const isHovered = hoveredMunicId === area.id;
                    const band = getCompletionBand(perc);

                    let fillColor = band.fillColor;
                    if (shadingMode === 'party') {
                      fillColor = matchedMunic?.leadingParty?.color || band.fillColor;
                    }

                    const tooltipText = `${area.name}: ${perc.toFixed(1)}% counted${
                      matchedMunic?.leadingParty ? ` • Leading: ${matchedMunic.leadingParty.abbr}` : ''
                    }`;

                    const cleanName = area.name.replace(/ Local Municipality| Metropolitan Municipality/g, '');

                    return (
                      <g
                        key={area.id}
                        className="cursor-pointer transition-transform"
                        onClick={() => handleSelectMunicipality(area.name)}
                        onMouseEnter={() => setHoveredMunicId(area.id)}
                        onMouseLeave={() => setHoveredMunicId(null)}
                      >
                        <path
                          d={area.d}
                          fill={fillColor}
                          stroke={isHovered ? '#0047b9' : '#8cb5ec'}
                          strokeWidth={isHovered ? 2 : 1}
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          className="transition-all duration-150"
                          style={{ fillOpacity: isHovered ? 0.98 : 0.9 }}
                        >
                          <title>{tooltipText}</title>
                        </path>

                        {/* Centered clean outlined label matching ElectAI */}
                        <text
                          x={area.x}
                          y={area.y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="pointer-events-none select-none font-semibold text-[10px] sm:text-[11px] fill-[#1e293b] dark:fill-slate-100"
                          style={{
                            paintOrder: 'stroke',
                            stroke: '#ffffff',
                            strokeWidth: '2.5px',
                            strokeLinejoin: 'round',
                          }}
                        >
                          <tspan x={area.x} dy="0">
                            {cleanName}
                          </tspan>
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>Loading {selectedProvince} map...</span>
                </div>
              </div>
            )}

            {/* Legend & Visual Honesty Footnote */}
            <div className="pt-3 border-t border-border/40 flex flex-col gap-2 text-xs text-muted-foreground">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-[#edf3fa] border border-[#cbd5e1]" /> No results yet</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-[#cfe2ff]" /> Under 25%</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-[#96bcf2]" /> 25 to 49%</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-[#5f97e8]" /> 50 to 74%</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-[#2563eb]" /> 75 to 99%</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-[#0047b9]" /> All counted</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Tap a municipality for its results. Colour shows how much is counted, not who’s ahead.
              </p>
            </div>
          </div>
        )}

        {/* ================= LEVEL 3 & 4: MUNICIPALITY WARDS MAP & WARD DRILL-DOWN ================= */}
        {(drillDownLevel === 'wards' || drillDownLevel === 'ward-detail') && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-foreground">
                  {selectedMunicipality} wards
                </h4>
                {activeWard && (
                  <Badge variant="secondary" size="sm" className="font-semibold text-[11px] bg-primary/10 text-primary border-primary/20">
                    Viewing {activeWard.name}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                {/* Jump to Ward quick-selector */}
                {wardGeo && wardGeo.areas.length > 0 && (
                  <select
                    value={activeWard ? String(activeWard.wardNumber) : ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) {
                        handleSelectWard(null);
                        return;
                      }
                      const num = parseInt(val, 10);
                      const target = municipalityWards.find((w) => w.wardNumber === num);
                      if (target) {
                        handleSelectWard(target);
                      }
                    }}
                    className="h-7 text-[11px] rounded-lg border border-border bg-card px-2 text-foreground font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
                    aria-label="Jump directly to ward"
                  >
                    <option value="">Jump to Ward...</option>
                    {wardGeo.areas.map((wa) => {
                      const num = parseInt(wa.label || wa.name.replace(/\D/g, ''), 10) || 1;
                      return (
                        <option key={wa.id} value={num}>
                          Ward {num}
                        </option>
                      );
                    })}
                  </select>
                )}

                <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                  {wardGeo ? `${wardGeo.areas.length} Wards` : 'Loading Wards...'}
                </Badge>
              </div>
            </div>

            {/* Ward Map SVG */}
            {wardGeo ? (
              <div className="relative w-full aspect-[640/560] max-h-[460px] bg-card rounded-xl border border-border/40 overflow-hidden flex items-center justify-center p-2">
                <svg
                  viewBox={`-2 -2 ${wardGeo.width + 4} ${wardGeo.height + 4}`}
                  className="w-full h-full drop-shadow-xs select-none"
                  role="group"
                  aria-label={`Interactive map of ${selectedMunicipality} wards`}
                >
                  {sortedWardAreas.map((wardArea) => {
                    const wardNo = parseInt(wardArea.label || wardArea.name.replace(/\D/g, ''), 10) || 1;
                    const matchedWard = municipalityWards.find((w) => w.wardNumber === wardNo);
                    const isSelected = activeWard?.wardNumber === wardNo;
                    const isHovered = hoveredWardId === wardArea.id;
                    const perc = matchedWard?.percComplete ?? 0;
                    const band = getCompletionBand(perc);

                    let fillColor = band.fillColor;
                    if (shadingMode === 'party') {
                      fillColor = matchedWard?.leadingParty?.color || band.fillColor;
                    }

                    const tooltipText = `Ward ${wardNo}: ${perc}% counted${
                      matchedWard?.leadingParty ? ` • Leading: ${matchedWard.leadingParty.abbr} (${matchedWard.leadingParty.percentage}%)` : ''
                    }`;

                    return (
                      <g
                        key={wardArea.id}
                        className="cursor-pointer transition-transform"
                        onClick={() => {
                          const targetWard = matchedWard || municipalityWards.find((w) => w.wardNumber === wardNo) || {
                            wardNumber: wardNo,
                            wardCode: wardArea.id,
                            name: `Ward ${wardNo}`,
                            vdsCounted: 0,
                            totalVds: 2,
                            percComplete: 0,
                            status: 'pending' as const,
                            leadingParty: { abbr: 'Pending', color: '#64748B', percentage: 0, votes: 0 },
                            registeredVoters: 0,
                            totalVotes: 0,
                            turnout: 0,
                            parties: [],
                          };
                          handleSelectWard(targetWard);
                        }}
                        onMouseEnter={() => setHoveredWardId(wardArea.id)}
                        onMouseLeave={() => setHoveredWardId(null)}
                      >
                        <path
                          d={wardArea.d}
                          fill={fillColor}
                          stroke={isSelected ? '#000000' : isHovered ? '#0047b9' : '#8cb5ec'}
                          strokeWidth={isSelected ? 2.75 : isHovered ? 1.75 : 0.75}
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          className="transition-all duration-100"
                          style={{
                            fillOpacity: isSelected || isHovered ? 1 : 0.9,
                          }}
                        >
                          <title>{tooltipText}</title>
                        </path>

                        {/* Ward Number Label */}
                        {(wardArea.labelled || isSelected || isHovered) && (
                          <text
                            x={wardArea.x}
                            y={wardArea.y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="pointer-events-none select-none font-semibold text-[10px] sm:text-[11px] fill-[#0f172a] dark:fill-slate-100 font-sans"
                            style={{
                              paintOrder: 'stroke',
                              stroke: '#ffffff',
                              strokeWidth: isSelected ? '3.5px' : '2px',
                              strokeLinejoin: 'round',
                            }}
                          >
                            {wardArea.label || wardArea.name.replace(/\D/g, '')}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>Loading {selectedMunicipality} wards map...</span>
                </div>
              </div>
            )}

            {/* Legend & Visual Honesty Footnote */}
            <div className="pt-3 border-t border-border/40 flex flex-col gap-2 text-xs text-muted-foreground">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-[#edf3fa] border border-[#cbd5e1]" /> No results yet</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-[#cfe2ff]" /> Under 25%</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-[#96bcf2]" /> 25 to 49%</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-[#5f97e8]" /> 50 to 74%</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-[#2563eb]" /> 75 to 99%</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-[#0047b9]" /> All counted</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Tap a ward for its results, or zoom in for small ones. Colour shows how much is counted, not who’s ahead.
              </p>
            </div>

            {/* LEVEL 4: Selected Ward Ballot Breakdown Card */}
            {activeWard && (
              <div className="p-4 rounded-xl bg-card border-2 border-primary/40 shadow-sm flex flex-col gap-3 transition-all animate-in fade-in-50 duration-200">
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                        <Vote className="w-4 h-4 text-primary" />
                        <span>{activeWard.name}</span>
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          activeWard.status === 'declared'
                            ? 'bg-status-completed/15 text-status-completed border border-status-completed/30'
                            : 'bg-muted text-muted-foreground border border-border'
                        }`}
                      >
                        {activeWard.status === 'declared' ? '✓ Declared' : `${activeWard.percComplete}% Counted`}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {selectedMunicipality} • {selectedProvince} • {activeWard.vdsCounted} of {activeWard.totalVds} Voting Districts Finalized
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => handleSelectWard(null)}
                    className="text-xs h-7 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                  >
                    Close Ward View ×
                  </Button>
                </div>

                {/* Ward Turnout & Voters Bar */}
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/40 border border-border/50">
                  <span className="text-muted-foreground">
                    Turnout: <strong className="text-foreground font-mono">{activeWard.turnout}%</strong>
                  </span>
                  <span className="text-muted-foreground">
                    Registered Voters: <strong className="text-foreground font-mono">{new Intl.NumberFormat('en-ZA').format(activeWard.registeredVoters)}</strong>
                  </span>
                  <span className="text-muted-foreground">
                    Ballots Cast: <strong className="text-foreground font-mono">{new Intl.NumberFormat('en-ZA').format(activeWard.totalVotes)}</strong>
                  </span>
                </div>

                {/* Ward Party Results Standings */}
                {Boolean(activeWard.totalVotes > 0 || (activeWard.leadingParty && activeWard.leadingParty.votes > 0)) ? (
                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Party Ballot Breakdown
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {/* 1st Place */}
                      <div className="p-2.5 rounded-lg bg-background border border-primary/30 flex flex-col gap-1.5 shadow-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <PartyLogo
                              abbr={activeWard.leadingParty.abbr}
                              name={activeWard.leadingParty.abbr}
                              color={activeWard.leadingParty.color}
                              size="sm"
                            />
                            <div>
                              <span className="font-bold truncate text-foreground block">
                                {activeWard.leadingParty.abbr}
                              </span>
                              <span className="text-[10px] text-primary font-semibold">1st Place (Leading)</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-extrabold text-sm text-foreground">
                              {activeWard.leadingParty.percentage}%
                            </div>
                            <div className="font-mono text-[10px] text-muted-foreground">
                              {new Intl.NumberFormat('en-ZA').format(activeWard.leadingParty.votes)} votes
                            </div>
                          </div>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${activeWard.leadingParty.percentage}%`,
                              backgroundColor: activeWard.leadingParty.color,
                            }}
                          />
                        </div>
                      </div>

                      {/* 2nd Place */}
                      {activeWard.runnerUp && (
                        <div className="p-2.5 rounded-lg bg-background border border-border/70 flex flex-col gap-1.5 shadow-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <PartyLogo
                                abbr={activeWard.runnerUp.abbr}
                                name={activeWard.runnerUp.abbr}
                                color={activeWard.runnerUp.color}
                                size="sm"
                              />
                              <div>
                                <span className="font-bold truncate text-foreground block">
                                  {activeWard.runnerUp.abbr}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-semibold">Runner-up (2nd)</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-mono font-bold text-sm text-foreground">
                                {activeWard.runnerUp.percentage}%
                              </div>
                              <div className="font-mono text-[10px] text-muted-foreground">
                                {new Intl.NumberFormat('en-ZA').format(activeWard.runnerUp.votes)} votes
                              </div>
                            </div>
                          </div>
                          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${activeWard.runnerUp.percentage}%`,
                                backgroundColor: activeWard.runnerUp.color,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Dedicated Results Pending Notice for this specific ward */
                  <div className="space-y-2.5">
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-400">
                      <Clock className="w-4 h-4 shrink-0 mt-0.5 animate-pulse" />
                      <div className="space-y-0.5">
                        <span className="font-semibold block">Results Not Yet Available</span>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Voting districts in {activeWard.name} are currently counting ballots. The IEC has not yet audited and published the first results slip for this ward.
                        </p>
                      </div>
                    </div>

                    {activeWard.parties && activeWard.parties.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Contesting Candidates &amp; Parties ({activeWard.parties.length})
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                          {activeWard.parties.map((p, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/60 border border-border/70 text-[11px] text-foreground font-medium"
                            >
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: p.color || '#64748B' }}
                              />
                              <span className="font-semibold">{p.abbr}</span>
                              <span className="text-[10px] text-muted-foreground">Awaiting votes</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
