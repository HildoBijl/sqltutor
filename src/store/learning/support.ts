/**
 * Learning store support.
 */

import type {
  ModuleState,
  ConceptModuleState,
  SkillModuleState,
} from './types';

export const DEFAULT_MODULE_TYPE: ModuleState['type'] = 'skill';

export function createModuleState(
  id: string,
  type: ModuleState['type'] = DEFAULT_MODULE_TYPE,
): ModuleState {
  switch (type) {
    case 'concept':
      return {
        type: 'concept',
        id,
        understood: false,
        tab: undefined,
        lastAccessed: undefined,
      };
    case 'skill':
    default:
      return {
        type: 'skill',
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

export function normalizeModuleState(
  id: string,
  state: Partial<ModuleState> | undefined,
): ModuleState {
  if (!state || !('type' in state) || !state.type) {
    return createModuleState(id);
  }
  const desiredType = state.type;
  const lastAccessed = coerceTimestamp(state.lastAccessed);

  switch (desiredType) {
    case 'concept': {
      const normalized: ConceptModuleState = {
        ...createModuleState(id, 'concept'),
        ...(state as Partial<ConceptModuleState>),
        id,
        type: 'concept',
        lastAccessed,
      };
      return normalized;
    }
    case 'skill':
    default: {
      const partialSkill = state as Partial<SkillModuleState>;
      const normalized: SkillModuleState = {
        ...createModuleState(id, 'skill'),
        ...partialSkill,
        id,
        type: 'skill',
        lastAccessed,
        exercises: Array.isArray(partialSkill.exercises) ? partialSkill.exercises : [],
        numSolved: partialSkill.numSolved ?? 0,
        understood: partialSkill.understood === true ? true : undefined,
      };
      return normalized;
    }
  }
}
