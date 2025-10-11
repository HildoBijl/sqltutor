import { ContentMeta } from "@/features/content";
import { Rectangle, Element } from "@/components/figures/Drawing";
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
      <Element position={new Vector(centerX, centerY)}>
        <span
          style={{
            color: completed ? "#757575" : "#212121",
            fontWeight: 500,
            textAlign: "center",
            display: "block",
            fontSize: "0.95rem",
            wordWrap: "break-word",
            whiteSpace: "normal",
            width: `${width - 10}px`,
            lineHeight: "1.2",
          }}
        >
          {item.name}
        </span>
      </Element>
    </>
  );
}
