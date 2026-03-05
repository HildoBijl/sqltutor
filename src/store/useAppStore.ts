import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { slice as mainSlice } from './main';
import { slice as settingsSlice } from './settings';
import { slice as learningSlice } from './learning';
import { AppState } from './types';

// On state changes, bump the version number and add a migration to the respective slice.
export const STORE_VERSION = 1;

// Collect slices.
const slices = [mainSlice, settingsSlice, learningSlice] as const;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => {
      const state = {} as AppState;
      for (const slice of slices) {
        state[slice.key] = {
          ...slice.initialState,
          ...slice.createActions?.(set, get),
        };
      }
      console.log(state)
      return state;
    },
    {
      name: "sqltutor-storage",
      version: STORE_VERSION,

      partialize: (state) => {
        const result: Record<string, unknown> = {};
        for (const slice of slices) {
          result[slice.key] = slice.partialize(state[slice.key]);
        }
        return result;
      },

      onRehydrateStorage: () => (state) => {
        console.log("Raw localStorage:", localStorage.getItem("sqltutor-storage"));
        console.log('Rehydrate received:', state, state?.settings, state?.currentTheme, state?.settings?.currentTheme)
        if (!state) return;
        for (const slice of slices) {
          slice.rehydrate?.(state[slice.key]);
        }
        console.log(state)
        state.main.setHasHydrated(true);
      },

      migrate: (persisted, version) => {
        const state = persisted as Record<string, unknown>;
        for (const slice of slices) {
          if (slice.migrate && slice.key in state) {
            state[slice.key] = slice.migrate(state[slice.key], version);
          }
        }
        return state;
      },
    },
  ),
);
