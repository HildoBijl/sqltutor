import { RefObject, useState, useCallback } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import type { Vector } from "@/utils/geometry";
import { useDebouncedFunction } from "@/utils/dom";
import { Module } from "@/curriculum";
import { ModulePositionMeta } from "../definitions/sql-treeDefinition";
import { SkillTree } from "./SkillTree";
import { ZoomControls } from "./ZoomControls";
import { TreeLegend } from "./TreeLegend";
import { PlanningProgressIndicator } from "./PlanningProgressIndicator";
import { useTheme } from "@mui/material/";
import { useSkillTreeSettingsStore } from "@/store";
import { PlanningModeIntro } from "./PlanningModeIntro";

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
  const dispatchScrollEvent = useDebouncedFunction(() =>
    window.dispatchEvent(new Event("scroll")),
  );
  const [isPanning, setIsPanning] = useState(false);

const planningMode = useSkillTreeSettingsStore((state) => state.planningMode[treeId] ?? false);
const setPlanningMode = useSkillTreeSettingsStore((state) => state.setPlanningMode);

  const [goalProgress, setGoalProgress] = useState({
    completed: 0,
    total: 0,
    nextStep: null as string | null,
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
    (completed: number, total: number, nextStep: string | null) => {
      setGoalProgress({ completed, total, nextStep });
    },
    [],
  );

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
      <TransformWrapper
        initialScale={1}
        minScale={0.3}
        maxScale={2}
        limitToBounds={false}
        centerOnInit={true}
        wheel={{
          step: 0.05,
        }}
        doubleClick={{
          mode: "zoomIn",
        }}
        panning={{
          velocityDisabled: false,
          excluded: ["a", "button", "input"],
        }}
        onTransformed={dispatchScrollEvent}
      >
        {({ zoomIn, zoomOut, resetTransform, centerView }) => (
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <ZoomControls
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
              onReset={resetTransform}
              onCenter={centerView}
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
                completedCount={goalProgress.completed}
                totalCount={goalProgress.total}
                hasGoal={!!goalNodeId}
              />
            )}
            <TreeLegend />
            <TransformComponent
              wrapperStyle={{
                width: "100%",
                height: "100%",
                cursor: isPanning ? "grabbing" : "grab",
              }}
              contentStyle={{
                width: "100%",
                height: "100%",
              }}
              wrapperProps={{
                onMouseDown: () => setIsPanning(true),
                onMouseUp: () => setIsPanning(false),
                onMouseLeave: () => setIsPanning(false),
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
              />
            </TransformComponent>
          </div>
        )}
      </TransformWrapper>
      <PlanningModeIntro
        open={showPlanningModeModal}
        onClose={() => setShowPlanningModeModal(false)}
      />
    </div>
  );
}
