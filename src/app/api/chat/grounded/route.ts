import { NextRequest, NextResponse } from 'next/server';
import { aiProviderService } from '@/lib/ai/providers';
import { ConversationTurn, DocumentAnalysis } from '@/types/document';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const question = typeof body.question === 'string' ? body.question.trim() : '';
    const analysis = body.analysis as DocumentAnalysis | undefined;
    const history = Array.isArray(body.history) ? (body.history as ConversationTurn[]) : [];

    if (!question || !analysis || !Array.isArray(analysis.clauses)) {
      return NextResponse.json({ error: 'Question and Document Analysis are required' }, { status: 400 });
    }

    if (question.length > 2000) {
      return NextResponse.json({ error: 'Question is too long' }, { status: 413 });
    }

    const answer = await aiProviderService.answerQuestion(question, analysis, history.slice(-12));

    return NextResponse.json({
      success: true,
      answer,
      mode: aiProviderService.hasExternalKey() ? 'ai' : 'heuristic',
    });
  } catch (error) {
    console.error('Grounded chat error');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error during grounded question answering' },
      { status: 500 }
    );
  }
}
