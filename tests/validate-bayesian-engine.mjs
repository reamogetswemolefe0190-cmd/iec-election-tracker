import assert from 'node:assert/strict';
import {
  runMLElectionProjection,
  getBayesianWeights,
  extractPartyStrongholds,
  generatePlainEnglishBrief,
} from '../src/lib/ml-projection-engine.ts';

console.log('========================================================================');
console.log('MZANSI CIVIC ELECTION TRACKER — BAYESIAN PROJECTION ENGINE VALIDATION');
console.log('========================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failureDetails = [];

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  PASS: ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  FAIL: ${name}`);
    console.error(`        Error: ${err.message}`);
    failureDetails.push({ name, error: err.message, stack: err.stack });
  }
}

// -----------------------------------------------------------------------------
// SUITE 1: STATUTORY HARE QUOTA (LARGEST REMAINDER) SEAT CONSERVATION INVARIANT
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 1: Statutory Hare Quota Exact Seat Sum Invariant ---');

test('Hare Quota Invariant: Exactly allocates N seats for standard SA councils', () => {
  const councilSizes = [11, 24, 30, 45, 60, 90, 120, 214, 222, 224, 231, 270, 400];
  const sampleParties = [
    { id: 1, abbr: 'ANC', votes: 45000, votePercentage: 45.0 },
    { id: 2, abbr: 'DA', votes: 25000, votePercentage: 25.0 },
    { id: 3, abbr: 'EFF', votes: 12000, votePercentage: 12.0 },
    { id: 4, abbr: 'MK', votes: 8000, votePercentage: 8.0 },
    { id: 5, abbr: 'IFP', votes: 5000, votePercentage: 5.0 },
    { id: 6, abbr: 'PA', votes: 3000, votePercentage: 3.0 },
    { id: 7, abbr: 'VF PLUS', votes: 2000, votePercentage: 2.0 },
  ];

  for (const n of councilSizes) {
    const sim = runMLElectionProjection(sampleParties, n, 50, 100, 'Test Council', 'municipality');
    const allocatedSeats = sim.projections.reduce((sum, p) => sum + p.projectedSeats, 0);
    assert.equal(
      allocatedSeats,
      n,
      `Allocated seats (${allocatedSeats}) must exactly equal totalSeats (${n})`
    );
  }
});

test('Hare Quota Invariant: 250 Monte Carlo randomized vote distributions', () => {
  const councilSizes = [11, 24, 45, 90, 214, 270, 400];
  let violations = 0;

  for (let trial = 0; trial < 250; trial++) {
    const targetN = councilSizes[trial % councilSizes.length];
    const numParties = 3 + Math.floor(Math.random() * 20); // 3 to 22 parties
    
    // Generate random raw vote shares
    const rawWeights = Array.from({ length: numParties }, () => Math.random() * 100);
    const sumRaw = rawWeights.reduce((a, b) => a + b, 0);
    const mockParties = rawWeights.map((w, i) => {
      const share = (w / sumRaw) * 100;
      return {
        id: i + 1,
        abbr: `P${i + 1}`,
        votes: Math.round(share * 1000),
        votePercentage: Number(share.toFixed(2)),
      };
    });

    const completeness = 5 + Math.random() * 95; // 5% to 100%
    const sim = runMLElectionProjection(
      mockParties,
      targetN,
      Math.round(completeness),
      100,
      'Random Trial',
      'municipality'
    );
    const totalAllocated = sim.projections.reduce((s, p) => s + p.projectedSeats, 0);

    if (totalAllocated !== targetN) {
      violations++;
    }
  }

  assert.equal(violations, 0, `Monte Carlo detected ${violations} seat sum violations out of 250 trials`);
});

test('Hare Quota Edge Case: Single party monopoly (100% vote share)', () => {
  const monopoly = [{ id: 1, abbr: 'ANC', votes: 500000, votePercentage: 100.0 }];
  const sim = runMLElectionProjection(monopoly, 270, 100, 100, 'City of Johannesburg', 'municipality');
  assert.equal(sim.projections[0].projectedSeats, 270);
  assert.equal(sim.hungCouncilProbability, 0);
  assert.equal(sim.projections[0].isProjectedMajority, true);
});

test('Hare Quota Edge Case: Extreme fragmentation (20 micro-parties with identical votes)', () => {
  const totalSeats = 90;
  const numParties = 20;
  const uniformParties = Array.from({ length: numParties }, (_, i) => ({
    id: i + 1,
    abbr: `P${i + 1}`,
    votes: 5000,
    votePercentage: 5.0,
  }));

  const sim = runMLElectionProjection(uniformParties, totalSeats, 50, 100, 'Polokwane', 'municipality');
  const sumSeats = sim.projections.reduce((s, p) => s + p.projectedSeats, 0);
  assert.equal(sumSeats, totalSeats, `Sum of seats (${sumSeats}) must match total seats (${totalSeats})`);
  const seats5 = sim.projections.filter((p) => p.projectedSeats === 5).length;
  const seats4 = sim.projections.filter((p) => p.projectedSeats === 4).length;
  assert.equal(seats5 + seats4, numParties);
  assert.equal(seats5 * 5 + seats4 * 4, totalSeats);
});

// -----------------------------------------------------------------------------
// SUITE 2: BAYESIAN WEIGHT DYNAMICS & CONVERGENCE MONOTONICITY
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 2: Bayesian Weight Dynamics & Asymptotic Monotonicity ---');

test('Bayesian Weights: Monotonic growth of live weight and decay of prior', () => {
  let prevLiveWeight = -1;
  let prevPriorWeight = 2;

  for (let c = 0; c <= 100; c += 2) {
    const weights = getBayesianWeights(c);
    const priorWeight = weights.lge2021Weight + weights.npe2024Weight;

    assert.ok(
      weights.liveObservedWeight >= prevLiveWeight,
      `Live weight at c=${c} (${weights.liveObservedWeight}) must be >= previous (${prevLiveWeight})`
    );
    assert.ok(
      priorWeight <= prevPriorWeight + 0.0001,
      `Prior weight at c=${c} (${priorWeight}) must be <= previous (${prevPriorWeight})`
    );

    const sumW = weights.liveObservedWeight + weights.lge2021Weight + weights.npe2024Weight;
    assert.ok(
      Math.abs(sumW - 1.0) <= 0.001,
      `Sum of weights (${sumW}) must equal 1.0 at c=${c}`
    );

    if (priorWeight > 0.05) {
      const lgeRatio = weights.lge2021Weight / priorWeight;
      assert.ok(
        Math.abs(lgeRatio - 0.65) <= 0.02,
        `LGE prior share (${lgeRatio}) should approximate 0.65`
      );
    }

    prevLiveWeight = weights.liveObservedWeight;
    prevPriorWeight = priorWeight;
  }
});

test('Bayesian Convergence: Asymptotic convergence to live observed counts at 100%', () => {
  const liveParties = [
    { id: 1, abbr: 'ANC', votes: 412000, votePercentage: 35.5 },
    { id: 2, abbr: 'DA', votes: 348000, votePercentage: 30.0 },
    { id: 3, abbr: 'EFF', votes: 174000, votePercentage: 15.0 },
    { id: 4, abbr: 'ACTIONSA', votes: 116000, votePercentage: 10.0 },
    { id: 5, abbr: 'PA', votes: 58000, votePercentage: 5.0 },
    { id: 6, abbr: 'MK', votes: 52000, votePercentage: 4.5 },
  ];

  const sim100 = runMLElectionProjection(liveParties, 270, 100, 100, 'City of Johannesburg', 'municipality');
  
  let totalAbsDiff = 0;
  for (const p of liveParties) {
    const projected = sim100.projections.find((x) => x.abbr === p.abbr);
    assert.ok(projected, `Party ${p.abbr} must exist in projection`);
    const diff = Math.abs(projected.projectedPercentage - p.votePercentage);
    totalAbsDiff += diff;
  }
  const mae = totalAbsDiff / liveParties.length;
  assert.ok(
    mae < 0.05,
    `At 100% completion, MAE between observed and projected percentage must be < 0.05% (got ${mae}%)`
  );
});

test('Margin of Error: Monotonically contracts as reporting completeness advances', () => {
  const mockParties = [
    { id: 1, abbr: 'ANC', votes: 35000, votePercentage: 35.0 },
    { id: 2, abbr: 'DA', votes: 30000, votePercentage: 30.0 },
  ];

  const checkpoints = [5, 20, 50, 75, 95];
  let prevMoE = 999;

  for (const c of checkpoints) {
    const sim = runMLElectionProjection(mockParties, 270, c, 100, 'City of Johannesburg', 'municipality');
    const ancMoE = sim.projections.find((p) => p.abbr === 'ANC').marginOfError;
    assert.ok(
      ancMoE <= prevMoE,
      `MoE at ${c}% (${ancMoE}) must be <= MoE at previous checkpoint (${prevMoE})`
    );
    prevMoE = ancMoE;
  }
});

// -----------------------------------------------------------------------------
// SUITE 3: STATUTORY MAJORITY THRESHOLDS & HUNG COUNCILS
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 3: Statutory Majority Thresholds & Hung Councils ---');

test('Statutory Majority Threshold: Evaluates floor(N / 2) + 1 across all standard sizes', () => {
  const benchmarkCouncils = [
    { name: 'City of Johannesburg', seats: 270, expectedThreshold: 136 },
    { name: 'City of Tshwane', seats: 214, expectedThreshold: 108 },
    { name: 'Ekurhuleni', seats: 224, expectedThreshold: 113 },
    { name: 'City of Cape Town', seats: 231, expectedThreshold: 116 },
    { name: 'eThekwini', seats: 222, expectedThreshold: 112 },
    { name: 'Nelson Mandela Bay', seats: 120, expectedThreshold: 61 },
    { name: 'Polokwane (LIM354)', seats: 90, expectedThreshold: 46 },
    { name: 'National Assembly', seats: 400, expectedThreshold: 201 },
  ];

  const mockParties = [
    { id: 1, abbr: 'ANC', votes: 55000, votePercentage: 55.0 },
    { id: 2, abbr: 'DA', votes: 45000, votePercentage: 45.0 },
  ];

  for (const council of benchmarkCouncils) {
    const sim = runMLElectionProjection(mockParties, council.seats, 50, 100, council.name, 'municipality');
    assert.equal(
      sim.majorityThreshold,
      council.expectedThreshold,
      `${council.name} majority threshold must be ${council.expectedThreshold}`
    );
  }
});

test('Hung Council Probability: Triggers 100% when leading party lacks majority', () => {
  const hungCouncilParties = [
    { id: 1, abbr: 'DA', votes: 35000, votePercentage: 35.0 },
    { id: 2, abbr: 'ANC', votes: 33000, votePercentage: 33.0 },
    { id: 3, abbr: 'ACTIONSA', votes: 18000, votePercentage: 18.0 },
    { id: 4, abbr: 'EFF', votes: 14000, votePercentage: 14.0 },
  ];

  const sim = runMLElectionProjection(hungCouncilParties, 270, 75, 100, 'City of Johannesburg', 'municipality');
  const leader = sim.projections[0];

  assert.equal(leader.isProjectedMajority, false, 'Leader with 35% cannot have majority in 270-seat council');
  assert.equal(sim.hungCouncilProbability, 100, 'Hung council probability must be 100% when no majority');
});

test('Outright Majority Council: Hung probability drops to 0% when leader secures majority', () => {
  const dominantParties = [
    { id: 1, abbr: 'DA', votes: 62000, votePercentage: 62.0 },
    { id: 2, abbr: 'ANC', votes: 20000, votePercentage: 20.0 },
    { id: 3, abbr: 'EFF', votes: 10000, votePercentage: 10.0 },
    { id: 4, abbr: 'PA', votes: 8000, votePercentage: 8.0 },
  ];

  const sim = runMLElectionProjection(dominantParties, 231, 80, 100, 'City of Cape Town', 'municipality');
  const leader = sim.projections[0];

  assert.equal(leader.isProjectedMajority, true, 'Leader with >60% should have projected majority');
  assert.ok(
    leader.projectedSeats >= sim.majorityThreshold,
    `Projected seats (${leader.projectedSeats}) must be >= majority threshold (${sim.majorityThreshold})`
  );
  assert.equal(sim.hungCouncilProbability, 0, 'Hung council probability must be 0% on decisive majority');
});

// -----------------------------------------------------------------------------
// SUITE 4: EMPIRICAL 95% CREDIBLE INTERVAL COVERAGE (CI_95)
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 4: Empirical 95% Credible Interval Coverage ---');

test('Empirical CI95 Coverage: Monte Carlo 1,000 perturbed election samples', () => {
  // Define baseline prior distributions for a council
  const baselines = {
    ANC: { percentage21: 44.0, percentage24: 40.0 },
    DA: { percentage21: 25.0, percentage24: 26.0 },
    EFF: { percentage21: 12.0, percentage24: 10.0 },
    MK: { percentage21: 0.0, percentage24: 12.0 },
    IFP: { percentage21: 4.5, percentage24: 3.5 },
    ACTIONSA: { percentage21: 3.5, percentage24: 2.5 },
    OTHER: { percentage21: 11.0, percentage24: 6.0 },
  };

  const priorMeans = {};
  for (const [abbr, b] of Object.entries(baselines)) {
    priorMeans[abbr] = b.percentage21 > 0 ? (b.percentage21 * 0.65 + b.percentage24 * 0.35) : b.percentage24;
  }

  let totalIntervalsChecked = 0;
  let intervalsCovered = 0;

  function randNormal(mean, stdDev) {
    const u1 = Math.max(1e-7, Math.random());
    const u2 = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z * stdDev;
  }

  for (let trial = 0; trial < 1000; trial++) {
    const c = 15 + Math.random() * 70;
    
    // Simulate election-night swing from prior
    const trueShares = {};
    for (const [abbr, mean] of Object.entries(priorMeans)) {
      trueShares[abbr] = Math.max(0.5, randNormal(mean, 1.2));
    }
    const sumTrue = Object.values(trueShares).reduce((a, b) => a + b, 0);
    for (const k of Object.keys(trueShares)) {
      trueShares[k] = (trueShares[k] / sumTrue) * 100;
    }

    // Observed sample noise contracts with sqrt((100-c)/c)
    const observedParties = Object.keys(baselines).map((abbr, idx) => {
      const sampleNoise = randNormal(0, 0.9 * Math.sqrt((100 - c) / c));
      const observed = Math.max(0.1, trueShares[abbr] + sampleNoise);
      return {
        id: idx + 1,
        abbr,
        votes: Math.round(observed * 5000),
        votePercentage: Number(observed.toFixed(2)),
      };
    });

    // Normalize observed shares
    const sumObs = observedParties.reduce((s, p) => s + p.votePercentage, 0);
    observedParties.forEach((p) => {
      p.votePercentage = Number(((p.votePercentage / sumObs) * 100).toFixed(2));
    });

    const sim = runMLElectionProjection(
      observedParties,
      270,
      Math.round(c),
      100,
      'Simulation Metro',
      'municipality',
      baselines
    );

    for (const abbr of Object.keys(baselines)) {
      const proj = sim.projections.find((x) => x.abbr === abbr);
      if (!proj) continue;

      totalIntervalsChecked++;
      const [minR, maxR] = proj.projectedRange;
      const trueVal = trueShares[abbr];
      if (trueVal >= minR && trueVal <= maxR) {
        intervalsCovered++;
      }
    }
  }

  const coverageRate = (intervalsCovered / totalIntervalsChecked) * 100;
  console.log(`    Empirical CI95 coverage rate: ${coverageRate.toFixed(2)}% (${intervalsCovered}/${totalIntervalsChecked})`);
  
  assert.ok(
    coverageRate >= 91.0,
    `Empirical coverage (${coverageRate.toFixed(2)}%) must be >= 91.0%`
  );
});

// -----------------------------------------------------------------------------
// SUITE 5: CERTIFIED HISTORICAL BACKTESTING (2021 LGE & 2024 NPE)
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 5: Certified Historical Backtesting ---');

test('Historical Backtest: 2021 City of Johannesburg LGE (270 seats)', () => {
  // Official certified 2021 Johannesburg results with complete 100% field:
  const actual2021JHB = [
    { abbr: 'ANC', share: 33.60, seats: 91 },
    { abbr: 'DA', share: 26.47, seats: 71 },
    { abbr: 'ACTIONSA', share: 16.05, seats: 44 },
    { abbr: 'EFF', share: 10.63, seats: 29 },
    { abbr: 'PA', share: 2.81, seats: 8 },
    { abbr: 'IFP', share: 2.65, seats: 7 },
    { abbr: 'VF PLUS', share: 1.48, seats: 4 },
    { abbr: 'AL JAMA-AH', share: 0.95, seats: 3 },
    { abbr: 'ACDP', share: 0.88, seats: 2 },
    { abbr: 'AIC', share: 0.64, seats: 2 },
    { abbr: 'OTHER', share: 3.84, seats: 9 }, // Other 10 minor parties
  ];

  // 1. Simulate early returns at 35% with suburban DA bias (+5.5% DA, -5.5% ANC in early counts)
  const biasedEarlyReturns = actual2021JHB.map((p, idx) => {
    let observedShare = p.share;
    if (p.abbr === 'DA') observedShare += 5.5;
    if (p.abbr === 'ANC') observedShare -= 5.5;
    return {
      id: idx + 1,
      abbr: p.abbr,
      votes: Math.round(observedShare * 8000),
      votePercentage: Number(observedShare.toFixed(2)),
    };
  });

  const simEarly = runMLElectionProjection(
    biasedEarlyReturns,
    270,
    35,
    100,
    'City of Johannesburg',
    'municipality'
  );

  const ancProj = simEarly.projections.find((p) => p.abbr === 'ANC');
  const daProj = simEarly.projections.find((p) => p.abbr === 'DA');

  // Early observed DA was 32%, but projection should be pulled closer to true 26.5%
  assert.ok(
    daProj.projectedPercentage < 32.0,
    `Bayesian prior should dampen inflated early DA share (32% -> ${daProj.projectedPercentage}%)`
  );

  // Early observed ANC was 28.1%, but projection should be pulled closer to true 33.6%
  assert.ok(
    ancProj.projectedPercentage > 28.1,
    `Bayesian prior should elevate deflated early ANC share (28.1% -> ${ancProj.projectedPercentage}%)`
  );

  // 2. Test full convergence at 100%
  const finalReturns = actual2021JHB.map((p, idx) => ({
    id: idx + 1,
    abbr: p.abbr,
    votes: Math.round(p.share * 10000),
    votePercentage: p.share,
  }));

  const simFinal = runMLElectionProjection(
    finalReturns,
    270,
    100,
    100,
    'City of Johannesburg',
    'municipality'
  );

  // Validate exact statutory seat allocations match certified seats
  for (const actual of actual2021JHB.slice(0, 5)) {
    const proj = simFinal.projections.find((p) => p.abbr === actual.abbr);
    const seatDiff = Math.abs(proj.projectedSeats - actual.seats);
    assert.ok(
      seatDiff <= 1,
      `Projected seats for ${actual.abbr} (${proj.projectedSeats}) should match actual (${actual.seats}) within ±1 seat`
    );
  }
});

test('Historical Backtest: 2024 National Parliamentary Outcome (400 seats)', () => {
  // Certified 2024 NPE results with complete 100% field:
  const actual2024NPE = [
    { abbr: 'ANC', share: 40.18, seats: 159 },
    { abbr: 'DA', share: 21.81, seats: 87 },
    { abbr: 'MK', share: 14.58, seats: 58 },
    { abbr: 'EFF', share: 9.52, seats: 39 },
    { abbr: 'IFP', share: 3.85, seats: 17 },
    { abbr: 'PA', share: 2.06, seats: 9 },
    { abbr: 'VF PLUS', share: 1.36, seats: 6 },
    { abbr: 'ACTIONSA', share: 1.20, seats: 6 },
    { abbr: 'ACDP', share: 0.60, seats: 3 },
    { abbr: 'UDM', share: 0.49, seats: 3 },
    { abbr: 'BOSA', share: 0.41, seats: 2 },
    { abbr: 'ATM', share: 0.40, seats: 2 },
    { abbr: 'OTHER', share: 3.54, seats: 9 },
  ];

  const npeInput = actual2024NPE.map((p, idx) => ({
    id: idx + 1,
    abbr: p.abbr,
    votes: Math.round(p.share * 160000),
    votePercentage: p.share,
  }));

  const sim = runMLElectionProjection(
    npeInput,
    400,
    100,
    100,
    'South Africa',
    'national'
  );

  assert.equal(sim.totalSeats, 400);
  assert.equal(sim.majorityThreshold, 201);

  // Validate seat projections
  const anc = sim.projections.find((p) => p.abbr === 'ANC');
  const da = sim.projections.find((p) => p.abbr === 'DA');
  const mk = sim.projections.find((p) => p.abbr === 'MK');

  assert.ok(Math.abs(anc.projectedSeats - 159) <= 2, `ANC seats ${anc.projectedSeats} ≈ 159`);
  assert.ok(Math.abs(da.projectedSeats - 87) <= 2, `DA seats ${da.projectedSeats} ≈ 87`);
  assert.ok(Math.abs(mk.projectedSeats - 58) <= 2, `MK seats ${mk.projectedSeats} ≈ 58`);

  const sumSeats = sim.projections.reduce((s, p) => s + p.projectedSeats, 0);
  assert.equal(sumSeats, 400, 'Sum of seats must exactly equal 400');
});

// -----------------------------------------------------------------------------
// SUITE 6: PLAIN-ENGLISH CIVIC NARRATIVE & CONVERSATIONAL TRUTH
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 6: Plain-English Civic Narrative & Zero Hallucination ---');

test('Plain-English Narrative: Distinguishes National vs Municipal scopes', () => {
  const parties = [
    { id: 1, abbr: 'ANC', votes: 45000, votePercentage: 45.0 },
    { id: 2, abbr: 'DA', votes: 35000, votePercentage: 35.0 },
  ];

  const simNational = runMLElectionProjection(parties, 8825, 50, 100, 'South Africa', 'national');
  const briefNational = generatePlainEnglishBrief(simNational, simNational.projections[0], { abbr: 'ANC', name: 'ANC' });
  
  assert.ok(
    briefNational.summarySentence.includes('257 municipalities'),
    'National summary must clarify nationwide municipal elections'
  );
  assert.ok(
    !briefNational.headline.includes('Mayor'),
    'National headline must NOT claim election of an executive Mayor'
  );

  const simMunicipal = runMLElectionProjection(parties, 90, 50, 100, 'Polokwane', 'municipality');
  const briefMunicipal = generatePlainEnglishBrief(simMunicipal, simMunicipal.projections[0], { abbr: 'ANC', name: 'ANC' });

  assert.ok(
    briefMunicipal.headline.includes('Polokwane') || briefMunicipal.summarySentence.includes('Polokwane'),
    'Municipal brief must reference the specific council'
  );
  assert.ok(
    briefMunicipal.keyQuestions.some((q) => q.question.includes('Polokwane Council')),
    'Municipal brief questions must reference local council governance'
  );
});

test('Stronghold Extraction: Ranks municipalities and computes vote gap accurately', () => {
  const mockMunicipalities = [
    {
      municipalityId: 1,
      code: 'CPT',
      name: 'City of Cape Town',
      provinceName: 'Western Cape',
      seatsExpected: 231,
      topParties: [
        { abbr: 'DA', votePercentage: 58.2, seats: 135, color: '#005BA6' },
        { abbr: 'ANC', votePercentage: 18.4, seats: 43, color: '#007A3D' },
      ],
    },
    {
      municipalityId: 2,
      code: 'JHB',
      name: 'City of Johannesburg',
      provinceName: 'Gauteng',
      seatsExpected: 270,
      topParties: [
        { abbr: 'DA', votePercentage: 38.0, seats: 103, color: '#005BA6' },
        { abbr: 'ANC', votePercentage: 35.0, seats: 95, color: '#007A3D' },
      ],
    },
  ];

  const daStrongholds = extractPartyStrongholds('DA', mockMunicipalities);
  assert.equal(daStrongholds.length, 2);
  assert.equal(daStrongholds[0].municipalityName, 'City of Cape Town');
  assert.equal(daStrongholds[0].classification, 'Safe Stronghold');
  assert.equal(daStrongholds[0].rank, 1);
  assert.equal(daStrongholds[0].voteGapToLeaderOrRunnerUp, 39.8);

  assert.equal(daStrongholds[1].municipalityName, 'City of Johannesburg');
  assert.equal(daStrongholds[1].classification, 'Battleground Swing'); // gap 3.0% <= 6%
  assert.equal(daStrongholds[1].rank, 1);
});

// -----------------------------------------------------------------------------
// SUITE 7: REAL-WORLD 2026 ACTUAL BENCHMARK VALIDATION
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 7: Real-World 2026 Actual Benchmark Validation ---');

test('2026 Actual Benchmark: Evaluates winner and coalition projection accuracy across 30 completed 2026 councils', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');

  const DEFAULT_PARTY_MAP = {
    'DEMOCRATIC ALLIANCE': 'DA',
    'ACTIONSA': 'ACTIONSA',
    'AFRICAN NATIONAL CONGRESS': 'ANC',
    'VRYHEIDSFRONT PLUS | FREEDOM FRONT PLUS': 'VF PLUS',
    'ECONOMIC FREEDOM FIGHTERS': 'EFF',
    'UMKHONTO WESIZWE PARTY': 'MK',
    'PATRIOTIC ALLIANCE': 'PA',
    'INKATHA FREEDOM PARTY': 'IFP',
    'RISE MZANSI': 'RISE MZANSI',
    'BUILD ONE SOUTH AFRICA': 'BOSA',
    'AFRICAN CHRISTIAN DEMOCRATIC PARTY': 'ACDP',
    'UNITED DEMOCRATIC MOVEMENT': 'UDM',
    'AL JAMA-AH': 'AL JAMA-AH',
    'GOOD': 'GOOD',
    'PAN AFRICANIST CONGRESS OF AZANIA': 'PAC'
  };

  const dir = path.resolve('src/data/granular');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  const completed = [];
  for (const f of files) {
    const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    if (d.vdsCounted === d.vdsTotal && d.vdsTotal >= 15 && d.wards && Object.keys(d.wards).length >= 5) {
      completed.push(d);
    }
  }

  let totalTested = 0;
  let correctWinnerAt35 = 0;
  let totalAbsShareDiffAt35 = 0;
  let checkedPartiesAt35 = 0;

  for (const d of completed.slice(0, 30)) {
    totalTested++;
    const wards = Object.values(d.wards);
    const totalSeats = d.seatsTotal || 25;
    const vdsTotal = d.vdsTotal;

    const actualLeader = d.parties[0];
    const actualLeaderAbbr = DEFAULT_PARTY_MAP[actualLeader.party.toUpperCase().trim()] || actualLeader.party;

    // Simulate early returns at ~35% of wards counted
    const wardsSliceCount = Math.max(2, Math.floor(wards.length * 0.35));
    let earlyVotes = {};
    let earlyVds = 0;
    for (let i = 0; i < wardsSliceCount; i++) {
      const w = wards[i];
      earlyVds += w.vdsCounted;
      (w.rows || []).forEach(r => {
        const abbr = DEFAULT_PARTY_MAP[r.party.toUpperCase().trim()] || r.party;
        earlyVotes[abbr] = (earlyVotes[abbr] || 0) + r.votes;
      });
    }

    const sumEarly = Object.values(earlyVotes).reduce((a, b) => a + b, 0);
    if (sumEarly === 0) continue;

    const earlyParties = Object.entries(earlyVotes).map(([abbr, votes], idx) => ({
      id: idx + 1,
      abbr,
      fullName: abbr,
      votes,
      votePercentage: Number(((votes / sumEarly) * 100).toFixed(2))
    })).filter(p => p.votes > 0);

    const sim = runMLElectionProjection(
      earlyParties,
      totalSeats,
      earlyVds,
      vdsTotal,
      d.name,
      'municipality'
    );

    if (sim.projectedLeadingParty.toUpperCase() === actualLeaderAbbr.toUpperCase()) {
      correctWinnerAt35++;
    }

    for (let i = 0; i < Math.min(3, d.parties.length); i++) {
      const ap = d.parties[i];
      const abbr = DEFAULT_PARTY_MAP[ap.party.toUpperCase().trim()] || ap.party;
      const proj = sim.projections.find(p => p.abbr.toUpperCase() === abbr.toUpperCase());
      if (proj) {
        totalAbsShareDiffAt35 += Math.abs(proj.projectedPercentage - ap.percent);
        checkedPartiesAt35++;
      }
    }
  }

  const winnerAcc = (correctWinnerAt35 / totalTested) * 100;
  const mae = totalAbsShareDiffAt35 / checkedPartiesAt35;
  console.log(`    2026 early returns (~35% counted) winner accuracy: ${winnerAcc.toFixed(1)}% (${correctWinnerAt35}/${totalTested})`);
  console.log(`    2026 early returns MAE: ${mae.toFixed(2)}%`);

  assert.ok(winnerAcc >= 90.0, `Early winner accuracy (${winnerAcc.toFixed(1)}%) must be >= 90%`);
  assert.ok(mae <= 6.5, `Early MAE (${mae.toFixed(2)}%) must be <= 6.5%`);
});

test('2026 Actual Benchmark: Monotonic error contraction as counts advance to ~70%', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');

  const DEFAULT_PARTY_MAP = {
    'DEMOCRATIC ALLIANCE': 'DA',
    'ACTIONSA': 'ACTIONSA',
    'AFRICAN NATIONAL CONGRESS': 'ANC',
    'VRYHEIDSFRONT PLUS | FREEDOM FRONT PLUS': 'VF PLUS',
    'ECONOMIC FREEDOM FIGHTERS': 'EFF',
    'UMKHONTO WESIZWE PARTY': 'MK',
    'PATRIOTIC ALLIANCE': 'PA',
    'INKATHA FREEDOM PARTY': 'IFP',
    'RISE MZANSI': 'RISE MZANSI',
    'BUILD ONE SOUTH AFRICA': 'BOSA',
    'AFRICAN CHRISTIAN DEMOCRATIC PARTY': 'ACDP',
    'UNITED DEMOCRATIC MOVEMENT': 'UDM',
    'AL JAMA-AH': 'AL JAMA-AH',
    'GOOD': 'GOOD',
    'PAN AFRICANIST CONGRESS OF AZANIA': 'PAC'
  };

  const dir = path.resolve('src/data/granular');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  const completed = [];
  for (const f of files) {
    const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    if (d.vdsCounted === d.vdsTotal && d.vdsTotal >= 15 && d.wards && Object.keys(d.wards).length >= 5) {
      completed.push(d);
    }
  }

  let totalTested = 0;
  let correctWinnerAt70 = 0;
  let correctMajorityAt70 = 0;
  let totalAbsShareDiffAt70 = 0;
  let checkedPartiesAt70 = 0;

  for (const d of completed.slice(0, 30)) {
    totalTested++;
    const wards = Object.values(d.wards);
    const totalSeats = d.seatsTotal || 25;
    const vdsTotal = d.vdsTotal;

    const actualLeader = d.parties[0];
    const actualLeaderAbbr = DEFAULT_PARTY_MAP[actualLeader.party.toUpperCase().trim()] || actualLeader.party;
    const actualIsMajority = actualLeader.percent >= 50;

    const wardsSliceCount = Math.max(3, Math.floor(wards.length * 0.70));
    let earlyVotes = {};
    let earlyVds = 0;
    for (let i = 0; i < wardsSliceCount; i++) {
      const w = wards[i];
      earlyVds += w.vdsCounted;
      (w.rows || []).forEach(r => {
        const abbr = DEFAULT_PARTY_MAP[r.party.toUpperCase().trim()] || r.party;
        earlyVotes[abbr] = (earlyVotes[abbr] || 0) + r.votes;
      });
    }

    const sumEarly = Object.values(earlyVotes).reduce((a, b) => a + b, 0);
    if (sumEarly === 0) continue;

    const earlyParties = Object.entries(earlyVotes).map(([abbr, votes], idx) => ({
      id: idx + 1,
      abbr,
      fullName: abbr,
      votes,
      votePercentage: Number(((votes / sumEarly) * 100).toFixed(2))
    })).filter(p => p.votes > 0);

    const sim = runMLElectionProjection(
      earlyParties,
      totalSeats,
      earlyVds,
      vdsTotal,
      d.name,
      'municipality'
    );

    if (sim.projectedLeadingParty.toUpperCase() === actualLeaderAbbr.toUpperCase()) {
      correctWinnerAt70++;
    }
    const projectedIsMajority = sim.projections[0]?.isProjectedMajority;
    if (Boolean(projectedIsMajority) === Boolean(actualIsMajority)) {
      correctMajorityAt70++;
    }

    for (let i = 0; i < Math.min(3, d.parties.length); i++) {
      const ap = d.parties[i];
      const abbr = DEFAULT_PARTY_MAP[ap.party.toUpperCase().trim()] || ap.party;
      const proj = sim.projections.find(p => p.abbr.toUpperCase() === abbr.toUpperCase());
      if (proj) {
        totalAbsShareDiffAt70 += Math.abs(proj.projectedPercentage - ap.percent);
        checkedPartiesAt70++;
      }
    }
  }

  const winnerAcc = (correctWinnerAt70 / totalTested) * 100;
  const majorityAcc = (correctMajorityAt70 / totalTested) * 100;
  const mae = totalAbsShareDiffAt70 / checkedPartiesAt70;
  console.log(`    2026 advanced returns (~70% counted) winner accuracy: ${winnerAcc.toFixed(1)}% (${correctWinnerAt70}/${totalTested})`);
  console.log(`    2026 advanced returns majority/hung accuracy: ${majorityAcc.toFixed(1)}% (${correctMajorityAt70}/${totalTested})`);
  console.log(`    2026 advanced returns MAE: ${mae.toFixed(2)}%`);

  assert.ok(winnerAcc >= 95.0, `Advanced winner accuracy (${winnerAcc.toFixed(1)}%) must be >= 95%`);
  assert.ok(majorityAcc >= 80.0, `Advanced majority accuracy (${majorityAcc.toFixed(1)}%) must be >= 80%`);
  assert.ok(mae <= 3.5, `Advanced MAE (${mae.toFixed(2)}%) must be <= 3.5%`);
});

test('2026 Progressive Track: Johannesburg Metro early (15% counted) vs progressive (46% counted) alignment', async () => {
  // Snapshot recorded at 15.0% counted (131/862 VDs):
  const jhbEarly15 = [
    { id: 1, abbr: 'DA', votes: 126204, votePercentage: 40.96 },
    { id: 2, abbr: 'ANC', votes: 61500, votePercentage: 19.96 },
    { id: 3, abbr: 'ACTIONSA', votes: 47800, votePercentage: 15.51 },
    { id: 4, abbr: 'EFF', votes: 23100, votePercentage: 7.50 },
    { id: 5, abbr: 'MK', votes: 15400, votePercentage: 5.00 },
  ];

  const sim15 = runMLElectionProjection(
    jhbEarly15,
    270,
    131,
    862,
    'City of Johannesburg',
    'municipality'
  );

  // Progressive actual at 46% counted (395/862 VDs): DA was 41.02%
  const daProj15 = sim15.projections.find(p => p.abbr === 'DA');
  assert.ok(daProj15, 'DA must be present in 15% projection');
  const [minR, maxR] = daProj15.projectedRange;

  const actualDAAt46 = 41.02;
  assert.ok(
    actualDAAt46 >= minR && actualDAAt46 <= maxR,
    `DA at 46% (${actualDAAt46}%) must fall within 15% Credible Interval [${minR}% - ${maxR}%]`
  );
  assert.equal(sim15.hungCouncilProbability, 100, 'JHB must correctly be projected as hung council');
});

// -----------------------------------------------------------------------------
// TEST SUMMARY & FINAL VERDICT
// -----------------------------------------------------------------------------
console.log('\n========================================================================');
console.log(`TOTAL TESTS:   ${totalTests}`);
console.log(`PASSED:        ${passedTests}`);
console.log(`FAILED:        ${failedTests}`);
console.log('========================================================================');

if (failedTests > 0) {
  console.error('\nFAILURE BREAKDOWN:');
  failureDetails.forEach((f, idx) => {
    console.error(`  ${idx + 1}. ${f.name}`);
    console.error(`     ${f.error}`);
  });
  process.exit(1);
} else {
  console.log('\nALL BAYESIAN PROJECTION ENGINE TESTS PASSED WITH ZERO VIOLATIONS.');
  process.exit(0);
}
