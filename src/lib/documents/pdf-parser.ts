import { PDFParse } from 'pdf-parse';

export interface ParsedPdfResult {
  text: string;
  pageCount: number;
  info?: Record<string, unknown>;
}

/**
 * Extracts plain text and page metadata from a PDF Buffer
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<ParsedPdfResult> {
  try {
    const parser = new PDFParse({ data: buffer });
    const textResult = await parser.getText();
    const pageCount = textResult.total || (textResult.pages ? textResult.pages.length : 1);
    await parser.destroy();

    if (textResult.text && textResult.text.trim().length >= 20) {
      const cleanedText = sanitizeLegalText(textResult.text);
      return {
        text: cleanedText,
        pageCount,
      };
    }

    const err = new Error('NO_SELECTABLE_TEXT');
    (err as Error & { code?: string }).code = 'NO_SELECTABLE_TEXT';
    throw err;
  } catch (error) {
    console.error('Error parsing PDF with PDFParse');
    if (error instanceof Error && (error as Error & { code?: string }).code === 'NO_SELECTABLE_TEXT') {
      throw error;
    }
    const looksLikePdf = buffer.slice(0, 5).toString('latin1').startsWith('%PDF');
    if (looksLikePdf) {
      throw new Error('Failed to parse PDF document');
    }
    const fallbackText = extractPrintableTextFromBuffer(buffer);
    if (fallbackText && fallbackText.length > 50) {
      return {
        text: sanitizeLegalText(fallbackText),
        pageCount: 1,
      };
    }
    throw new Error(`Failed to parse PDF document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fallback to extract readable text sequences from raw buffer
 */
function extractPrintableTextFromBuffer(buf: Buffer): string {
  const str = buf.toString('latin1');
  const matches = str.match(/[\x20-\x7E\r\n]{5,}/g);
  return matches ? matches.join('\n') : '';
}

/**
 * Cleans and normalizes legal document text (removes weird artifacts, unifies line endings)
 */
export function sanitizeLegalText(rawText: string): string {
  if (!rawText) return '';

  return rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Replace multiple form feeds or page breaks
    .replace(/\x0C/g, '\n\n')
    // Normalize excessive horizontal whitespace
    .replace(/[\t ]+/g, ' ')
    // Normalize excessive vertical whitespace (more than 3 newlines to 2)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Segments raw text into draft clause chunks based on common numbering patterns (e.g. "1.", "1.1", "SECTION 1", "ARTICLE I")
 */
export function segmentTextIntoDraftClauses(text: string): Array<{ section: string; title: string; content: string }> {
  const lines = text.split('\n');
  const chunks: Array<{ section: string; title: string; content: string }> = [];
  
  const sectionRegex = /^(\d+(\.\d+)*|[A-Z]+|\bSection\s+\d+(\.\d+)*|\bArticle\s+[IVXLCDM\d]+)[\.\:\s\-]+([A-Z\s\(\)\,\/]{3,60})$/i;
  
  let currentSection = 'Preamble';
  let currentTitle = 'Introduction';
  let currentLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(sectionRegex);

    if (match && trimmed.length < 80) {
      if (currentLines.length > 0) {
        chunks.push({
          section: currentSection,
          title: currentTitle,
          content: currentLines.join('\n').trim(),
        });
        currentLines = [];
      }
      currentSection = match[1];
      currentTitle = match[4]?.trim() || 'Untitled Section';
    } else {
      currentLines.push(line);
    }
  }

  if (currentLines.length > 0) {
    chunks.push({
      section: currentSection,
      title: currentTitle,
      content: currentLines.join('\n').trim(),
    });
  }

  return chunks;
}
