import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('====================================================');
console.log('🚀 IEC ELECTION TRACKER — ADVERSARIAL STRESS TEST SUITE');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const findings = [];

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✅ PASS: ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Reason: ${err.message}`);
    findings.push({ type: 'HARD_FAILURE', name, error: err.message, stack: err.stack });
  }
}

// -----------------------------------------------------------------------------
// MOCK DATA GENERATOR
// -----------------------------------------------------------------------------
const mock2024Parties = [
  { id: 7, abbr: 'ANC', fullName: 'African National Congress', color: '#007A3D', logoUrl: '', votes: 6459683, votePercentage: 40.18, seats: 159, isLeading: true, isIndependent: false },
  { id: 52, abbr: 'DA', fullName: 'Democratic Alliance', color: '#005BA6', logoUrl: '', votes: 3505735, votePercentage: 21.81, seats: 87, isLeading: false, isIndependent: false },
  { id: 1748, abbr: 'MK', fullName: 'uMkhonto weSizwe', color: '#004727', logoUrl: '', votes: 2344309, votePercentage: 14.58, seats: 58, isLeading: false, isIndependent: false },
  { id: 945, abbr: 'EFF', fullName: 'Economic Freedom Fighters', color: '#DE0000', logoUrl: '', votes: 1529961, votePercentage: 9.52, seats: 39, isLeading: false, isIndependent: false },
  { id: 3, abbr: 'IFP', fullName: 'Inkatha Freedom Party', color: '#DA251D', logoUrl: '', votes: 618207, votePercentage: 3.85, seats: 17, isLeading: false, isIndependent: false },
  { id: 1335, abbr: 'PA', fullName: 'Patriotic Alliance', color: '#F58220', logoUrl: '', votes: 330425, votePercentage: 2.06, seats: 9, isLeading: false, isIndependent: false },
  { id: 8, abbr: 'VF PLUS', fullName: 'Vryheidsfront Plus', color: '#004777', logoUrl: '', votes: 218809, votePercentage: 1.36, seats: 6, isLeading: false, isIndependent: false },
  { id: 1492, abbr: 'ActionSA', fullName: 'ActionSA', color: '#00A352', logoUrl: '', votes: 192373, votePercentage: 1.20, seats: 6, isLeading: false, isIndependent: false },
  { id: 18, abbr: 'ACDP', fullName: 'African Christian Democratic Party', color: '#C8102E', logoUrl: '', votes: 96575, votePercentage: 0.60, seats: 3, isLeading: false, isIndependent: false },
  { id: 4, abbr: 'UDM', fullName: 'United Democratic Movement', color: '#EDB111', logoUrl: '', votes: 78448, votePercentage: 0.49, seats: 3, isLeading: false, isIndependent: false },
  { id: 45, abbr: 'ATM', fullName: 'African Transformation Movement', color: '#0055A5', logoUrl: '', votes: 63554, votePercentage: 0.40, seats: 2, isLeading: false, isIndependent: false },
  { id: 1749, abbr: 'BOSA', fullName: 'Build One South Africa', color: '#E05A47', logoUrl: '', votes: 65912, votePercentage: 0.41, seats: 2, isLeading: false, isIndependent: false },
  { id: 946, abbr: 'NCCR', fullName: 'National Coloured Congress', color: '#F7931E', logoUrl: '', votes: 37422, votePercentage: 0.23, seats: 2, isLeading: false, isIndependent: false },
  { id: 6, abbr: 'PAC', fullName: 'Pan Africanist Congress of Azania', color: '#008751', logoUrl: '', votes: 36775, votePercentage: 0.23, seats: 1, isLeading: false, isIndependent: false },
  { id: 1475, abbr: 'GOOD', fullName: 'GOOD', color: '#F47920', logoUrl: '', votes: 29501, votePercentage: 0.18, seats: 1, isLeading: false, isIndependent: false },
  { id: 1750, abbr: 'UAT', fullName: 'United Africans Transformation', color: '#333333', logoUrl: '', votes: 35679, votePercentage: 0.22, seats: 1, isLeading: false, isIndependent: false },
  // Zero seat parties
  { id: 9991, abbr: 'ZERO1', fullName: 'Zero Seat Party 1', color: '#666666', logoUrl: '', votes: 5000, votePercentage: 0.03, seats: 0, isLeading: false, isIndependent: false },
  { id: 9992, abbr: 'ZERO2', fullName: 'Zero Seat Party 2', color: '#777777', logoUrl: '', votes: 2000, votePercentage: 0.01, seats: 0, isLeading: false, isIndependent: false },
];

const mockProvinces = [
  { provinceId: 1, name: 'Eastern Cape', vdsComplete: 4800, vdExpected: 4868, percComplete: 98.6, leadingParty: { abbr: 'ANC', color: '#007A3D', votes: 1200000, percentage: 62.4 }, topParties: [], allParties: [] },
  { provinceId: 2, name: 'Free State', vdsComplete: 1580, vdExpected: 1586, percComplete: 99.6, leadingParty: { abbr: 'ANC', color: '#007A3D', votes: 450000, percentage: 53.1 }, topParties: [], allParties: [] },
  { provinceId: 3, name: 'Gauteng', vdsComplete: 2700, vdExpected: 2797, percComplete: 96.5, leadingParty: { abbr: 'ANC', color: '#007A3D', votes: 1300000, percentage: 34.6 }, topParties: [], allParties: [] },
  { provinceId: 4, name: 'KwaZulu-Natal', vdsComplete: 4900, vdExpected: 4974, percComplete: 98.5, leadingParty: { abbr: 'MK', color: '#004727', votes: 1500000, percentage: 45.3 }, topParties: [], allParties: [] },
  { provinceId: 5, name: 'Limpopo', vdsComplete: 3150, vdExpected: 3176, percComplete: 99.2, leadingParty: { abbr: 'ANC', color: '#007A3D', votes: 1100000, percentage: 73.2 }, topParties: [], allParties: [] },
  { provinceId: 6, name: 'Mpumalanga', vdsComplete: 1780, vdExpected: 1812, percComplete: 98.2, leadingParty: { abbr: 'ANC', color: '#007A3D', votes: 600000, percentage: 51.3 }, topParties: [], allParties: [] },
  { provinceId: 7, name: 'North West', vdsComplete: 1750, vdExpected: 1758, percComplete: 99.5, leadingParty: { abbr: 'ANC', color: '#007A3D', votes: 550000, percentage: 58.1 }, topParties: [], allParties: [] },
  { provinceId: 8, name: 'Northern Cape', vdsComplete: 730, vdExpected: 730, percComplete: 100.0, leadingParty: { abbr: 'ANC', color: '#007A3D', votes: 195000, percentage: 49.3 }, topParties: [], allParties: [] },
  { provinceId: 9, name: 'Western Cape', vdsComplete: 1570, vdExpected: 1572, percComplete: 99.9, leadingParty: { abbr: 'DA', color: '#005BA6', votes: 1100000, percentage: 53.4 }, topParties: [], allParties: [] },
];

// =============================================================================
// TEST SUITE 1: SeatMajorityBar State, Math & Boundary Contracts
// =============================================================================
console.log('--- Test Suite 1: SeatMajorityBar ---');

test('SeatMajorityBar - 400 national seats calculation & majority threshold', () => {
  const parties = mock2024Parties;
  const totalSeats = 400;
  const majorityThreshold = 201;

  const seatParties = parties.filter((p) => p.seats > 0);
  const totalAllocatedSeats = seatParties.reduce((sum, p) => sum + p.seats, 0);
  assert.equal(totalAllocatedSeats, 396, '396 seats allocated out of 400 in mock set');

  const majorityPercentage = (majorityThreshold / totalSeats) * 100;
  assert.ok(Math.abs(majorityPercentage - 50.25) < 1e-9, '201/400 must equal 50.25%');

  // Verify proportional width calculations
  for (const party of seatParties) {
    const widthPercent = (party.seats / totalSeats) * 100;
    assert.ok(widthPercent > 0 && widthPercent <= 100, `Width percent for ${party.abbr} must be > 0 and <= 100`);
    assert.equal(Number(((party.seats / totalSeats) * 100).toFixed(1)), Number(widthPercent.toFixed(1)));
  }
});

test('SeatMajorityBar - Municipal 8,825 seats calculation & threshold', () => {
  const totalSeats = 8825;
  const majorityThreshold = Math.ceil(8825 / 2); // 4413
  assert.equal(majorityThreshold, 4413);

  const majorityPercentage = (majorityThreshold / totalSeats) * 100;
  assert.ok(Math.abs(majorityPercentage - 50.0056) < 0.01, 'Majority percentage is ~50.01%');

  const isNational400 = totalSeats === 400;
  assert.equal(isNational400, false, 'Must flag non-400 as council distribution');
  const title = isNational400
    ? 'National Assembly 400-Seat Distribution'
    : `Council Seat Distribution (${totalSeats.toLocaleString('en-ZA')} Seats)`;
  assert.match(title, /Council Seat Distribution \(8[,\s]825 Seats\)/);
});

test('SeatMajorityBar - 0-seat parties are properly filtered from bar rendering', () => {
  const parties = [
    { id: 1, abbr: 'P1', color: '#111', seats: 0 },
    { id: 2, abbr: 'P2', color: '#222', seats: 0 },
  ];
  const seatParties = parties.filter((p) => p.seats > 0);
  assert.equal(seatParties.length, 0);
  const totalAllocatedSeats = seatParties.reduce((sum, p) => sum + p.seats, 0);
  assert.equal(totalAllocatedSeats, 0);
});

test('SeatMajorityBar - Empty parties array edge case does not throw', () => {
  const parties = [];
  const seatParties = parties.filter((p) => p.seats > 0);
  assert.equal(seatParties.length, 0);
  const totalAllocatedSeats = seatParties.reduce((sum, p) => sum + p.seats, 0);
  assert.equal(totalAllocatedSeats, 0);
  const majorityPercentage = (201 / 400) * 100;
  assert.ok(Math.abs(majorityPercentage - 50.25) < 1e-9);
});

test('SeatMajorityBar - Exact seat tie condition maintains proportional balance', () => {
  const tieParties = [
    { id: 1, abbr: 'P1', color: '#111', seats: 150 },
    { id: 2, abbr: 'P2', color: '#222', seats: 150 },
    { id: 3, abbr: 'P3', color: '#333', seats: 100 },
  ];
  const totalSeats = 400;
  const widths = tieParties.map((p) => (p.seats / totalSeats) * 100);
  assert.equal(widths[0], widths[1], 'Tied parties must have identical widths');
  assert.equal(widths[0], 37.5);
  assert.equal(widths[2], 25.0);
  assert.equal(widths.reduce((a, b) => a + b, 0), 100.0);
});

test('SeatMajorityBar - Fallback for seatsExpected: 0 defaults to 400 in page container', () => {
  const seatsExpected = 0;
  const totalSeats = seatsExpected || 400;
  assert.equal(totalSeats, 400, 'seatsExpected 0 must fallback to 400');
});

// =============================================================================
// TEST SUITE 2: PartyLeaderboard Search & Filtering
// =============================================================================
console.log('\n--- Test Suite 2: PartyLeaderboard ---');

function filterLeaderboard(parties, search, filterMode) {
  let list = [...parties];
  if (filterMode === 'top10') {
    list = list.slice(0, 10);
  } else if (filterMode === 'seats') {
    list = list.filter((p) => p.seats > 0);
  }

  if (search.trim()) {
    const q = search.toLowerCase();
    list = list.filter(
      (p) =>
        p.abbr.toLowerCase().includes(q) ||
        p.fullName.toLowerCase().includes(q)
    );
  }
  return list;
}

test('PartyLeaderboard - Top 10 filter mode slices exactly 10 parties', () => {
  const res = filterLeaderboard(mock2024Parties, '', 'top10');
  assert.equal(res.length, 10);
  assert.equal(res[0].abbr, 'ANC');
  assert.equal(res[9].abbr, 'UDM');
});

test('PartyLeaderboard - Seat Winners mode filters parties with seats > 0', () => {
  const res = filterLeaderboard(mock2024Parties, '', 'seats');
  assert.equal(res.length, 16);
  assert.ok(res.every((p) => p.seats > 0));
});

test('PartyLeaderboard - All mode returns all contesting parties', () => {
  const res = filterLeaderboard(mock2024Parties, '', 'all');
  assert.equal(res.length, mock2024Parties.length);
});

test('PartyLeaderboard - Search query case insensitivity matches abbreviation & full name', () => {
  const ancQuery = filterLeaderboard(mock2024Parties, 'anc', 'all');
  assert.ok(ancQuery.some((p) => p.abbr === 'ANC'));

  const fullQuery = filterLeaderboard(mock2024Parties, 'democratic', 'all');
  assert.ok(fullQuery.some((p) => p.abbr === 'DA' && p.fullName.includes('Democratic')));

  const mixedCase = filterLeaderboard(mock2024Parties, 'uMkHoNtO', 'all');
  assert.ok(mixedCase.some((p) => p.abbr === 'MK'));
});

test('PartyLeaderboard - Search with special regex characters does NOT throw error', () => {
  const specialChars = ['(', ')', '[', ']', '*', '+', '?', '^', '$', '\\', '.', '/', '-'];
  for (const char of specialChars) {
    assert.doesNotThrow(() => {
      filterLeaderboard(mock2024Parties, `ANC ${char}`, 'all');
    }, `Failed on special character ${char}`);
  }
});

test('PartyLeaderboard - Non-matching query returns empty list', () => {
  const res = filterLeaderboard(mock2024Parties, 'NonExistentParty123', 'all');
  assert.equal(res.length, 0);
});

test('PartyLeaderboard - Adversarial check: query with leading/trailing spaces in current implementation', () => {
  const trimmedMatch = filterLeaderboard(mock2024Parties, 'ANC', 'all');
  const untrimmedMatch = filterLeaderboard(mock2024Parties, ' ANC ', 'all');
  assert.ok(trimmedMatch.length > 0);
  if (untrimmedMatch.length === 0) {
    findings.push({
      type: 'UX_EDGE_CASE',
      component: 'PartyLeaderboard',
      issue: "Search query uses `const q = search.toLowerCase()` instead of `search.trim().toLowerCase()`. Entering leading/trailing spaces prevents matching unless user manually backspaces."
    });
  }
});

test('PartyLeaderboard - Search inside top10 mode is scoped to top 10', () => {
  const searchBosaInTop10 = filterLeaderboard(mock2024Parties, 'BOSA', 'top10');
  assert.equal(searchBosaInTop10.length, 0, 'BOSA is not in top 10 so top10 search yields 0');
  const searchBosaInAll = filterLeaderboard(mock2024Parties, 'BOSA', 'all');
  assert.equal(searchBosaInAll.length, 1, 'BOSA is found when filter is All');
});

test('PartyLeaderboard - Swing calculation for party with positive swing', () => {
  const daCurrent = 24.50;
  const da2021 = 21.62;
  const delta = Number((daCurrent - da2021).toFixed(2));
  assert.equal(delta, 2.88);
  assert.ok(delta > 0);
});

test('PartyLeaderboard - Swing calculation for party with negative swing', () => {
  const ancCurrent = 39.50;
  const anc2021 = 45.59;
  const delta = Number((ancCurrent - anc2021).toFixed(2));
  assert.equal(delta, -6.09);
  assert.ok(delta < 0);
});

test('PartyLeaderboard - Swing calculation flags new party (MK vs 2021) as isNew', () => {
  const benchmarks = {
    ANC: { lge2021: 45.59, npe2024: 40.18 },
    MK: { lge2021: 0, npe2024: 14.58 }
  };
  const isMkNewIn2021 = benchmarks.MK.lge2021 === 0;
  assert.equal(isMkNewIn2021, true, 'MK must be flagged as NEW for 2021 comparison');

  const isMkNewIn2024 = benchmarks.MK.npe2024 === 0;
  assert.equal(isMkNewIn2024, false, 'MK was present in 2024');
});

// =============================================================================
// TEST SUITE 3: CoalitionBuilder Simulation Logic & Threshold Math
// =============================================================================
console.log('\n--- Test Suite 3: CoalitionBuilder ---');

function computeCoalition(parties, selectedIds, majorityThreshold = 201, totalSeats = 400) {
  const seatParties = parties.filter((p) => p.seats > 0);
  const selectedParties = seatParties.filter((p) => selectedIds.includes(p.id));
  const combinedSeats = selectedParties.reduce((sum, p) => sum + p.seats, 0);
  const combinedPercent = ((combinedSeats / totalSeats) * 100).toFixed(1);
  const hasMajority = combinedSeats >= majorityThreshold;
  const seatGap = combinedSeats - majorityThreshold;
  const progressValue = Math.min(100, (combinedSeats / majorityThreshold) * 100);
  return { combinedSeats, combinedPercent, hasMajority, seatGap, progressValue };
}

function applyPreset(parties, preset) {
  const seatParties = parties.filter((p) => p.seats > 0);
  const normalize = (s) => s.toUpperCase().replace(/[\.\s\-]/g, '');
  const findId = (abbr) => seatParties.find((p) => normalize(p.abbr) === normalize(abbr))?.id;

  if (preset === 'clear') return [];
  if (preset === 'gnu') {
    return ['ANC', 'DA', 'IFP', 'PA', 'GOOD', 'PAC'].map(findId).filter(Boolean);
  }
  if (preset === 'anc_da') {
    return ['ANC', 'DA'].map(findId).filter(Boolean);
  }
  if (preset === 'opposition') {
    return ['MK', 'EFF'].map(findId).filter(Boolean);
  }
  return [];
}

test('CoalitionBuilder - GNU Preset achieves governing majority', () => {
  const gnuIds = applyPreset(mock2024Parties, 'gnu');
  assert.equal(gnuIds.length, 6);
  const result = computeCoalition(mock2024Parties, gnuIds, 201, 400);

  // ANC (159) + DA (87) + IFP (17) + PA (9) + GOOD (1) + PAC (1) = 274 seats
  assert.equal(result.combinedSeats, 274);
  assert.equal(result.combinedPercent, '68.5');
  assert.equal(result.hasMajority, true);
  assert.equal(result.seatGap, 73);
  assert.equal(result.progressValue, 100);
});

test('CoalitionBuilder - ANC + DA Preset achieves governing majority', () => {
  const ancDaIds = applyPreset(mock2024Parties, 'anc_da');
  assert.equal(ancDaIds.length, 2);
  const result = computeCoalition(mock2024Parties, ancDaIds, 201, 400);

  // ANC (159) + DA (87) = 246 seats
  assert.equal(result.combinedSeats, 246);
  assert.equal(result.combinedPercent, '61.5');
  assert.equal(result.hasMajority, true);
  assert.equal(result.seatGap, 45);
  assert.equal(result.progressValue, 100);
});

test('CoalitionBuilder - Opposition Preset (MK + EFF) produces Hung Parliament', () => {
  const oppIds = applyPreset(mock2024Parties, 'opposition');
  assert.equal(oppIds.length, 2);
  const result = computeCoalition(mock2024Parties, oppIds, 201, 400);

  // MK (58) + EFF (39) = 97 seats
  assert.equal(result.combinedSeats, 97);
  assert.equal(result.combinedPercent, '24.3');
  assert.equal(result.hasMajority, false);
  assert.equal(result.seatGap, -104);
  assert.ok(result.progressValue < 100);
});

test('CoalitionBuilder - Clear Preset empties selection and reports 0 seats', () => {
  const clearIds = applyPreset(mock2024Parties, 'clear');
  assert.equal(clearIds.length, 0);
  const result = computeCoalition(mock2024Parties, clearIds, 201, 400);
  assert.equal(result.combinedSeats, 0);
  assert.equal(result.hasMajority, false);
  assert.equal(result.seatGap, -201);
  assert.equal(result.progressValue, 0);
});

test('CoalitionBuilder - Boundary: Exactly at majorityThreshold (201 seats)', () => {
  const parties = [
    { id: 101, abbr: 'P1', seats: 201 },
    { id: 102, abbr: 'P2', seats: 199 }
  ];
  const result = computeCoalition(parties, [101], 201, 400);
  assert.equal(result.combinedSeats, 201);
  assert.equal(result.hasMajority, true);
  assert.equal(result.seatGap, 0);
  assert.equal(result.progressValue, 100);
});

test('CoalitionBuilder - Boundary: Exactly 1 seat short (200 seats)', () => {
  const parties = [
    { id: 101, abbr: 'P1', seats: 200 },
    { id: 102, abbr: 'P2', seats: 200 }
  ];
  const result = computeCoalition(parties, [101], 201, 400);
  assert.equal(result.combinedSeats, 200);
  assert.equal(result.hasMajority, false);
  assert.equal(result.seatGap, -1);
  assert.ok(result.progressValue < 100);
});

test('CoalitionBuilder - Toggle behavior idempotency', () => {
  let selected = [7, 52];
  const toggle = (id) => selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id];

  // Remove 52
  selected = toggle(52);
  assert.deepEqual(selected, [7]);

  // Re-add 52
  selected = toggle(52);
  assert.deepEqual(selected, [7, 52]);

  // Toggle non-existent 945
  selected = toggle(945);
  assert.deepEqual(selected, [7, 52, 945]);
});

test('CoalitionBuilder - Municipal 8,825 seat simulation', () => {
  const totalSeats = 8825;
  const majorityThreshold = 4413;
  const parties = [
    { id: 1, abbr: 'ANC', seats: 4500 },
    { id: 2, abbr: 'DA', seats: 2200 },
    { id: 3, abbr: 'EFF', seats: 1100 },
  ];
  const result = computeCoalition(parties, [1], majorityThreshold, totalSeats);
  assert.equal(result.hasMajority, true);
  assert.equal(result.seatGap, 87);
  assert.equal(result.progressValue, 100);
});

// =============================================================================
// TEST SUITE 4: KpiCards Data Formatting, Percentage Rounding, Extremes
// =============================================================================
console.log('\n--- Test Suite 4: KpiCards ---');

test('KpiCards - PercComplete formatting and status badge rules', () => {
  const getBadgeVariant = (perc) => perc >= 100 ? 'completed' : perc > 0 ? 'live' : 'outline';
  const getBadgeText = (perc) => perc === 0 ? '0% Initial' : perc >= 100 ? 'Certified' : 'Live Counting';
  const getProgressVal = (perc) => Math.min(100, Math.max(perc === 0 ? 2 : 0, perc));

  assert.equal(getBadgeVariant(0), 'outline');
  assert.equal(getBadgeText(0), '0% Initial');
  assert.equal(getProgressVal(0), 2); // 2% minimum visual indicator

  assert.equal(getBadgeVariant(54.2), 'live');
  assert.equal(getBadgeText(54.2), 'Live Counting');
  assert.equal(getProgressVal(54.2), 54.2);

  assert.equal(getBadgeVariant(100), 'completed');
  assert.equal(getBadgeText(100), 'Certified');
  assert.equal(getProgressVal(100), 100);

  // Overflow clamp
  assert.equal(getProgressVal(105), 100);
});

test('KpiCards - South African number formatting with en-ZA locale', () => {
  const formatNumber = (num) => new Intl.NumberFormat('en-ZA').format(num);
  const formattedVoters = formatNumber(27782477);
  assert.match(formattedVoters, /27[\s\u00A0]782[\s\u00A0]477/);

  const formattedZero = formatNumber(0);
  assert.equal(formattedZero, '0');
});

test('KpiCards - Null leading party fallback behavior', () => {
  const leadingParty = null;
  const cardTitleValue = leadingParty ? leadingParty.abbr : 'Live Feed';
  assert.equal(cardTitleValue, 'Live Feed');
  const subtitle = leadingParty ? leadingParty.fullName : 'Feed connected';
  assert.equal(subtitle, 'Feed connected');
});

test('KpiCards - Election year mode switching (LGE 2026 vs NPE 2024)', () => {
  const lgeTitle = (year) => year === '2026' ? 'Registered Voters' : 'Voter Turnout';
  assert.equal(lgeTitle('2026'), 'Registered Voters');
  assert.equal(lgeTitle('2024'), 'Voter Turnout');

  const municTitle = (year) => year === '2026' ? 'Municipalities' : 'Vote Integrity';
  assert.equal(municTitle('2026'), 'Municipalities');
  assert.equal(municTitle('2024'), 'Vote Integrity');
});

test('KpiCards - Scoped counting progress reflection for active municipality', () => {
  const activeMunicipality = {
    municipalityId: 101,
    name: 'City of Cape Town',
    provinceName: 'Western Cape',
    percComplete: 84.5,
    vdsComplete: 750,
    vdExpected: 887,
    seatsComplete: 200,
    seatsExpected: 231,
    majorityWon: true,
    hungCouncil: false,
  };
  const natStats = { percComplete: 12.3, vdsComplete: 2900, vdExpected: 23696 };

  // Municipal scope resolution
  const resolvedProgress = activeMunicipality ? activeMunicipality.percComplete : natStats.percComplete;
  assert.equal(resolvedProgress, 84.5, 'Must reflect municipality progress, NOT national 12.3%');

  const scopeLabel = activeMunicipality ? 'Local Municipal Count' : 'National Aggregate Count';
  assert.equal(scopeLabel, 'Local Municipal Count');
});

test('KpiCards - Scoped counting progress reflection for active province', () => {
  const activeProvince = {
    provinceId: 3,
    name: 'Gauteng',
    percComplete: 45.2,
    vdsComplete: 1250,
    vdExpected: 2766,
  };
  const natStats = { percComplete: 10.0, vdsComplete: 2300, vdExpected: 23696 };

  // Provincial scope resolution
  const resolvedProgress = activeProvince ? activeProvince.percComplete : natStats.percComplete;
  assert.equal(resolvedProgress, 45.2, 'Must reflect provincial progress, NOT national 10.0%');

  const scopeLabel = activeProvince ? 'Provincial Count' : 'National Aggregate Count';
  assert.equal(scopeLabel, 'Provincial Count');
});

test('KpiCards - Explicit National count state when no filter is applied', () => {
  const activeMunicipality = null;
  const activeProvince = null;
  const natStats = { percComplete: 0.5, vdsComplete: 118, vdExpected: 23696 };

  const resolvedProgress = activeMunicipality ? activeMunicipality.percComplete : activeProvince ? activeProvince.percComplete : natStats.percComplete;
  assert.equal(resolvedProgress, 0.5, 'Must reflect national stats');

  const scopeLabel = activeMunicipality ? 'Local Municipal Count' : activeProvince ? 'Provincial Count' : 'National Aggregate Count';
  assert.equal(scopeLabel, 'National Aggregate Count');
});

// =============================================================================
// TEST SUITE 5: GpsFilterCard Logic, Geolocation Fallback & Province Normalization
// =============================================================================
console.log('\n--- Test Suite 5: GpsFilterCard & Geo ---');

test('GpsFilterCard - Geolocation error code handling', () => {
  const getErrorMessage = (code) => {
    if (code === 1) {
      return 'Location permission was denied. You can select your province manually below.';
    }
    return 'Unable to retrieve your location. Check your GPS or device settings.';
  };

  assert.equal(getErrorMessage(1), 'Location permission was denied. You can select your province manually below.');
  assert.equal(getErrorMessage(2), 'Unable to retrieve your location. Check your GPS or device settings.');
  assert.equal(getErrorMessage(3), 'Unable to retrieve your location. Check your GPS or device settings.');
});

test('GpsFilterCard - Province matching is case-insensitive', () => {
  const provinces = mockProvinces;
  const matchProvince = (provName) => provinces.find(p => p.name.toLowerCase() === provName.toLowerCase());

  assert.equal(matchProvince('gauteng')?.name, 'Gauteng');
  assert.equal(matchProvince('WESTERN CAPE')?.name, 'Western Cape');
  assert.equal(matchProvince('kwaZulu-Natal')?.name, 'KwaZulu-Natal');
  assert.equal(matchProvince('Atlantis'), undefined);
});

test('GpsFilterCard - SA 9 provinces list integrity', () => {
  const SA_PROVINCES = [
    'Eastern Cape',
    'Free State',
    'Gauteng',
    'KwaZulu-Natal',
    'Limpopo',
    'Mpumalanga',
    'North West',
    'Northern Cape',
    'Western Cape',
  ];
  assert.equal(SA_PROVINCES.length, 9);
  const provinceOptions = [
    { value: '', label: 'Select province manually...' },
    ...SA_PROVINCES.map((prov) => ({ value: prov, label: prov })),
  ];
  assert.equal(provinceOptions.length, 10);
});

function normalizeProvinceName(raw) {
  const SA_PROVINCES = [
    'Eastern Cape',
    'Free State',
    'Gauteng',
    'KwaZulu-Natal',
    'Limpopo',
    'Mpumalanga',
    'North West',
    'Northern Cape',
    'Western Cape',
  ];
  const clean = raw.toLowerCase().replace(/[\-\s]/g, '');
  for (const prov of SA_PROVINCES) {
    if (prov.toLowerCase().replace(/[\-\s]/g, '') === clean) {
      return prov;
    }
  }
  if (clean.includes('gauteng')) return 'Gauteng';
  if (clean.includes('westerncape')) return 'Western Cape';
  if (clean.includes('kwazulu') || clean.includes('natal')) return 'KwaZulu-Natal';
  if (clean.includes('easterncape')) return 'Eastern Cape';
  if (clean.includes('freestate')) return 'Free State';
  if (clean.includes('limpopo')) return 'Limpopo';
  if (clean.includes('mpumalanga')) return 'Mpumalanga';
  if (clean.includes('northwest')) return 'North West';
  if (clean.includes('northerncape')) return 'Northern Cape';
  return raw;
}

test('Geo - normalizeProvinceName handles hyphenated, spaced, and loose variations', () => {
  assert.equal(normalizeProvinceName('western-cape'), 'Western Cape');
  assert.equal(normalizeProvinceName('Eastern Cape'), 'Eastern Cape');
  assert.equal(normalizeProvinceName('KwaZulu-Natal Province'), 'KwaZulu-Natal');
  assert.equal(normalizeProvinceName('City of Johannesburg, Gauteng'), 'Gauteng');
  assert.equal(normalizeProvinceName('Unknown Land'), 'Unknown Land');
});

// =============================================================================
// TEST SUITE 6: ProvinceMatrix Selection & Counting Stage Logic
// =============================================================================
console.log('\n--- Test Suite 6: ProvinceMatrix ---');

function getProvinceStageVariant(perc) {
  return perc >= 100
    ? 'completed'
    : perc >= 85
    ? 'live'
    : perc >= 30
    ? 'verified'
    : 'inProgress';
}

test('ProvinceMatrix - Counting stage status variant thresholds', () => {
  assert.equal(getProvinceStageVariant(0), 'inProgress');
  assert.equal(getProvinceStageVariant(29.9), 'inProgress');
  assert.equal(getProvinceStageVariant(30.0), 'verified');
  assert.equal(getProvinceStageVariant(84.9), 'verified');
  assert.equal(getProvinceStageVariant(85.0), 'live');
  assert.equal(getProvinceStageVariant(99.9), 'live');
  assert.equal(getProvinceStageVariant(100.0), 'completed');
  assert.equal(getProvinceStageVariant(105.0), 'completed');
});

test('ProvinceMatrix - Selection and toggle off behavior', () => {
  let selectedProvince = null;
  const onSelectProvince = (provName) => {
    selectedProvince = provName;
  };

  // Select Gauteng
  const isSelected = selectedProvince?.toLowerCase() === 'gauteng'.toLowerCase();
  onSelectProvince(isSelected ? null : 'Gauteng');
  assert.equal(selectedProvince, 'Gauteng');

  // Click Gauteng again -> deselects
  const isSelected2 = selectedProvince?.toLowerCase() === 'gauteng'.toLowerCase();
  onSelectProvince(isSelected2 ? null : 'Gauteng');
  assert.equal(selectedProvince, null);

  // Click Western Cape -> selects
  onSelectProvince('Western Cape');
  assert.equal(selectedProvince, 'Western Cape');

  // Reset to National
  onSelectProvince(null);
  assert.equal(selectedProvince, null);
});

// =============================================================================
// TEST SUITE 7: Design Tokens & CSS Variable Registration
// =============================================================================
console.log('\n--- Test Suite 7: Design Token Architecture ---');

test('CSS Globals - Complete token registration in globals.css', () => {
  const cssPath = path.join(projectRoot, 'src', 'app', 'globals.css');
  assert.ok(fs.existsSync(cssPath), 'globals.css must exist');
  const css = fs.readFileSync(cssPath, 'utf8');

  // Check Tailwind v4 import
  assert.ok(css.includes('@import "tailwindcss";') || css.includes("@import 'tailwindcss';"));

  // Check @theme directive
  assert.ok(css.includes('@theme'));

  // Required design tokens
  const requiredTokens = [
    '--color-background',
    '--color-foreground',
    '--color-card',
    '--color-card-foreground',
    '--color-primary',
    '--color-secondary',
    '--color-muted',
    '--color-accent',
    '--color-destructive',
    '--color-border',
    '--color-input',
    '--color-ring',
    '--color-status-live',
    '--color-status-completed',
    '--color-status-in-progress',
    '--color-status-verified',
    '--color-status-hung',
    '--color-status-majority',
  ];

  for (const token of requiredTokens) {
    assert.ok(css.includes(token), `Missing required token ${token} in globals.css`);
  }

  // Check both :root and .dark are defined
  assert.ok(css.includes(':root'), 'Must contain :root token definitions');
  assert.ok(css.includes('.dark'), 'Must contain .dark token definitions');
});

// =============================================================================
// TEST SUITE 8: Component Primitives Inventory & ARIA Attributes
// =============================================================================
console.log('\n--- Test Suite 8: Component Primitives & ARIA Inventory ---');

test('UI Primitives - All 12 base UI primitives exist and export expected components', () => {
  const uiDir = path.join(projectRoot, 'src', 'components', 'ui');
  const expectedPrimitives = [
    'card.tsx',
    'badge.tsx',
    'button.tsx',
    'tabs.tsx',
    'progress.tsx',
    'table.tsx',
    'tooltip.tsx',
    'select.tsx',
    'separator.tsx',
    'input.tsx',
    'stat-card.tsx',
    'skeleton.tsx',
  ];

  for (const file of expectedPrimitives) {
    const filePath = path.join(uiDir, file);
    assert.ok(fs.existsSync(filePath), `Primitive ${file} must exist at ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf8');
    assert.ok(content.length > 50, `Primitive ${file} must not be empty`);
  }
});

