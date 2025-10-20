import { ContentMeta } from "@/features/content";
import { Rectangle } from "@/components/figures/Drawing";
// @ts-ignore - SvgPortal is a JavaScript module without type definitions
import { SvgPortal } from "@/components/figures/Drawing/DrawingContext";
// @ts-ignore - Vector is a JavaScript module without type definitions
import { Vector } from "@/util/geometry/Vector";
// @ts-ignore - Element is a JavaScript module without type definitions
import { Element } from "@/components/figures";
import { Opacity } from "@mui/icons-material";

/*
 * NodeCard component representing a concept or skill in the learning tree.
 * Renders the Rectangle with text directly inside the SVG.
 */
interface NodeCardProps {
  item: ContentMeta;
  completed: boolean;
  isHovered: boolean;
}

// SVg data paths for icons - wrapped in a group with transform for positioning
const ICON_PATHS = {
  concept: "M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z",
  skill: "M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z",
  checkmark: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
}

// Helper function to split text into lines that fit within the width
function wrapText(text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  // Should be based on font size, this is an estimate for 0.95 rem
  const avgCharWidth = 7;
  const maxCharsPerLine = Math.floor(maxWidth / avgCharWidth);

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length <= maxCharsPerLine) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines;
}

export function NodeCard({ item, completed, isHovered }: NodeCardProps) {
  const type = item.type;
  const width = 160;
  const height = 80;
  const cornerRadius = type === "concept" ? 4 : 12;

  // Calculate rectangle bounds from position (top-left corner)
  const rectStart = new Vector(item.position.x, item.position.y);
  const rectEnd = new Vector(item.position.x + width, item.position.y + height);

  // Calculate center position for text
  const centerX = item.position.x + width / 2;
  const centerY = item.position.y + height / 2;

  //Calculate position for the icon
  const iconSize = 20;
  const iconX = item.position.x + 2.5;
  const iconY = item.position.y + 2.5;

  // Calculate position for the checkmark
  const checkmarkSize = 18;
  const checkmarkX = item.position.x + width - 2.5;
  const checkmarkY = item.position.y + 2.5;

  // Wrap text to fit in the node card
  const lines = wrapText(item.name, width - 20);
  const lineHeight = 16;
  const totalHeight = lines.length * lineHeight;
  const startY = centerY - totalHeight / 2 + lineHeight / 2;

  // Node opacity based on completion status 
  const nodeOpacity = completed ? 1.0 : 0.15;

  return (
    <>
      <Rectangle
        dimensions={{ start: rectStart, end: rectEnd }}
        cornerRadius={cornerRadius}
        style={{
          fill: isHovered ? "#f5f5f5" : "#fff",
          stroke: isHovered ? "#ff0000" : "#e0e0e0",
          strokeWidth: 1,
          transition: "fill 90ms, stroke 90ms",
        }}
      />
      <SvgPortal>
        {/* Type icon (concept/skill) in top-left corner */}
        <g transform={`translate(${iconX - iconSize / 2}, ${iconY - iconSize / 2})`}
        style ={{ opacity: nodeOpacity }}>
          <circle
            cx={iconSize / 2}
            cy={iconSize / 2}
            r={iconSize / 2}
            fill="#ffffff"
            style={{ pointerEvents: "none" }}
          />
          <path
            d={ICON_PATHS[type]}
            fill={completed ? "#757575" : (type === "concept" ? "#616161" : "#ff0000")}
            style={{
              pointerEvents: "none",
              userSelect: "none",
            }}
            transform={`scale(${iconSize / 24})`} // Original SVG viewBox is 24x24
          />
        </g>

        {/* Green checkmark in top-right corner when completed */}
        {completed && (
          <g transform={`translate(${checkmarkX - checkmarkSize / 2}, ${checkmarkY - checkmarkSize / 2})`}>
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

        {/* Text label */}
        <Element position={[centerX, centerY]} style={{opacity: nodeOpacity}}>
          <div style={{ width: width - 20, textAlign: 'center' }}>{item.name}</div>
        </Element>
        {/* <text
          x={centerX}
          y={startY}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fill: "#212121",
            fontWeight: 500,
            fontSize: "0.95rem",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {lines.map((line, i) => (
            <tspan key={i} x={centerX} dy={i === 0 ? 0 : lineHeight}>
              {line}
            </tspan>
          ))}
        </text> */}
      </SvgPortal>
    </>
  );
}
