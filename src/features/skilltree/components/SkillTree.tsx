import { RefObject, useState } from "react";
import type { Vector } from "@/utils/geometry";
import { Drawing, Curve } from "@/components/figures";
import { ContentMeta } from "@/features/content";
import { NodeCard } from "./NodeCard";
import { ContentPositionMeta } from "../utils/treeDefinition";

/*
 * SkillTree component that renders the tree structure with nodes and connectors.
 * This is a pure rendering component without zoom/pan controls.
 * Uses the Drawing library for coordinate-based positioning.
 *
 * @param contentItems - Array of content items (concepts and skills) with info about these contents.
 * @param contentPositions - Array of content position data entries to display.
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
  visiblePaths: { points: Vector[]; from: string; to: string }[];
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

    if (!item?.prerequisites || item.prerequisites.length === 0)
      return prerequisites;

    for (const prereqId of item.prerequisites) {
      prerequisites.add(prereqId);
      const nestedPrereqs = getPrerequisites(prereqId);
      for (const p of nestedPrereqs) {
        prerequisites.add(p);
      }
    }

    return prerequisites;
  };

  // Tooltip state
  const [tooltip, setTooltip] = useState<{
    content: string;
    x: number;
    y: number;
  } | null>(null);

  // Handlers for hover events
  const handleHoverStart = (id: string, event: React.MouseEvent) => {
    setLocalHoveredId(id);
    setHoveredId(id);
    const chain = getPrerequisites(id);
    // Calculate full prerequisite chain
    setPrerequisites(chain);

    // Show tooltip at cursor position
    const item = contentItems[id];
    const rect = containerRef.current?.getBoundingClientRect();
    const offsetX = rect ? event.clientX - rect.left : event.clientX;
    const offsetY = rect ? event.clientY - rect.top : event.clientY;

    // Upon hover, show description in tooltip
    setTooltip({
      content: item.description || "No description available",
      x: offsetX + 15,
      y: offsetY - 10,
    });
  };

  // Update tooltip position on mouse move
  const handleMouseMove = (event: React.MouseEvent) => {
    if (tooltip) {
      const rect = containerRef.current?.getBoundingClientRect();
      const offsetX = rect ? event.clientX - rect.left : event.clientX;
      const offsetY = rect ? event.clientY - rect.top : event.clientY;

      setTooltip({
        ...tooltip,
        x: offsetX + 15,
        y: offsetY - 10,
      });
    }
  };

  const handleHoverEnd = () => {
    setLocalHoveredId(null);
    setHoveredId(null);
    // Reset the prerequisite chain
    setPrerequisites(new Set());
    setTooltip(null);
  };

  // Handler for click events on nodes
  const handleNodeClick = (item: ContentMeta) => {
    const path =
      item.type === "skill" ? `/skill/${item.id}` : `/concept/${item.id}`;
    window.location.href = path;
  };

  // Determine if a node is ready to learn
  const isReadyToLearn = (item: ContentMeta): boolean => {
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

  // Determine the style for connectors based on different cases
  const getConnectorStyle = (connector: { from: string; to: string }) => {
    // Full opacity for connectors in the hovered path
    if (isConnectorInHoveredPath(connector)) {
      return { opacity: 0.7 };
    }
    // If hovering over some node, fade all other connectors
    if (localHoveredId) {
      return { opacity: 0.2 };
    }

    // When no hover, opacity is based on completion status
    const bothCompleted =
      isCompleted(connector.from) && isCompleted(connector.to);
    const isNextToLearn =
      isReadyToLearn(contentItems[connector.to]) && isCompleted(connector.from);

    if (bothCompleted) {
      return { opacity: 0.7 };
    }
    if (isNextToLearn) {
      return { opacity: 0.5 };
    }
    return { opacity: 0.2 };
  };

  const getConnectorColor = (connector: { from: string; to: string }) => {
    // If a connectors is in the hover path, highlight it
    if (isConnectorInHoveredPath(connector)) {
      return "#9aa0a6";
    }

    if (localHoveredId) {
      return "#9aa0a6";
    }

    // Color based on completition status, no hover active
    const bothCompleted =
      isCompleted(connector.from) && isCompleted(connector.to);
    const isNextToLearn =
      isReadyToLearn(contentItems[connector.to]) && isCompleted(connector.from);
    if (bothCompleted) {
      return "#9aa0a6";
    }
    if (isNextToLearn) {
      return "#FFD700";
    }
    return "#9aa0a6";
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
            color={getConnectorColor(connector)}
            size={1.5}
            curveDistance={20}
            style={getConnectorStyle(connector)}
          />
        ))}

        {/* Rectangles in the SVG layer, and only those whose position is defined */}
        {Object.values(contentPositions).map((positionData) => {
          const item = contentItems[positionData.id];
          const readyToLearn = isReadyToLearn(item);

          return (
            <g
              key={item.id}
              onMouseEnter={(e) => handleHoverStart(item.id, e)}
              onMouseMove={handleMouseMove}
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
                isSomethingHovered={localHoveredId !== null}
              />
            </g>
          );
        })}
      </Drawing>
      {tooltip && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x,
            top: tooltip.y,
            border: "1px solid #ccc",
            backgroundColor: "rgba(255, 255, 255, 0.75)",
            color: "black",
            padding: "8px 12px",
            borderRadius: "4px",
            fontSize: "14px",
            maxWidth: "300px",
            pointerEvents: "none",
            zIndex: 1000,
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}
