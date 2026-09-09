// Interface for handling skill tree state in memory, without persistent storage.
export interface SkillTreeMemoryStoreAPI {
    planningMode?: boolean;
    setPlanningMode?: (value: boolean) => void;
    goalNodeId?: string | null;
    setGoalNodeId?: (id: string | null) => void;
    hasAccessedPlanningMode?: boolean;
    setHasAccessedPlanningMode?: (value: boolean) => void;
    hideLegend?: boolean;
    setHideLegend?: (value: boolean) => void;
    hasSeenSkillTreeIntro?: boolean;
    setHasSeenSkillTreeIntro?: (seen: boolean) => void;
    // False while a persisted store is still rehydrating, so the intro is not
    // shown to someone who has already seen it. Absent means ready.
    hasHydrated?: boolean;
}
