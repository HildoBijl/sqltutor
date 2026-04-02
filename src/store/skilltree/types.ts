/**
 * Skill tree settings store types.
 */

export interface SkillTreeSettingsState {
  goalNodeID: Record<string, string | null>;
  hideLegend: boolean;
  hasAccessedPlanningMode: boolean;
}
