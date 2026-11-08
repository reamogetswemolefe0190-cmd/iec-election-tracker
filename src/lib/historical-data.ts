/**
 * Official historical benchmarks from the Electoral Commission of South Africa (IEC).
 * 
 * 2021 LGE: 2021 Local Government Elections (Municipal councils baseline)
 * 2024 NPE: 2024 National & Provincial Elections (National Assembly baseline)
 */

export interface HistoricalBenchmark {
  abbr: string;
  lge2021Percent: number; // 2021 Local Government Elections
  npe2024Percent: number; // 2024 National & Provincial Elections
  lge2021Votes?: number;
  npe2024Votes?: number;
  lge2021Seats?: number;
}

export const HISTORICAL_PARTY_BENCHMARKS: Record<string, HistoricalBenchmark> = {
  ANC: { abbr: 'ANC', lge2021Percent: 45.59, npe2024Percent: 40.18 },
  DA: { abbr: 'DA', lge2021Percent: 21.62, npe2024Percent: 21.81 },
  MK: { abbr: 'MK', lge2021Percent: 0, npe2024Percent: 14.58 }, // MK formed late 2023
  EFF: { abbr: 'EFF', lge2021Percent: 10.31, npe2024Percent: 9.52 },
  IFP: { abbr: 'IFP', lge2021Percent: 5.39, npe2024Percent: 3.85 },
  PA: { abbr: 'PA', lge2021Percent: 1.04, npe2024Percent: 2.06 },
  'VF PLUS': { abbr: 'VF PLUS', lge2021Percent: 2.32, npe2024Percent: 1.36 },
  'FF PLUS': { abbr: 'FF PLUS', lge2021Percent: 2.32, npe2024Percent: 1.36 },
  ACTIONSA: { abbr: 'ACTIONSA', lge2021Percent: 2.36, npe2024Percent: 1.20 },
  ACDP: { abbr: 'ACDP', lge2021Percent: 0.88, npe2024Percent: 0.60 },
  UDM: { abbr: 'UDM', lge2021Percent: 0.55, npe2024Percent: 0.49 },
  ATM: { abbr: 'ATM', lge2021Percent: 0.42, npe2024Percent: 0.40 },
  BOSA: { abbr: 'BOSA', lge2021Percent: 0, npe2024Percent: 0.41 },
  'RISE MZANSI': { abbr: 'RISE MZANSI', lge2021Percent: 0, npe2024Percent: 0.42 },
  GOOD: { abbr: 'GOOD', lge2021Percent: 0.61, npe2024Percent: 0.18 },
  'AL JAMA-AH': { abbr: 'AL JAMA-AH', lge2021Percent: 0.45, npe2024Percent: 0.24 },
  PAC: { abbr: 'PAC', lge2021Percent: 0.24, npe2024Percent: 0.23 },
  UAT: { abbr: 'UAT', lge2021Percent: 0.11, npe2024Percent: 0.14 },
  AIC: { abbr: 'AIC', lge2021Percent: 0.35, npe2024Percent: 0.11 },
  NFP: { abbr: 'NFP', lge2021Percent: 0.56, npe2024Percent: 0.12 },
  COPE: { abbr: 'COPE', lge2021Percent: 0.22, npe2024Percent: 0.10 },
};

/**
 * Provincial historical benchmarks for all 9 South African provinces
 */
