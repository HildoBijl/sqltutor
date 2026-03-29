/**
 * Skill tree settings store types.
 */

export interface SkillTreeSettingsState {
  goalNodeID: Record<string, string | null>;
  hasAcessedSkillTree: boolean;
  hideLegend: boolean;
  hasAccessedPlanningMode: boolean;
}
