import type { Theme } from '@mui/material/styles';

interface NodeStyleInput {
  planningMode: boolean;
  isGoalNode: boolean;
  isOnGoalPath: boolean;
  isHovered: boolean;
  hasGoal: boolean;
  completed: boolean;
  readyToLearn: boolean;
  isSomethingHovered: boolean;
  isPrerequisite: boolean;
  theme: Theme;
}

interface NodeStyle {
  borderColor: string;
  fillColor: string;
  nodeOpacity: number;
  strokeWidth: number;
}

export function getNodeStyle({
  planningMode,
  isGoalNode,
  isOnGoalPath,
  isHovered,
  hasGoal,
  completed,
  readyToLearn,
  isSomethingHovered,
  isPrerequisite,
  theme,
}: NodeStyleInput): NodeStyle {
  const fillColor = isGoalNode ? 'purple' : theme.palette.background.paper;

  if (planningMode) {
    const prominent = isGoalNode || isOnGoalPath || isHovered;
    const nodeOpacity = prominent || !hasGoal ? 1.0 : 0.15;
    const strokeWidth = isGoalNode || isHovered ? 2 : 1;

    let borderColor: string;
    if (isGoalNode) {
      borderColor = 'purple';
    } else if (completed) {
      borderColor = '#4CAF50';
    } else if (isOnGoalPath && readyToLearn) {
      borderColor = '#FFD700';
    } else if (isOnGoalPath) {
      borderColor = 'purple';
    } else {
      borderColor = isHovered ? theme.palette.primary.main : theme.palette.divider;
    }

    return { borderColor, fillColor, nodeOpacity, strokeWidth };
  }

  const highlighted = isHovered || isPrerequisite;
  const dimmed = isSomethingHovered && !highlighted;

  if (highlighted) {
    return {
      borderColor: completed ? 'rgba(76, 175, 80, 1.0)' : readyToLearn ? '#FFD700' : '#E84421',
      fillColor,
      nodeOpacity: 1.0,
      strokeWidth: 2,
    };
  }
  if (completed) {
    return {
      borderColor: dimmed ? 'rgba(76, 175, 80, 0.4)' : '#4CAF50',
      fillColor,
      nodeOpacity: dimmed ? 0.4 : 1.0,
      strokeWidth: 1,
    };
  }
  if (readyToLearn) {
    return {
      borderColor: dimmed ? '#e0e0e0' : '#FFD700',
      fillColor,
      nodeOpacity: dimmed ? 0.15 : 1.0,
      strokeWidth: 1,
    };
  }
  return {
    borderColor: '#e0e0e0',
    fillColor,
    nodeOpacity: 0.15,
    strokeWidth: 1,
  };
}