export const HISTORICAL_PROVINCE_BENCHMARKS: Record<string, Record<string, HistoricalBenchmark>> = {
  limpopo: {
    ANC: { abbr: 'ANC', lge2021Percent: 68.32, npe2024Percent: 54.42 },
    EFF: { abbr: 'EFF', lge2021Percent: 14.41, npe2024Percent: 14.12 },
    DA: { abbr: 'DA', lge2021Percent: 6.94, npe2024Percent: 5.92 },
    MK: { abbr: 'MK', lge2021Percent: 0.0, npe2024Percent: 0.84 },
    'VF PLUS': { abbr: 'VF PLUS', lge2021Percent: 2.34, npe2024Percent: 1.45 },
    ACTIONSA: { abbr: 'ACTIONSA', lge2021Percent: 0.52, npe2024Percent: 0.93 },
    ACDP: { abbr: 'ACDP', lge2021Percent: 0.48, npe2024Percent: 0.38 },
  },
  gauteng: {
    ANC: { abbr: 'ANC', lge2021Percent: 36.14, npe2024Percent: 34.62 },
    DA: { abbr: 'DA', lge2021Percent: 28.72, npe2024Percent: 27.45 },
    EFF: { abbr: 'EFF', lge2021Percent: 11.14, npe2024Percent: 12.92 },
    MK: { abbr: 'MK', lge2021Percent: 0.0, npe2024Percent: 9.79 },
    ACTIONSA: { abbr: 'ACTIONSA', lge2021Percent: 8.64, npe2024Percent: 4.16 },
    PA: { abbr: 'PA', lge2021Percent: 2.11, npe2024Percent: 2.32 },
    'VF PLUS': { abbr: 'VF PLUS', lge2021Percent: 4.12, npe2024Percent: 2.31 },
    'RISE MZANSI': { abbr: 'RISE MZANSI', lge2021Percent: 0.0, npe2024Percent: 1.02 },
    BOSA: { abbr: 'BOSA', lge2021Percent: 0.0, npe2024Percent: 0.74 },
    IFP: { abbr: 'IFP', lge2021Percent: 1.54, npe2024Percent: 0.88 },
  },
  'kwazulu-natal': {
    MK: { abbr: 'MK', lge2021Percent: 0.0, npe2024Percent: 45.35 },
    IFP: { abbr: 'IFP', lge2021Percent: 24.29, npe2024Percent: 18.07 },
    ANC: { abbr: 'ANC', lge2021Percent: 41.39, npe2024Percent: 16.99 },
    DA: { abbr: 'DA', lge2021Percent: 12.94, npe2024Percent: 13.38 },
    EFF: { abbr: 'EFF', lge2021Percent: 8.93, npe2024Percent: 2.26 },
    NFP: { abbr: 'NFP', lge2021Percent: 3.21, npe2024Percent: 0.56 },
    ACTIONSA: { abbr: 'ACTIONSA', lge2021Percent: 1.89, npe2024Percent: 0.54 },
  },
  'western cape': {
    DA: { abbr: 'DA', lge2021Percent: 54.26, npe2024Percent: 55.30 },
    ANC: { abbr: 'ANC', lge2021Percent: 20.41, npe2024Percent: 19.55 },
    PA: { abbr: 'PA', lge2021Percent: 3.52, npe2024Percent: 7.80 },
    EFF: { abbr: 'EFF', lge2021Percent: 4.18, npe2024Percent: 5.30 },
    GOOD: { abbr: 'GOOD', lge2021Percent: 3.82, npe2024Percent: 1.15 },
    'VF PLUS': { abbr: 'VF PLUS', lge2021Percent: 3.96, npe2024Percent: 1.48 },
    ACDP: { abbr: 'ACDP', lge2021Percent: 1.52, npe2024Percent: 1.34 },
    'AL JAMA-AH': { abbr: 'AL JAMA-AH', lge2021Percent: 0.94, npe2024Percent: 0.52 },
  },
  'eastern cape': {
    ANC: { abbr: 'ANC', lge2021Percent: 63.24, npe2024Percent: 62.16 },
    DA: { abbr: 'DA', lge2021Percent: 15.17, npe2024Percent: 14.94 },
    EFF: { abbr: 'EFF', lge2021Percent: 8.01, npe2024Percent: 10.15 },
    UDM: { abbr: 'UDM', lge2021Percent: 3.25, npe2024Percent: 3.70 },
    PA: { abbr: 'PA', lge2021Percent: 1.12, npe2024Percent: 2.30 },
    ATM: { abbr: 'ATM', lge2021Percent: 1.42, npe2024Percent: 1.52 },
  },
  mpumalanga: {
    ANC: { abbr: 'ANC', lge2021Percent: 58.12, npe2024Percent: 51.31 },
    MK: { abbr: 'MK', lge2021Percent: 0.0, npe2024Percent: 16.97 },
    EFF: { abbr: 'EFF', lge2021Percent: 15.34, npe2024Percent: 13.87 },
    DA: { abbr: 'DA', lge2021Percent: 12.39, npe2024Percent: 12.03 },
    'VF PLUS': { abbr: 'VF PLUS', lge2021Percent: 3.42, npe2024Percent: 1.54 },
    ACTIONSA: { abbr: 'ACTIONSA', lge2021Percent: 1.12, npe2024Percent: 0.51 },
  },
  'free state': {
    ANC: { abbr: 'ANC', lge2021Percent: 50.61, npe2024Percent: 51.87 },
    DA: { abbr: 'DA', lge2021Percent: 18.91, npe2024Percent: 21.89 },
    EFF: { abbr: 'EFF', lge2021Percent: 12.54, npe2024Percent: 13.52 },
    'VF PLUS': { abbr: 'VF PLUS', lge2021Percent: 4.83, npe2024Percent: 3.01 },
    MK: { abbr: 'MK', lge2021Percent: 0.0, npe2024Percent: 2.14 },
    ACTIONSA: { abbr: 'ACTIONSA', lge2021Percent: 1.52, npe2024Percent: 0.81 },
  },
  'north west': {
    ANC: { abbr: 'ANC', lge2021Percent: 55.42, npe2024Percent: 57.73 },
    EFF: { abbr: 'EFF', lge2021Percent: 16.89, npe2024Percent: 17.37 },
    DA: { abbr: 'DA', lge2021Percent: 11.23, npe2024Percent: 13.24 },
    'VF PLUS': { abbr: 'VF PLUS', lge2021Percent: 4.12, npe2024Percent: 2.65 },
    MK: { abbr: 'MK', lge2021Percent: 0.0, npe2024Percent: 2.05 },
    ACTIONSA: { abbr: 'ACTIONSA', lge2021Percent: 1.41, npe2024Percent: 0.92 },
  },
  'northern cape': {
    ANC: { abbr: 'ANC', lge2021Percent: 50.55, npe2024Percent: 49.34 },
    DA: { abbr: 'DA', lge2021Percent: 19.46, npe2024Percent: 21.32 },
    PA: { abbr: 'PA', lge2021Percent: 7.82, npe2024Percent: 10.82 },
    EFF: { abbr: 'EFF', lge2021Percent: 10.92, npe2024Percent: 13.24 },
    'VF PLUS': { abbr: 'VF PLUS', lge2021Percent: 3.51, npe2024Percent: 1.83 },
  },
};

