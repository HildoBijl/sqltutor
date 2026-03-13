/**
 * Versioning and migrations for the settings store persistence payload.
 */

import type { PersistedSettings } from './persist';
import type { DatasetSize } from '@/mockData/types';

export const SETTINGS_STORE_VERSION = 1;

type MigrationState = Record<string, unknown>;

/** Migrations: index i transforms payload from version i to i+1. */
const MIGRATIONS: Array<(state: MigrationState) => MigrationState> = [
  // v0 -> v1: no-op (initial versioned payload)
  (state) => state,
];

function asRecord(value: unknown): MigrationState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return { ...(value as MigrationState) };
}

function sanitizeDatasetSize(value: unknown): DatasetSize | undefined {
  if (value === 'full' || value === 'small') {
    return value;
  }
  return undefined;
}

function sanitizeGoalNodeID(
  value: unknown,
): Record<string, string | null> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  const safeEntries = Object.entries(value).filter(
    ([treeId, goalNodeId]) =>
      treeId.length > 0 &&
      (typeof goalNodeId === 'string' || goalNodeId === null),
  );

  return Object.fromEntries(safeEntries) as Record<string, string | null>;
}

function sanitizePersistedSettings(value: unknown): PersistedSettings {
  const state = asRecord(value);

  return {
    currentTheme:
      state.currentTheme === 'light' || state.currentTheme === 'dark'
        ? state.currentTheme
        : undefined,
    hideStories:
      typeof state.hideStories === 'boolean' ? state.hideStories : undefined,
    practiceDatasetSize: sanitizeDatasetSize(state.practiceDatasetSize),
    goalNodeID: sanitizeGoalNodeID(state.goalNodeID),
    hasAccessedPlanningMode:
      typeof state.hasAccessedPlanningMode === 'boolean'
        ? state.hasAccessedPlanningMode
        : undefined,
  };
}

export function migrateSettingsPersistedState(
  persistedState: unknown,
  fromVersion: number,
): PersistedSettings {
  let state = asRecord(persistedState);
  const sourceVersion = Number.isFinite(fromVersion) ? fromVersion : 0;

  if (sourceVersion < SETTINGS_STORE_VERSION) {
    const migrationsToRun = MIGRATIONS.slice(sourceVersion, SETTINGS_STORE_VERSION);
    for (const migrate of migrationsToRun) {
      state = migrate(state);
    }
  }

  return sanitizePersistedSettings(state);
}
