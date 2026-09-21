import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPdf } from '@/lib/documents/pdf-parser';
import { aiProviderService } from '@/lib/ai/providers';
import { SAMPLE_DOCUMENTS } from '@/lib/documents/sample-documents';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // 1. JSON Request (Sample Document or Raw Text)
    if (contentType.includes('application/json')) {
      const body = await req.json();

      if (body.sampleId) {
        const sample = SAMPLE_DOCUMENTS.find(s => s.id === body.sampleId);
        if (sample) {
          return NextResponse.json({
            success: true,
            data: sample.precomputedAnalysis,
            source: 'sample',
          });
        }
      }

      if (body.rawText) {
        const analysis = await aiProviderService.analyzeDocument(body.rawText, body.filename || 'Pasted Legal Text');
        return NextResponse.json({
          success: true,
          data: analysis,
          source: 'text',
        });
      }

      return NextResponse.json({ error: 'Missing sampleId or rawText' }, { status: 400 });
    }

    // 2. Form-Data Request (PDF File Upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      const filename = file.name;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      let extractedText = '';
      let pageCount = 1;

      if (filename.toLowerCase().endsWith('.pdf')) {
        const pdfResult = await extractTextFromPdf(buffer);
        extractedText = pdfResult.text;
        pageCount = pdfResult.pageCount;
      } else {
        // Plain text / markdown
        extractedText = buffer.toString('utf-8');
      }

      if (!extractedText || extractedText.trim().length < 20) {
        return NextResponse.json({ error: 'Could not extract sufficient readable text from document' }, { status: 422 });
      }

      const analysis = await aiProviderService.analyzeDocument(extractedText, filename);
      analysis.pageCount = pageCount;

      return NextResponse.json({
        success: true,
        data: analysis,
        source: 'upload',
      });
    }

    return NextResponse.json({ error: 'Unsupported Content-Type' }, { status: 400 });
  } catch (error) {
    console.error('Document parse error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error while analyzing document' },
      { status: 500 }
    );
  }
}
