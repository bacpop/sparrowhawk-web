export interface MSASequence {
  id: string;
  sequence: string;
}

/**
 * Parse FASTA format text into an array of sequences
 */
export function parseFasta(content: string): MSASequence[] {
  const lines = content.split(/\r?\n/);
  const result: MSASequence[] = [];
  let current: MSASequence | null = null;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (line.startsWith('>')) {
      if (current) result.push(current);
      current = { id: line.slice(1).trim(), sequence: '' };
    } else if (current) {
      current.sequence += line.trim();
    }
  }
  if (current) result.push(current);

  return result;
}

/**
 * Detect if a file is a FASTA alignment based on filename and content
 */
export function detectFileType(filename: string, text: string): 'alignment' | 'unknown' {
  const lower = filename.toLowerCase();
  if (/\.(fasta|fas|fa)$/.test(lower)) return 'alignment';

  const head = text.slice(0, 2000);
  if (/^>\S/m.test(head)) return 'alignment';

  return 'unknown';
}
