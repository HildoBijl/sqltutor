/**
 * Assembled app store.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createMainActions, initialMainState } from './main/slice';
import { createSettingsActions, initialSettingsState } from './settings/slice';
import {
  createLearningActions,
  initialLearningState,
  normalizeComponentState,
} from './learning/slice';
import { migrateState, STORE_VERSION } from './version';
import type { MainState, MainActions } from './main/slice';
import type { SettingsState, SettingsActions } from './settings/slice';
import type { LearningActions } from './learning/slice';
import type { ComponentState } from './learning/types';

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
        (fn) => set((state) => fn({ components: state.components })),
        () => ({ components: get().components }),
      ),
    }),
    {
      name: 'sqltutor-storage',
      partialize: (state) => ({
        version: STORE_VERSION,
        components: state.components,
        currentTheme: state.currentTheme,
        hideStories: state.hideStories,
        practiceDatasetSize: state.practiceDatasetSize,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const migrated = migrateState({
            version: (state as { version?: number }).version,
            components: state.components,
            currentTheme: state.currentTheme,
            hideStories: state.hideStories,
            practiceDatasetSize: state.practiceDatasetSize,
          });

          state.components = Object.fromEntries(
            Object.entries(migrated.components ?? {}).map(([id, value]) => [
              id,
              normalizeComponentState(id, value as Partial<ComponentState> | undefined),
            ]),
          );
          state.currentTheme = (migrated.currentTheme as 'light' | 'dark') ?? state.currentTheme;
          state.hideStories = migrated.hideStories ?? state.hideStories;
          state.practiceDatasetSize = (migrated.practiceDatasetSize as 'full' | 'small') ?? state.practiceDatasetSize;

          state.setHasHydrated(true);
        }
      },
    },
  ),
);
