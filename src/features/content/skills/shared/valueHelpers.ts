export function stringify(value: unknown): string {
  return value === null || value === undefined ? '' : String(value);
}

export function stringOrNull(value: unknown): string | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  return String(value);
}

export function numberOrNull(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (typeof value === 'string' && value.trim().length === 0) {
    return null;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

export function booleanOrNull(value: unknown): boolean | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
    return null;
  }

  const normalized = String(value).trim().toLowerCase();
  if (normalized === 'true' || normalized === 't' || normalized === 'yes' || normalized === '1') {
    return true;
  }
  if (normalized === 'false' || normalized === 'f' || normalized === 'no' || normalized === '0') {
    return false;
  }
  return null;
}

export function compareRows(a: unknown[], b: unknown[]): number {
  const maxLength = Math.min(a.length, b.length);
  for (let index = 0; index < maxLength; index += 1) {
    const left = stringify(a[index]);
    const right = stringify(b[index]);
    const diff = left.localeCompare(right);
    if (diff !== 0) {
      return diff;
    }
  }

  return a.length - b.length;
}
