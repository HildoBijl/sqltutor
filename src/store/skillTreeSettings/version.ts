/**
 * Versioning and migrations for the skill tree settings store persistence payload.
 */

import type { PersistedSkillTreeSettings } from './persist';
import { asRecord, runMigrations } from '../utils';

export const SKILL_TREE_SETTINGS_STORE_VERSION = 2;

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

  return result.length > 0 ? result : ['sql'];
}

/** Migrations: index i transforms payload from version i to i+1. */
const MIGRATIONS: Array<(state: PersistedSkillTreeSettings) => PersistedSkillTreeSettings> = [
  // v0 -> v1: no-op (initial versioned payload)
  (state) => state,
  // v1 -> v2: move skill-tree history into this store.
  (state) => ({
    ...state,
    lastVisitedSkillTrees: normalizeHistory(state.lastVisitedSkillTrees),
  }),
];

export function migrateSkillTreeSettingsPersistedState(
  persistedState: unknown,
  fromVersion: number,
): PersistedSkillTreeSettings {
  const state = asRecord(persistedState) as PersistedSkillTreeSettings;
  return runMigrations(state, fromVersion, SKILL_TREE_SETTINGS_STORE_VERSION, MIGRATIONS);
}
