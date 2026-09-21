import { NextRequest, NextResponse } from 'next/server';
import { aiProviderService } from '@/lib/ai/providers';
import { DocumentAnalysis } from '@/types/document';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { question, analysis } = await req.json();

    if (!question || !analysis) {
      return NextResponse.json({ error: 'Question and Document Analysis are required' }, { status: 400 });
    }

    const answer = await aiProviderService.answerQuestion(question, analysis as DocumentAnalysis);

    return NextResponse.json({
      success: true,
      answer,
    });
  } catch (error) {
    console.error('Grounded chat error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error during grounded question answering' },
      { status: 500 }
    );
  }
}
