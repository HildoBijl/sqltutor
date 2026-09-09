import type { Theme } from '@mui/material/styles';
import { treeColors } from './treeColors';

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
  staticMode?: boolean;
  isSelected?: boolean;
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
  staticMode = false,
  isSelected = false
}: NodeStyleInput): NodeStyle {
  const fillColor = isGoalNode ? treeColors.goal : theme.palette.background.paper;

  if (staticMode) {
    return {
      borderColor: theme.palette.divider,
      fillColor: theme.palette.background.paper,
      nodeOpacity: 1.0,
      strokeWidth: 1,
    }
  }

  if (planningMode) {
    const highlighted = isHovered || isPrerequisite || isSelected;
    const dimmedByHover = isSomethingHovered && !highlighted && !isGoalNode;

    const prominent = isGoalNode || isOnGoalPath || highlighted || !hasGoal;
    const nodeOpacity = dimmedByHover || !prominent ? 0.15 : 1.0;
    const strokeWidth = isGoalNode || highlighted ? 2 : 1;

    let borderColor: string;
    if (isGoalNode) {
      borderColor = treeColors.goal;
    } else if (highlighted) {
      borderColor = completed ? treeColors.completed : readyToLearn ? treeColors.ready : treeColors.locked;
    } else if (completed) {
      borderColor = treeColors.completed;
    } else if (isOnGoalPath && readyToLearn) {
      borderColor = treeColors.ready;
    } else if (isOnGoalPath) {
      borderColor = treeColors.goal;
    } else {
      borderColor = theme.palette.divider;
    }

    return { borderColor, fillColor, nodeOpacity, strokeWidth };
  }

  const highlighted = isHovered || isPrerequisite || isSelected;
  const dimmed = isSomethingHovered && !highlighted;

  if (highlighted) {
    return {
      borderColor: completed ? treeColors.completed : readyToLearn ? treeColors.ready : treeColors.locked,
      fillColor,
      nodeOpacity: 1.0,
      strokeWidth: 2,
    };
  }
  if (completed) {
    return {
      borderColor: dimmed ? treeColors.completedFaded : treeColors.completed,
      fillColor,
      nodeOpacity: dimmed ? 0.4 : 1.0,
      strokeWidth: 1,
    };
  }
  if (readyToLearn) {
    return {
      borderColor: dimmed ? treeColors.faded : treeColors.ready,
      fillColor,
      nodeOpacity: dimmed ? 0.15 : 1.0,
      strokeWidth: 1,
    };
  }
  return {
    borderColor: treeColors.faded,
    fillColor,
    nodeOpacity: 0.15,
    strokeWidth: 1,
  };
}
