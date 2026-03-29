/**
 * Settings store types.
 */

import type { DatasetSize } from '@/mockData/types';

export type Theme = 'light' | 'dark';

export interface SettingsState {
  currentTheme: Theme;
  hideStories: boolean;
  practiceDatasetSize: DatasetSize;
  goalNodeID: Record<string, string | null>;
  hasAccessedPlanningMode: boolean; 
  hasAcessedSkillTree: boolean;
  hideLegend: boolean;
}
