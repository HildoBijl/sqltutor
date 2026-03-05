/**
 * Persistence helpers for the main slice.
 */

import type { MainState } from './types';

export interface PersistedMain {}

export function partializeMain(_state: MainState): PersistedMain {
  return {};
}

export function rehydrateMain(_state: MainState, _persisted?: PersistedMain): void {
}

