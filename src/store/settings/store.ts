/**
 * Persisted settings store.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  createSettingsActions,
  initialSettingsState,
  type SettingsActions,
  type SettingsState,
} from './slice';
import { partializeSettings, type PersistedSettings } from './persist';
import {
  migrateSettingsPersistedState,
  SETTINGS_STORE_VERSION,
} from './version';
import {
  migrateLegacyStorageIfNeeded,
  SETTINGS_STORAGE_KEY,
} from '../legacyMigration';

migrateLegacyStorageIfNeeded();

interface SettingsHydrationState {
  _hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export interface SettingsStoreState
  extends SettingsState,
    SettingsActions,
    SettingsHydrationState {}

export const useSettingsStore = create<SettingsStoreState>()(
  persist(
    (set) => ({
      ...initialSettingsState,
      _hasHydrated: false,
      ...createSettingsActions(set as Parameters<typeof createSettingsActions>[0]),
      setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),
    }),
    {
      name: SETTINGS_STORAGE_KEY,
      version: SETTINGS_STORE_VERSION,
      migrate: (persistedState, version) =>
        migrateSettingsPersistedState(persistedState, version),
      partialize: (state): PersistedSettings => partializeSettings(state),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Failed to rehydrate settings store:', error);
        }
        if (state) {
          state.setHasHydrated(true);
          return;
        }
        useSettingsStore.setState({ _hasHydrated: true });
      },
    },
  ),
);
