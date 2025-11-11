import { Vector } from "@/utils/geometry";
import { Rectangle, SvgPortal, Element } from "@/components/figures";
import { ContentMeta } from "@/features/content";
import { cardWidth, cardHeight } from "../utils/settings";
import { ContentPositionMeta } from "../utils/treeDefinition";
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditNoteIcon from '@mui/icons-material/EditNote';


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
  isSomethingHovered?: boolean;
}

export function NodeCard({
  item,
  positionData,
  completed,
  isHovered,
  readyToLearn = false,
  isPrerequisite = false,
  isSomethingHovered = false,
}: NodeCardProps) {
  const type = item.type;
  const cornerRadius = type === "concept" ? 4 : 12;

  // Calculate rectangle bounds from position (top-left corner)
  const rectStart = new Vector(
    positionData.position.x - cardWidth / 2,
    positionData.position.y - cardHeight / 2
  );
  const rectEnd = new Vector(
    positionData.position.x + cardWidth / 2,
    positionData.position.y + cardHeight / 2
  );

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
  // let borderOpacity: number;

  if (isHovered || isPrerequisite) {
    if (completed) {
      nodeOpacity = 1.0;
      borderColor = "rgba(76, 175, 80, 1.0)";
      strokeWidth = 2;
    } else {
    nodeOpacity = 1.0;
    borderColor = "#E84421";
    strokeWidth = 2; }
  } else if (completed) {
    if (isSomethingHovered && !isPrerequisite) {
      nodeOpacity = 0.4;
      borderColor = "rgba(76, 175, 80, 0.4)";
      strokeWidth = 1;
    } else {
      nodeOpacity = 1.0;
      borderColor = "#4CAF50";
      strokeWidth = 1;
    }
  } else if (readyToLearn) {
    if (isSomethingHovered && !isPrerequisite) {
      nodeOpacity = 0.15;
      borderColor = "#e0e0e0";
      strokeWidth = 1;
    } else {
      nodeOpacity = 0.6;
      borderColor = "#FFD700";
      strokeWidth = 1;
    }
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
          <foreignObject
            x={0}
            y={0}
            width={iconSize}
            height={iconSize}
            style={{ pointerEvents: "none" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
              }}
            >
              {type === "concept" ? (
                <MenuBookIcon
                  sx={{
                    fontSize: iconSize,
                    color: completed ? "#757575" : "#616161",
                  }}
                />
              ) : (
                <EditNoteIcon
                  sx={{
                    fontSize: iconSize,
                    color: completed ? "#757575" : "#ff0000",
                  }}
                />
              )}
            </div>
          </foreignObject>
        </g>

        {/* Green checkmark in top-right corner when completed */}
        {completed && (
          <>
            <circle
              cx={checkmarkX}
              cy={checkmarkY}
              r={checkmarkSize / 2}
              fill="#ffffff"
              style={{ pointerEvents: "none" }}
            />
            <foreignObject
              x={checkmarkX - checkmarkSize / 2}
              y={checkmarkY - checkmarkSize / 2}
              width={checkmarkSize}
              height={checkmarkSize}
              style={{ pointerEvents: "none" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "100%",
                }}
              >
                <CheckCircleIcon
                  sx={{
                    fontSize: checkmarkSize,
                    color: "#4caf50",
                  }}
                />
              </div>
            </foreignObject>
          </>
        )}
      </SvgPortal>

      {/* Text label */}
      <Element
        position={positionData.position}
        style={{ opacity: nodeOpacity }}
      >
        <div
          style={{
            width: cardWidth - 20,
            textAlign: "center",
            fontWeight: 500,
          }}
        >
          {item.name}
        </div>
      </Element>
    </>
  );
}
