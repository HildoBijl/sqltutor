/**
 * Assembled app store.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createMainActions, initialMainState } from './main/slice';
import { createSettingsActions, initialSettingsState } from './settings/slice';
import { createLearningActions, initialLearningState } from './learning/slice';
import { partializeMain, rehydrateMain } from './main/persist';
import { partializeSettings, rehydrateSettings } from './settings/persist';
import { partializeLearning, rehydrateLearning } from './learning/persist';
import { migrateState, STORE_VERSION, type PersistedState } from './version';
import type { MainState, MainActions } from './main/slice';
import type { SettingsState, SettingsActions } from './settings/slice';
import type { LearningActions } from './learning/slice';

const APP_STORAGE_KEY = 'sqlvalley-storage';
const LEGACY_APP_STORAGE_KEY = 'sqltutor-storage';

const migrateLegacyAppStorage = () => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const existing = window.localStorage.getItem(APP_STORAGE_KEY);
    if (existing !== null) {
      return;
    }

    const legacy = window.localStorage.getItem(LEGACY_APP_STORAGE_KEY);
    if (legacy !== null) {
      window.localStorage.setItem(APP_STORAGE_KEY, legacy);
    }
  } catch (error) {
    console.warn('Failed to migrate legacy app storage.', error);
  }
};

migrateLegacyAppStorage();

export interface AppState
  extends MainState,
    MainActions,
    SettingsState,
    SettingsActions,
    LearningActions {
  components: Record<string, import('./learning/types').ComponentState>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialMainState,
      ...initialSettingsState,
      ...initialLearningState,
      ...createMainActions(set as Parameters<typeof createMainActions>[0]),
      ...createSettingsActions(set as Parameters<typeof createSettingsActions>[0]),
      ...createLearningActions(
        (fn) => set((state) => fn(state as any)),
        () => get() as any,
      ),
    }),
    {
      name: APP_STORAGE_KEY,
      partialize: (state) => ({
        version: STORE_VERSION,
        main: partializeMain(state),
        settings: partializeSettings(state),
        learning: partializeLearning(state),
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        const migrated = migrateState({
          version: (state as { version?: number }).version,
          main: (state as unknown as PersistedState).main,
          settings: (state as unknown as PersistedState).settings,
          learning: (state as unknown as PersistedState).learning,
        });

        rehydrateMain(state, migrated.main);
        rehydrateSettings(state, migrated.settings);
        rehydrateLearning(state, migrated.learning);

        state.setHasHydrated(true);
      },
    },
  ),
);
