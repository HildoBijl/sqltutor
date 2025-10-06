import { RefObject } from "react";
import { Box } from "@mui/material";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ContentMeta } from "@/features/content";
import { NodeCard } from "./NodeCard";
import { ZoomControls } from "./ZoomControls";
import { TreeLegend } from "./TreeLegend";

/*
* SkillTreeCanvas component that renders the interactive skill tree with zoom and pan capabilities.
*
* @param contentItems - Array of content items (concepts and skills) to display.
* @param treeBounds - The bounding box of the tree layout.
* @param visiblePaths - Array of SVG path data for visible connectors between nodes.
* @param isCompleted - Function to check if a content item is completed.
* @param getProgress - Function to get progress string for a content item.
* @param hoveredId - ID of the currently hovered node, or null if none.
* @param setHoveredId - Function to set the hovered node ID.
* @param containerRef - Ref to the container div for the tree.
* @param nodeRefs - Ref to a map of node IDs to their corresponding div elements.
*/
interface SkillTreeCanvasProps {
  contentItems: ContentMeta[];
  treeBounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
  };
  visiblePaths: { d: string; from: string; to: string }[];
  isCompleted: (id: string) => boolean;
  getProgress: (id: string) => string | null;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  containerRef: RefObject<HTMLDivElement | null>;
  nodeRefs: RefObject<Map<string, HTMLDivElement | null>>;
}

export function SkillTreeCanvas({
  contentItems,
  treeBounds,
  visiblePaths,
  isCompleted,
  getProgress,
  setHoveredId,
  containerRef,
  nodeRefs,
}: SkillTreeCanvasProps) {
  const setNodeRef = (id: string) => (el: HTMLDivElement | null) => {
    nodeRefs.current?.set(id, el);
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "calc(100vh - 120px)",
        minHeight: "600px",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
        backgroundColor: "background.default",
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
      >
        {({ zoomIn, zoomOut, resetTransform, centerView }) => (
          <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
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
              }}
              contentStyle={{
                width: "100%",
                height: "100%",
              }}
            >
              <Box
                ref={containerRef}
                sx={{
                  position: "relative",
                  width: `${treeBounds.width}px`,
                  height: `${treeBounds.height}px`,
                  margin: "0 auto",
                }}
              >
                {/* Connectors overlay */}
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    zIndex: 0,
                  }}
                >
                  <svg
                    width="100%"
                    height="100%"
                    style={{ overflow: "visible" }}
                  >
                    {visiblePaths.map((p, i) => (
                      <path
                        key={i}
                        d={p.d}
                        stroke="#9aa0a6"
                        strokeWidth={1.5}
                        fill="none"
                        strokeLinecap="round"
                      />
                    ))}
                  </svg>
                </Box>

                {/* Absolutely positioned nodes */}
                {contentItems.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      position: "absolute",
                      left: item.position.x - treeBounds.minX,
                      top: item.position.y - treeBounds.minY,
                      opacity: 1,
                    }}
                  >
                    <NodeCard
                      item={item}
                      completed={isCompleted(item.id)}
                      progress={getProgress(item.id)}
                      setNodeRef={setNodeRef}
                      onHoverStart={setHoveredId}
                      onHoverEnd={() => setHoveredId(null)}
                    />
                  </Box>
                ))}
              </Box>
            </TransformComponent>
          </Box>
        )}
      </TransformWrapper>
    </Box>
  );
}