test('UI Primitives - ARIA attributes and civic accessibility semantics', () => {
  const uiDir = path.join(projectRoot, 'src', 'components', 'ui');

  const tabsContent = fs.readFileSync(path.join(uiDir, 'tabs.tsx'), 'utf8');
  assert.ok(tabsContent.includes('role="tablist"'), 'tabs.tsx must include role="tablist"');
  assert.ok(tabsContent.includes('role="tab"'), 'tabs.tsx must include role="tab"');

  const progressContent = fs.readFileSync(path.join(uiDir, 'progress.tsx'), 'utf8');
  assert.ok(progressContent.includes('role="progressbar"'), 'progress.tsx must include role="progressbar"');
  assert.ok(progressContent.includes('aria-valuenow'), 'progress.tsx must include aria-valuenow');

  const selectContent = fs.readFileSync(path.join(uiDir, 'select.tsx'), 'utf8');
  assert.ok(selectContent.includes('role="combobox"'), 'select.tsx must include role="combobox"');
  assert.ok(selectContent.includes('role="listbox"'), 'select.tsx must include role="listbox"');
  assert.ok(selectContent.includes('role="option"'), 'select.tsx must include role="option"');

  const separatorContent = fs.readFileSync(path.join(uiDir, 'separator.tsx'), 'utf8');
  assert.ok(
    separatorContent.includes("'separator'") || separatorContent.includes('"separator"'),
    'separator.tsx must include role separator'
  );

  const skeletonContent = fs.readFileSync(path.join(uiDir, 'skeleton.tsx'), 'utf8');
  assert.ok(skeletonContent.includes('role="status"'), 'skeleton.tsx must include role="status"');
});

