import { Vector } from "@/utils/geometry";
import { Rectangle, Element } from "@/components";
import { Module } from "@/curriculum";
import { cardWidth, cardHeight } from "../../utils/settings";
import { getNodeStyle } from "../../utils/nodeStyle";
import { ModulePositionMeta } from "../../definitions/sql-treeDefinition";
import { useTheme, ButtonBase } from "@mui/material/";
import { NodeIconBadge } from "./Icons/NodeIconBadge";
import { NodeGoalPin } from "./Icons/NodeGoalPin";
import { NodeCompletedMark } from "./Icons/NodeCompletedMark";

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
  onClick?: () => void;
  planningMode?: boolean;
  hasGoal?: boolean;
  isGoalNode?: boolean;
  isOnGoalPath?: boolean;
  onSetGoal?: () => void;
  nextStepId?: string | null;
}

export function NodeCard({
  item,
  positionData,
  completed,
  isHovered,
  readyToLearn = false,
  isPrerequisite = false,
  isSomethingHovered = false,
  onClick,
  planningMode = false,
  hasGoal = false,
  isGoalNode = false,
  isOnGoalPath = false,
  onSetGoal,
  nextStepId,
}: NodeCardProps) {
  const theme = useTheme();
  const type = item.type;
  const cornerRadius = type === "concept" ? 4 : 12;

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    // Wait for animation to complete before calling onClick
    setTimeout(() => {
      if (onClick) {
        onClick();
      }
    }, 200);
  };

  // Calculate rectangle bounds from position (top-left corner)
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
  });

  return (
    <>
      {/* Background rectangle to avoid lines in the background */}
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
          strokeWidth: strokeWidth,
          strokeOpacity: nodeOpacity,
          transition: "fill 90ms, stroke 90ms",
        }}
      />

      {/* Text label and clickable overlay */}
      <Element
        position={positionData.position}
        anchor={[0, 0]}
        passive={false}
        style={{ opacity: nodeOpacity }}
      >
        <ButtonBase
          onClick={handleClick}
          focusRipple
          centerRipple
          sx={{
            width: cardWidth,
            height: cardHeight,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            cursor: "pointer",
            borderRadius: `${cornerRadius}px`,
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
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
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <NodeIconBadge
              type={type}
              iconSize={iconSize}
            />

            {completed && !isGoalNode && (
              <NodeCompletedMark iconSize={checkmarkSize} />
            )}

            {/* Show pin icon when hovering over an item in planning mode, if the item is not set as a goal */}
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

            {/* Show filled pin icon if the item is set as a goal */}
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
                textAlign: "center",
                fontWeight: 500,
                fontSize: "17px",
                color: planningMode && isGoalNode ? "#ffffff" : "#000000",
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
