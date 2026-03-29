/**
 * Persistence helpers for the settings slice.
 */

import type { SettingsState, Theme } from './types';
import type { DatasetSize } from '@/mockData/types';

export interface PersistedSettings {
  currentTheme?: Theme;
  hideStories?: boolean;
  practiceDatasetSize?: DatasetSize;
  goalNodeID?: Record<string, string | null>;
  hasAccessedPlanningMode?: boolean;
  hasAcessedSkillTree?: boolean;
  hideLegend?: boolean;
}

export function partializeSettings(state: SettingsState): PersistedSettings {
  return {
    currentTheme: state.currentTheme,
    hideStories: state.hideStories,
    practiceDatasetSize: state.practiceDatasetSize,
    goalNodeID: state.goalNodeID,
    hasAccessedPlanningMode: state.hasAccessedPlanningMode,
    hasAcessedSkillTree: state.hasAcessedSkillTree,
    hideLegend: state.hideLegend,
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
  if (persisted.goalNodeID) {
    state.goalNodeID = persisted.goalNodeID;
  }
  if (typeof persisted.hasAccessedPlanningMode === 'boolean') {
    state.hasAccessedPlanningMode = persisted.hasAccessedPlanningMode;
  }
  if (typeof persisted.hasAcessedSkillTree === 'boolean') {
    state.hasAcessedSkillTree = persisted.hasAcessedSkillTree;
  }
  if (typeof persisted.hideLegend === 'boolean') {
    state.hideLegend = persisted.hideLegend;
  }
}

