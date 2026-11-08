'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ProductFilm } from '@/remotion/ProductFilm';

// Dynamically import Remotion Player with SSR disabled to prevent Date.now() evaluation during static page prerender
const Player = dynamic(() => import('@remotion/player').then((mod) => mod.Player), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 text-zinc-400 gap-3">
      <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      <span className="text-xs font-mono text-zinc-500">Initializing Remotion Engine (1080p 60s)...</span>
    </div>
  ),
});
import {
  ArrowLeft,
  Sparkles,
  Share2,
  Check,
  Code2,
  Tv,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export default function VideoShowcasePage() {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-emerald-500/30 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Live Dashboard</span>
            </Link>
            <div className="h-4 w-px bg-zinc-800 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2">
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs font-mono font-bold">
                PRODUCED WITH REMOTION &amp; CODE
              </Badge>
              <span className="text-xs text-zinc-400 font-medium">60s Product Launch Film</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="h-8 px-3 text-xs border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-white"
            >
              {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 mr-1" />}
              <span>{copied ? 'Link Copied!' : 'Share Video'}</span>
            </Button>
            <Link href="/?view=warroom">
              <Button size="sm" className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-950/50">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Launch Live War Room
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Theater Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Film Title Header */}
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400">
            <Tv className="w-3.5 h-3.5" />
            <span>PORTFOLIO &amp; PRODUCT SHOWCASE FILM</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            Mzansi Civic Election Tracker
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-3xl leading-relaxed">
            A 60-second code-rendered film showing how real-time IEC counts, statutory Hare Quota allocations, Bayesian ML predictions, and coalition simulators combine to bring transparency to South Africa's elections.
          </p>
        </div>

        {/* 16:9 Remotion Video Player Canvas */}
        <div className="relative rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl bg-black aspect-video group">
          <Player
            component={ProductFilm}
            durationInFrames={1800}
            compositionWidth={1920}
            compositionHeight={1080}
            fps={30}
            controls
            autoPlay
            loop
            acknowledgeRemotionLicense
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        </div>

        {/* Chapters & Storyboard Index */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span>Film Storyboard &amp; Chapters</span>
            </h3>
            <span className="text-xs font-mono text-zinc-500">60 Seconds • 30 FPS • 1080p</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
            <Card className="p-4 bg-zinc-900/60 border-zinc-800 text-zinc-300 space-y-1">
              <div className="text-emerald-400 font-bold text-[11px]">00:00 — 00:08 (Frames 0–240)</div>
              <div className="font-sans font-bold text-sm text-white">1. The Civic Challenge</div>
              <p className="font-sans text-xs text-zinc-400 leading-tight">
                257 municipalities, 23,000+ voting districts. Why raw data isn't enough without real-time intelligence.
              </p>
            </Card>

            <Card className="p-4 bg-zinc-900/60 border-zinc-800 text-zinc-300 space-y-1">
              <div className="text-emerald-400 font-bold text-[11px]">00:08 — 00:20 (Frames 240–600)</div>
              <div className="font-sans font-bold text-sm text-white">2. Live Civic Intelligence</div>
              <p className="font-sans text-xs text-zinc-400 leading-tight">
                Statutory Hare Quota PR seat allocation and real candidate names on record with the IEC.
              </p>
            </Card>

            <Card className="p-4 bg-zinc-900/60 border-zinc-800 text-zinc-300 space-y-1">
              <div className="text-emerald-400 font-bold text-[11px]">00:20 — 00:36 (Frames 600–1080)</div>
              <div className="font-sans font-bold text-sm text-white">3. AI Party War Room</div>
              <p className="font-sans text-xs text-zinc-400 leading-tight">
                Turnout-Weighted Bayesian regression blending 2021 LGE and 2024 NPE baselines with live swing updates.
              </p>
            </Card>

            <Card className="p-4 bg-zinc-900/60 border-zinc-800 text-zinc-300 space-y-1">
              <div className="text-emerald-400 font-bold text-[11px]">00:36 — 00:48 (Frames 1080–1440)</div>
              <div className="font-sans font-bold text-sm text-white">4. Granular Ward Dossier</div>
              <p className="font-sans text-xs text-zinc-400 leading-tight">
                One-click Ward 37 inspection comparing 2021 historical winners against live 2026 counting.
              </p>
            </Card>

            <Card className="p-4 bg-zinc-900/60 border-zinc-800 text-zinc-300 space-y-1">
              <div className="text-emerald-400 font-bold text-[11px]">00:48 — 00:55 (Frames 1440–1650)</div>
              <div className="font-sans font-bold text-sm text-white">5. Coalition Simulator</div>
              <p className="font-sans text-xs text-zinc-400 leading-tight">
                Interactive majority thresholds and governance stability index for hung councils.
              </p>
            </Card>

            <Card className="p-4 bg-zinc-900/60 border-zinc-800 text-zinc-300 space-y-1 border-emerald-500/30 bg-emerald-950/20">
              <div className="text-emerald-400 font-bold text-[11px]">00:55 — 01:00 (Frames 1650–1800)</div>
              <div className="font-sans font-bold text-sm text-white">6. Architect &amp; Engineering</div>
              <p className="font-sans text-xs text-zinc-400 leading-tight">
                Built by Reamogetswe Molefe with Next.js 16, React 19, TypeScript, Tailwind 4, SWR, and Remotion.
              </p>
            </Card>
          </div>
        </div>

        {/* Engineering Highlights Banner */}
        <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-bold text-base text-white">
              Why Code-Rendered Video with Remotion?
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
              Every scene in this film is a live React component compiled from the real UI tokens, SVG party emblems, and statutory mathematical models of the tracker—zero mockups, zero manual video editing, perfectly responsive to code changes.
            </p>
          </div>
          <Link href="/">
            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 px-4 shrink-0">
              Explore Live Tracker →
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-6 text-center text-xs text-zinc-500 font-mono">
        © 2026 Mzansi Civic Election Tracker • Product Demo Film • Built by Reamogetswe Molefe
      </footer>
    </div>
  );
}
