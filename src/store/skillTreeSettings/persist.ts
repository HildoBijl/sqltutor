/**
 * Persistence helpers for the skill tree settings slice.
 */

import type { SkillTreeSettingsState } from './types';
import {
  LEGACY_SKILL_TREE_HISTORY_KEY,
  SKILL_TREE_HISTORY_KEY,
} from './constants';

const DEFAULT_SKILL_TREE_HISTORY = ['sql'];

function normalizeHistory(raw: unknown): string[] {
  const result: string[] = [];
  const seen = new Set<string>();

  if (Array.isArray(raw)) {
    for (const value of raw) {
      if (typeof value !== 'string') {
        continue;
      }
      const id = value.trim();
      if (!id || seen.has(id)) {
        continue;
      }
      seen.add(id);
      result.push(id);
    }
  }

  if (!seen.has('sql')) {
    result.unshift('sql');
  }

  return result.length > 0 ? result : [...DEFAULT_SKILL_TREE_HISTORY];
}

function readLegacyHistoryFromStorage(): string[] | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const keys = [SKILL_TREE_HISTORY_KEY, LEGACY_SKILL_TREE_HISTORY_KEY];
  for (const key of keys) {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      continue;
    }

    try {
      return normalizeHistory(JSON.parse(raw));
    } catch {
      // Ignore malformed history and try the next key.
    }
  }

  return null;
}

export interface PersistedSkillTreeSettings {
  goalNodeID?: Record<string, string | null>;
  hideLegend?: boolean;
  hasAccessedPlanningMode?: boolean;
  planningMode?: Record<string, boolean>;
  lastVisitedSkillTrees?: string[];
}

export function partializeSkillTreeSettings(state: SkillTreeSettingsState): PersistedSkillTreeSettings {
  return {
    goalNodeID: state.goalNodeID,
    hideLegend: state.hideLegend,
    hasAccessedPlanningMode: state.hasAccessedPlanningMode,
    planningMode: state.planningMode,
    lastVisitedSkillTrees: state.lastVisitedSkillTrees,
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

  if (persisted.lastVisitedSkillTrees) {
    state.lastVisitedSkillTrees = normalizeHistory(persisted.lastVisitedSkillTrees);
    return;
  }

  const legacyHistory = readLegacyHistoryFromStorage();
  if (legacyHistory) {
    state.lastVisitedSkillTrees = legacyHistory;
  }
}
