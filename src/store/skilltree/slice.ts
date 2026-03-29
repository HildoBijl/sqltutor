/**
 * Skill tree settings store slice.
 */

import type { SkillTreeSettingsState } from './types';
import type { SetState } from '../utils';

export type { SkillTreeSettingsState } from './types';

export const initialSkillTreeSettingsState: SkillTreeSettingsState = {
  goalNodeID: {},
  hasAcessedSkillTree: false,
  hideLegend: false,
  hasAccessedPlanningMode: false,
};

export interface SkillTreeSettingsActions {
  setGoalNodeID: (treeId: string, id: string | null) => void;
  setHasAcessedSkillTree: (accessed: boolean) => void;
  setHideLegend: (hide: boolean) => void;
  setHasAccessedPlanningMode: (accessed: boolean) => void;
}

export function createSkillTreeSettingsActions(set: SetState<SkillTreeSettingsState>): SkillTreeSettingsActions {
  return {
    setGoalNodeID: (treeId, id) => set((state) => ({
      goalNodeID: { ...state.goalNodeID, [treeId]: id },
    })),
    setHasAcessedSkillTree(accessed) {
      set({ hasAcessedSkillTree: accessed });
    },
    setHideLegend: (hide) => set({ hideLegend: hide }),
    setHasAccessedPlanningMode: (accessed) => set({ hasAccessedPlanningMode: accessed }),
  };
}