/**
 * Resolves the historical benchmark based on the active scope (municipality, province, or national)
 */
export function getScopedHistoricalBenchmark(
  partyAbbr: string,
  scopeType: 'national' | 'province' | 'municipality',
  scopeName?: string | null,
  municipalHistoricalBaseline?: { percentage21?: number; percentage24?: number; votes21?: number; seats21?: number }
): HistoricalBenchmark {
  const normAbbr = partyAbbr.toUpperCase().trim();
  const nationalBench = HISTORICAL_PARTY_BENCHMARKS[normAbbr] || {
    abbr: normAbbr,
    lge2021Percent: 0,
    npe2024Percent: 0,
  };

  if (scopeType === 'municipality' && municipalHistoricalBaseline) {
    return {
      abbr: normAbbr,
      lge2021Percent: municipalHistoricalBaseline.percentage21 ?? nationalBench.lge2021Percent,
      npe2024Percent: municipalHistoricalBaseline.percentage24 ?? nationalBench.npe2024Percent,
      lge2021Votes: municipalHistoricalBaseline.votes21,
      lge2021Seats: municipalHistoricalBaseline.seats21,
    };
  }

  if (scopeType === 'province' && scopeName) {
    const provKey = scopeName.toLowerCase().trim();
    const provMap = HISTORICAL_PROVINCE_BENCHMARKS[provKey];
    if (provMap && provMap[normAbbr]) {
      return provMap[normAbbr];
    }
  }

  return nationalBench;
}

export interface SwingCalculation {
  delta: number;
  baselinePercent: number;
  isNew: boolean;
  baselineYear: '2021' | '2024';
}

/**
 * Calculates the vote swing (percentage point change) for a party relative to a baseline election.
 */
export function calculateVoteSwing(
  partyAbbr: string,
  currentVotePercentage: number,
  baselineYear: '2021' | '2024' = '2021'
): SwingCalculation {
  const normAbbr = partyAbbr.toUpperCase().trim();
  const benchmark = HISTORICAL_PARTY_BENCHMARKS[normAbbr];

  if (!benchmark) {
    return {
      delta: 0,
      baselinePercent: 0,
      isNew: true,
      baselineYear,
    };
  }

  const baselinePercent =
    baselineYear === '2021' ? benchmark.lge2021Percent : benchmark.npe2024Percent;

  if (baselinePercent === 0) {
    return {
      delta: currentVotePercentage,
      baselinePercent: 0,
      isNew: true,
      baselineYear,
    };
  }

  const delta = Number((currentVotePercentage - baselinePercent).toFixed(2));

  return {
    delta,
    baselinePercent,
    isNew: false,
    baselineYear,
  };
}
