import type { PracticeSolution, PracticeSolutionLike } from '../types';

function normalizeExplanation(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

type CandidateSolution = Partial<PracticeSolution> & Record<string, unknown>;

function extractQuery(candidate: CandidateSolution): string | null {
  const possibleKeys: Array<string> = ['query', 'sql', 'solution'];
  for (const key of possibleKeys) {
    const raw = candidate[key];
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (trimmed) return trimmed;
    }
  }
  return null;
}

export function normalizePracticeSolution(value: PracticeSolutionLike): PracticeSolution | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    return { query: trimmed, explanation: null };
  }

  if (typeof value === 'object') {
    const candidate = value as CandidateSolution;
    const directQuery =
      typeof candidate.query === 'string' ? candidate.query.trim() : null;
    const query = directQuery && directQuery.length > 0 ? directQuery : extractQuery(candidate);
    if (!query) return null;
    const explanation = normalizeExplanation(candidate.explanation);
    return { query, explanation };
  }

  return null;
}
