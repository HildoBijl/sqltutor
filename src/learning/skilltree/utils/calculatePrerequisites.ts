import { useMemo, useEffect } from "react";
import { Module } from "@/curriculum";
import { getPrerequisites } from "./goalPath";

export function useGoalProgress(
  goalNodeId: string | null | undefined,
  moduleItems: Record<string, Module>,
  isCompleted: (id: string) => boolean,
  onGoalProgressChange?: (
    completedCount: number,
    totalCount: number,
    nextStepName: string | null,
    nextStepId: string | null,
  ) => void,
): Set<string> {
  const goalPrerequisites = useMemo(() => {
    if (goalNodeId) {
      return getPrerequisites(goalNodeId, moduleItems);
    }
    return new Set<string>();
  }, [goalNodeId, moduleItems]);

  useEffect(() => {
    if (onGoalProgressChange && goalNodeId) {
      const nodesOnPath = [...Array.from(goalPrerequisites), goalNodeId];
      const totalCount = nodesOnPath.length;
      const completedCount = nodesOnPath.filter((id) => isCompleted(id)).length;

      const nextStep = nodesOnPath.find((id) => {
        if (isCompleted(id)) return false;
        const item = moduleItems[id];
        const allPrereqsCompleted =
          item.prerequisites?.every((prereqId) => isCompleted(prereqId)) ??
          true;
        return allPrereqsCompleted;
      });

      const nextStepName = nextStep ? moduleItems[nextStep]?.name : null;
      onGoalProgressChange(
        completedCount,
        totalCount,
        nextStepName,
        nextStep ?? null,
      );
    }
  }, [
    goalNodeId,
    goalPrerequisites,
    isCompleted,
    onGoalProgressChange,
    moduleItems,
  ]);

  return goalPrerequisites;
}
