const LEARNER_SEED_STORAGE_KEY = 'sqlvalley:learner-seed';

export interface ExerciseRng {
  next(): number;
  integer(maxExclusive: number): number;
}

export function createExerciseRng(seed: string): ExerciseRng {
  let state = hashSeed(seed);

  const next = () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };

  return {
    next,
    integer: (maxExclusive) => {
      if (maxExclusive <= 0) return 0;
      return Math.floor(next() * maxExclusive);
    },
  };
}

export function pickRandomly<T>(rng: ExerciseRng, options: readonly T[]): T | undefined {
  if (options.length === 0) return undefined;
  return options[rng.integer(options.length)];
}

export function getOrCreateLearnerSeed(): string {
  if (typeof window === 'undefined') {
    return createUnstoredSeed();
  }

  try {
    const existing = window.localStorage.getItem(LEARNER_SEED_STORAGE_KEY);
    if (existing) return existing;

    const next = createUnstoredSeed();
    window.localStorage.setItem(LEARNER_SEED_STORAGE_KEY, next);
    return next;
  } catch {
    return createUnstoredSeed();
  }
}

export function createAttemptSeed({
  learnerSeed,
  skillId,
  exerciseId,
  version,
  attemptNumber,
}: {
  learnerSeed: string;
  skillId: string;
  exerciseId: string;
  version: number;
  attemptNumber: number;
}): string {
  return [learnerSeed, skillId, exerciseId, version, attemptNumber, Date.now(), Math.random()].join('|');
}

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createUnstoredSeed(): string {
  const cryptoApi = typeof crypto !== 'undefined' ? crypto : undefined;
  if (cryptoApi?.randomUUID) {
    return cryptoApi.randomUUID();
  }
  const randomPart = Math.random().toString(36).slice(2);
  return `${Date.now().toString(36)}-${randomPart}`;
}
