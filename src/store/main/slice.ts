/**
 * Main store slice.
 */

import type { MainState } from './types';

export type { MainState } from './types';
export const initialMainState: MainState = {
  _hasHydrated: false,
};

export interface MainActions {
  setHasHydrated: (hasHydrated: boolean) => void;
}

type SetState<T> = (partial: Partial<T> | ((state: T) => Partial<T>)) => void;

export function createMainActions(set: SetState<MainState>): MainActions {
  return {
    setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),
  };
}
