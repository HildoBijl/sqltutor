import { useState, useCallback } from "react";
import { SkillTreeMemoryStoreAPI } from "../../types/SkillTreeMemoryStoreAPI";

const noop = () => {};

export function useSkillTreePlanning(memoryStoreAPI?: SkillTreeMemoryStoreAPI) {
  const planningMode = memoryStoreAPI?.planningMode ?? false;
  const setPlanningMode = memoryStoreAPI?.setPlanningMode ?? noop;

  const goalNodeId = memoryStoreAPI?.goalNodeId ?? null;
  const setGoalNodeId = memoryStoreAPI?.setGoalNodeId ?? noop;

  const hasAccessedPlanningMode = memoryStoreAPI?.hasAccessedPlanningMode ?? false;
  const setHasAccessedPlanningMode = memoryStoreAPI?.setHasAccessedPlanningMode ?? noop;

  const [goalProgress, setGoalProgress] = useState({
    completed: 0,
    total: 0,
    nextStep: null as string | null,
    nextStepId: null as string | null,
  });

  const [showPlanningModeModal, setShowPlanningModeModal] = useState(false);

  const handleGoalProgressChange = useCallback(
    (
      completed: number,
      total: number,
      nextStep: string | null,
      nextStepId: string | null,
    ) => {
      setGoalProgress({ completed, total, nextStep, nextStepId });
    },
    [],
  );

  const togglePlanningMode = () => {
    if (!planningMode && !hasAccessedPlanningMode) {
      setShowPlanningModeModal(true);
      setHasAccessedPlanningMode(true);
    }
    setPlanningMode(!planningMode);
  };

  return {
    planningMode,
    goalNodeId,
    setGoalNodeId,
    goalProgress,
    handleGoalProgressChange,
    showPlanningModeModal,
    setShowPlanningModeModal,
    togglePlanningMode,
  };
}
