/**
 * Skill tree settings store slice.
 */

import type { SkillTreeSettingsState } from './types';
import type { SetState } from '../utils';

export type { SkillTreeSettingsState } from './types';

export const initialSkillTreeSettingsState: SkillTreeSettingsState = {
  goalNodeID: {},
  hideLegend: false,
  hasAccessedPlanningMode: false,
  planningMode: {},
  lastVisitedSkillTrees: ['sql'],
};

export interface SkillTreeSettingsActions {
  setGoalNodeID: (treeId: string, id: string | null) => void;
  setHideLegend: (hide: boolean) => void;
  setHasAccessedPlanningMode: (accessed: boolean) => void;
  setPlanningMode: (treeId: string, planningMode: boolean) => void;
  markSkillTreeVisited: (treeId: string) => void;
}

export function createSkillTreeSettingsActions(set: SetState<SkillTreeSettingsState>): SkillTreeSettingsActions {
  return {
    setGoalNodeID: (treeId, id) => set((state) => ({
      goalNodeID: { ...state.goalNodeID, [treeId]: id },
    })),
    setHideLegend: (hide) => set({ hideLegend: hide }),
    setHasAccessedPlanningMode: (accessed) => set({ hasAccessedPlanningMode: accessed }),
    setPlanningMode: (treeId, planningMode) => set((state) => ({
      planningMode: { ...state.planningMode, [treeId]: planningMode },
    })),
    markSkillTreeVisited: (treeId) => {
      const normalizedTreeId = treeId.trim();
      if (!normalizedTreeId) {
        return;
      }

      set((state) => ({
        lastVisitedSkillTrees: [
          normalizedTreeId,
          ...state.lastVisitedSkillTrees.filter((id) => id !== normalizedTreeId),
        ],
      }));
    },
  };
}
