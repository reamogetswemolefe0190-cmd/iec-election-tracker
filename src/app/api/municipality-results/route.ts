import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { EnrichedPartyResult } from '@/types/election';
import { WardResult } from '@/lib/wards';
import { getPartyMetadataMap, fetchElectionResults } from '@/lib/iec-client';

const LOGO_BASE_URL = 'https://results.elections.org.za/dashboards/npe/Party_Images';

const DEFAULT_PARTY_MAP: Record<string, { abbr: string; color: string }> = {
  'DEMOCRATIC ALLIANCE': { abbr: 'DA', color: '#005BA6' },
  'ACTIONSA': { abbr: 'ActionSA', color: '#00B050' },
  'AFRICAN NATIONAL CONGRESS': { abbr: 'ANC', color: '#007A3D' },
  'VRYHEIDSFRONT PLUS | FREEDOM FRONT PLUS': { abbr: 'VF Plus', color: '#8B4513' },
  'FREEDOM FRONT PLUS (VRYHEIDSFRONT PLUS)': { abbr: 'VF Plus', color: '#8B4513' },
  'ECONOMIC FREEDOM FIGHTERS': { abbr: 'EFF', color: '#DE0000' },
  'UMKHONTO WESIZWE PARTY': { abbr: 'MK', color: '#004727' },
  'UMKHONTO WESIZWE': { abbr: 'MK', color: '#004727' },
  'SOUTH AFRICAN COMMUNIST PARTY': { abbr: 'SACP', color: '#D60000' },
  'RISE MZANSI': { abbr: 'Rise Mzansi', color: '#008A44' },
  'AFRICAN INDEPENDENT CONGRESS': { abbr: 'AIC', color: '#E8A500' },
  'PATRIOTIC ALLIANCE': { abbr: 'PA', color: '#F58220' },
  'AFRIKA MAYIBUYE MOVEMENT': { abbr: 'AMM', color: '#7E22CE' },
  'PAN AFRICANIST CONGRESS OF AZANIA': { abbr: 'PAC', color: '#008751' },
  'SECURITY PERSONNEL PARTY OF SOUTH AFRICA': { abbr: 'SPPSA', color: '#334155' },
  'SERVICE DELIVERY PARTY': { abbr: 'SDP', color: '#0891B2' },
  'AFRICAN CHRISTIAN DEMOCRATIC PARTY': { abbr: 'ACDP', color: '#1E398B' },
  'AFRICAN TRANSFORMATION MOVEMENT': { abbr: 'ATM', color: '#1B365D' },
  "AZANIAN PEOPLE'S ORGANISATION": { abbr: 'AZAPO', color: '#B91C1C' },
  'INDEPENDENT': { abbr: 'Independent', color: '#64748B' },
  'BUILD ONE SOUTH AFRICA': { abbr: 'BOSA', color: '#292C5B' },
  'AFRICAN HEART CONGRESS': { abbr: 'AHC', color: '#DC2626' },
  'UNITED AFRICANS TRANSFORMATION': { abbr: 'UAT', color: '#15803D' },
  'CONCERN': { abbr: 'CONCERN', color: '#475569' },
  'UNITED PROGRESSIVE PEOPLE ALLIANCE': { abbr: 'UPPA', color: '#059669' },
  "AFRICAN PEOPLE'S CONVENTION": { abbr: 'APC', color: '#D97706' },
  'INKATHA FREEDOM PARTY': { abbr: 'IFP', color: '#DA251D' },
  'CONGRESS OF THE PEOPLE': { abbr: 'COPE', color: '#E11D48' },
  'AL JAMA-AH': { abbr: 'Al Jama-ah', color: '#009639' },
  'UNITED DEMOCRATIC MOVEMENT': { abbr: 'UDM', color: '#E30613' },
  'UNITED INDEPENDENT MOVEMENT': { abbr: 'UIM', color: '#2563EB' },
  'GOOD': { abbr: 'GOOD', color: '#E56A10' },
  'NATIONAL COLOURED CONGRESS': { abbr: 'NCC', color: '#E05A1B' },
};

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code')?.toUpperCase();
    if (!code) {
      return NextResponse.json({ error: 'Municipality code is required' }, { status: 400 });
    }

    const partyMap = await getPartyMetadataMap();

    let raw: any = null;

    // 1. Load high-fidelity local certified snapshot (wards, candidate profiles, and full party roster)
    try {
      const localPath = path.join(process.cwd(), 'src', 'data', 'granular', `${code}.json`);
      if (fs.existsSync(localPath)) {
        const fileContent = fs.readFileSync(localPath, 'utf8');
        raw = JSON.parse(fileContent);
      }
    } catch (localErr) {
      console.warn(`Local granular lookup failed for ${code}:`, localErr);
    }

    if (!raw) {
      return NextResponse.json(
        { error: `No granular results found for municipality ${code}` },
        { status: 404 }
      );
    }

    // 2. Cross-verify with the official statutory IEC feed (Monotonic progress guarantee)
    try {
      const iecData = await fetchElectionResults('2026');
      const iecMatched = iecData.municipalities?.find((m) =>
        m.name.toUpperCase().includes(code) ||
        (raw.name && m.name.toUpperCase().includes(raw.name.toUpperCase())) ||
        (m.code && m.code.toUpperCase() === code)
      );

      if (iecMatched && iecMatched.vdsComplete > (raw.vdsCounted || 0)) {
        // Enforce the higher live official IEC progress
        raw.vdsCounted = iecMatched.vdsComplete;
        raw.vdsTotal = iecMatched.vdExpected || raw.vdsTotal;
        raw.percComplete = iecMatched.percComplete;
      }
    } catch (iecErr) {
      // If live IEC poll is transiently unavailable, proceed with certified snapshot
    }

    // Enrich all parties (all 80+ parties in councils like Tshwane!)
    const enrichedParties: EnrichedPartyResult[] = (raw.parties || []).map((p: {
      party: string;
      votes: number;
      percent: number;
      wardsLeading?: number | null;
      wardsWon?: number | null;
      seats?: number | null;
    }, idx: number) => {
      const rawUpper = (p.party || '').toUpperCase().trim();
      const known = DEFAULT_PARTY_MAP[rawUpper];

      // Lookup in IEC metadata map if available
      let iecMeta = null;
      for (const [, meta] of partyMap.entries()) {
        if (
          meta.Name?.toUpperCase() === rawUpper ||
          meta.PartyFullName?.toUpperCase() === rawUpper ||
          (known && meta.Name?.toUpperCase() === known.abbr.toUpperCase())
        ) {
          iecMeta = meta;
          break;
        }
      }

      const abbr = known?.abbr || iecMeta?.Name || p.party;
      const color = known?.color || iecMeta?.sWebColour || '#475569';
      const logoUrl = iecMeta?.PartyImage ? `${LOGO_BASE_URL}/${iecMeta.PartyImage}` : '';

      // Lookup seats from partyTally or seatsSoFar if p.seats is null/undefined
      const tallyMatch = (raw.partyTally?.parties || []).find((tp: any) =>
        tp.party?.toUpperCase().trim() === rawUpper ||
        (known && tp.party?.toUpperCase().trim() === known.abbr.toUpperCase())
      );
      const soFarMatch = (raw.seatsSoFar?.parties || []).find((sp: any) =>
        sp.party?.toUpperCase().trim() === rawUpper ||
        (known && sp.party?.toUpperCase().trim() === known.abbr.toUpperCase())
      );
      const partySeats = p.seats || tallyMatch?.seats || soFarMatch?.seats || 0;
      const partyWardSeats = p.wardsWon || tallyMatch?.wardSeats || partySeats;

      return {
        id: idx + 1,
        abbr,
        fullName: iecMeta?.PartyFullName || p.party,
        color,
        logoUrl,
        votes: p.votes || 0,
        votePercentage: p.percent || 0,
        seats: partySeats,
        wardSeats: partyWardSeats,
        prSeats: 0,
        councilsWon: 0,
        isLeading: idx === 0,
        isIndependent: rawUpper.includes('INDEPENDENT'),
      };
    });

    // Enrich all wards
    const enrichedWards: Record<string, WardResult> = {};
    if (raw.wards) {
      for (const [wKey, wVal] of Object.entries(raw.wards as Record<string, {
        wardId: string;
        wardNo: number;
        vdsCounted: number;
        vdsTotal: number;
        votesCast: number;
        registered: number;
        rows: { party: string; candidate?: string; votes: number; percent: number }[];
      }>)) {
        const sortedRows = (wVal.rows || []).sort((a, b) => b.votes - a.votes || b.percent - a.percent);
        const topRow = sortedRows[0];
        const runnerRow = sortedRows[1];

        const topKnown = topRow ? DEFAULT_PARTY_MAP[topRow.party.toUpperCase().trim()] : null;
        const runnerKnown = runnerRow ? DEFAULT_PARTY_MAP[runnerRow.party.toUpperCase().trim()] : null;

        const percComplete = wVal.vdsTotal > 0 ? Math.round((wVal.vdsCounted / wVal.vdsTotal) * 100) : 0;
        const hasVotes = Boolean(topRow && (topRow.votes > 0 || (topRow.percent > 0)));
        const status: 'declared' | 'counting' | 'pending' =
          wVal.vdsCounted === wVal.vdsTotal && wVal.vdsTotal > 0 && hasVotes
            ? 'declared'
            : wVal.vdsCounted > 0 && hasVotes
            ? 'counting'
            : 'pending';

        const turnout = wVal.registered > 0 ? Math.round((wVal.votesCast / wVal.registered) * 100) : 0;

        enrichedWards[String(wVal.wardNo)] = {
          wardNumber: wVal.wardNo,
          wardCode: wVal.wardId,
          name: `Ward ${wVal.wardNo}`,
          vdsCounted: wVal.vdsCounted || 0,
          totalVds: wVal.vdsTotal || 0,
          percComplete,
          status,
          leadingParty: hasVotes
            ? {
                abbr: topKnown?.abbr || topRow?.party || 'ANC',
                color: topKnown?.color || '#007A3D',
                percentage: topRow?.percent || 0,
                votes: topRow?.votes || 0,
              }
            : {
                abbr: 'Pending',
                color: '#64748B',
                percentage: 0,
                votes: 0,
              },
          runnerUp: hasVotes && runnerRow
            ? {
                abbr: runnerKnown?.abbr || runnerRow.party,
                color: runnerKnown?.color || '#005BA6',
                percentage: runnerRow.percent || 0,
                votes: runnerRow.votes || 0,
              }
            : undefined,
          parties: sortedRows.map((r) => {
            const k = DEFAULT_PARTY_MAP[r.party.toUpperCase().trim()];
            return {
              abbr: k?.abbr || r.party,
              name: r.party,
              color: k?.color || '#475569',
              percentage: r.percent || 0,
              votes: r.votes || 0,
              candidate: r.candidate || undefined,
            };
          }),
          councillorCandidate: hasVotes ? topRow?.candidate : undefined,
          registeredVoters: wVal.registered || 0,
          totalVotes: wVal.votesCast || 0,
          turnout,
        };
      }
    }

    // 3. Fetch historical 2021 election data (lastElection)
    let lastElectionRaw: any = null;
    try {
      const ballotsRes = await fetch(`https://www.electai.co.za/api/municipality-ballots/${code}`, {
        next: { revalidate: 3600 },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Referer': 'https://www.electai.co.za/election-results',
        }
      });
      if (ballotsRes.ok) {
        const ballotsData = await ballotsRes.json();
        if (ballotsData?.lastElection) {
          lastElectionRaw = ballotsData.lastElection;
        }
      }
    } catch {
      // Non-blocking fallback
    }

    // Local fallback for ballots / historical 2021 election
    if (!lastElectionRaw) {
      try {
        const localBallotPath = path.join(process.cwd(), 'src', 'data', 'ballots', `${code}.json`);
        if (fs.existsSync(localBallotPath)) {
          const content = fs.readFileSync(localBallotPath, 'utf8');
          const parsed = JSON.parse(content);
          if (parsed?.lastElection) {
            lastElectionRaw = parsed.lastElection;
          }
        }
      } catch (localBallotErr) {
        console.warn(`Local ballot lookup failed for ${code}:`, localBallotErr);
      }
    }

    // Normalized 2021 council baseline per party:
    const baseline2021ByParty: Record<string, { abbr: string; name: string; votes: number; percentage: number; seats: number }> = {};
    if (lastElectionRaw?.council?.rows && Array.isArray(lastElectionRaw.parties)) {
      const partiesList = lastElectionRaw.parties;
      const total2021Votes = lastElectionRaw.council.rows.reduce((sum: number, r: [number, number, number]) => sum + (r[2] || 0), 0);
      for (const row of lastElectionRaw.council.rows) {
        const [partyIdx, seats, votes] = row;
        const pMeta = partiesList[partyIdx];
        if (pMeta) {
          const rawName = (pMeta.n || pMeta.a || '').toUpperCase().trim();
          const known = DEFAULT_PARTY_MAP[rawName];
          const abbr = pMeta.a || known?.abbr || pMeta.n;
          const percentage = total2021Votes > 0 ? Number(((votes / total2021Votes) * 100).toFixed(2)) : 0;
          baseline2021ByParty[abbr.toUpperCase()] = {
            abbr,
            name: pMeta.n,
            votes,
            percentage,
            seats,
          };
        }
      }
    }

    // Normalized 2021 ward winners
    const baseline2021Wards: Record<string, { wardNumber: number; winningParty: string; candidateName: string; totalVotes: number; votes: number }> = {};
    if (lastElectionRaw?.wards && Array.isArray(lastElectionRaw.parties)) {
      const partiesList = lastElectionRaw.parties;
      for (const [, wVal] of Object.entries(lastElectionRaw.wards as Record<string, any>)) {
        const p0 = wVal.p?.[0];
        if (p0 && p0.win) {
          const pMeta = partiesList[p0.win[0]];
          const winningParty = pMeta?.a || pMeta?.n || 'IND';
          const candidateName = p0.win[1] || '';
          baseline2021Wards[String(p0.no)] = {
            wardNumber: p0.no,
            winningParty,
            candidateName,
            totalVotes: p0.v || 0,
            votes: p0.t?.[0]?.[1] || 0,
          };
        }
      }
    }

    return NextResponse.json({
      municipalityId: raw.municipalityId || code,
      name: raw.name || code,
      vdsCounted: raw.vdsCounted || 0,
      vdsTotal: raw.vdsTotal || 0,
      percComplete: raw.vdsTotal > 0 ? Math.round(((raw.vdsCounted || 0) / raw.vdsTotal) * 100) : 0,
      declared: Boolean(raw.declared),
      seatsTotal: raw.seatsTotal || (raw.wardsTotal ? raw.wardsTotal * 2 : 0),
      seatsMajority: raw.seatsMajority || (raw.seatsTotal ? Math.floor(raw.seatsTotal / 2) + 1 : 0),
      seatsFilled: raw.partyTally?.seatsFilled || raw.seatsSoFar?.filled || enrichedParties.reduce((sum, p) => sum + (p.seats || 0), 0),
      totalVotesCast: enrichedParties.reduce((sum, p) => sum + p.votes, 0),
      parties: enrichedParties,
      wards: enrichedWards,
      baseline2021: {
        parties: baseline2021ByParty,
        wards: baseline2021Wards,
        councilSeats: lastElectionRaw?.council?.seats || 0,
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        'CDN-Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      }
    });
  } catch (err: unknown) {
    if ((err as { digest?: string })?.digest === 'NEXT_PRERENDER_INTERRUPTED') {
      throw err;
    }
    console.error('Error fetching municipality detail:', err);
    return NextResponse.json({ error: 'Failed to fetch municipality data' }, { status: 500 });
  }
}
