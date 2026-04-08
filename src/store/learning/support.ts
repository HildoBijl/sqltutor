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

export const DEFAULT_MODULE_TYPE: ModuleType = 'skill';

export function createModuleState(
  id: string,
  type: ModuleType = DEFAULT_MODULE_TYPE,
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

export function normalizeModuleState(
  id: string,
  state: Partial<ModuleState> | undefined,
): ModuleState {
  if (!state) {
    return createModuleState(id);
  }
  const stateRecord = state as Partial<ModuleState> & { type?: unknown };
  const {
    type: _legacyType,
    ...withoutLegacyType
  } = stateRecord;
  const lastAccessed = coerceTimestamp(stateRecord.lastAccessed);
  const isSkill =
    stateRecord.type === 'skill' ||
    typeof (stateRecord as Partial<SkillModuleState>).numSolved === 'number' ||
    Array.isArray((stateRecord as Partial<SkillModuleState>).exercises);

  if (isSkill) {
    const partialSkill = withoutLegacyType as Partial<SkillModuleState>;
    const normalized: SkillModuleState = {
      ...createModuleState(id, 'skill'),
      ...partialSkill,
      id,
      lastAccessed,
      exercises: Array.isArray(partialSkill.exercises)
        ? partialSkill.exercises
          .map((exercise) => normalizeStoredExerciseInstance(exercise))
          .filter((exercise): exercise is StoredExerciseInstance => exercise !== null)
        : [],
      numSolved: typeof partialSkill.numSolved === 'number' ? partialSkill.numSolved : 0,
      understood: partialSkill.understood === true ? true : undefined,
    };
    return normalized;
  }

  const partialConcept = withoutLegacyType as Partial<ConceptModuleState>;
  const normalized: ConceptModuleState = {
    ...createModuleState(id, 'concept'),
    ...partialConcept,
    id,
    lastAccessed,
    understood: partialConcept.understood === true ? true : undefined,
  };
  return normalized;
}
