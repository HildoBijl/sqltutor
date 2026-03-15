/**
 * Versioning and migrations for the learning store persistence payload.
 */

import type { PersistedLearning } from './persist';
import { asRecord, runMigrations } from '../utils';

export const LEARNING_STORE_VERSION = 1;

/** Migrations: index i transforms payload from version i to i+1. */
const MIGRATIONS: Array<(state: PersistedLearning) => PersistedLearning> = [
  // v0 -> v1: no-op (initial versioned payload)
  (state) => state,
];

export function migrateLearningPersistedState(
  persistedState: unknown,
  fromVersion: number,
): PersistedLearning {
  const state = asRecord(persistedState) as PersistedLearning;
  return runMigrations(state, fromVersion, LEARNING_STORE_VERSION, MIGRATIONS);
}
