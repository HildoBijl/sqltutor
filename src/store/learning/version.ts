/**
 * Versioning and migrations for the learning store persistence payload.
 */

import type { PersistedLearning } from './persist';
import { asRecord, runMigrations } from '../utils';

export const LEARNING_STORE_VERSION = 2;

/** Migrations: index i transforms payload from version i to i+1. */
const MIGRATIONS: Array<(state: PersistedLearning) => PersistedLearning> = [
  // v0 -> v1: no-op (initial versioned payload)
  (state) => state,
  // v1 -> v2: rename persisted "components" to "modules"
  (state) => {
    const safeState = asRecord(state) as PersistedLearning & { components?: unknown };
    if (safeState.modules) {
      return state;
    }
    const legacyComponents = asRecord(safeState.components);
    if (Object.keys(legacyComponents).length === 0) {
      return {
        ...state,
        modules: {},
      };
    }
    return {
      ...state,
      modules: legacyComponents as PersistedLearning['modules'],
    };
  },
];

export function migrateLearningPersistedState(
  persistedState: unknown,
  fromVersion: number,
): PersistedLearning {
  const state = asRecord(persistedState) as PersistedLearning;
  return runMigrations(state, fromVersion, LEARNING_STORE_VERSION, MIGRATIONS);
}
