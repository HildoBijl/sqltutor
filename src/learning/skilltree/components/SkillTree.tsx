import {
  type RefObject,
  type ReactNode,
  useState,
  useEffect,
  useMemo,
} from "react";
import type { Vector } from "@/utils/geometry";
import { Drawing, Element, Curve, useDrawingMousePosition } from "@/components";
import { Module } from "@/curriculum";
import { NodeCard } from "./NodeCard";
import { ModulePositionMeta } from "../definitions/sql-treeDefinition";
import { useTheme } from "@mui/material/";
import { useTransformContext } from "react-zoom-pan-pinch";
import { useDebouncedFunction } from "@/utils";
import { getPrerequisites } from "../utils/goalPath";
import { getConnectorStyle } from "../utils/connectorStyle";

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

  // Local state for hovered node ID and prerequisite chain
  const [localHoveredId, setLocalHoveredId] = useState<string | null>(null);
  const [prerequisites, setPrerequisites] = useState<Set<string>>(new Set());

  // const setNodeRef = (id: string) => (el: HTMLDivElement | null) => {
  //   nodeRefs.current?.set(id, el);
  // };

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
  const goalPrerequisites = useMemo(() => {
    if (goalNodeId) {
      return getPrerequisites(goalNodeId, moduleItems);
    }
    return new Set<string>();
  }, [goalNodeId, moduleItems]);

  useEffect(() => {
    if (onGoalProgressChange && goalNodeId) {
      const nodesOnPath = [...Array.from(goalPrerequisites), goalNodeId];
      const totalCount = nodesOnPath.length;
      const completedCount = nodesOnPath.filter((id) => isCompleted(id)).length;

      const nextStep = nodesOnPath.find((id) => {
        if (isCompleted(id)) return false;
        const item = moduleItems[id];
        const allPrereqsCompleted =
          item.prerequisites?.every((prereqId) => isCompleted(prereqId)) ??
          true;
        return allPrereqsCompleted;
      });

      const nextStepName = nextStep ? moduleItems[nextStep]?.name : null;
      onGoalProgressChange(completedCount, totalCount, nextStepName, nextStep ?? null);
    }
  }, [
    goalNodeId,
    goalPrerequisites,
    isCompleted,
    onGoalProgressChange,
    moduleItems,
  ]);

  // Tooltip state
  const [tooltip, setTooltip] = useState<string | null>(null);

  // Handlers for hover events
  const handleHoverStart = (id: string) => {
    setLocalHoveredId(id);
    setHoveredId(id);
    const chain = getPrerequisites(id, moduleItems);
    // Calculate full prerequisite chain
    setPrerequisites(chain);

    // Show tooltip at cursor position
    const item = moduleItems[id];
    setTooltip(item.description || "No description available");
  };

  const handleHoverEnd = () => {
    setLocalHoveredId(null);
    setHoveredId(null);
    // Reset the prerequisite chain
    setPrerequisites(new Set());
    setTooltip(null);
  };

  // Handler for click events on nodes
  const handleNodeClick = (item: Module) => {
    const path =
      item.type === "skill" ? `/skill/${item.id}` : `/concept/${item.id}`;
    window.location.href = path;
  };

  // Determine if a node is ready to learn
  const isReadyToLearn = (item: Module): boolean => {
    const allPrequisitesCompleted =
      item.prerequisites?.every((preId) => isCompleted(preId)) ?? true;
    return !isCompleted(item.id) && allPrequisitesCompleted;
  };

  // Check if a connector is part of the hovered path
  const isConnectorInHoveredPath = (connector: {
    from: string;
    to: string;
  }): boolean => {
    if (!localHoveredId) return false;

    const toIsHovered = connector.to === localHoveredId;
    const fromIsInChain = prerequisites.has(connector.from);
    const toIsInChain = prerequisites.has(connector.to) || toIsHovered;

    return toIsInChain && fromIsInChain;
  };

  // Check if a connector is part of the goal path
  const isConnectorInGoalPath = (connector: {
    from: string;
    to: string;
  }): boolean => {
    if (!planningMode || !goalNodeId) return false;

    const fromInPath =
      goalPrerequisites.has(connector.from) || connector.from === goalNodeId;
    const toInPath =
      goalPrerequisites.has(connector.to) || connector.to === goalNodeId;

    return fromInPath && toInPath;
  };

  const resolveConnectorStyle = (connector: { from: string; to: string }) => {
    const fromCompleted = isCompleted(connector.from);
    return getConnectorStyle({
      planningMode,
      goalNodeId,
      isInGoalPath: isConnectorInGoalPath(connector),
      isInHoveredPath: isConnectorInHoveredPath(connector),
      isSomethingHovered: !!localHoveredId,
      fromCompleted,
      toCompleted: isCompleted(connector.to),
      isNextToLearn: isReadyToLearn(moduleItems[connector.to]) && fromCompleted,
    });
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
          const { strokeColor, strokeWidth, opacity } = resolveConnectorStyle(connector);
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
          const readyToLearn = isReadyToLearn(item);

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

interface TooltipProps {
  children?: ReactNode;
}
function Tooltip({ children }: TooltipProps) {
  const mousePosition = useDrawingMousePosition();
  const theme = useTheme();

  if (!children || !mousePosition) return null;

  return (
    <Element anchor={[-1, -1]} position={mousePosition.add([20, 10])}>
      <div
        style={{
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          padding: "8px 12px",
          borderRadius: "4px",
          fontSize: "14px",
          maxWidth: "300px",
          zIndex: 1000,
          boxShadow: theme.shadows[4],
        }}
      >
        {children}
      </div>
    </Element>
  );
}
