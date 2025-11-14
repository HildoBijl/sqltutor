import { Vector } from "@/utils/geometry";
import { Rectangle, Element } from "@/components/figures";
import { ContentMeta } from "@/features/content";
import { cardWidth, cardHeight } from "../utils/settings";
import { ContentPositionMeta } from "../utils/treeDefinition";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { useTheme } from "@mui/material/";

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
  const theme = useTheme();
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

  // Calculate position for the checkmark
  const checkmarkSize = 18;


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
      strokeWidth = 2;
    }
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
    {/* Background rectangle to avoid lines in the backround */}
    <Rectangle
        dimensions={{ start: rectStart, end: rectEnd }}
        cornerRadius={cornerRadius}
        style ={{
          fill: theme.palette.background.paper,
          stroke: theme.palette.divider,
          strokeWidth: 1,
          strokeOpacity: nodeOpacity,
        }}
      />
      <Rectangle
        dimensions={{ start: rectStart, end: rectEnd }}
        cornerRadius={cornerRadius}
        style={{
          fill: isHovered ? theme.palette.action.hover : theme.palette.background.paper,
          stroke: borderColor,
          strokeWidth: strokeWidth,
          strokeOpacity: nodeOpacity,
          transition: "fill 90ms, stroke 90ms",
        }}
      />

      {/* Text label */}
      <Element
        position={positionData.position}
        anchor={[0, 0]}
        passive={false}
        style={{ opacity: nodeOpacity }}
      >
        <div
          style={{
            width: cardWidth,
            height: cardHeight,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            textAlign: "center",
            fontWeight: 500,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -10,
              left: -5,
              width: iconSize,
              height: iconSize,
              backgroundColor: theme.palette.background.paper,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {type === "concept" ? (
              <MenuBookIcon
                style={{
                  fontSize: iconSize,
                  color: completed ? "#757575" : "#616161",
                }}
              />
            ) : (
              <EditNoteIcon
                style={{
                  fontSize: iconSize,
                  color: completed ? "#757575" : "#ff0000",
                }}
              />
            )}
          </div>

          {completed && (
            <div
              style={{
                position: "absolute",
                top: -10,
                right: -5,
                width: checkmarkSize,
                height: checkmarkSize,
                backgroundColor: theme.palette.background.paper,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircleIcon
                style={{ fontSize: checkmarkSize, color: "#4CAF50" }}
              />
            </div>
          )}

          <div
            style={{
              width: cardWidth - 20,
              textAlign: "center",
              fontWeight: 500,
            }}
          >
            {item.name}
          </div>
        </div>
      </Element>
    </>
  );
}
