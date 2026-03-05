import type { DatasetSize } from '@/mockData/types';

import { StoreSlice } from '../utils';

export type Theme = 'light' | 'dark';

export interface SettingsState {
  currentTheme: Theme;
  hideStories: boolean;
  practiceDatasetSize: DatasetSize;
}

export interface SettingsPersisted {
  currentTheme?: Theme;
  hideStories?: boolean;
  practiceDatasetSize?: DatasetSize;
}

export interface SettingsActions {
  toggleHideStories: () => void;
  setTheme: (theme: Theme) => void;
  setPracticeDatasetSize: (size: DatasetSize) => void;
}

export type SettingsSlice = StoreSlice<SettingsState, SettingsPersisted, SettingsActions>
