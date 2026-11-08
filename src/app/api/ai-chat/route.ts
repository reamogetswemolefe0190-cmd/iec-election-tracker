import { NextRequest, NextResponse } from 'next/server';
import { askCivicAi, CivicElectionContext, ChatMessage } from '@/lib/ai-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context, history } = body as {
      message: string;
      context: CivicElectionContext;
      history?: ChatMessage[];
    };

    if (!message || !context) {
      return NextResponse.json(
        { error: 'Missing required "message" or "context" parameter' },
        { status: 400 }
      );
    }

    const { text, modelUsed } = await askCivicAi(message, context, history || []);

    return NextResponse.json({
      answer: text,
      modelUsed,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    console.error('Error in AI chat route:', err);
    return NextResponse.json(
      { error: 'Failed to process AI chat query' },
      { status: 500 }
    );
  }
}
