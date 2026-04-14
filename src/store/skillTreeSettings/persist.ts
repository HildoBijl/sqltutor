/**
 * Persistence helpers for the skill tree settings slice.
 */

import type { SkillTreeSettingsState } from './types';

export interface PersistedSkillTreeSettings {
  goalNodeID?: Record<string, string | null>;
  hideLegend?: boolean;
  hasAccessedPlanningMode?: boolean;
  planningMode?: Record<string, boolean>;
}

export function partializeSkillTreeSettings(state: SkillTreeSettingsState): PersistedSkillTreeSettings {
  return {
    goalNodeID: state.goalNodeID,
    hideLegend: state.hideLegend,
    hasAccessedPlanningMode: state.hasAccessedPlanningMode,
    planningMode: state.planningMode
  };
}

export function rehydrateSkillTreeSettings(
  state: SkillTreeSettingsState,
  persisted: PersistedSkillTreeSettings | undefined,
): void {
  if (!persisted) return;

  if (persisted.goalNodeID) {
    state.goalNodeID = persisted.goalNodeID;
  }
  if (typeof persisted.hideLegend === 'boolean') {
    state.hideLegend = persisted.hideLegend;
  }
  if (typeof persisted.hasAccessedPlanningMode === 'boolean') {
    state.hasAccessedPlanningMode = persisted.hasAccessedPlanningMode;
  }

  if (persisted.planningMode && typeof persisted.planningMode === 'object') {
    state.planningMode = persisted.planningMode;
  }
}
