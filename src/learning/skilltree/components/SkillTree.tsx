import {
  type RefObject,
  useEffect,
} from "react";
import type { Vector } from "@/utils/geometry";
import { Drawing, Curve } from "@/components";
import { Module } from "@/curriculum";
import { NodeCard } from "./SkillTreeComponents/NodeCard";
import { Tooltip } from "./SkillTreeComponents/Tooltip";
import { ModulePositionMeta } from "../definitions/sql-treeDefinition";
import { useTheme } from "@mui/material/";
import { useTransformContext } from "react-zoom-pan-pinch";
import { useDebouncedFunction } from "@/utils";
import { useGoalProgress } from "../utils/calculatePrerequisites";
import { useHoverState } from "../utils/mouseEvents";
import { isReadyToLearn, resolveConnectorStyle } from "../utils/connectorStyle";

/*
 * SkillTree component that renders the tree structure with nodes and connectors.
 * This is a pure rendering component without zoom/pan controls.
 * Uses the Drawing library for coordinate-based positioning.
 *
 * @param moduleItems - Array of modules (concepts and skills) with info about these modules.
 * @param modulePositions - Array of module position data entries to display.
 * @param treeBounds - The bounding box of the tree layout.
 * @param visiblePaths - Array of connector objects with points arrays and from/to node IDs.
 * @param isCompleted - Function to check if a module is completed.
 * @param getProgress - Function to get progress string for a module.
 * @param setHoveredId - Function to set the hovered node ID.
 * @param containerRef - Ref to the container div for the tree.
 * @param nodeRefs - Ref to a map of node IDs to their corresponding div elements.
 */
interface SkillTreeProps {
  moduleItems: Record<string, Module>;
  modulePositions: Record<string, ModulePositionMeta>;
  treeBounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
  };
  visiblePaths: { points: Vector[]; from: string; to: string }[];
  isCompleted: (id: string) => boolean;
  getProgress: (id: string) => string | null;
  setHoveredId: (id: string | null) => void;
  containerRef: RefObject<HTMLDivElement | null>;
  nodeRefs: RefObject<Map<string, HTMLDivElement | null>>;
  planningMode: boolean;
  goalNodeId?: string | null;
  setGoalNodeId?: (id: string | null) => void;
  onGoalProgressChange?: (
    completedCount: number,
    totalCount: number,
    nextStepName: string | null,
    nextStepId: string | null,
  ) => void;
  nextStepId?: string | null;
}

export function SkillTree({
  moduleItems,
  modulePositions,
  treeBounds,
  visiblePaths,
  isCompleted,
  setHoveredId,
  containerRef,
  planningMode,
  goalNodeId,
  setGoalNodeId,
  onGoalProgressChange,
  nextStepId,
}: SkillTreeProps) {
  const theme = useTheme();

  const {
    localHoveredId,
    prerequisites,
    tooltip,
    handleHoverStart,
    handleHoverEnd,
    isConnectorInHoveredPath,
  } = useHoverState(moduleItems, setHoveredId);

  // On changes in the zoom-pan-pinch transform state, dispatch a scroll event to update rects.
  const { transformState } = useTransformContext();
  const dispatchScrollEvent = useDebouncedFunction(() =>
    window.dispatchEvent(new Event("scroll")),
  );
  useEffect(dispatchScrollEvent, [
    transformState.scale,
    transformState.positionX,
    transformState.positionY,
  ]);

  // Calculate prerequisites for goal node in planning mode
  const goalPrerequisites = useGoalProgress(
    goalNodeId,
    moduleItems,
    isCompleted,
    onGoalProgressChange,
  );

  // Handler for click events on nodes
  const handleNodeClick = (item: Module) => {
    const path =
      item.type === "skill" ? `/skill/${item.id}` : `/concept/${item.id}`;
    window.location.href = path;
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: `${treeBounds.width}px`,
        height: `${treeBounds.height}px`,
        // Add a margin when rendering the SkillTree in the Canvas
        marginLeft: "35px",
        marginTop: "35px",
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Drawing
        width={treeBounds.width}
        height={treeBounds.height}
        useSvg={true}
        useCanvas={false}
        autoScale={false} // Scaling manually controlled by transformer.
      >
        {/* The lines between skills and concepts */}
        {visiblePaths.map((connector, i) => {
          const { strokeColor, strokeWidth, opacity } =
            resolveConnectorStyle(connector, planningMode, goalNodeId, goalPrerequisites, localHoveredId, isCompleted, moduleItems, isConnectorInHoveredPath);
          return (
            <Curve
              key={i}
              points={connector.points}
              color={strokeColor}
              size={strokeWidth}
              curveDistance={20}
              style={{ opacity }}
            />
          );
        })}

        {/* Rectangles in the SVG layer, and only those whose position is defined */}
        {Object.values(modulePositions).map((positionData) => {
          const item = moduleItems[positionData.id];
          const readyToLearn = isReadyToLearn(item, isCompleted);

          return (
            <g
              key={item.id}
              onMouseEnter={() => handleHoverStart(item.id)}
              onMouseLeave={handleHoverEnd}
            >
              <NodeCard
                item={item}
                positionData={modulePositions[item.id]}
                completed={isCompleted(item.id)}
                isHovered={localHoveredId === item.id}
                readyToLearn={readyToLearn}
                isPrerequisite={prerequisites.has(item.id)}
                isSomethingHovered={localHoveredId !== null}
                onClick={() => handleNodeClick(item)}
                planningMode={planningMode}
                hasGoal={planningMode && !!goalNodeId}
                isGoalNode={planningMode && goalNodeId === item.id}
                isOnGoalPath={planningMode && goalPrerequisites.has(item.id)}
                onSetGoal={() => {
                  if (planningMode && setGoalNodeId) {
                    setGoalNodeId(goalNodeId === item.id ? null : item.id);
                  }
                }}
                nextStepId={nextStepId}
              />
            </g>
          );
        })}

        {/* The tooltip. */}
        <Tooltip>{tooltip}</Tooltip>
      </Drawing>
    </div>
  );
}

