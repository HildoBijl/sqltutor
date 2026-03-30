import { Vector } from "@/utils/geometry";
import { Rectangle, Element } from "@/components";
import { Module } from "@/curriculum";
import { cardWidth, cardHeight } from "../utils/settings";
import { ModulePositionMeta } from "../definitions/sql-treeDefinition";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditNoteIcon from "@mui/icons-material/EditNote";
import School from "@mui/icons-material/School";
import { useTheme, ButtonBase } from "@mui/material/";
import { useState } from "react";
import PushPinIcon from "@mui/icons-material/PushPin";

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
  planningMode,
  hasGoal = false,
  isGoalNode = false,
  isOnGoalPath = false,
  onSetGoal,
}: NodeCardProps) {
  const theme = useTheme();
  const [isPinHovered, setIsPinHovered] = useState(false);
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

  // Calculate position for the icon
  const iconSize = 20;

  // Calculate position for the checkmark
  const checkmarkSize = 18;

  let nodeOpacity: number;
  let borderColor: string;
  let strokeWidth: number;
  let fillColor: string = theme.palette.background.paper;

  if (planningMode) {
    const prominent = isGoalNode || isOnGoalPath || isHovered;
    nodeOpacity = prominent || !hasGoal ? 1.0 : 0.15;
    strokeWidth = isGoalNode || isHovered ? 2 : 1;

    if (isGoalNode) {
      fillColor = "purple";
      borderColor = "purple";
    } else if (isOnGoalPath && completed) {
      borderColor = "#4CAF50";
    } else if (isOnGoalPath && readyToLearn) {
      borderColor = "#FFD700";
    } else if (isOnGoalPath) {
      borderColor = "purple";
    } else {
      borderColor = isHovered
        ? theme.palette.primary.main
        : theme.palette.divider;
    }
  } else {
    const highlighted = isHovered || isPrerequisite;
    const dimmed = isSomethingHovered && !highlighted;

    if (highlighted) {
      nodeOpacity = 1.0;
      strokeWidth = 2;
      borderColor = completed
        ? "rgba(76, 175, 80, 1.0)"
        : readyToLearn
          ? "#FFD700"
          : "#E84421";
    } else if (completed) {
      nodeOpacity = dimmed ? 0.4 : 1.0;
      strokeWidth = 1;
      borderColor = dimmed ? "rgba(76, 175, 80, 0.4)" : "#4CAF50";
    } else if (readyToLearn) {
      nodeOpacity = dimmed ? 0.15 : 1.0;
      strokeWidth = 1;
      borderColor = dimmed ? "#e0e0e0" : "#FFD700";
    } else {
      nodeOpacity = 0.15;
      strokeWidth = 1;
      borderColor = "#e0e0e0";
    }
  }

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
            <div
              style={{
                position: "absolute",
                top: -10,
                left: -5,
                width: iconSize,
                height: iconSize,
                backgroundColor: theme.palette.background.paper,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {type === "concept" ? (
                <School
                  style={{
                    fontSize: iconSize,
                    color: completed ? "#757575" : "#616161",
                  }}
                />
              ) : (
                <EditNoteIcon
                  style={{
                    fontSize: iconSize,
                    color: "primary",
                  }}
                />
              )}
            </div>

            {completed && !isGoalNode && (
              <div
                style={{
                  position: "absolute",
                  top: -10,
                  right: -5,
                  width: checkmarkSize,
                  height: checkmarkSize,
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircleIcon
                  style={{ fontSize: checkmarkSize, color: "#4CAF50" }}
                />
              </div>
            )}

            {/* Show pin icon when hovering over an item in planning mode, if the item is not set as a goal */}
            {planningMode && !isGoalNode && (!hasGoal || isHovered) && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSetGoal) {
                    onSetGoal();
                  }
                }}
                onMouseEnter={() => setIsPinHovered(true)}
                onMouseLeave={() => setIsPinHovered(false)}
                style={{
                  position: "absolute",
                  top: -15,
                  right: -15,
                  width: 2 * checkmarkSize,
                  height: 2 * checkmarkSize,
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  border: `1px solid ${isPinHovered ? "purple" : "#616161"}`,
                  pointerEvents: "auto",
                }}
              >
                <PushPinIcon
                  style={{
                    fontSize: checkmarkSize - 4,
                    color: isPinHovered ? "purple" : "#9aa0a6",
                  }}
                />
              </div>
            )}

            {/* Show filled pin icon if the item is set as a goal */}
            {planningMode && isGoalNode && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSetGoal) {
                    onSetGoal();
                  }
                }}
                onMouseEnter={() => setIsPinHovered(true)}
                onMouseLeave={() => setIsPinHovered(false)}
                style={{
                  position: "absolute",
                  top: -15,
                  right: -15,
                  width: 2 * checkmarkSize,
                  height: 2 * checkmarkSize,
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  pointerEvents: "auto",
                  border: `1px solid ${isPinHovered ? "#616161" : "purple"}`,
                }}
              >
                <PushPinIcon
                  style={{
                    fontSize: checkmarkSize - 4,
                    color: isPinHovered ? "#9aa0a6" : "purple",
                  }}
                />
              </div>
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
