import { NextRequest, NextResponse } from 'next/server';
import { fetchElectionResults } from '@/lib/iec-client';

export async function GET(request: NextRequest) {
  try {
    const year = request.nextUrl.searchParams.get('year') || '2026';
    const ballot = request.nextUrl.searchParams.get('ballot')?.toLowerCase() === 'regional' ? 'Regional' : 'National';

    const data = await fetchElectionResults(year, ballot);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        'CDN-Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      }
    });
  } catch (error: unknown) {
    if ((error as { digest?: string })?.digest === 'NEXT_PRERENDER_INTERRUPTED') {
      throw error;
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown upstream error';
    console.error('API Error fetching IEC results:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve live election data from IEC',
        message: errorMessage
      },
      { status: 502 }
    );
  }
}
