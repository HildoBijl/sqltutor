/**
 * Learning store support.
 */

import type {
  ModuleState,
  ModuleType,
  ConceptModuleState,
  SkillModuleState,
  StoredExerciseEvent,
  StoredExerciseInstance,
} from './types';

export function createModuleState(
  id: string,
  type: ModuleType,
): ModuleState {
  switch (type) {
    case 'concept':
      return {
        id,
        understood: undefined,
        tab: undefined,
        lastAccessed: undefined,
      };
    case 'skill':
    default:
      return {
        id,
        tab: undefined,
        numSolved: 0,
        understood: undefined,
        exercises: [],
        lastAccessed: undefined,
      };
  }
}

export function coerceTimestamp(value: unknown): number | undefined {
  if (typeof value === 'number') {
    return value;
  }
  if (value === undefined || value === null) {
    return undefined;
  }
  const asNumber = new Date(value as string | number).getTime();
  return Number.isNaN(asNumber) ? undefined : asNumber;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function normalizeStoredExerciseEvent(value: unknown): StoredExerciseEvent | null {
  if (!isRecord(value)) {
    return null;
  }

  const timestamp = coerceTimestamp(value.timestamp);
  if (timestamp === undefined) {
    return null;
  }

  return {
    timestamp,
    action: isRecord(value.action) ? { ...value.action } : {},
    resultingState: isRecord(value.resultingState) ? { ...value.resultingState } : {},
  };
}

function normalizeStoredExerciseInstance(value: unknown): StoredExerciseInstance | null {
  if (!isRecord(value)) {
    return null;
  }

  const exerciseIdRaw = value.exerciseId;
  const exerciseId = typeof exerciseIdRaw === 'string' ? exerciseIdRaw.trim() : '';
  if (!exerciseId) {
    return null;
  }

  const version = typeof value.version === 'number' && Number.isFinite(value.version)
    ? value.version
    : 1;
  const createdAt = coerceTimestamp(value.createdAt) ?? Date.now();
  const parameters = isRecord(value.parameters) ? { ...value.parameters } : {};
  const events = Array.isArray(value.events)
    ? value.events
      .map((entry) => normalizeStoredExerciseEvent(entry))
      .filter((entry): entry is StoredExerciseEvent => entry !== null)
    : [];

  return {
    exerciseId,
    version,
    parameters,
    createdAt,
    events,
    draftInput: value.draftInput,
  };
}

interface LegacyModuleShape {
  tab?: unknown;
  lastAccessed?: unknown;
  understood?: unknown;
  numSolved?: unknown;
  exercises?: unknown;
}

function normalizeCommonModuleFields(
  id: string,
  state: LegacyModuleShape | undefined,
): Pick<ModuleState, 'id' | 'tab' | 'lastAccessed' | 'understood'> {
  return {
    id,
    tab: typeof state?.tab === 'string' ? state.tab : undefined,
    lastAccessed: coerceTimestamp(state?.lastAccessed),
    understood: state?.understood === true ? true : undefined,
  };
}

export function normalizeConceptModuleState(
  id: string,
  state: Partial<ModuleState> | undefined,
): ConceptModuleState {
  const base = createModuleState(id, 'concept') as ConceptModuleState;
  const common = normalizeCommonModuleFields(id, state as LegacyModuleShape | undefined);
  return {
    ...base,
    ...common,
  };
}

export function normalizeSkillModuleState(
  id: string,
  state: Partial<ModuleState> | undefined,
): SkillModuleState {
  const base = createModuleState(id, 'skill') as SkillModuleState;
  const partialSkill = state as Partial<SkillModuleState> | undefined;
  const common = normalizeCommonModuleFields(id, state as LegacyModuleShape | undefined);

  const normalized: SkillModuleState = {
    ...base,
    ...common,
    numSolved: typeof partialSkill?.numSolved === 'number' ? partialSkill.numSolved : 0,
    exercises: Array.isArray(partialSkill?.exercises)
      ? partialSkill.exercises
        .map((exercise) => normalizeStoredExerciseInstance(exercise))
        .filter((exercise): exercise is StoredExerciseInstance => exercise !== null)
      : [],
  };
  return normalized;
}

function looksLikeSkillModule(state: Partial<ModuleState> & { type?: unknown }): boolean {
  return (
    state.type === 'skill' ||
    typeof (state as Partial<SkillModuleState>).numSolved === 'number' ||
    Array.isArray((state as Partial<SkillModuleState>).exercises)
  );
}

export function normalizeModuleState(
  id: string,
  state: Partial<ModuleState> | undefined,
): ModuleState {
  if (!state) {
    return createModuleState(id, 'skill');
  }
  const stateRecord = state as Partial<ModuleState> & { type?: unknown };
  if (looksLikeSkillModule(stateRecord)) {
    return normalizeSkillModuleState(id, stateRecord);
  }
  return normalizeConceptModuleState(id, stateRecord);
}
