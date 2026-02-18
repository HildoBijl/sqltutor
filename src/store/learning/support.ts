/**
 * Learning store support.
 */

import type {
  ComponentState,
  ConceptComponentState,
  PlaygroundComponentState,
  SkillComponentState,
} from './types';

export const DEFAULT_COMPONENT_TYPE: ComponentState['type'] = 'skill';

export function createComponentState(
  id: string,
  type: ComponentState['type'] = DEFAULT_COMPONENT_TYPE,
): ComponentState {
  switch (type) {
    case 'concept':
      return {
        type: 'concept',
        id,
        understood: false,
        tab: undefined,
        lastAccessed: undefined,
      };
    case 'playground':
      return {
        type: 'playground',
        id,
        savedQueries: [],
        history: [],
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
        instances: {},
        currentInstanceId: undefined,
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

export function normalizeComponentState(
  id: string,
  state: Partial<ComponentState> | undefined,
): ComponentState {
  if (!state || !('type' in state) || !state.type) {
    return createComponentState(id);
  }
  const desiredType = state.type;
  const lastAccessed = coerceTimestamp(state.lastAccessed);

  switch (desiredType) {
    case 'concept': {
      const normalized: ConceptComponentState = {
        ...createComponentState(id, 'concept'),
        ...(state as Partial<ConceptComponentState>),
        id,
        type: 'concept',
        lastAccessed,
      };
      return normalized;
    }
    case 'playground': {
      const normalized: PlaygroundComponentState = {
        ...createComponentState(id, 'playground'),
        ...(state as Partial<PlaygroundComponentState>),
        id,
        type: 'playground',
        lastAccessed,
      };
      return normalized;
    }
    case 'skill':
    default: {
      const partialSkill = state as Partial<SkillComponentState>;
      const normalized: SkillComponentState = {
        ...createComponentState(id, 'skill'),
        ...partialSkill,
        id,
        type: 'skill',
        lastAccessed,
        instances: partialSkill.instances ?? {},
        numSolved: partialSkill.numSolved ?? 0,
        currentInstanceId: partialSkill.currentInstanceId ?? undefined,
      };
      return normalized;
    }
  }
}
