'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { GpsLocation, ProvinceSummary, MunicipalitySummary } from '@/types/election';
import {
  reverseGeocodeCoordinates,
  SA_PROVINCES,
  getMunicipalitiesForProvince,
  findProvinceForMunicipality,
} from '@/lib/geo';
import { searchSuburbs, SuburbEntry } from '@/lib/suburb-mapping';
import {
  MapPin,
  Navigation,
  Compass,
  RotateCcw,
  AlertCircle,
  Bell,
  BellOff,
  Building2,
  Check,
  Search,
  X,
  MapPinned,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { PartyLogo } from '@/components/ui/party-logo';

interface GpsFilterCardProps {
  provinces: ProvinceSummary[];
  selectedProvince: string | null;
  onSelectProvince: (provName: string | null) => void;
  municipalities?: MunicipalitySummary[];
  selectedMunicipality?: string | null;
  onSelectMunicipality?: (municName: string | null) => void;
  alertsEnabled?: boolean;
  onToggleAlerts?: () => void;
}

export function GpsFilterCard({
  provinces,
  selectedProvince,
  onSelectProvince,
  municipalities = [],
  selectedMunicipality = null,
  onSelectMunicipality,
  alertsEnabled = false,
  onToggleAlerts,
}: GpsFilterCardProps) {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<GpsLocation | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAreaName, setActiveAreaName] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Search predictions
  const searchResults = useMemo(() => {
    return searchSuburbs(searchQuery);
  }, [searchQuery]);

  // Click outside listener for search results dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const requestGpsLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const loc = await reverseGeocodeCoordinates(latitude, longitude);
          setLocation(loc);
          setLoading(false);
          setActiveAreaName(loc.ward);

          // Auto-apply province filter if matched
          const matchedProv = provinces.find(
            (p) => p.name.toLowerCase() === loc.province.toLowerCase()
          );
          if (matchedProv) {
            onSelectProvince(matchedProv.name);
          }

          // Try matching municipality in feed or registry
          if (onSelectMunicipality) {
            onSelectMunicipality(loc.municipality);
          }
        } catch {
          setErrorMsg('Could not detect ward from coordinates. You can select manually below.');
          setLoading(false);
        }
      },
      (geoError) => {
        setLoading(false);
        if (geoError.code === 1) {
          setErrorMsg('Location permission was denied. You can select your province manually below.');
        } else {
          setErrorMsg('Unable to retrieve your location. Check your GPS or device settings.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleClearLocation = () => {
    setLocation(null);
    setErrorMsg(null);
    setActiveAreaName(null);
    onSelectProvince(null);
    onSelectMunicipality?.(null);
  };

  const handleSelectArea = (entry: SuburbEntry) => {
    setActiveAreaName(entry.suburb);
    setSearchQuery('');
    setIsSearchOpen(false);

    onSelectProvince(entry.province);

    // Find closest municipality match in live feed or registry
    const liveMatch = municipalities.find((m) =>
      m.name.toLowerCase().includes(entry.municipality.toLowerCase()) ||
      entry.municipality.toLowerCase().includes(m.name.toLowerCase())
    );

    onSelectMunicipality?.(liveMatch ? liveMatch.name : entry.municipality);
  };

  const matchedProvince = location
    ? provinces.find((p) => p.name.toLowerCase() === location.province.toLowerCase())
    : null;

  const matchedMunicipality = location && municipalities.length > 0
    ? municipalities.find(
        (m) =>
          m.name.toLowerCase().includes(location.municipality.toLowerCase()) ||
          location.municipality.toLowerCase().includes(m.name.toLowerCase())
      )
    : null;

  const provinceOptions = [
    { value: '', label: 'All 9 Provinces (National Results)' },
    ...SA_PROVINCES.map((prov) => ({ value: prov, label: prov })),
  ];

  // Comprehensive options: combines live feed data with full official registry
  const municipalityOptions = useMemo(() => {
    const liveMunicsForProvince = (municipalities || []).filter((m) =>
      selectedProvince ? m.provinceName.toLowerCase() === selectedProvince.toLowerCase() : true
    );
    const liveNames = new Set(liveMunicsForProvince.map((m) => m.name));

    // Official South African registry list
    const registryMunics = getMunicipalitiesForProvince(selectedProvince);

    const items = [
      ...liveMunicsForProvince.map((m) => ({
        value: m.name,
        label: `${m.name} (${m.vdsComplete}/${m.vdExpected} VDs)`,
      })),
      ...registryMunics
        .filter((name) => !liveNames.has(name))
        .map((name) => ({
          value: name,
          label: name,
        })),
    ];

    return [
      {
        value: '',
        label: selectedProvince
          ? `All Municipalities in ${selectedProvince}`
          : 'All Municipalities (National / Metros)',
      },
      ...items,
    ];
  }, [municipalities, selectedProvince]);

  const handleProvinceSelect = (prov: string | null) => {
    onSelectProvince(prov);
    if (prov && selectedMunicipality) {
      const parentProv = findProvinceForMunicipality(selectedMunicipality);
      if (parentProv && parentProv.toLowerCase() !== prov.toLowerCase()) {
        onSelectMunicipality?.(null);
      }
    }
  };

  const handleMunicipalitySelect = (munic: string | null) => {
    onSelectMunicipality?.(munic);
    if (munic && !selectedProvince) {
      const deducedProv = findProvinceForMunicipality(munic);
      if (deducedProv) {
        onSelectProvince(deducedProv);
      }
    }
  };

  return (
    <Card className="bg-card border-border/80 p-5 relative z-20 transition-all shadow-sm">
      <CardContent className="p-0 space-y-4 relative z-20">
        {!location ? (
          /* Default View: 3-Way Search & Filter Layout (Suburb + Dropdowns + GPS) */
          <div className="space-y-4">
            {/* Tier 1: Title, Suburb Finder & GPS Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary flex-shrink-0 mt-0.5 shadow-xs">
                  <Compass className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-foreground">
                      Track Counting in Your Ward, Suburb or Municipality
                    </h2>
                    <Badge variant="live" size="sm">
                      GPS ACTIVE
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Search by suburb, township, municipality, or detect via GPS.
                  </p>
                  {errorMsg && (
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-amber-500 dark:text-amber-400">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <Button
                  variant="default"
                  size="sm"
                  onClick={requestGpsLocation}
                  disabled={loading}
                  isLoading={loading}
                  className="shadow-sm"
                >
                  <Navigation className="w-3.5 h-3.5 mr-1" />
                  {loading ? 'Detecting...' : 'Use My Location'}
                </Button>

                {onToggleAlerts && (
                  <Button
                    variant={alertsEnabled ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={onToggleAlerts}
                    title={alertsEnabled ? 'Live vote alerts enabled' : 'Enable live vote alerts'}
                    className="gap-1.5"
                  >
                    {alertsEnabled ? (
                      <>
                        <Bell className="w-3.5 h-3.5 text-primary animate-pulse" />
                        <span className="text-xs font-semibold text-primary">Alerts ON</span>
                      </>
                    ) : (
                      <>
                        <BellOff className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Alerts OFF</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Suburb & Town Predictive Search Bar (ElectAI Pattern) */}
            <div ref={searchContainerRef} className="relative w-full">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  placeholder="Type your suburb or town (e.g. Soweto, Centurion, Lenasia, Umhlanga, Sandton, Paarl)..."
                  className="w-full h-10 pl-10 pr-10 rounded-xl bg-card border border-border text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Suggestions Flyout */}
              {isSearchOpen && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-11 bg-card border border-border/90 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 bg-muted/40 text-[10px] font-mono text-muted-foreground uppercase tracking-wider border-b border-border/50">
                    Matching Suburbs & Municipalities
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-border/40">
                    {searchResults.map((entry, idx) => (
                      <button
                        key={`${entry.suburb}-${idx}`}
                        type="button"
                        onClick={() => handleSelectArea(entry)}
                        className="w-full px-3.5 py-2.5 text-left hover:bg-muted/60 transition-colors flex items-center justify-between gap-2 cursor-pointer group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <MapPinned className="w-4 h-4 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                          <div className="min-w-0">
                            <span className="font-bold text-xs sm:text-sm text-foreground block truncate">
                              {entry.suburb}
                            </span>
                            <span className="text-[11px] text-muted-foreground truncate block">
                              {entry.municipality} • {entry.province}
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline" size="sm" className="shrink-0 text-[10px]">
                          Select
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Active Suburb Pill */}
            {activeAreaName && (
              <div className="flex items-center justify-between p-2 rounded-xl bg-primary/10 border border-primary/30 text-xs">
                <span className="flex items-center gap-1.5 text-primary font-medium">
                  <Check className="w-3.5 h-3.5" />
                  <span>Viewing results for: <strong>{activeAreaName}</strong></span>
                </span>
                <button
                  type="button"
                  onClick={() => setActiveAreaName(null)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Tier 2: Dedicated Filter Toolbar with Roomy Dropdowns */}
            <div className="pt-2 border-t border-border/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 min-w-[220px]">
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  1. Filter by Province
                </label>
                <Select
                  value={selectedProvince || ''}
                  onValueChange={(val) => handleProvinceSelect(val || null)}
                  options={provinceOptions}
                  placeholder="All 9 Provinces (National)"
                  aria-label="Filter by South African province"
                />
              </div>

              {onSelectMunicipality && (
                <div className="flex-1 min-w-[240px]">
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    2. Filter by Municipality / Council
                  </label>
                  <Select
                    value={selectedMunicipality || ''}
                    onValueChange={(val) => handleMunicipalitySelect(val || null)}
                    options={municipalityOptions}
                    placeholder="Select municipality / metro..."
                    aria-label="Filter by South African municipality"
                  />
                </div>
              )}

              {(selectedProvince || selectedMunicipality) && (
                <div className="sm:self-end pb-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onSelectProvince(null);
                      onSelectMunicipality?.(null);
                      setActiveAreaName(null);
                    }}
                    className="text-xs text-primary hover:text-primary/90 font-semibold h-10 px-3"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                    Reset to National
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Detected Location Active View */
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary flex-shrink-0 shadow-xs">
                  <MapPin className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-status-live">
                      YOUR VOTING REGION DETECTED
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-xs font-mono text-muted-foreground tabular-nums">
                      Lat: {location.latitude.toFixed(2)}, Lon: {location.longitude.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-base font-bold text-foreground">
                      {location.ward}
                    </span>
                    <span className="text-border">•</span>
                    <span className="text-sm font-semibold text-muted-foreground flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {location.municipality}
                    </span>
                    <span className="text-border">•</span>
                    <Badge variant="outline" size="sm">
                      {location.province}
                    </Badge>
                  </div>

                  {/* Progress Details */}
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
                    {matchedMunicipality ? (
                      <span>
                        Municipality Counting:{' '}
                        <b className="text-status-live font-mono tabular-nums">
                          {matchedMunicipality.vdsComplete} of {matchedMunicipality.vdExpected} VDs ({matchedMunicipality.percComplete}%)
                        </b>
                      </span>
                    ) : matchedProvince ? (
                      <span>
                        Province Counting:{' '}
                        <b className="text-status-live font-mono tabular-nums">
                          {matchedProvince.percComplete?.toFixed(1)}% VDs complete
                        </b>
                      </span>
                    ) : null}

                    {matchedProvince?.leadingParty && (
                      <span className="flex items-center gap-1.5">
                        Leading in {location.province}:
                        <PartyLogo
                          abbr={matchedProvince.leadingParty.abbr}
                          color={matchedProvince.leadingParty.color}
                          size="xs"
                        />
                        <b className="text-foreground">{matchedProvince.leadingParty.abbr}</b>
                        <span className="font-mono text-muted-foreground tabular-nums">
                          ({matchedProvince.leadingParty.percentage.toFixed(1)}%)
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start lg:self-center">
                {onToggleAlerts && (
                  <Button
                    variant={alertsEnabled ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={onToggleAlerts}
                    title="Toggle live vote audio alerts"
                    className="gap-1.5"
                  >
                    {alertsEnabled ? (
                      <Bell className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <BellOff className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                    <span className="text-xs">{alertsEnabled ? 'Alerts ON' : 'Alerts OFF'}</span>
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearLocation}
                  title="Reset GPS location"
                  aria-label="Reset GPS location"
                  className="h-9 w-9 rounded-xl border border-border"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Filter Toolbar for Active GPS Mode */}
            <div className="pt-2 border-t border-border/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 min-w-[220px]">
                <Select
                  value={selectedProvince || ''}
                  onValueChange={(val) => handleProvinceSelect(val || null)}
                  options={provinceOptions}
                  placeholder="Filter province..."
                  aria-label="Filter by province"
                />
              </div>

              {onSelectMunicipality && (
                <div className="flex-1 min-w-[240px]">
                  <Select
                    value={selectedMunicipality || ''}
                    onValueChange={(val) => handleMunicipalitySelect(val || null)}
                    options={municipalityOptions}
                    placeholder="Filter municipality..."
                    aria-label="Filter by municipality"
                  />
                </div>
              )}

              {(selectedProvince || selectedMunicipality) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onSelectProvince(null);
                    onSelectMunicipality?.(null);
                    setActiveAreaName(null);
                  }}
                  className="text-xs text-primary hover:text-primary/90 font-semibold h-10 px-3"
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  View National
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
