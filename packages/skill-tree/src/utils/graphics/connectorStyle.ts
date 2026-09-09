import type { Module } from '@sqlvalley/skill-tree-definition';
import { isReadyToLearn } from '@sqlvalley/skill-tree-definition';
import { treeColors } from './treeColors';

export function isConnectorInGoalPath(
  connector: { from: string; to: string },
  planningMode: boolean,
  goalNodeId: string | null | undefined,
  goalPath: Set<string>,
): boolean {
  if (!planningMode || !goalNodeId) return false;
  return goalPath.has(connector.from) && goalPath.has(connector.to);
}

export function resolveConnectorStyle(
  connector: { from: string; to: string },
  planningMode: boolean,
  goalNodeId: string | null | undefined,
  goalPath: Set<string>,
  localHoveredId: string | null,
  isCompletedFn: (id: string) => boolean,
  skillTree: Record<string, Module>,
  isConnectorInHoveredPath: (connector: { from: string; to: string }) => boolean,
  staticMode?: boolean,
) {
  const fromCompleted = isCompletedFn(connector.from);
  return getConnectorStyle({
    planningMode,
    goalNodeId,
    isInGoalPath: isConnectorInGoalPath(
      connector,
      planningMode,
      goalNodeId,
      goalPath,
    ),
    isInHoveredPath: isConnectorInHoveredPath(connector),
    isSomethingHovered: !!localHoveredId,
    fromCompleted,
    toCompleted: isCompletedFn(connector.to),
    isNextToLearn:
      isReadyToLearn(skillTree, connector.to, isCompletedFn) && fromCompleted,
    staticMode,
  });
}

interface ConnectorStyleInput {
  planningMode: boolean;
  goalNodeId: string | null | undefined;
  isInGoalPath: boolean;
  isInHoveredPath: boolean;
  isSomethingHovered: boolean;
  fromCompleted: boolean;
  toCompleted: boolean;
  isNextToLearn: boolean;
  staticMode?: boolean;
}

interface ConnectorStyleOutput {
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
}

export function getConnectorStyle({
  planningMode,
  goalNodeId,
  isInGoalPath,
  isInHoveredPath,
  isSomethingHovered,
  fromCompleted,
  toCompleted,
  isNextToLearn,
  staticMode,
}: ConnectorStyleInput): ConnectorStyleOutput {
  const bothCompleted = fromCompleted && toCompleted;

  if (staticMode) {
    return { strokeColor: treeColors.neutral, strokeWidth: 1.5, opacity: 1 };
  }

  if (isInHoveredPath) {
    if (bothCompleted) {
      return { strokeColor: treeColors.completed, strokeWidth: 1.5, opacity: 0.7 };
    }
    if (isNextToLearn) {
      return { strokeColor: treeColors.ready, strokeWidth: 1.5, opacity: 0.7 };
    }
    return { strokeColor: treeColors.locked, strokeWidth: 1.5, opacity: 0.7 };
  }

  if (isSomethingHovered) {
    return {
      strokeColor: treeColors.neutral,
      strokeWidth: 1.5,
      opacity: planningMode ? 0.15 : 0.2,
    };
  }

  if (planningMode) {
    if (!goalNodeId) {
      return { strokeColor: treeColors.neutral, strokeWidth: 1.5, opacity: 0.7 };
    }
    if (!isInGoalPath) {
      return { strokeColor: treeColors.neutral, strokeWidth: 1.5, opacity: 0.15 };
    }
    if (bothCompleted) {
      return { strokeColor: treeColors.completed, strokeWidth: 1.5, opacity: 1 };
    }
    if (isNextToLearn) {
      return { strokeColor: treeColors.ready, strokeWidth: 1.5, opacity: 1 };
    }
    return { strokeColor: treeColors.goal, strokeWidth: 1.5, opacity: 1 };
  }

  if (bothCompleted) {
    return { strokeColor: treeColors.completed, strokeWidth: 1.5, opacity: 0.7 };
  }
  if (isNextToLearn) {
    return { strokeColor: treeColors.ready, strokeWidth: 1.5, opacity: 0.5 };
  }
  return { strokeColor: treeColors.neutral, strokeWidth: 1.5, opacity: 0.2 };
}
