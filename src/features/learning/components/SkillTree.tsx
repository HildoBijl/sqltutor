import { RefObject, useState } from "react";
import { ContentMeta } from "@/features/content";
import { Drawing } from "@/components/figures/Drawing";
import { NodeCard } from "./NodeCard";

/*
* SkillTree component that renders the tree structure with nodes and connectors.
* This is a pure rendering component without zoom/pan controls.
* Uses the Drawing library for coordinate-based positioning.
*
* @param contentItems - Array of content items (concepts and skills) to display.
* @param treeBounds - The bounding box of the tree layout.
* @param visiblePaths - Array of SVG path data for visible connectors between nodes.
* @param isCompleted - Function to check if a content item is completed.
* @param getProgress - Function to get progress string for a content item.
* @param setHoveredId - Function to set the hovered node ID.
* @param containerRef - Ref to the container div for the tree.
* @param nodeRefs - Ref to a map of node IDs to their corresponding div elements.
*/
interface SkillTreeProps {
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
  setHoveredId: (id: string | null) => void;
  containerRef: RefObject<HTMLDivElement | null>;
  nodeRefs: RefObject<Map<string, HTMLDivElement | null>>;
}

export function SkillTree({
  contentItems,
  treeBounds,
  visiblePaths,
  isCompleted,
  // getProgress,
  // setHoveredId,
  containerRef,
  // nodeRefs,
}: SkillTreeProps) {
  // const [localHoveredId, setLocalHoveredId] = useState<string | null>(null);

  // const setNodeRef = (id: string) => (el: HTMLDivElement | null) => {
  //   nodeRefs.current?.set(id, el);
  // };

  // const handleHoverStart = (id: string) => {
  //   setLocalHoveredId(id);
  //   setHoveredId(id);
  // };

  // const handleHoverEnd = () => {
  //   setLocalHoveredId(null);
  //   setHoveredId(null);
  // };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: `${treeBounds.width}px`,
        height: `${treeBounds.height}px`,
        margin: "0 auto",
      }}
    >
      <Drawing
        width={treeBounds.width}
        height={treeBounds.height}
        useSvg={true}
        useCanvas={false}
      >
        {/* SVG connector paths - rendered in Drawing's SVG layer */}
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

        {/* Node rectangles - rendered in SVG layer */}
        {contentItems.map((item) => (
          <NodeCard
            key={item.id}
            item={item}
            completed={isCompleted(item.id)}
            isHovered={false}
          />
        ))}
      </Drawing>
    </div>
  );
}
