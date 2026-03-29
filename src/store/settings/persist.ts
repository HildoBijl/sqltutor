/**
 * Persistence helpers for the settings slice.
 */

import type { SettingsState, Theme } from './types';
import type { DatasetSize } from '@/mockData/types';

export interface PersistedSettings {
  currentTheme?: Theme;
  hideStories?: boolean;
  practiceDatasetSize?: DatasetSize;
}

export function partializeSettings(state: SettingsState): PersistedSettings {
  return {
    currentTheme: state.currentTheme,
    hideStories: state.hideStories,
    practiceDatasetSize: state.practiceDatasetSize,
  };
}

export function rehydrateSettings(
  state: SettingsState,
  persisted: PersistedSettings | undefined,
): void {
  if (!persisted) return;

  if (persisted.currentTheme) {
    state.currentTheme = persisted.currentTheme;
  }
  if (typeof persisted.hideStories === 'boolean') {
    state.hideStories = persisted.hideStories;
  }
  if (persisted.practiceDatasetSize) {
    state.practiceDatasetSize = persisted.practiceDatasetSize;
  }
}

