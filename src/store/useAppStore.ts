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
      // Walk through the slices and set up initial states in the "initial" attribute of the state, to be hydrated in later.
      let state = { initial: {} };
      for (const slice of slices) {
        // Set up custom getters and setters to work within the respective state slice.
        const { key } = slice;
        const sliceSet = (updater: Partial<typeof slice.initialState> | ((state: typeof slice.initialState) => Partial<typeof slice.initialState>)) => {
          set((fullState) => {
            const sliceState = fullState[key] as typeof slice.initialState;
            const updatedSlice = typeof updater === "function" ? updater(sliceState) : updater;
            return { [key]: { ...sliceState, ...updatedSlice } };
          });
        };
        const sliceGet = () => get()[key] as typeof slice.initialState;
        state.initial[key] = {
          ...slice.initialState,
          ...slice.createActions?.(sliceSet, sliceGet),
        };
      }
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
        if (!state) return;
        // Hydrate each slice separately. Give the object to adjust, the state received from storage (a clone, so as not to adjust it) and the initial state including actions.
        for (const slice of slices) {
          slice.rehydrate?.(state[slice.key], { ...state[slice.key] }, state.initial[slice.key]);
        }
        delete state.initial; // Remove initialization, now that it's been implemented.
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
