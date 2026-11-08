import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// =========================================================================
// SCENE 1: THE DRAMATIC HOOK (0 - 8s / Frames 0 - 240)
// =========================================================================
function Scene1Hook() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({ frame: frame - 15, fps, config: { damping: 14 } });
  const subProgress = spring({ frame: frame - 55, fps, config: { damping: 14 } });
  const logoProgress = spring({ frame: frame - 110, fps, config: { damping: 12 } });

  const glowPulse = Math.sin(frame / 12) * 15 + 35;

  return (
    <AbsoluteFill className="bg-black text-white flex flex-col items-center justify-center p-16 font-sans select-none overflow-hidden">
      {/* South African Accent Ambient Lighting */}
      <div
        className="absolute w-[800px] h-[800px] rounded-full blur-[140px] pointer-events-none opacity-30"
        style={{
          background: 'radial-gradient(circle, #007A3D 0%, #FFB612 40%, #005BA6 80%)',
          transform: `scale(${1 + Math.sin(frame / 20) * 0.08})`,
        }}
      />

      {/* Pill Badge */}
      <div
        style={{
          opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' }),
          transform: `translateY(${interpolate(frame, [0, 20], [20, 0], { extrapolateRight: 'clamp' })}px)`,
        }}
        className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/40 backdrop-blur-md text-emerald-300 text-sm font-mono font-bold tracking-widest uppercase shadow-lg"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>South Africa 2026 • Local Government Elections</span>
      </div>

      {/* Main Kinetic Headline */}
      <div className="text-center max-w-5xl space-y-4 z-10">
        <h1
          style={{
            opacity: titleProgress,
            transform: `scale(${interpolate(titleProgress, [0, 1], [0.92, 1])})`,
          }}
          className="text-6xl sm:text-7xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent"
        >
          257 Municipalities.
          <br />
          <span className="text-emerald-400">Over 23,000</span> Voting Districts.
        </h1>

        <p
          style={{
            opacity: subProgress,
            transform: `translateY(${interpolate(subProgress, [0, 1], [20, 0])}px)`,
          }}
          className="text-2xl text-zinc-300 font-medium max-w-3xl mx-auto leading-relaxed"
        >
          In hours of breaking election counts, raw data alone isn't enough.
          <br />
          <span className="text-zinc-400">Citizens need real civic intelligence.</span>
        </p>

        {/* Revealed Brand Card */}
        <div
          style={{
            opacity: logoProgress,
            transform: `scale(${interpolate(logoProgress, [0, 1], [0.85, 1])})`,
            boxShadow: `0 0 ${glowPulse}px rgba(16, 185, 129, 0.25)`,
          }}
          className="mt-8 inline-block p-6 rounded-3xl bg-zinc-900/80 border border-emerald-500/40 backdrop-blur-xl"
        >
          <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold mb-1">
            INTRODUCING
          </div>
          <div className="text-4xl sm:text-5xl font-black text-white tracking-tight flex items-center justify-center gap-3">
            <span>🇿🇦</span>
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
              Mzansi Civic Election Tracker
            </span>
          </div>
          <div className="text-sm font-mono text-zinc-400 mt-2">
            Real-Time Results • AI ML Projections • Coalition Simulator
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// =========================================================================
// SCENE 2: LIVE CIVIC INTELLIGENCE (8 - 20s / Frames 240 - 600)
// =========================================================================
function Scene2LiveCore() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({ frame: frame - 240, fps, config: { damping: 14 } });
  const countSeats = Math.round(interpolate(frame, [260, 480], [0, 400], { extrapolateRight: 'clamp' }));

  return (
    <AbsoluteFill className="bg-zinc-950 text-white flex flex-col justify-between p-14 font-sans select-none overflow-hidden">
      {/* Top Section Header */}
      <div
        style={{
          opacity: entrance,
          transform: `translateY(${interpolate(entrance, [0, 1], [-20, 0])}px)`,
        }}
        className="flex items-center justify-between border-b border-zinc-800 pb-4"
      >
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-md bg-emerald-500 text-black font-black text-xs font-mono">
            FEATURE 01
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
            Real-Time Parliamentary &amp; Council Allocation
          </h2>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Statutory Hare Quota • 0% Remainder Truncation Error</span>
        </div>
      </div>

      {/* Main 3-Column Demo Grid */}
      <div className="grid grid-cols-12 gap-6 my-auto">
        {/* Left Card: Animated Seats Bar */}
        <div
          style={{
            opacity: spring({ frame: frame - 260, fps }),
            transform: `translateY(${interpolate(spring({ frame: frame - 260, fps }), [0, 1], [30, 0])}px)`,
          }}
          className="col-span-4 p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-4"
        >
          <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
            Total Allocated Seats
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-black font-mono text-emerald-400 tabular-nums">
              {countSeats}
            </span>
            <span className="text-zinc-500 font-mono text-lg">/ 400 Statutory Seats</span>
          </div>
          <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${(countSeats / 400) * 100}%` }}
            />
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Every proportional representation seat dynamically allocated in real time as progressive voting districts report.
          </p>
        </div>

        {/* Center Card: Real Councillor Candidate on Record Banner */}
        <div
          style={{
            opacity: spring({ frame: frame - 300, fps }),
            transform: `translateY(${interpolate(spring({ frame: frame - 300, fps }), [0, 1], [30, 0])}px)`,
          }}
          className="col-span-4 p-6 rounded-2xl bg-zinc-900/90 border border-amber-500/30 shadow-xl space-y-3 relative overflow-hidden"
        >
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px] font-mono font-bold">
            <span>⭐ Human Transparency</span>
          </div>
          <div className="text-lg font-bold text-white">
            Ward Councillor Candidate on Record
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
            <div className="text-xl font-black text-amber-400">Michael Ratsoma</div>
            <div className="text-xs text-zinc-400">Ward 37 (Seshego / Polokwane) • EFF Candidate</div>
            <div className="text-[11px] font-mono text-emerald-400 font-bold mt-1">
              ✓ Verified on official IEC Candidate Register
            </div>
          </div>
          <p className="text-xs text-zinc-400">
            No faceless political parties. Citizens see the actual human representatives running for their wards.
          </p>
        </div>

        {/* Right Card: Multi-Level Drill Down Map */}
        <div
          style={{
            opacity: spring({ frame: frame - 340, fps }),
            transform: `translateY(${interpolate(spring({ frame: frame - 340, fps }), [0, 1], [30, 0])}px)`,
          }}
          className="col-span-4 p-6 rounded-2xl bg-zinc-900/90 border border-blue-500/30 shadow-xl space-y-3"
        >
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[11px] font-mono font-bold">
            <span>🗺️ Geospatial Vector Engine</span>
          </div>
          <div className="text-lg font-bold text-white">
            Multi-Tiered Spatial Drill-Down
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between">
              <span className="text-zinc-400">Tier 1: National</span>
              <span className="text-white font-bold">9 Provinces</span>
            </div>
            <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between">
              <span className="text-zinc-400">Tier 2: Provincial</span>
              <span className="text-white font-bold">257 Municipalities</span>
            </div>
            <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-emerald-300">
              <span className="font-bold">Tier 3: Ward Level</span>
              <span className="font-bold">4,468 Wards</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar Footer */}
      <div className="text-xs font-mono text-zinc-500 flex items-center justify-between">
        <span>Mzansi Civic Platform • Official IEC Data Integration</span>
        <span>Next: Machine Learning Predictive War Room →</span>
      </div>
    </AbsoluteFill>
  );
}

// =========================================================================
// SCENE 3: THE AI WAR ROOM & BAYESIAN ENGINE (20 - 36s / Frames 600 - 1080)
// =========================================================================
function Scene3WarRoom() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({ frame: frame - 600, fps, config: { damping: 14 } });
  const card1 = spring({ frame: frame - 640, fps });
  const card2 = spring({ frame: frame - 680, fps });
  const card3 = spring({ frame: frame - 720, fps });

  return (
    <AbsoluteFill className="bg-zinc-950 text-white flex flex-col justify-between p-14 font-sans select-none overflow-hidden">
      {/* Top Bar Header */}
      <div
        style={{
          opacity: entrance,
          transform: `translateY(${interpolate(entrance, [0, 1], [-20, 0])}px)`,
        }}
        className="flex items-center justify-between border-b border-zinc-800 pb-4"
      >
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-md bg-purple-500 text-black font-black text-xs font-mono">
            FEATURE 02
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <span>Party War Room &amp; Bayesian Predictive Engine</span>
          </h2>
        </div>
        <div className="text-xs font-mono text-purple-400 bg-purple-950/60 border border-purple-500/30 px-3 py-1.5 rounded-full">
          <span>Turnout-Weighted Swing Regression (LGE 2021 + NPE 2024 Baselines)</span>
        </div>
      </div>

      {/* Hero Plain-English Civic Brief Card */}
      <div
        style={{
          opacity: card1,
          transform: `scale(${interpolate(card1, [0, 1], [0.95, 1])})`,
        }}
        className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-zinc-900 to-zinc-900 border-2 border-purple-500/40 shadow-2xl space-y-4 my-auto"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="font-extrabold text-xl text-white">
              Plain-English Election Intelligence: EFF in Polokwane
            </span>
          </div>
          <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold text-xs font-mono">
            🤝 Decisive Kingmaker
          </span>
        </div>

        {/* Big Verdict Headline */}
        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800">
          <div className="text-2xl font-black text-white leading-tight">
            "EFF holds the decisive balance of power as Kingmaker in Polokwane."
          </div>
          <div className="text-sm text-zinc-400 mt-1">
            Neither ANC (42 seats) nor opposition can reach the 46-seat majority without EFF's projected 19 seats.
          </div>
        </div>

        {/* 2 Comparative Metric Pillows */}
        <div className="grid grid-cols-2 gap-4">
          <div
            style={{ opacity: card2 }}
            className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1"
          >
            <div className="text-xs font-mono uppercase text-zinc-400">3-Election Comparison</div>
            <div className="flex items-baseline gap-3 text-lg font-mono">
              <span className="text-zinc-400 font-bold">'21: 24.8%</span>
              <span className="text-zinc-400 font-bold">'24: 22.8%</span>
              <span className="text-emerald-400 font-black">'26 Live: 21.6%</span>
            </div>
            <div className="text-xs font-mono text-rose-400 font-bold">
              📉 -3.2% localized swing vs 2021 LGE
            </div>
          </div>

          <div
            style={{ opacity: card3 }}
            className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1"
          >
            <div className="text-xs font-mono uppercase text-zinc-400">Who Governs The Council?</div>
            <div className="text-lg font-bold text-white">
              ANC (42) + EFF (19) = <span className="text-emerald-400">61 of 90 seats</span>
            </div>
            <div className="text-xs text-zinc-400">
              Comfortably clears the 46-seat threshold to elect the Executive Mayor.
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-xs font-mono text-zinc-500 flex items-center justify-between">
        <span>Bayesian priors update dynamically as progressive voting districts report</span>
        <span>Next: Granular Ward Inspector →</span>
      </div>
    </AbsoluteFill>
  );
}

// =========================================================================
// SCENE 4: GRANULAR WARDS & THE INSPECTOR (36 - 48s / Frames 1080 - 1440)
// =========================================================================
function Scene4Wards() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({ frame: frame - 1080, fps, config: { damping: 14 } });
  const inspectCard = spring({ frame: frame - 1140, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill className="bg-zinc-950 text-white flex flex-col justify-between p-14 font-sans select-none overflow-hidden">
      {/* Top Header */}
      <div
        style={{
          opacity: entrance,
          transform: `translateY(${interpolate(entrance, [0, 1], [-20, 0])}px)`,
        }}
        className="flex items-center justify-between border-b border-zinc-800 pb-4"
      >
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-md bg-blue-500 text-black font-black text-xs font-mono">
            FEATURE 03
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
            Granular Ward Transparency &amp; Active Dossier
          </h2>
        </div>
        <div className="text-xs font-mono text-blue-400 bg-blue-950/60 border border-blue-500/30 px-3 py-1.5 rounded-full">
          <span>Inspect Every Ward • 2021 Baseline Winner vs 2026 Live Outcome</span>
        </div>
      </div>

      {/* In-Place Ward Dossier Card */}
      <div
        style={{
          opacity: inspectCard,
          transform: `scale(${interpolate(inspectCard, [0, 1], [0.93, 1])})`,
        }}
        className="p-6 rounded-3xl bg-zinc-900/90 border-2 border-emerald-500/50 shadow-2xl space-y-4 my-auto max-w-4xl mx-auto w-full"
      >
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-black font-black text-xs">
                INSPECTED
              </span>
              <span className="text-2xl font-black text-white">Ward 37 • Polokwane</span>
              <span className="text-xs font-mono text-zinc-400">(LIM354)</span>
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              Moletjie / Seshego • 3,111 Votes Cast • 54% Turnout
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold">
            ✓ Result Declared
          </span>
        </div>

        {/* 3 Metrics Row */}
        <div className="grid grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
            <div className="text-zinc-400">2021 LGE Winner</div>
            <div className="text-base font-bold text-white">EFF (50.1%)</div>
            <div className="text-[11px] text-zinc-500">Michael Ratsoma (1,559 votes)</div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
            <div className="text-zinc-400">2026 Live Winner</div>
            <div className="text-base font-bold text-emerald-400">EFF (49.8%)</div>
            <div className="text-[11px] text-zinc-500">+5.2% lead over ANC</div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
            <div className="text-zinc-400">Status &amp; Trend</div>
            <div className="text-base font-bold text-emerald-400">Retained Lead</div>
            <div className="text-[11px] text-zinc-500">Safe municipal ward</div>
          </div>
        </div>

        {/* Mini Contesting Parties Progress */}
        <div className="space-y-2 pt-1 font-mono text-xs">
          <div>
            <div className="flex justify-between text-zinc-300 mb-1">
              <span>1. EFF (Michael Ratsoma)</span>
              <span>1,548 votes (49.8%)</span>
            </div>
            <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div className="h-full bg-red-600 rounded-full" style={{ width: '49.8%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-zinc-300 mb-1">
              <span>2. ANC (Thabo Moloto)</span>
              <span>1,385 votes (44.5%)</span>
            </div>
            <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full" style={{ width: '44.5%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-xs font-mono text-zinc-500 flex items-center justify-between">
        <span>Instant auto-scroll directly to where the chief information is</span>
        <span>Next: Municipal Coalition Simulator →</span>
      </div>
    </AbsoluteFill>
  );
}

// =========================================================================
// SCENE 5: DYNAMIC COALITION SIMULATOR (48 - 55s / Frames 1440 - 1650)
// =========================================================================
function Scene5Coalition() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({ frame: frame - 1440, fps, config: { damping: 14 } });
  const barProgress = spring({ frame: frame - 1470, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill className="bg-zinc-950 text-white flex flex-col justify-between p-14 font-sans select-none overflow-hidden">
      {/* Top Header */}
      <div
        style={{
          opacity: entrance,
          transform: `translateY(${interpolate(entrance, [0, 1], [-20, 0])}px)`,
        }}
        className="flex items-center justify-between border-b border-zinc-800 pb-4"
      >
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-md bg-amber-500 text-black font-black text-xs font-mono">
            FEATURE 04
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
            Interactive Coalition Builder &amp; Stability Index
          </h2>
        </div>
        <div className="text-xs font-mono text-amber-400 bg-amber-950/60 border border-amber-500/30 px-3 py-1.5 rounded-full">
          <span>Council Majority Simulator • Stability Dossiers</span>
        </div>
      </div>

      {/* Main Interactive Coalition Bar Visual */}
      <div className="my-auto max-w-4xl mx-auto w-full p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-zinc-400 uppercase">Simulated Municipal Coalition</div>
            <div className="text-2xl font-black text-white">City of Johannesburg Council (270 Seats)</div>
          </div>
          <div className="text-right">
            <div className="text-xs font-mono text-zinc-400 uppercase">Combined Seats</div>
            <div className="text-3xl font-black text-emerald-400 font-mono">148 / 270 Seats</div>
          </div>
        </div>

        {/* Majority Target Line & Progress Bar */}
        <div className="relative pt-6 pb-2">
          {/* Target Flag */}
          <div
            className="absolute top-0 text-[10px] font-mono text-amber-400 font-bold border-l-2 border-amber-400 pl-1 h-12 z-20"
            style={{ left: '50.37%' }}
          >
            Majority Threshold (136 Seats)
          </div>

          <div className="w-full h-8 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden flex">
            <div
              className="bg-emerald-600 h-full transition-all"
              style={{ width: `${interpolate(barProgress, [0, 1], [0, 32])}%` }}
              title="ANC (86 seats)"
            />
            <div
              className="bg-red-600 h-full transition-all"
              style={{ width: `${interpolate(barProgress, [0, 1], [0, 23])}%` }}
              title="EFF (62 seats)"
            />
          </div>
        </div>

        {/* Stability Rating */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-bold text-white text-sm">Governance Stability Index: 78 / 100</span>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold">
            ✓ Viable Executive Council Coalition
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-xs font-mono text-zinc-500 flex items-center justify-between">
        <span>Simulate custom coalition pacts for any municipality or national assembly</span>
        <span>Next: Developer Portfolio Credits →</span>
      </div>
    </AbsoluteFill>
  );
}

// =========================================================================
// SCENE 6: OUTRO & DEVELOPER SIGNATURE (55 - 60s / Frames 1650 - 1800)
// =========================================================================
function Scene6Outro() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({ frame: frame - 1650, fps, config: { damping: 14 } });
  const pulse = Math.sin(frame / 10) * 8 + 24;

  return (
    <AbsoluteFill className="bg-black text-white flex flex-col items-center justify-center p-16 font-sans select-none overflow-hidden text-center">
      {/* South Africa Ambient Glow */}
      <div
        className="absolute w-[900px] h-[900px] rounded-full blur-[160px] pointer-events-none opacity-25"
        style={{
          background: 'radial-gradient(circle, #007A3D 0%, #FFB612 50%, #DE0000 100%)',
        }}
      />

      <div
        style={{
          opacity: entrance,
          transform: `scale(${interpolate(entrance, [0, 1], [0.9, 1])})`,
        }}
        className="space-y-6 z-10 max-w-4xl"
      >
        <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
          ARCHITECTED &amp; ENGINEERED BY
        </div>

        <h1 className="text-6xl sm:text-7xl font-black tracking-tight text-white">
          Reamogetswe Molefe
        </h1>

        <p className="text-xl text-zinc-300 font-medium">
          Full-Stack AI Software Engineer • Civic Tech Builder
        </p>

        {/* Tech Stack Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs font-mono text-zinc-300">
          <span className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800">Next.js 16 (App Router)</span>
          <span className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800">React 19</span>
          <span className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800">TypeScript</span>
          <span className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800">Tailwind CSS 4</span>
          <span className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800">SWR Real-Time</span>
          <span className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800">Bayesian ML Models</span>
          <span className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800">Remotion</span>
        </div>

        {/* Live URL Pill */}
        <div
          style={{
            boxShadow: `0 0 ${pulse}px rgba(16, 185, 129, 0.4)`,
          }}
          className="mt-6 inline-block px-8 py-4 rounded-2xl bg-emerald-600 text-white font-mono font-bold text-lg tracking-wider"
        >
          iec-election-tracker.vercel.app
        </div>

        <div className="text-xs font-mono text-zinc-500 pt-4">
          Open Source Civic Platform • Non-Partisan • Built for South Africa 🇿🇦
        </div>
      </div>
    </AbsoluteFill>
  );
}

// =========================================================================
// MAIN COMPOSITION EXPORT (1800 frames = 60 seconds at 30 fps)
// =========================================================================
export function ProductFilm() {
  return (
    <AbsoluteFill className="bg-black">
      {/* Act 1: The Dramatic Hook (0 - 8s) */}
      <Sequence from={0} durationInFrames={240}>
        <Scene1Hook />
      </Sequence>

      {/* Act 2: Live Core Intelligence (8 - 20s) */}
      <Sequence from={240} durationInFrames={360}>
        <Scene2LiveCore />
      </Sequence>

      {/* Act 3: AI War Room & Bayesian Engine (20 - 36s) */}
      <Sequence from={600} durationInFrames={480}>
        <Scene3WarRoom />
      </Sequence>

      {/* Act 4: Granular Wards Transparency (36 - 48s) */}
      <Sequence from={1080} durationInFrames={360}>
        <Scene4Wards />
      </Sequence>

      {/* Act 5: Coalition Simulator (48 - 55s) */}
      <Sequence from={1440} durationInFrames={210}>
        <Scene5Coalition />
      </Sequence>

      {/* Act 6: Outro & Developer Signature (55 - 60s) */}
      <Sequence from={1650} durationInFrames={150}>
        <Scene6Outro />
      </Sequence>
    </AbsoluteFill>
  );
}
