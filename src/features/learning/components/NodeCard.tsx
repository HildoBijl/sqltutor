import { ContentMeta } from "@/features/content";
import { Rectangle } from "@/components/figures/Drawing";
// @ts-ignore - SvgPortal is a JavaScript module without type definitions
import { SvgPortal } from "@/components/figures/Drawing/DrawingContext";
// @ts-ignore - Vector is a JavaScript module without type definitions
import { Vector } from "@/util/geometry/Vector";

/*
 * NodeCard component representing a concept or skill in the learning tree.
 * Renders the Rectangle with text directly inside the SVG.
 */
interface NodeCardProps {
  item: ContentMeta;
  completed: boolean;
  isHovered: boolean;
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

  // Wrap text to fit in the node card
  const lines = wrapText(item.name, width - 20);
  const lineHeight = 16; 
  const totalHeight = lines.length * lineHeight;
  const startY = centerY - totalHeight / 2 + lineHeight / 2;

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
        <text
          x={centerX}
          y={startY}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fill: completed ? "#757575" : "#212121",
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
        </text>
      </SvgPortal>
    </>
  );
}