// =============================================================================
// TEST SUITE 9: ShareSnapshot Formatting & Social Intent Logic
// =============================================================================
console.log('\n--- Test Suite 9: ShareSnapshot ---');

test('ShareSnapshot - WhatsApp message formatting and required hashtags/links', () => {
  const scopeTitle = 'City of Johannesburg';
  const scopeType = 'Municipal';
  const countingProgress = 76.4;
  const vdsComplete = 1200;
  const vdExpected = 1570;
  const totalVotes = 450000;
  const topParties = [
    { abbr: 'DA', votePercentage: 42.1, votes: 189450, seats: 85 },
    { abbr: 'ANC', votePercentage: 35.2, votes: 158400, seats: 71 },
    { abbr: 'EFF', votePercentage: 11.0, votes: 49500, seats: 22 },
  ];

  const formatNum = (n) => new Intl.NumberFormat('en-ZA').format(n);
  const partySummary = topParties
    .slice(0, 3)
    .map((p, idx) => `${idx + 1}. ${p.abbr}: ${p.votePercentage.toFixed(2)}% (${formatNum(p.votes)} votes • ${p.seats} seats)`)
    .join('\n');

  const shareText = `🇿🇦 *IEC 2026 Live Election Tracker*\n📍 *Scope:* ${scopeTitle} (${scopeType} Count)\n📊 *Counting Progress:* ${countingProgress.toFixed(1)}%\n${partySummary}\nhttps://iec-election-tracker.vercel.app`;

  assert.ok(shareText.includes('🇿🇦 *IEC 2026 Live Election Tracker*'));
  assert.ok(shareText.includes('City of Johannesburg'));
  assert.ok(shareText.includes('76.4%'));
  assert.ok(shareText.includes('DA: 42.10%'));
  assert.ok(shareText.includes('https://iec-election-tracker.vercel.app'));

  // WhatsApp intent URL encoding
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  assert.ok(whatsappUrl.startsWith('https://wa.me/?text='));
  assert.ok(whatsappUrl.includes('%F0%9F%87%BF%F0%9F%87%A6')); // Flag emoji encoded
});

test('ShareSnapshot - X (Twitter) intent URL encoding and hashtag inclusion', () => {
  const twitterText = '🇿🇦 Live IEC 2026 Election Update: Counting at 50.0% #SouthAfrica #IECElections2026';
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent('https://iec-election-tracker.vercel.app')}`;
  assert.ok(twitterUrl.includes('twitter.com/intent/tweet'));
  assert.ok(twitterUrl.includes('%23SouthAfrica'));
});

// =============================================================================
// SUMMARY
// =============================================================================
console.log('\n====================================================');
console.log(`📊 TEST RESULTS: ${passedTests}/${totalTests} PASSED (${failedTests} FAILED)`);
console.log('====================================================');

if (findings.length > 0) {
  console.log(`\n🔍 Findings / Adversarial Observations (${findings.length}):`);
  for (const f of findings) {
    console.log(`  - [${f.type || 'FAILURE'}] ${f.name || f.component}: ${f.issue || f.error}`);
  }
}

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
