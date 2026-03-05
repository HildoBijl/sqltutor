import { StoreSlice } from '../utils';

export interface MainState {
  _hasHydrated: boolean;
}

export interface MainPersisted {}

export interface MainActions {
  setHasHydrated: (hasHydrated: boolean) => void;
}

export type MainSlice = StoreSlice<MainState, MainPersisted, MainActions>
