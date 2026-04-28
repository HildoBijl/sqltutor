import { RefObject, useState, useCallback, useRef, useEffect } from "react";
import { useGesture } from "@use-gesture/react";
import type { Vector } from "@/utils/geometry";
import { useDebouncedFunction } from "@/utils/dom";
import { Module } from "@/curriculum";
import { ModulePositionMeta } from "../definitions/sql-treeDefinition";
import { SkillTree } from "./SkillTree";
import { ZoomControls } from "./SkillTreeComponents/ZoomControls";
import { TreeLegend } from "./SkillTreeComponents/TreeLegend";
import { PlanningProgressIndicator } from "./SkillTreeComponents/PlanningProgressIndicator";
import { useTheme } from "@mui/material/";
import { useSkillTreeSettingsStore } from "@/store";
import { PlanningModeIntro } from "./SkillTreeComponents/PlanningModeIntro";
import { useSpring, animated } from "@react-spring/web";

/*
 * SkillTreeCanvas component that wraps the skill tree with zoom and pan capabilities.
 * This component only handles the zoom/pan functionality and UI controls.
 *
 * @param moduleItems - Array of modules (concepts and skills) with info about these modules.
 * @param modulePositions - Array of module position data entries to display.
 * @param treeBounds - The bounding box of the tree layout.
 * @param visiblePaths - Array of connector objects with points arrays and from/to node IDs.
 * @param isCompleted - Function to check if a module is completed.
 * @param getProgress - Function to get progress string for a module.
 * @param hoveredId - ID of the currently hovered node, or null if none.
 * @param setHoveredId - Function to set the hovered node ID.
 * @param containerRef - Ref to the container div for the tree.
 * @param nodeRefs - Ref to a map of node IDs to their corresponding div elements.
 */
export interface SkillTreeCanvasProps {
  treeId: string;
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
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  containerRef: RefObject<HTMLDivElement | null>;
  nodeRefs: RefObject<Map<string, HTMLDivElement | null>>;
}

