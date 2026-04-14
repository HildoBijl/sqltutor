/**
 * Versioning and migrations for the skill tree settings store persistence payload.
 */

import type { PersistedSkillTreeSettings } from './persist';
import { asRecord, runMigrations } from '../utils';

export const SKILL_TREE_SETTINGS_STORE_VERSION = 1;

/** Migrations: index i transforms payload from version i to i+1. */
const MIGRATIONS: Array<(state: PersistedSkillTreeSettings) => PersistedSkillTreeSettings> = [
  // v0 -> v1: no-op (initial versioned payload)
  (state) => state,
];

export function migrateSkillTreeSettingsPersistedState(
  persistedState: unknown,
  fromVersion: number,
): PersistedSkillTreeSettings {
  const state = asRecord(persistedState) as PersistedSkillTreeSettings;
  return runMigrations(state, fromVersion, SKILL_TREE_SETTINGS_STORE_VERSION, MIGRATIONS);
}
