import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { GetState, SetState } from './utils';
import { type AppState, type InitialAppState, type FullAppState, slices } from './slices';

// On state changes, bump the version number and add a migration to the respective slice.
export const STORE_VERSION = 1;

// Helper function to set up the initial state of zustand.
function buildInitialState(set: any, get: any): InitialAppState {
  const state: InitialAppState = { initial: {} };
  for (const key of Object.keys(slices) as (keyof typeof slices)[]) {
    const slice = slices[key];
    type State = typeof slice.initialState;

    // Define setters and getters for the slice.
    const sliceSet: SetState<State> = (updater) => {
      set((fullState: AppState) => {
        const sliceState = fullState[key] as State;
        const updated = typeof updater === "function" ? updater(sliceState) : updater;
        return { [key]: { ...sliceState, ...updated } };
      });
    };
    const sliceGet: GetState<State> = () => get()[key] as State;

    // Set up the initial state.
    if (state.initial) { // Always true, but just for Typescript.
      state.initial[key] = {
        ...slice.initialState,
        ...slice.createActions?.(sliceSet, sliceGet as any),
      } as any;
    }
  }
  return state;
}

// The main app store giving all stored data for the user.
export const useAppStore = create<FullAppState>()(
  persist(
    (set, get) => ({
      ...buildInitialState(set, get),
    }),
    {
      name: "sqltutor-storage",
      version: STORE_VERSION,

      partialize: (state) => {
        const result: Record<string, unknown> = {};
        for (const key of Object.keys(slices) as (keyof typeof slices)[]) {
          const slice = slices[key];
          result[key] = slice.partialize(state[key] as any);
        }
        return result;
      },

      onRehydrateStorage: () => (state) => {
        if (!state) return; // Should never happen.

        // Hydrate each slice separately. Give the object to adjust, the state received from storage (a clone, so as not to adjust it) and the initial state including actions.
        for (const key of Object.keys(slices) as (keyof typeof slices)[]) {
          const slice = slices[key];
          slice.rehydrate?.(state[slice.key] as any, { ...(state[slice.key] || {}) }, state?.initial?.[slice.key] as any);
        }

        // Remove initialization, now that it's been implemented.
        delete state.initial;
        state.main?.setHasHydrated(true);
      },

      migrate: (persisted, version) => {
        const state = persisted as Record<string, unknown>;
        for (const key of Object.keys(slices) as (keyof typeof slices)[]) {
          const slice = slices[key];
          if (slice.migrate && key in state) {
            state[key] = slice.migrate(state[key] as any, version);
          }
        }
        return state;
      },
    }
  )
);