export function SkillTreeCanvas({
  treeId,
  moduleItems,
  modulePositions,
  treeBounds,
  visiblePaths,
  isCompleted,
  getProgress,
  setHoveredId,
  containerRef,
  nodeRefs,
}: SkillTreeCanvasProps) {
  const [isPanning, setIsPanning] = useState(false);

  const planningMode = useSkillTreeSettingsStore(
    (state) => state.planningMode[treeId] ?? false,
  );
  const setPlanningMode = useSkillTreeSettingsStore(
    (state) => state.setPlanningMode,
  );

  const [goalProgress, setGoalProgress] = useState({
    completed: 0,
    total: 0,
    nextStep: null as string | null,
    nextStepId: null as string | null,
  });

  // Set a goal node ID
  const goalNodeId = useSkillTreeSettingsStore(
    (state) => state.goalNodeID[treeId] ?? null,
  );
  const setGoalNodeIdInStore = useSkillTreeSettingsStore(
    (state) => state.setGoalNodeID,
  );
  const setGoalNodeId = (id: string | null) => setGoalNodeIdInStore(treeId, id);
  const setHasAccessedPlanningMode = useSkillTreeSettingsStore(
    (state) => state.setHasAccessedPlanningMode,
  );
  const hasAccessedPlanningMode = useSkillTreeSettingsStore(
    (state) => state.hasAccessedPlanningMode,
  );

  const [showPlanningModeModal, setShowPlanningModeModal] = useState(false);

  const theme = useTheme();

  const handleGoalProgressChange = useCallback(
    (
      completed: number,
      total: number,
      nextStep: string | null,
      nextStepId: string | null,
    ) => {
      setGoalProgress({ completed, total, nextStep, nextStepId });
    },
    [],
  );

  const [style, api] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1,
    config: { tension: 200, friction: 30 },
  }));
  const transformRef = useRef({ x: 0, y: 0, scale: 1 });

  const minScale = 0.3;
  const maxScale = 2;

  const isOutOfBounds = (x: number, y: number, scale: number) => {
    const containerWidth =
      containerRef.current?.clientWidth ?? window.innerWidth;
    const containerHeight =
      containerRef.current?.clientHeight ?? window.innerHeight;
    const scaledWidth = treeBounds.width * scale;
    const scaledHeight = treeBounds.height * scale;

    const minVisible = 500;

    return (
      x + scaledWidth < minVisible || // too far left
      x > containerWidth - minVisible || // too far right
      y + scaledHeight < minVisible || // too far up
      y > containerHeight - minVisible // too far down
    );
  };

  const fixTransform = (x: number, y: number, scale: number) => {
    const containerHeight = containerRef.current?.clientHeight ?? 0;
    const cotainerWidth = containerRef.current?.clientWidth ?? 0;

    const scaledWidth = treeBounds.width * scale;
    const scaledHeight = treeBounds.height * scale;

    const margin = 1000;

    const minX = -(scaledWidth - margin);
    const maxX = cotainerWidth - margin;
    const minY = -(scaledHeight - margin);
    const maxY = containerHeight - margin;

    return {
      x: Math.min(maxX, Math.max(minX, x)),
      y: Math.min(maxY, Math.max(minY, y)),
      scale,
    };
  };

  const bind = useGesture(
    {
      onDrag: ({ offset: [x, y] }) => {
        setIsPanning(true);
        transformRef.current = { ...transformRef.current, x, y };
        api.set({ x, y });
      },
      onDragEnd: () => {
        setIsPanning(false);
        const { x, y, scale } = transformRef.current;
        if (isOutOfBounds(x, y, scale)) {
          // bounce back to center
          const containerWidth =
            containerRef.current?.clientWidth ?? window.innerWidth;
          const containerHeight =
            containerRef.current?.clientHeight ?? window.innerHeight;
          const cx = (containerWidth - treeBounds.width) / 2;
          const cy = (containerHeight - treeBounds.height) / 2;
          transformRef.current = { x: cx, y: cy, scale };
          api.start({ x: cx, y: cy }); // animated bounce
        }
      },
      onPinch: ({ offset: [d] }) => {
        event?.preventDefault();
        const clamped = Math.min(maxScale, Math.max(minScale, d));
        transformRef.current = { ...transformRef.current, scale: clamped };
        api.set({ scale: clamped });
      },
      onWheel: ({ delta: [, dy], event }) => {
        event.preventDefault();
        const factor = dy > 0 ? 0.95 : 1.05;
        const newScale = Math.min(
          maxScale,
          Math.max(minScale, transformRef.current.scale * factor),
        );
        transformRef.current = { ...transformRef.current, scale: newScale };
        api.set({ scale: newScale });
      },
    },
    {
      drag: {
        from: () => [transformRef.current.x, transformRef.current.y],
        filterTaps: true,
        pointer: { touch: true },
      },
      pinch: {
        scaleBounds: { min: minScale, max: maxScale },
        from: () => [transformRef.current.scale, 0],
        pointer: { touch: true },
      },
      wheel: {
        eventOptions: { passive: false },
      },
    },
  );

  // Functions that replace zoomIn, zoomOut, resetTransform, centerView from TransformWrapper
  const zoomBy = (factor: number) => {
    const newScale = Math.min(
      maxScale,
      Math.max(minScale, transformRef.current.scale * factor),
    );
    const next = fixTransform(
      transformRef.current.x,
      transformRef.current.y,
      newScale,
    );
    transformRef.current = next;
    api.start(next);
  };

  const reset = () => {
    const containerWidth =
      containerRef.current?.clientWidth ?? window.innerWidth;
    const containerHeight =
      containerRef.current?.clientHeight ?? window.innerHeight;
    const cx = (containerWidth - treeBounds.width) / 2;
    const cy = (containerHeight - treeBounds.height) / 2;
    const next = { x: cx, y: cy, scale: 1 };
    transformRef.current = next;
    api.start(next);
  };

  return (
    <div
      style={{
        width: "100%",
        height: "calc(100vh - 120px)",
        minHeight: "600px",
        border: `1px solid ${theme.palette.divider}`,
        overflow: "hidden",
        backgroundColor: theme.palette.background.paper,
        position: "relative",
      }}
    >
      {/* Zoom controls outside of the pannable area */}
      <ZoomControls
        onZoomIn={() => zoomBy(1.2)}
        onZoomOut={() => zoomBy(1 / 1.2)}
        onReset={reset}
        onTogglePlanningMode={() => {
          if (!planningMode && !hasAccessedPlanningMode) {
            setShowPlanningModeModal(true);
            setHasAccessedPlanningMode(true);
          }
          setPlanningMode(treeId, !planningMode);
        }}
        planningMode={planningMode}
      />
      {planningMode && (
        <PlanningProgressIndicator
          nextStepName={goalProgress.nextStep || "All completed!"}
          nextStepId={goalProgress.nextStepId}
          treeId={treeId}
          completedCount={goalProgress.completed}
          totalCount={goalProgress.total}
          hasGoal={!!goalNodeId}
        />
      )}
      <TreeLegend />

      {/* The pannable/zoomable area */}
      <div
        {...bind()}
        style={{
          width: "100%",
          height: "100%",
          cursor: isPanning ? "grabbing" : "grab",
          touchAction: "none", // critical for mobile
        }}
      >
        <animated.div
          style={{
            x: style.x,
            y: style.y,
            scale: style.scale,
            transformOrigin: "0 0",
            willChange: "transform",
          }}
        >
          <SkillTree
            moduleItems={moduleItems}
            modulePositions={modulePositions}
            treeBounds={treeBounds}
            visiblePaths={visiblePaths}
            isCompleted={isCompleted}
            getProgress={getProgress}
            setHoveredId={setHoveredId}
            containerRef={containerRef}
            nodeRefs={nodeRefs}
            planningMode={planningMode}
            goalNodeId={goalNodeId}
            setGoalNodeId={setGoalNodeId}
            onGoalProgressChange={handleGoalProgressChange}
            nextStepId={goalProgress.nextStepId}
          />
        </animated.div>
      </div>

      <PlanningModeIntro
        open={showPlanningModeModal}
        onClose={() => setShowPlanningModeModal(false)}
      />
    </div>
  );
}
