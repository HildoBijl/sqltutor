/**
 * CSV parsing utilities and value converters.
 */

/**
 * Parse a raw CSV string into an array of records.
 * Each record is an object mapping column headers to string values.
 */
export function parseCsv(raw: string): Record<string, string>[] {
  if (!raw) return [];
  const source = raw.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let currentCell = '';
  let currentRow: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      currentCell += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      currentRow.push(currentCell);
      currentCell = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        i += 1;
      }
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = '';
      continue;
    }

    currentCell += char;
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }

  if (rows.length === 0) return [];

  const headers = rows[0].map((header) => header.trim());

  return rows
    .slice(1)
    .map((cells) => {
      const entry: Record<string, string> = {};
      headers.forEach((header, index) => {
        entry[header] = (cells[index] ?? '').trim();
      });
      return entry;
    })
    .filter((entry) => headers.some((header) => (entry[header] ?? '').trim().length > 0));
}

/**
 * Convert a string value to a number, or null if invalid/empty.
 */
export function numberOrNull(value: string | undefined): number | null {
  if (!value) return null;
  const normalized = value.replace(/[^0-9.-]/g, '');
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Convert a string value to a boolean, or null if invalid/empty.
 */
export function booleanOrNull(value: string | undefined): boolean | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return null;
}

/**
 * Trim a string value, returning null if empty.
 */
export function stringOrNull(value: string | undefined): string | null {
  const trimmed = (value ?? '').trim();
  return trimmed.length === 0 ? null : trimmed;
}

/**
 * Convert a string value to a numeric ID or keep as string ID, or null if empty.
 */
export function idOrNull(value: string | undefined): number | string | null {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return null;
  const numeric = Number(trimmed);
  return Number.isFinite(numeric) ? numeric : trimmed;
}
