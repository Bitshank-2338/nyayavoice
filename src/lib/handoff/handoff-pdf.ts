function escapePdfText(value: string): string {
  return value
    .replace(/[^\x20-\x7E]/g, '?')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function wrapLine(line: string, width: number): string[] {
  if (line.length <= width) return [line];
  const words = line.split(/\s+/);
  const rows: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > width) {
      if (current) rows.push(current);
      current = word.length > width ? word.slice(0, width) : word;
    } else {
      current = next;
    }
  }
  if (current) rows.push(current);
  return rows.length ? rows : [''];
}

function paginate(text: string): string[][] {
  const rows = text.split('\n').flatMap((line) => wrapLine(line, 88));
  const perPage = 46;
  const pages: string[][] = [];
  for (let i = 0; i < rows.length; i += perPage) {
    pages.push(rows.slice(i, i + perPage));
  }
  return pages.length ? pages : [['NyayaVoice handoff']];
}

function pageStream(lines: string[]): string {
  const commands = ['BT', '/F1 11 Tf', '54 740 Td', '14 TL'];
  for (const line of lines) {
    commands.push(`(${escapePdfText(line)}) Tj`);
    commands.push('T*');
  }
  commands.push('ET');
  return commands.join('\n');
}

export function buildHandoffPdf(text: string): Uint8Array {
  const pages = paginate(text);
  const objects: string[] = [];

  const pageObjectIds: number[] = [];
  const contentObjectIds: number[] = [];
  let nextId = 4;
  for (let i = 0; i < pages.length; i += 1) {
    pageObjectIds.push(nextId);
    contentObjectIds.push(nextId + 1);
    nextId += 2;
  }

  objects[1] = `<< /Type /Catalog /Pages 2 0 R >>`;
  objects[2] = `<< /Type /Pages /Count ${pages.length} /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] >>`;
  objects[3] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`;

  pages.forEach((lines, index) => {
    const pageId = pageObjectIds[index];
    const contentId = contentObjectIds[index];
    const stream = pageStream(lines);
    objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${contentId} 0 R /Resources << /Font << /F1 3 0 R >> >> >>`;
    objects[contentId] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });

  let body = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (let id = 1; id < objects.length; id += 1) {
    offsets[id] = body.length;
    body += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }

  const xrefStart = body.length;
  let xref = `xref\n0 ${objects.length}\n`;
  xref += '0000000000 65535 f \n';
  for (let id = 1; id < objects.length; id += 1) {
    xref += `${offsets[id].toString().padStart(10, '0')} 00000 n \n`;
  }
  body += xref;
  body += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new TextEncoder().encode(body);
}

export function downloadHandoffPdf(text: string, filename: string) {
  const bytes = buildHandoffPdf(text);
  const blob = new Blob([Uint8Array.from(bytes)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
