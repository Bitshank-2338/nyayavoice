import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPdf } from '@/lib/documents/pdf-parser';
import { aiProviderService } from '@/lib/ai/providers';
import { SAMPLE_DOCUMENTS } from '@/lib/documents/sample-documents';

export const dynamic = 'force-dynamic';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXT = ['.pdf', '.txt', '.md'];

function sanitizeFilename(name: string): string {
  return name.replace(/[/\\]/g, '_').replace(/\.\./g, '').slice(0, 180) || 'document';
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await req.json();

      if (body.sampleId) {
        const sample = SAMPLE_DOCUMENTS.find(s => s.id === body.sampleId);
        if (sample) {
          return NextResponse.json({
            success: true,
            data: sample.precomputedAnalysis,
            source: 'sample',
            mode: 'demo',
          });
        }
        return NextResponse.json({ error: 'Unknown sample document' }, { status: 404 });
      }

      if (typeof body.rawText === 'string') {
        if (body.rawText.trim().length < 20) {
          return NextResponse.json({ error: 'Pasted text is too short to analyze.' }, { status: 422 });
        }
        if (body.rawText.length > 400_000) {
          return NextResponse.json({ error: 'Pasted text exceeds the analysis size limit.' }, { status: 413 });
        }
        const analysis = await aiProviderService.analyzeDocument(body.rawText, sanitizeFilename(body.filename || 'Pasted Legal Text'));
        return NextResponse.json({
          success: true,
          data: analysis,
          source: 'text',
          mode: aiProviderService.hasExternalKey() ? 'ai' : 'heuristic',
        });
      }

      return NextResponse.json({ error: 'Missing sampleId or rawText' }, { status: 400 });
    }

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file');

      if (!(file instanceof File)) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      const filename = sanitizeFilename(file.name || 'upload');
      const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
      if (ext && !ALLOWED_EXT.includes(ext)) {
        return NextResponse.json({ error: 'Unsupported file type. Upload a PDF or text file.' }, { status: 415 });
      }

      if (file.size > MAX_UPLOAD_BYTES) {
        return NextResponse.json({ error: 'File is larger than 10 MB.' }, { status: 413 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      let extractedText = '';
      let pageCount = 1;

      if (filename.toLowerCase().endsWith('.pdf') || (file.type || '').includes('pdf')) {
        try {
          const pdfResult = await extractTextFromPdf(buffer);
          extractedText = pdfResult.text;
          pageCount = pdfResult.pageCount;
        } catch (err) {
          const message = err instanceof Error ? err.message : '';
          if (message === 'NO_SELECTABLE_TEXT' || (err as { code?: string }).code === 'NO_SELECTABLE_TEXT') {
            return NextResponse.json({
              error: 'NyayaVoice could not detect selectable text in this document. OCR support is not currently enabled.',
            }, { status: 422 });
          }
          return NextResponse.json({
            error: 'This file could not be parsed as a valid PDF. Try exporting a text-based PDF.',
          }, { status: 422 });
        }
      } else {
        extractedText = buffer.toString('utf-8');
      }

      if (!extractedText || extractedText.trim().length < 20) {
        return NextResponse.json({
          error: 'NyayaVoice could not detect selectable text in this document. OCR support is not currently enabled.',
        }, { status: 422 });
      }

      const analysis = await aiProviderService.analyzeDocument(extractedText, filename);
      analysis.pageCount = pageCount;

      return NextResponse.json({
        success: true,
        data: analysis,
        source: 'upload',
        mode: aiProviderService.hasExternalKey() ? 'ai' : 'heuristic',
      });
    }

    return NextResponse.json({ error: 'Unsupported Content-Type' }, { status: 400 });
  } catch (error) {
    console.error('Document parse error');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error while analyzing document' },
      { status: 500 }
    );
  }
}
