/**
 * Settings store slice.
 */

import type { SettingsState, Theme } from './types';

export type { SettingsState } from './types';
import type { DatasetSize } from '@/mockData/types';

export const initialSettingsState: SettingsState = {
  currentTheme: 'light',
  hideStories: true,
  practiceDatasetSize: 'full',
};

export interface SettingsActions {
  toggleHideStories: () => void;
  setTheme: (theme: Theme) => void;
  setPracticeDatasetSize: (size: DatasetSize) => void;
}

type SetState<T> = (partial: Partial<T> | ((state: T) => Partial<T>)) => void;

export function createSettingsActions(set: SetState<SettingsState>): SettingsActions {
  return {
    toggleHideStories: () => set((state) => ({ hideStories: !state.hideStories })),
    setTheme: (theme) => set({ currentTheme: theme }),
    setPracticeDatasetSize: (size) => set({ practiceDatasetSize: size }),
  };
}
