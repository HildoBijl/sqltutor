const cache = new Map<string, Record<string, unknown>[]>();

export function parseSchemaRows(schema: string, tableName: string): Record<string, unknown>[] {
  const cacheKey = `${tableName}::${schema}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached.map(row => ({ ...row }));
  }

  const escapedTable = escapeRegex(tableName);
  const createMatch = schema.match(new RegExp(`CREATE\\s+TABLE\\s+${escapedTable}\\s*\\(([\\s\\S]*?)\\);`, 'i'));
  if (!createMatch) {
    cache.set(cacheKey, []);
    return [];
  }

  const columnDefs = createMatch[1]
    .split(',')
    .map(part => part.trim())
    .filter(part => part.length > 0 && !/^(primary|foreign|unique|check|constraint)/i.test(part));

  const columns = columnDefs.map(def => def.split(/\s+/)[0].replace(/["'`]/g, ''));

  const insertMatch = schema.match(new RegExp(`INSERT\\s+INTO\\s+${escapedTable}\\s+VALUES\\s*([\\s\\S]*?);`, 'i'));
  if (!insertMatch) {
    cache.set(cacheKey, []);
    return [];
  }

  const tuples = Array.from(insertMatch[1].matchAll(/\(([^()]*?)\)/g)).map(match => match[1]);

  const rows = tuples.map(tuple => {
    const values = splitTuple(tuple).map(convertLiteral);
    const entry: Record<string, unknown> = {};

    columns.forEach((column, index) => {
      entry[column] = index < values.length ? values[index] : null;
    });

    return entry;
  });

  cache.set(cacheKey, rows);
  return rows.map(row => ({ ...row }));
}

function splitTuple(tuple: string): string[] {
  const values: string[] = [];
  let current = '';
  let inString = false;

  for (let i = 0; i < tuple.length; i += 1) {
    const char = tuple[i];

    if (char === "'") {
      const next = tuple[i + 1];
      if (inString && next === "'") {
        current += "'";
        i += 1;
        continue;
      }

      inString = !inString;
      continue;
    }

    if (char === ',' && !inString) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current.trim());

  return values;
}

function convertLiteral(raw: string): unknown {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^null$/i.test(trimmed)) return null;

  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) {
    const numeric = Number(trimmed);
    return Number.isNaN(numeric) ? trimmed : numeric;
  }

  return trimmed.replace(/''/g, "'");
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
