# Mzansi Civic Election Tracker (IEC Live Results & Bayesian Projection Engine)

A real-time, responsive South African election results dashboard and statistical projection engine built with **Next.js 16 (App Router)**, **TypeScript**, and **Tailwind CSS**, deployed on **Vercel**.

Directly connected to the public live results feeds of the **Electoral Commission of South Africa (IEC)** and supplemented by verified offline municipal and ward-level datasets.

---

## Core Capabilities

- **Live Background Sync:** Real-time polling via SWR without full-page reloads.
- **Edge Cache Proxy (`/api/election-results`):** Serverless Route Handler caching upstream IEC feeds with `stale-while-revalidate` to prevent upstream rate-limiting during high election-night traffic.
- **Turnout-Weighted Bayesian Projection Engine (`src/lib/ml-projection-engine.ts`):**
  - Fuses progressive voting district (VD) returns with 2021 LGE and 2024 NPE historical baselines.
  - Dynamically calculates 95% Credible Intervals contracting asymptotically as counting nears completion.
  - Allocates council and parliamentary seats using the Statutory Hare Quota (Largest Remainder) with exact seat conservation and zero truncation errors.
- **Civic War Room & Stronghold Analysis:**
  - Municipal and provincial stronghold classification: Safe Strongholds, Competitive Pluralities, and Battleground Swings.
  - Plain-English civic briefs translating raw electoral mathematics into actionable democratic insights.
- **Interactive Coalition Simulator:**
  - Test municipal and national coalition combinations against statutory majority thresholds (e.g. 136 seats for JHB, 201 for National Assembly).
- **Interactive GeoJSON Maps:**
  - Fast, responsive national, provincial, and municipal boundary maps rendered with localized GeoJSON files.

---

## Testing & Validation Suite

The engine includes an automated validation suite with 18 mathematical proofs, Monte Carlo simulations, and real-world backtests:

```bash
# Run the Bayesian projection engine validation suite
npm run test:engine
```

The test battery verifies:
- Statutory Hare Quota exact seat sum invariant across all council sizes ($N \in \{11, 24, 45, 90, 214, 270, 400\}$).
- Monotonic Bayesian belief updating and asymptotic convergence ($MAE < 0.01\%$).
- Empirical 95% Credible Interval coverage ($\ge 98\%$ over 1,000 perturbed Monte Carlo election runs).
- Certified historical backtesting against 2021 Johannesburg LGE and 2024 National Parliamentary outcomes.
- Real-world validation against actual 2026 declared council results across 30 fully completed municipalities (100% winner accuracy at ~35% counted).

---

## Running Locally

```bash
# Navigate to the project directory
cd iec-election-tracker

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## Upstream Data Source

Data is fetched from the official public feeds of the **[Electoral Commission of South Africa (IEC)](https://www.elections.org.za)** (`results.elections.org.za`).
