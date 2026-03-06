import type { StoreSlice } from './utils';
import { slice as mainSlice } from './main';
import { slice as settingsSlice } from './settings';
import { slice as learningSlice } from './learning';

// Collect slices.
export const slices = {
  main: mainSlice,
  settings: settingsSlice,
  learning: learningSlice,
} as const;

export type SliceRegistry = { -readonly [K in keyof typeof slices]: typeof slices[K] };
export type SliceState<S> = S extends StoreSlice<infer State, any, any> ? State : never;
export type SlicePersisted<S> = S extends StoreSlice<any, infer Persisted, any> ? Persisted : never;
export type SliceActions<S> = S extends StoreSlice<any, any, infer Actions> ? Actions : never;

export type AppState = {
  [K in keyof SliceRegistry]: SliceState<SliceRegistry[K]> & SliceActions<SliceRegistry[K]>;
};
export type InitialAppState = {
  initial?: { [K in keyof SliceRegistry]?: SliceState<SliceRegistry[K]> & SliceActions<SliceRegistry[K]> };
};
export type FullAppState = InitialAppState & Partial<AppState>;
