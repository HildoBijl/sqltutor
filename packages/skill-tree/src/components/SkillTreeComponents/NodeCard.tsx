import { ButtonBase, useTheme } from '@mui/material/';
import { Element, Rectangle } from '@sqlvalley/ui';
import type { Module } from '@sqlvalley/skill-tree-definition';
import { Vector } from '@sqlvalley/utils/geometry';
import { NodeCompletedMark } from './Icons/NodeCompletedMark';
import { NodeGoalPin } from './Icons/NodeGoalPin';
import { NodeIconBadge } from './Icons/NodeIconBadge';
import { getNodeStyle } from '../../utils/graphics/nodeStyle';
import { treeColors } from '../../utils/graphics/treeColors';
import type { ModulePositionMeta } from '../../utils/positionProcessing';
import { cardHeight, cardWidth } from '../../utils/settings';

/*
 * NodeCard component representing a concept or skill in the learning tree.
 * Renders the Rectangle with text directly inside the SVG.
 */
interface NodeCardProps {
  item: Module;
  positionData: ModulePositionMeta;
  completed: boolean;
  isHovered: boolean;
  readyToLearn?: boolean;
  isPrerequisite?: boolean;
  isSomethingHovered?: boolean;
  planningMode?: boolean;
  hasGoal?: boolean;
  isGoalNode?: boolean;
  isOnGoalPath?: boolean;
  onSetGoal?: () => void;
  nextStepId?: string | null;
  staticMode?: boolean;
  isSelected?: boolean;
}

export function NodeCard({
  item,
  positionData,
  completed,
  isHovered,
  readyToLearn = false,
  isPrerequisite = false,
  isSomethingHovered = false,
  planningMode = false,
  hasGoal = false,
  isGoalNode = false,
  isOnGoalPath = false,
  onSetGoal,
  nextStepId,
  staticMode = false,
  isSelected = false,
}: NodeCardProps) {
  const theme = useTheme();
  const type = item.type;
  const cornerRadius = type === 'concept' ? 4 : 12;

 

  const rectStart = new Vector(
    positionData.position.x - cardWidth / 2,
    positionData.position.y - cardHeight / 2,
  );
  const rectEnd = new Vector(
    positionData.position.x + cardWidth / 2,
    positionData.position.y + cardHeight / 2,
  );

  const iconSize = 20;
  const checkmarkSize = 18;

  const { borderColor, fillColor, nodeOpacity, strokeWidth } = getNodeStyle({
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
    staticMode,
    isSelected,
  });

  return (
    <>
      <Rectangle
        dimensions={{ start: rectStart, end: rectEnd }}
        cornerRadius={cornerRadius}
        style={{
          fill: theme.palette.background.paper,
          stroke: theme.palette.divider,
          strokeWidth: 1,
          strokeOpacity: nodeOpacity,
        }}
      />
      <Rectangle
        dimensions={{ start: rectStart, end: rectEnd }}
        cornerRadius={cornerRadius}
        style={{
          fill: fillColor,
          stroke: borderColor,
          strokeWidth,
          strokeOpacity: nodeOpacity,
          transition: 'fill 90ms, stroke 90ms',
        }}
      />

      <Element
        position={positionData.position}
        anchor={[0, 0]}
        passive={false}
        style={{ opacity: nodeOpacity }}
      >
        <ButtonBase
          focusRipple
          centerRipple
          sx={{
            width: cardWidth,
            height: cardHeight,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            cursor: 'pointer',
            borderRadius: `${cornerRadius}px`,
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
          TouchRippleProps={{
            style: {
              opacity: 0.3,
            },
          }}
        >
          <div
            style={{
              width: cardWidth,
              height: cardHeight,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <NodeIconBadge type={type} iconSize={iconSize} />

            {completed && !isGoalNode && (
              <NodeCompletedMark iconSize={checkmarkSize} />
            )}

            {planningMode &&
              !isGoalNode &&
              !completed &&
              (!hasGoal || isHovered) && (
                <NodeGoalPin
                  variant="set"
                  checkmarkSize={checkmarkSize}
                  onSetGoal={onSetGoal}
                />
              )}

            {planningMode && hasGoal && nextStepId === item.id && (
              <NodeGoalPin variant="next-step" checkmarkSize={checkmarkSize} />
            )}

            {planningMode && isGoalNode && (
              <NodeGoalPin
                variant="active"
                checkmarkSize={checkmarkSize}
                onSetGoal={onSetGoal}
              />
            )}

            <div
              style={{
                width: cardWidth - 20,
                textAlign: 'center',
                fontWeight: 500,
                fontSize: '17px',
                color:
                  planningMode && isGoalNode
                    ? treeColors.goalContrastText
                    : theme.palette.text.primary,
              }}
            >
              {item.name}
            </div>
          </div>
        </ButtonBase>
      </Element>
    </>
  );
}
