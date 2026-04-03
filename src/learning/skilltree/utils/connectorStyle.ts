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
