/**
 * Settings store types.
 */

import type { DatasetSize } from '@sqlvalley/mock-data/types';

export type Theme = 'light' | 'dark';

export interface SettingsState {
  currentTheme: Theme;
  hideStories: boolean;
  practiceDatasetSize: DatasetSize;
}
