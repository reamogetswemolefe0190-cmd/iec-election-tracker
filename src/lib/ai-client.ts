export interface CivicElectionContext {
  scope: string; // 'national' | 'province' | 'municipality' | 'ward'
  scopeName: string; // e.g. 'City of Tshwane', 'Gauteng', 'Ward 99'
  parentScopeName?: string;
  percComplete: number;
  vdsCounted: number;
  vdsTotal: number;
  totalVotes: number;
  status: 'provisional' | 'declared';
  topParties: {
    abbr: string;
    fullName?: string;
    votes: number;
    votePercentage: number;
    seats?: number;
    color?: string;
  }[];
  councilMath?: {
    seatsTotal: number;
    seatsMajority: number;
    hungCouncil: boolean;
    majorityWon: boolean;
  };
  wardDetails?: {
    wardNumber: number;
    councillorCandidate?: string;
    leadingParty: string;
    turnout: number;
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'openrouter/free';
const FALLBACK_MODEL = 'google/gemma-4-31b-it:free';

/**
 * Builds the civic system prompt strictly binding the AI to verified IEC returns and visual honesty rules
 */
export function buildCivicSystemPrompt(ctx: CivicElectionContext): string {
  const topPartiesList = (ctx.topParties || [])
    .slice(0, 8)
    .map(
      (p, i) =>
        `${i + 1}. ${p.abbr} (${p.fullName || p.abbr}): ${(p.votePercentage ?? 0).toFixed(1)}% (${(p.votes ?? 0).toLocaleString('en-ZA')} votes${
          p.seats !== undefined && p.seats > 0 ? `, ${p.seats} seats` : ''
        })`
    )
    .join('\n');

  const councilInfo = ctx.councilMath
    ? `COUNCIL SEAT THRESHOLD:
- Total Council Seats: ${ctx.councilMath.seatsTotal}
- Seats Needed for Outright Majority: ${ctx.councilMath.seatsMajority}
- Current Status: ${
        ctx.councilMath.majorityWon
          ? 'Outright majority achieved'
          : ctx.councilMath.hungCouncil
          ? 'Hung council (coalition government required)'
          : 'Counting in progress'
      }`
    : '';

  const wardInfo = ctx.wardDetails
    ? `WARD LEVEL DETAILS:
- Ward Number: Ward ${ctx.wardDetails.wardNumber}
- Leading Candidate: ${ctx.wardDetails.councillorCandidate || 'Candidate tally updating'}
- Leading Party: ${ctx.wardDetails.leadingParty}
- Voter Turnout: ${ctx.wardDetails.turnout}%`
    : '';

  const scopeLabel = ctx.scope ? ctx.scope.toUpperCase() : 'COUNCIL';
  const percComplete = ctx.percComplete ?? 0;
  const vdsCounted = ctx.vdsCounted ?? 0;
  const vdsTotal = ctx.vdsTotal ?? 0;

  return `You are "Ask Mzansi AI", the dedicated, non-partisan South African Civic Election AI assistant for the IEC Live Election Tracker.

CURRENT ELECTION CONTEXT:
- Active Location / Scope: ${ctx.scopeName || 'South Africa'} (${scopeLabel})
- Counting Progress: ${percComplete.toFixed(1)}% (${vdsCounted.toLocaleString('en-ZA')} of ${vdsTotal.toLocaleString('en-ZA')} Voting Districts counted)
- Total Ballots Cast: ${ctx.totalVotes.toLocaleString('en-ZA')}
- Status: ${ctx.status === 'declared' ? 'Official IEC Final Result Certified' : 'Provisional IEC Count (Preliminary until certified)'}

CURRENT TOP PARTIES IN THIS SCOPE:
${topPartiesList}

${councilInfo}

${wardInfo}

SOUTH AFRICAN CIVIC GUARDRAILS & VISUAL HONESTY RULES:
1. NON-PARTISAN ACCURACY: You never favor, endorse, or bias towards any political party (ANC, DA, EFF, ActionSA, MK, VF Plus, IFP, PA, etc.). You explain the numbers objectively and respectfully.
2. VERIFIED IEC NUMBERS: Cite the exact votes, percentages, and seats provided in the context above. If asked about a party or council not reporting yet, state that counting is in progress according to the IEC.
3. PROVISIONAL TRANSPARENCY: Always clarify that vote counts are provisional until certified by the IEC Municipal Electoral Officer.
4. COALITION REALITY: In South African Local Government Elections (LGE), a party needs 50% + 1 seat to elect an Executive Mayor and Council Speaker alone. If no party reaches this, explain that parties must negotiate coalition pacts or government of local unity (GLU) agreements.
5. CONCISE & HELPFUL: Keep responses brief, engaging, civic-minded, and easy to read on mobile.
6. NO MARKDOWN ASTERISKS OR CODE CHARACTERS:
- NEVER use asterisks (** or *) for bold or italic. Never output raw markdown asterisks.
- NEVER use markdown header hashes (### or ##). Use clean text titles with colons.
- NEVER use horizontal divider lines (--- or ___).
- NEVER use markdown table syntax with vertical pipes (| :--- |). Instead, format data as simple clean bullet points (•).
- Always ensure sentences begin with complete words (e.g. "In South African" rather than missing letters).`;
}

/**
 * Sanitizes and strips raw markdown characters (asterisks, hashes, divider lines, table pipes)
 * ensuring pure, clean, human-readable text for voters.
 */
export function cleanCivicAiText(raw: string): string {
  if (!raw) return '';
  let text = raw.trim();

  // Restore leading "I" if chopped off
  if (/^n\s+South\s+Africa/i.test(text)) {
    text = 'I' + text;
  }

  const lines = text.split('\n');
  const cleanedLines: string[] = [];
  let inTable = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip table divider rows like | :--- | :--- | or | --- | --- |
    if (/^\|[\s\-:]+(\|[\s\-:]+)+\|?$/.test(trimmed)) {
      continue;
    }

    // Convert markdown table rows into clean bullets
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim().replace(/\*{1,3}/g, ''));

      if (!inTable) {
        inTable = true;
        // Skip header label row if generic
        if (cells.length > 0 && cells[0].toLowerCase() === 'metric') {
          continue;
        }
      }

      if (cells.length >= 2 && cells[0] && cells[1]) {
        cleanedLines.push(`• ${cells[0]}: ${cells[1]}`);
      } else if (cells.length > 0 && cells[0]) {
        cleanedLines.push(`• ${cells.join(' — ')}`);
      }
      continue;
    } else {
      inTable = false;
    }

    // Remove horizontal rule lines: ---, ***, ___
    if (/^[\-\*_]{3,}$/.test(trimmed)) {
      continue;
    }

    // Convert markdown headings: ### Title -> Title:
    let l = line.replace(/^#{1,6}\s*(.+)$/, '$1:');

    // Convert markdown list markers (* or -) into clean bullet (•)
    l = l.replace(/^\s*[\*\-]\s+/g, '• ');

    // Strip ALL asterisks (*, **, ***)
    l = l.replace(/\*{1,3}/g, '');

    cleanedLines.push(l);
  }

  return cleanedLines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Deterministic fallback generator for when no API key is configured or offline
 */
export function generateDeterministicCivicAnswer(userPrompt: string, ctx: CivicElectionContext): string {
  const q = userPrompt.toLowerCase();
  const parties = ctx.topParties || [];
  const top = parties[0];
  const runner = parties[1];
  const top3 = parties[2];
  const scopeName = ctx.scopeName || 'the selected area';

  // Coalition questions
  if (q.includes('coalition') || q.includes('majority') || q.includes('hung') || q.includes('govern') || q.includes('seats')) {
    if (ctx.councilMath && ctx.councilMath.seatsTotal > 0) {
      const threshold = ctx.councilMath.seatsMajority;
      const total = ctx.councilMath.seatsTotal;
      const top4 = parties[3];

      // Calculate projected seats from vote percentages if official PR seats not yet declared
      const getSeats = (p?: { seats?: number; votePercentage: number }) => {
        if (!p) return 0;
        if (p.seats !== undefined && p.seats > 0) return p.seats;
        return Math.round(((p.votePercentage || 0) / 100) * total);
      };

      const topSeats = getSeats(top);
      const runnerSeats = getSeats(runner);
      const top3Seats = getSeats(top3);
      const top4Seats = getSeats(top4);

      if (top && top.votePercentage >= 50) {
        return `Yes. ${top.abbr} currently holds an outright majority with ${top.votePercentage.toFixed(1)}% of the counted vote in ${scopeName}. They command ~${topSeats} seats, exceeding the ${threshold}-seat threshold (out of ${total} total council seats) required to elect the Executive Mayor and Speaker without needing coalition partners.`;
      }

      // Calculate coalition combinations
      const pathways: string[] = [];
      if (top && runner) {
        const comb = topSeats + runnerSeats;
        pathways.push(`• ${top.abbr} + ${runner.abbr} (~${comb} seats): ${comb >= threshold ? `Passes majority threshold (+${comb - threshold} seat buffer)` : `Falls ${threshold - comb} seats short; requires a third party`}`);
      }
      if (top && top3) {
        const comb = topSeats + top3Seats;
        pathways.push(`• ${top.abbr} + ${top3.abbr} (~${comb} seats): ${comb >= threshold ? `Passes majority threshold (+${comb - threshold} buffer)` : `Requires an additional partner (+${threshold - comb} seats needed)`}`);
      }
      if (runner && top3 && top4) {
        const comb = runnerSeats + top3Seats + top4Seats;
        pathways.push(`• ${runner.abbr} + ${top3.abbr} + ${top4.abbr} (~${comb} seats): ${comb >= threshold ? `Alternative majority bloc (+${comb - threshold} buffer)` : `Falls short by ${threshold - comb} seats`}`);
      }

      return `Yes — a multi-party coalition is the only viable way to govern ${scopeName}.

In ${scopeName}, ${threshold} seats (out of ${total} total council seats) are required to elect an Executive Mayor and Council Speaker:
• ${top?.abbr || 'Leading Party'}: ${(top?.votePercentage ?? 0).toFixed(1)}% (~${topSeats} projected seats)
• ${runner?.abbr || 'Runner-up'}: ${(runner?.votePercentage ?? 0).toFixed(1)}% (~${runnerSeats} projected seats)
${top3 ? `• ${top3.abbr}: ${(top3.votePercentage ?? 0).toFixed(1)}% (~${top3Seats} projected seats)\n` : ''}${top4 ? `• ${top4.abbr}: ${(top4.votePercentage ?? 0).toFixed(1)}% (~${top4Seats} projected seats)\n` : ''}
Note: Because official compensatory PR seats are only finalized once 100% of voting districts are certified, seat numbers above are realistic projections based on current popular vote shares.

Potential Coalition Pathways to Reach ${threshold} Seats:
${pathways.join('\n')}

Because no single party has won 50% + 1 seat, this council is officially in hung council territory. Parties have 14 days under municipal legislation to formalize a coalition agreement or Government of Local Unity (GLU).`;
    }

    return `At the municipal council level, a party or coalition needs 50% + 1 seat to elect an Executive Mayor and Speaker. In hung councils where no party wins an outright 50% majority, coalitions or municipal governance agreements must be concluded within 14 days of declaration.`;
  }

  // Ward questions
  if (q.includes('ward') && ctx.wardDetails) {
    return `Ward ${ctx.wardDetails.wardNumber} Standings (${scopeName}):
• Leading Party: ${ctx.wardDetails.leadingParty}
• Ward Candidate: ${ctx.wardDetails.councillorCandidate || 'Candidate slips currently being tallied'}
• Turnout: ${ctx.wardDetails.turnout}%
• Counting Progress: ${(ctx.vdsCounted ?? 0)} of ${(ctx.vdsTotal ?? 0)} Voting Districts completed (${(ctx.percComplete ?? 0).toFixed(1)}%).`;
  }

  // Who is leading / who won
  if (q.includes('who is leading') || q.includes('who won') || q.includes('leader') || q.includes('ahead') || q.includes('tshwane')) {
    if (top && runner) {
      const margin = (top.votePercentage - runner.votePercentage).toFixed(1);
      return `In ${scopeName}, ${top.abbr} is currently leading with ${top.votePercentage.toFixed(1)}% (${(top.votes ?? 0).toLocaleString('en-ZA')} votes), followed by ${runner.abbr} with ${runner.votePercentage.toFixed(1)}% (${(runner.votes ?? 0).toLocaleString('en-ZA')} votes) — a margin of ${margin}%.

Counting progress is currently at ${(ctx.percComplete ?? 0).toFixed(1)}% (${(ctx.vdsCounted ?? 0).toLocaleString('en-ZA')} of ${(ctx.vdsTotal ?? 0).toLocaleString('en-ZA')} VDs counted).`;
    }
  }

  // PR vs Ward explanation
  if (q.includes('pr') || q.includes('proportional') || q.includes('ballot') || q.includes('how does') || q.includes('system')) {
    return `In South African Metropolitan Municipalities (like the City of Tshwane), you vote with two separate ballots:

1. Ward Ballot (107 Seats in Tshwane) — First-Past-The-Post:
• What you vote for: A specific candidate to represent your geographic ward.
• How the winner is decided: The candidate with the most votes wins that single seat directly. Independent candidates can stand and win.

2. PR Ballot (107 Seats in Tshwane) — Proportional Representation:
• What you vote for: A political party list.
• How seats are allocated: Parties receive seats in proportion to their total popular vote share across the entire metro.
• The Top-Up Mechanism: This corrects Ward imbalances so the overall 214-seat council mirrors each party's total popular vote.

Bottom line: The Ward ballot picks your local ward councillor; the PR ballot decides the overall party balance in Council.`;
  }

  // Default overview
  return `Election Summary for ${scopeName}:
• Top Contender: ${top?.abbr} (${(top?.votePercentage ?? 0).toFixed(1)}%, ${(top?.votes ?? 0).toLocaleString('en-ZA')} votes)
• Runner-up: ${runner?.abbr} (${(runner?.votePercentage ?? 0).toFixed(1)}%, ${(runner?.votes ?? 0).toLocaleString('en-ZA')} votes)
• Counting Progress: ${(ctx.vdsCounted ?? 0).toLocaleString('en-ZA')} of ${(ctx.vdsTotal ?? 0).toLocaleString('en-ZA')} VDs reported (${(ctx.percComplete ?? 0).toFixed(1)}%)
• Total Ballots Processed: ${(ctx.totalVotes ?? 0).toLocaleString('en-ZA')}

Note: All returns are provisional until certified by the IEC Returning Officer.`;
}

/**
 * Calls OpenRouter AI API with fallback to deterministic answer
 */
export async function askCivicAi(
  userMessage: string,
  ctx: CivicElectionContext,
  history: ChatMessage[] = []
): Promise<{ text: string; modelUsed: string }> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return {
      text: generateDeterministicCivicAnswer(userMessage, ctx),
      modelUsed: 'local-civic-heuristics',
    };
  }

  const systemPrompt = buildCivicSystemPrompt(ctx);

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-4), // keep last 4 context turns
    { role: 'user', content: userMessage },
  ];

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://iec-election-tracker.vercel.app',
        'X-Title': 'IEC Live Election Tracker',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages,
        max_tokens: 600,
        temperature: 0.3, // keep factual and grounded
      }),
    });

    if (!response.ok) {
      console.warn(`OpenRouter primary model ${DEFAULT_MODEL} returned ${response.status}. Trying fallback model...`);
      // Fallback to Google Gemma 31B free tier
      const fallbackRes = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://iec-election-tracker.vercel.app',
          'X-Title': 'IEC Live Election Tracker',
        },
        body: JSON.stringify({
          model: FALLBACK_MODEL,
          messages,
          max_tokens: 600,
          temperature: 0.3,
        }),
      });

      if (!fallbackRes.ok) {
        throw new Error(`OpenRouter models failed with ${fallbackRes.status}`);
      }

      const data = await fallbackRes.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        return { text: cleanCivicAiText(content), modelUsed: FALLBACK_MODEL };
      }
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      return { text: cleanCivicAiText(content), modelUsed: DEFAULT_MODEL };
    }

    return {
      text: cleanCivicAiText(generateDeterministicCivicAnswer(userMessage, ctx)),
      modelUsed: 'local-civic-heuristics',
    };
  } catch (err) {
    console.warn('OpenRouter API request failed, falling back to civic heuristics:', err);
    return {
      text: cleanCivicAiText(generateDeterministicCivicAnswer(userMessage, ctx)),
      modelUsed: 'local-civic-heuristics',
    };
  }
}
