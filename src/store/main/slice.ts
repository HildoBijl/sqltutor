import type { SetState } from '../utils';

import type { MainSlice, MainState, MainPersisted, MainActions } from './types';

const initialState: MainState = {
  _hasHydrated: false,
};

function createActions(set: SetState<MainState>): MainActions {
  return {
    setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),
  };
}

function partialize(): MainPersisted {
  return {};
}

function rehydrate(state: MainPersisted, storedState: MainPersisted, initialState: MainState & MainActions): void {
  Object.assign(state, initialState);
  Object.assign(state, storedState);
}

function migrate(state: MainPersisted, _version: number): MainPersisted {
  return state
}

export const slice: MainSlice = {
  key: 'main',
  initialState,
  createActions,
  partialize,
  rehydrate,
  migrate,
}
