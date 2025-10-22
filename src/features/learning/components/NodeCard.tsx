import { Rectangle } from "@/components/figures/Drawing";
// @ts-ignore - SvgPortal is a JavaScript module without type definitions
import { SvgPortal } from "@/components/figures/Drawing/DrawingContext";
// @ts-ignore - Vector is a JavaScript module without type definitions
import { Vector } from "@/util/geometry/Vector";
// @ts-ignore - Element is a JavaScript module without type definitions
import { Element } from "@/components/figures";
import { ContentMeta } from "@/features/content";
import { cardWidth, cardHeight } from "../utils/settings";
import { ContentPositionMeta } from "../utils/treeDefinition";

/*
 * NodeCard component representing a concept or skill in the learning tree.
 * Renders the Rectangle with text directly inside the SVG.
 */
interface NodeCardProps {
  item: ContentMeta;
  positionData: ContentPositionMeta;
  completed: boolean;
  isHovered: boolean;
  readyToLearn?: boolean;
  isPrerequisite?: boolean;
}

// SVG data paths for icons - wrapped in a group with transform for positioning
const ICON_PATHS = {
  concept: "M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z",
  skill: "M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z",
  checkmark: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
};

export function NodeCard({
  item,
  positionData,
  completed,
  isHovered,
  readyToLearn = false,
  isPrerequisite = false,
}: NodeCardProps) {
  const type = item.type;
  const cornerRadius = type === "concept" ? 4 : 12;

  // Calculate rectangle bounds from position (top-left corner)
  const rectStart = new Vector(positionData.position.x - cardWidth / 2, positionData.position.y - cardHeight / 2);
  const rectEnd = new Vector(positionData.position.x + cardWidth / 2, positionData.position.y + cardHeight / 2);

  // Calculate position for the icon
  const iconSize = 20;
  const iconX = rectStart.x + 2.5;
  const iconY = rectStart.y + 2.5;

  // Calculate position for the checkmark
  const checkmarkSize = 18;
  const checkmarkX = rectEnd.x - 2.5;
  const checkmarkY = rectStart.y + 2.5;

  // Set the opacity based on completion state
  let nodeOpacity: number;
  let borderColor: string;
  let strokeWidth: number;

  if (isHovered || isPrerequisite) {
    nodeOpacity = 1.0;
    borderColor = isHovered ? "#FFD700" : "#9e9e9e";
    strokeWidth = 2;
  } else if (completed) {
    nodeOpacity = 1.0;
    borderColor = "#e0e0e0";
    strokeWidth = 1;
  } else if (readyToLearn) {
    nodeOpacity = 0.6;
    borderColor = "#4CAF50";
    strokeWidth = 1;
  } else {
    nodeOpacity = 0.15;
    borderColor = "#e0e0e0";
    strokeWidth = 1;
  }

  return (
    <>
      <Rectangle
        dimensions={{ start: rectStart, end: rectEnd }}
        cornerRadius={cornerRadius}
        style={{
          fill: isHovered ? "#f5f5f5" : "#fff",
          stroke: borderColor,
          strokeWidth: strokeWidth,
          transition: "fill 90ms, stroke 90ms",
        }}
      />
      <SvgPortal>
        {/* Type icon (concept/skill) in top-left corner */}
        <g
          transform={`translate(${iconX - iconSize / 2}, ${iconY - iconSize / 2
            })`}
          style={{ opacity: nodeOpacity }}
        >
          <circle
            cx={iconSize / 2}
            cy={iconSize / 2}
            r={iconSize / 2}
            fill="#ffffff"
            style={{ pointerEvents: "none" }}
          />
          <path
            d={ICON_PATHS[type]}
            fill={
              completed ? "#757575" : type === "concept" ? "#616161" : "#ff0000"
            }
            style={{
              pointerEvents: "none",
              userSelect: "none",
            }}
            transform={`scale(${iconSize / 24})`} // Original SVG viewBox is 24x24
          />
        </g>

        {/* Green checkmark in top-right corner when completed */}
        {completed && (
          <g
            transform={`translate(${checkmarkX - checkmarkSize / 2}, ${checkmarkY - checkmarkSize / 2
              })`}
          >
            <circle
              cx={checkmarkSize / 2}
              cy={checkmarkSize / 2}
              r={checkmarkSize / 2}
              fill="#4caf50"
              style={{ pointerEvents: "none" }}
            />
            <path
              d={ICON_PATHS.checkmark}
              fill="#ffffff"
              transform={`scale(${checkmarkSize / 24})`}
              style={{ pointerEvents: "none", userSelect: "none" }}
            />
          </g>
        )}
      </SvgPortal>
      
      {/* Text label */}
      <Element position={positionData.position} style={{ opacity: nodeOpacity }}>
        <div style={{ width: cardWidth - 20, textAlign: "center", fontWeight: 500 }}>
          {item.name}
        </div>
      </Element>
    </>
  );
}
