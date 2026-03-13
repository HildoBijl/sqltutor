/**
 * Versioning and migrations for the learning store persistence payload.
 */

import type { PersistedLearning } from './persist';
import type { ComponentState } from './types';

export const LEARNING_STORE_VERSION = 1;

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

function sanitizePersistedLearning(value: unknown): PersistedLearning {
  const state = asRecord(value);
  const components = asRecord(state.components);

  const safeComponents = Object.fromEntries(
    Object.entries(components).filter(
      ([id, component]) =>
        id.length > 0 &&
        Boolean(component) &&
        typeof component === 'object' &&
        !Array.isArray(component),
    ),
  ) as Record<string, Partial<ComponentState> | ComponentState>;

  return Object.keys(safeComponents).length > 0
    ? { components: safeComponents }
    : {};
}

export function migrateLearningPersistedState(
  persistedState: unknown,
  fromVersion: number,
): PersistedLearning {
  let state = asRecord(persistedState);
  const sourceVersion = Number.isFinite(fromVersion) ? fromVersion : 0;

  if (sourceVersion < LEARNING_STORE_VERSION) {
    const migrationsToRun = MIGRATIONS.slice(sourceVersion, LEARNING_STORE_VERSION);
    for (const migrate of migrationsToRun) {
      state = migrate(state);
    }
  }

  return sanitizePersistedLearning(state);
}
