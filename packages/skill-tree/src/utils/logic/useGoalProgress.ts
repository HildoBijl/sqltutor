import { useEffect, useMemo } from 'react';
import type { Module } from '@sqlvalley/skill-tree-definition';
import { getGoalPath, getGoalProgress } from '@sqlvalley/skill-tree-definition';

/*
 * Track progress towards the planning-mode goal.
 * Returns the set of modules on the goal path (prerequisites plus the goal
 * itself), and reports progress updates through onGoalProgressChange.
 */
export function useGoalProgress(
  goalNodeId: string | null | undefined,
  skillTree: Record<string, Module>,
  isCompleted: (id: string) => boolean,
  onGoalProgressChange?: (
    completedCount: number,
    totalCount: number,
    nextStepName: string | null,
    nextStepId: string | null,
  ) => void,
): Set<string> {
  const goalPath = useMemo(
    () => (goalNodeId ? getGoalPath(skillTree, goalNodeId) : new Set<string>()),
    [goalNodeId, skillTree],
  );

  useEffect(() => {
    if (onGoalProgressChange && goalNodeId) {
      const { completedCount, totalCount, nextStepName, nextStepId } =
        getGoalProgress(skillTree, goalNodeId, isCompleted);
      onGoalProgressChange(completedCount, totalCount, nextStepName, nextStepId);
    }
  }, [goalNodeId, isCompleted, onGoalProgressChange, skillTree]);

  return goalPath;
}
