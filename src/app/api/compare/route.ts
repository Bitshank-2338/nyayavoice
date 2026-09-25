import { NextRequest, NextResponse } from 'next/server';
import { compareDocuments } from '@/lib/documents/compare-documents';
import { DocumentAnalysis } from '@/types/document';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { docA, docB } = await req.json();

    if (!docA || !docB || !Array.isArray(docA.clauses) || !Array.isArray(docB.clauses)) {
      return NextResponse.json({ error: 'Both Document A and Document B are required' }, { status: 400 });
    }

    const comparison = compareDocuments(docA as DocumentAnalysis, docB as DocumentAnalysis);

    return NextResponse.json({
      success: true,
      comparison,
    });
  } catch (error) {
    console.error('Contract comparison error');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error comparing documents' },
      { status: 500 }
    );
  }
}
