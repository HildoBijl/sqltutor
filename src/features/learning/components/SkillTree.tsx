import { RefObject, useState } from "react";
import { ContentMeta } from "@/features/content";
import { Drawing, Curve } from "@/components/figures/Drawing";
// @ts-ignore - Vector is a JavaScript module without type definitions
import type { Vector } from "@/util/geometry/Vector";
import { NodeCard } from "./NodeCard";
import { ContentPositionMeta } from "../utils/treeDefinition";

/*
 * SkillTree component that renders the tree structure with nodes and connectors.
 * This is a pure rendering component without zoom/pan controls.
 * Uses the Drawing library for coordinate-based positioning.
 *
 * @param contentItems - Array of content items (concepts and skills) to display.
 * @param treeBounds - The bounding box of the tree layout.
 * @param visiblePaths - Array of connector objects with points arrays and from/to node IDs.
 * @param isCompleted - Function to check if a content item is completed.
 * @param getProgress - Function to get progress string for a content item.
 * @param setHoveredId - Function to set the hovered node ID.
 * @param containerRef - Ref to the container div for the tree.
 * @param nodeRefs - Ref to a map of node IDs to their corresponding div elements.
 */
interface SkillTreeProps {
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
  visiblePaths: { points: (typeof Vector)[]; from: string; to: string }[];
  isCompleted: (id: string) => boolean;
  getProgress: (id: string) => string | null;
  setHoveredId: (id: string | null) => void;
  containerRef: RefObject<HTMLDivElement | null>;
  nodeRefs: RefObject<Map<string, HTMLDivElement | null>>;
}

export function SkillTree({
  contentItems,
  contentPositions,
  treeBounds,
  visiblePaths,
  isCompleted,
  // getProgress,
  setHoveredId,
  containerRef,
}: // nodeRefs,
  SkillTreeProps) {
  const [localHoveredId, setLocalHoveredId] = useState<string | null>(null);
  const [prerequisites, setPrerequisites] = useState<Set<string>>(new Set());

  // const setNodeRef = (id: string) => (el: HTMLDivElement | null) => {
  //   nodeRefs.current?.set(id, el);
  // };

  // Recursive function to get all prerequisites for a given item
  const getPrerequisites = (itemId: string): Set<string> => {
    const prerequisites = new Set<string>();
    const item = contentItems[itemId];

    if (!item?.prerequisites || item.prerequisites.length === 0) return prerequisites;

    for (const prereqId of item.prerequisites) {
      prerequisites.add(prereqId);
      const nestedPrereqs = getPrerequisites(prereqId);
      for (const p of nestedPrereqs) {
        prerequisites.add(p);
      }
    }

    return prerequisites;
  }

  const handleHoverStart = (id: string) => {
    setLocalHoveredId(id);
    setHoveredId(id);
    const chain = getPrerequisites(id);
    // Caulculate full prerequisite chain
    setPrerequisites(chain);
  };

  const handleHoverEnd = () => {
    setLocalHoveredId(null);
    setHoveredId(null);
    // Reset the prerequisite chain
    setPrerequisites(new Set());
  };

  const handleNodeClick = (item: ContentMeta) => {
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
        margin: "0 auto",
        //opacity: 0.3,
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
        {visiblePaths.map((connector, i) => (
          <Curve
            key={i}
            points={connector.points}
            color="#9aa0a6"
            size={1.5}
            spread={20}
            style={{ opacity: 0.20 }}
          />
        ))}

        {/* Rectangles in the SVG layer, and only those whose position is defined */}
        {Object.values(contentPositions).map(positionData => {
          const item = contentItems[positionData.id];
          const allPrequisitesCompleted = item.prerequisites?.every((preId) => isCompleted(preId)) ?? true;
          const readyToLearn = !isCompleted(item.id) && allPrequisitesCompleted;

          return (
            <g
              key={item.id}
              onMouseEnter={() => handleHoverStart(item.id)}
              onMouseLeave={handleHoverEnd}
              onClick={() => handleNodeClick(item)}
              style={{ cursor: "pointer" }}
            >
              <NodeCard
                item={item}
                positionData={contentPositions[item.id]}
                completed={isCompleted(item.id)}
                isHovered={localHoveredId === item.id}
                readyToLearn={readyToLearn}
                isPrerequisite={prerequisites.has(item.id)}
              />
            </g>
          );
        })}
      </Drawing>
    </div>
  );
}
