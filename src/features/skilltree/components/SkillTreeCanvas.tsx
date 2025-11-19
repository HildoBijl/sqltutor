import { RefObject, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import type { Vector } from "@/utils/geometry";
import { useDebouncedFunction } from "@/utils/dom";
import { ContentMeta } from "@/features/content";
import { ContentPositionMeta } from "../utils/treeDefinition";
import { SkillTree } from "./SkillTree";
import { ZoomControls } from "./ZoomControls";
import { TreeLegend } from "./TreeLegend";
import { useTheme } from "@mui/material/";

/*
 * SkillTreeCanvas component that wraps the skill tree with zoom and pan capabilities.
 * This component only handles the zoom/pan functionality and UI controls.
 *
 * @param contentItems - Array of content items (concepts and skills) with info about these contents.
 * @param contentPositions - Array of content position data entries to display.
 * @param treeBounds - The bounding box of the tree layout.
 * @param visiblePaths - Array of connector objects with points arrays and from/to node IDs.
 * @param isCompleted - Function to check if a content item is completed.
 * @param getProgress - Function to get progress string for a content item.
 * @param hoveredId - ID of the currently hovered node, or null if none.
 * @param setHoveredId - Function to set the hovered node ID.
 * @param containerRef - Ref to the container div for the tree.
 * @param nodeRefs - Ref to a map of node IDs to their corresponding div elements.
 */
interface SkillTreeCanvasProps {
  contentItems: Record<string, ContentMeta>;
  contentPositions: Record<string, ContentPositionMeta>;
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
  contentItems,
  contentPositions,
  treeBounds,
  visiblePaths,
  isCompleted,
  getProgress,
  setHoveredId,
  containerRef,
  nodeRefs,
}: SkillTreeCanvasProps) {
  const dispatchScrollEvent = useDebouncedFunction(() => window.dispatchEvent(new Event("scroll")));
  const [isPanning, setIsPanning] = useState(false);

  const theme = useTheme();

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
            />
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
                contentItems={contentItems}
                contentPositions={contentPositions}
                treeBounds={treeBounds}
                visiblePaths={visiblePaths}
                isCompleted={isCompleted}
                getProgress={getProgress}
                setHoveredId={setHoveredId}
                containerRef={containerRef}
                nodeRefs={nodeRefs}
              />
            </TransformComponent>
          </div>
        )}
      </TransformWrapper>
    </div>
  );
}
