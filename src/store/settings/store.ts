/**
 * Persisted settings store.
 */

import {
  createSettingsActions,
  initialSettingsState,
  type SettingsActions,
  type SettingsState,
} from './slice';
import {
  partializeSettings,
  rehydrateSettings,
  type PersistedSettings,
} from './persist';
import {
  migrateSettingsPersistedState,
  SETTINGS_STORE_VERSION,
} from './version';
import { migrateLegacyStorageIfNeeded } from '../legacyMigration';
import { createStore, type HydrationState } from '../utils';
import {
  LEGACY_SETTINGS_STORAGE_KEY,
  SETTINGS_STORAGE_KEY,
} from './constants';

export interface SettingsStoreState
  extends SettingsState,
    SettingsActions,
    HydrationState {}

export const useSettingsStore = createStore<
  SettingsState,
  SettingsActions,
  PersistedSettings
>({
  initialState: initialSettingsState,
  createActions: (set) => createSettingsActions(set),
  storageKey: SETTINGS_STORAGE_KEY,
  version: SETTINGS_STORE_VERSION,
  migrate: migrateSettingsPersistedState,
  partialize: partializeSettings,
  rehydrate: rehydrateSettings,
  prepare: () =>
    migrateLegacyStorageIfNeeded({
      domain: 'settings',
      targetKey: SETTINGS_STORAGE_KEY,
      legacySplitKey: LEGACY_SETTINGS_STORAGE_KEY,
      targetVersion: SETTINGS_STORE_VERSION,
    }),
});
