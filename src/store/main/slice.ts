import type { SetState } from '../utils';

import type { MainSlice, MainState, MainPersisted, MainActions } from './types';

export const initialState: MainState = {
  _hasHydrated: false,
};

export function createActions(set: SetState<MainState>): MainActions {
  return {
    setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),
  };
}

export function partialize(): MainPersisted {
  return {};
}

export function rehydrate(): void {}

export function migrate(state: MainPersisted, _version: number): MainPersisted {
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
