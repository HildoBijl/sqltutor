/**
 * Settings store slice.
 */

import type { SettingsState, Theme } from './types';
import type { SetState } from '../utils';

export type { SettingsState } from './types';
import type { DatasetSize } from '@/mockData/types';

export const initialSettingsState: SettingsState = {
  currentTheme: 'light',
  hideStories: true,
  practiceDatasetSize: 'full',
  goalNodeID: {},
  hasAccessedPlanningMode: false,
};

export interface SettingsActions {
  toggleHideStories: () => void;
  setTheme: (theme: Theme) => void;
  setPracticeDatasetSize: (size: DatasetSize) => void;
  setGoalNodeID: (treeId: string, id: string | null) => void;
  setHasAccessedPlanningMode: (accessed: boolean) => void;
}

export function createSettingsActions(set: SetState<SettingsState>): SettingsActions {
  return {
    toggleHideStories: () => set((state) => ({ hideStories: !state.hideStories })),
    setTheme: (theme) => set({ currentTheme: theme }),
    setPracticeDatasetSize: (size) => set({ practiceDatasetSize: size }),
    setGoalNodeID: (treeId, id) => set((state) => ({
      goalNodeID: { ...state.goalNodeID, [treeId]: id },
    })),
    setHasAccessedPlanningMode: (accessed) => set({ hasAccessedPlanningMode: accessed }),
  };
}
