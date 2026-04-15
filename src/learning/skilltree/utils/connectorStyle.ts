import { Module } from "@/curriculum";

export function isReadyToLearn(
  item: Module,
  isCompleted: (id: string) => boolean,
): boolean {
  const allPrerequisitesCompleted =
    item.prerequisites?.every((preId) => isCompleted(preId)) ?? true;
  return !isCompleted(item.id) && allPrerequisitesCompleted;
}

export function isConnectorInGoalPath(
  connector: { from: string; to: string },
  planningMode: boolean,
  goalNodeId: string | null | undefined,
  goalPrerequisites: Set<string>,
): boolean {
  if (!planningMode || !goalNodeId) return false;

  const fromInPath =
    goalPrerequisites.has(connector.from) || connector.from === goalNodeId;
  const toInPath =
    goalPrerequisites.has(connector.to) || connector.to === goalNodeId;

  return fromInPath && toInPath;
}

export function resolveConnectorStyle(
  connector: { from: string; to: string },
  planningMode: boolean,
  goalNodeId: string | null | undefined,
  goalPrerequisites: Set<string>,
  localHoveredId: string | null,
  isCompletedFn: (id: string) => boolean,
  moduleItems: Record<string, Module>,
  isConnectorInHoveredPath: (connector: { from: string; to: string }) => boolean,
) {
  const fromCompleted = isCompletedFn(connector.from);
  return getConnectorStyle({
    planningMode,
    goalNodeId,
    isInGoalPath: isConnectorInGoalPath(connector, planningMode, goalNodeId, goalPrerequisites),
    isInHoveredPath: isConnectorInHoveredPath(connector),
    isSomethingHovered: !!localHoveredId,
    fromCompleted,
    toCompleted: isCompletedFn(connector.to),
    isNextToLearn: isReadyToLearn(moduleItems[connector.to], isCompletedFn) && fromCompleted,
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
}: ConnectorStyleInput): ConnectorStyleOutput {
  const bothCompleted = fromCompleted && toCompleted;

  if (planningMode) {
    if (!goalNodeId) return { strokeColor: "#9aa0a6", strokeWidth: 1.5, opacity: 0.7 };
    if (!isInGoalPath) return { strokeColor: "#9aa0a6", strokeWidth: 1.5, opacity: 0.15 };
    if (bothCompleted) return { strokeColor: "#4CAF50", strokeWidth: 1.5, opacity: 1 };
    if (isNextToLearn) return { strokeColor: "#FFD700", strokeWidth: 1.5, opacity: 1 };
    return { strokeColor: "purple", strokeWidth: 1.5, opacity: 1 };
  }

  if (isInHoveredPath) {
    if (bothCompleted) return { strokeColor: "#4CAF50", strokeWidth: 1.5, opacity: 0.7 };
    if (isNextToLearn) return { strokeColor: "#FFD700", strokeWidth: 1.5, opacity: 0.7 };
    return { strokeColor: "#E84421", strokeWidth: 1.5, opacity: 0.7 };
  }

  if (isSomethingHovered) {
    return { strokeColor: "#9aa0a6", strokeWidth: 1.5, opacity: 0.2 };
  }

  if (bothCompleted) return { strokeColor: "#4CAF50", strokeWidth: 1.5, opacity: 0.7 };
  if (isNextToLearn) return { strokeColor: "#FFD700", strokeWidth: 1.5, opacity: 0.5 };
  return { strokeColor: "#9aa0a6", strokeWidth: 1.5, opacity: 0.2 };
}
