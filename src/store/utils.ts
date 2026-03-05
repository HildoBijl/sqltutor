export type SetState<T> = (update: Partial<T> | ((state: T) => Partial<T>)) => void;
export type GetState<T> = () => T;

export type SliceKey = "main" | "settings" | "learning";

export interface StoreSlice<State, PersistedState, Actions> {
  key: SliceKey,
  initialState: State,
  createActions?: (set: SetState<State>, get: GetState<State>) => Actions,
  partialize: (state: State) => PersistedState,
  migrate?: (state: PersistedState, version: number) => PersistedState,
  rehydrate?: (state: State) => void,
}
