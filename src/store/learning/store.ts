/**
 * Persisted learning store.
 */

import {
  createLearningActions,
  initialLearningState,
  type LearningActions,
} from './slice';
import { partializeLearning, rehydrateLearning, type PersistedLearning } from './persist';
import type { LearningState } from './types';
import {
  migrateLearningPersistedState,
  LEARNING_STORE_VERSION,
} from './version';
import {
  LEGACY_LEARNING_STORAGE_KEY,
  migrateLegacyStorageIfNeeded,
} from '../legacyMigration';
import { createStore, type HydrationState } from '../utils';

export const LEARNING_STORAGE_KEY = 'sqlvalley-learning';

export interface LearningStoreState
  extends LearningState,
    LearningActions,
    HydrationState {}

export const useLearningStore = createStore<
  LearningState,
  LearningActions,
  PersistedLearning
>({
  initialState: initialLearningState,
  createActions: (set, get) => createLearningActions(set, get),
  storageKey: LEARNING_STORAGE_KEY,
  version: LEARNING_STORE_VERSION,
  migrate: migrateLearningPersistedState,
  partialize: partializeLearning,
  rehydrate: rehydrateLearning,
  prepare: () =>
    migrateLegacyStorageIfNeeded({
      domain: 'learning',
      targetKey: LEARNING_STORAGE_KEY,
      legacySplitKey: LEGACY_LEARNING_STORAGE_KEY,
      targetVersion: LEARNING_STORE_VERSION,
    }),
});
