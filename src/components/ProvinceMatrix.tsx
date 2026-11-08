'use client';

import React, { useState } from 'react';
import { ProvinceSummary } from '@/types/election';
import { MapPin, Check, RotateCcw, LayoutGrid, List, Info, SlidersHorizontal } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PartyLogo } from '@/components/ui/party-logo';

interface ProvinceMatrixProps {
  provinces: ProvinceSummary[];
  selectedProvince: string | null;
  onSelectProvince: (provName: string | null) => void;
}

export function ProvinceMatrix({
  provinces,
  selectedProvince,
  onSelectProvince,
}: ProvinceMatrixProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [shadingMode, setShadingMode] = useState<'progress' | 'party'>('progress');

  // Monochromatic saturation color calculator for Visual Honesty
  const getProgressTint = (perc: number) => {
    if (perc >= 100) return 'bg-emerald-600/30 border-emerald-500/60 text-emerald-300';
    if (perc >= 75) return 'bg-sky-600/25 border-sky-500/50 text-sky-300';
    if (perc >= 50) return 'bg-sky-700/20 border-sky-600/40 text-sky-300';
    if (perc >= 25) return 'bg-sky-800/15 border-sky-700/30 text-sky-400';
    return 'bg-muted/30 border-border/60 text-muted-foreground';
  };

  return (
    <Card className="p-5 @container space-y-4">
      <CardHeader className="p-0 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-status-live shrink-0" />
              <span className="truncate">9-Province Counting Matrix</span>
            </CardTitle>
            <CardDescription>
              Select any province to filter dashboard results
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/60">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                title="List view"
                aria-label="List view"
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'list'
                    ? 'bg-card text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                title="Grid view"
                aria-label="Grid view"
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'grid'
                    ? 'bg-card text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>

            {selectedProvince && (
              <Button
                variant="ghost"
                size="xs"
                onClick={() => onSelectProvince(null)}
                className="text-xs text-primary hover:text-primary/90 font-semibold"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Shading Mode Switcher (Visual Honesty Pattern) */}
        <div className="flex items-center justify-between gap-2 p-1 bg-muted/40 rounded-xl border border-border/50 text-xs">
          <span className="text-[11px] text-muted-foreground px-2 flex items-center gap-1 font-medium">
            <SlidersHorizontal className="w-3 h-3 text-primary" />
            Shading:
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShadingMode('progress')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                shadingMode === 'progress'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Counting %
            </button>
            <button
              type="button"
              onClick={() => setShadingMode('party')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                shadingMode === 'party'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Leading Party
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 space-y-3">
        {viewMode === 'list' ? (
          /* Sleek, un-squishable List View */
          <div className="flex flex-col gap-2">
            {provinces.map((prov) => {
              const perc = prov.percComplete || 0;
              const leading = prov.leadingParty;
              const isSelected = selectedProvince?.toLowerCase() === prov.name.toLowerCase();

              const stageVariant: 'inProgress' | 'verified' | 'live' | 'completed' =
                perc >= 100
                  ? 'completed'
                  : perc >= 85
                  ? 'live'
                  : perc >= 30
                  ? 'verified'
                  : 'inProgress';

              const progressClasses = getProgressTint(perc);

              return (
                <button
                  type="button"
                  key={prov.provinceId}
                  onClick={() => onSelectProvince(isSelected ? null : prov.name)}
                  aria-pressed={isSelected}
                  className={`rounded-xl p-3 transition-all text-left flex items-center justify-between gap-3 cursor-pointer border ${
                    isSelected
                      ? 'bg-primary/10 border-primary shadow-xs ring-1 ring-primary'
                      : shadingMode === 'progress'
                      ? `${progressClasses} hover:border-primary/50`
                      : 'bg-card/70 border-border hover:border-border/90 hover:bg-muted/40'
                  }`}
                >
                  {/* Left Column: Province Title & Leading Party */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-foreground truncate" title={prov.name}>
                        {prov.name}
                      </h4>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground min-w-0">
                      {leading ? (
                        <>
                          <PartyLogo
                            abbr={leading.abbr}
                            color={leading.color}
                            size="xs"
                          />
                          <span className="font-semibold text-foreground truncate">
                            {leading.abbr}
                          </span>
                          <span className="font-mono text-muted-foreground text-[11px] tabular-nums shrink-0">
                            ({leading.percentage.toFixed(1)}%)
                          </span>
                        </>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">Counting pending</span>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Progress percentage & Micro bar */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0 min-w-[76px]">
                    <Badge variant={stageVariant} size="sm" className="font-mono text-[11px] px-1.5 py-0.5">
                      {perc.toFixed(1)}% VDs
                    </Badge>
                    <div className="w-20">
                      <Progress
                        value={perc}
                        size="xs"
                        variant={perc >= 85 ? 'gradient' : 'default'}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* Roomy, responsive 2-column Card Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2.5">
            {provinces.map((prov) => {
              const perc = prov.percComplete || 0;
              const leading = prov.leadingParty;
              const isSelected = selectedProvince?.toLowerCase() === prov.name.toLowerCase();

              const stageVariant: 'inProgress' | 'verified' | 'live' | 'completed' =
                perc >= 100
                  ? 'completed'
                  : perc >= 85
                  ? 'live'
                  : perc >= 30
                  ? 'verified'
                  : 'inProgress';

              const progressClasses = getProgressTint(perc);

              return (
                <button
                  type="button"
                  key={prov.provinceId}
                  onClick={() => onSelectProvince(isSelected ? null : prov.name)}
                  aria-pressed={isSelected}
                  className={`rounded-xl p-3 transition-all text-left flex flex-col justify-between cursor-pointer border ${
                    isSelected
                      ? 'bg-primary/10 border-primary shadow-xs ring-1 ring-primary'
                      : shadingMode === 'progress'
                      ? `${progressClasses} hover:border-primary/50`
                      : 'bg-card/70 border-border hover:border-border/90 hover:bg-muted/40'
                  }`}
                >
                  <div className="w-full">
                    <div className="flex items-center justify-between gap-1.5 mb-2 w-full min-w-0">
                      <div className="flex items-center gap-1 min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-foreground truncate" title={prov.name}>
                          {prov.name}
                        </h4>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                        )}
                      </div>
                      <Badge variant={stageVariant} size="sm" className="shrink-0 font-mono text-[11px] px-1.5 py-0.5">
                        {perc.toFixed(1)}%
                      </Badge>
                    </div>

                    <div className="mb-2.5 w-full">
                      <Progress
                        value={perc}
                        size="xs"
                        variant={perc >= 85 ? 'gradient' : 'default'}
                      />
                    </div>
                  </div>

                  {leading ? (
                    <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs w-full min-w-0">
                      <span className="text-[11px] text-muted-foreground shrink-0">Leading:</span>
                      <div className="flex items-center gap-1.5 min-w-0 shrink">
                        <PartyLogo
                          abbr={leading.abbr}
                          color={leading.color}
                          size="xs"
                        />
                        <span className="font-bold text-foreground text-xs truncate">
                          {leading.abbr}
                        </span>
                        <span className="font-mono text-muted-foreground text-[11px] tabular-nums shrink-0">
                          ({leading.percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-[11px] text-muted-foreground pt-2 border-t border-border/50">
                      Counting pending
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Visual Honesty Footnote */}
        <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50 flex items-start gap-2 text-[11px] text-muted-foreground leading-normal">
          <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
          <span>
            {shadingMode === 'progress'
              ? 'Color saturation indicates counting completion (VDs counted), not the projected winner.'
              : 'Leading party reflects current counted ballots. Does not indicate final declaration.'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
