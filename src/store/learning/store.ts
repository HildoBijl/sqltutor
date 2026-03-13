/**
 * Persisted learning store.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  migrateLegacyStorageIfNeeded,
  LEARNING_STORAGE_KEY,
} from '../legacyMigration';

migrateLegacyStorageIfNeeded();

interface LearningHydrationState {
  _hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export interface LearningStoreState
  extends LearningState,
    LearningActions,
    LearningHydrationState {}

export const useLearningStore = create<LearningStoreState>()(
  persist(
    (set, get) => ({
      ...initialLearningState,
      _hasHydrated: false,
      ...createLearningActions(
        (updater) => set((state) => updater(state as LearningState)),
        () => get() as LearningState,
      ),
      setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),
    }),
    {
      name: LEARNING_STORAGE_KEY,
      version: LEARNING_STORE_VERSION,
      migrate: (persistedState, version) =>
        migrateLearningPersistedState(persistedState, version),
      partialize: (state): PersistedLearning => partializeLearning(state),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Failed to rehydrate learning store:', error);
        }
        if (state) {
          rehydrateLearning(state, partializeLearning(state));
          state.setHasHydrated(true);
          return;
        }
        useLearningStore.setState({ _hasHydrated: true });
      },
    },
  ),
);
