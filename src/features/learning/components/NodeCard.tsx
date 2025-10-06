import { useRef } from "react";
import { Box, Card, CardContent, Tooltip, Typography } from "@mui/material";
import { CheckCircle, MenuBook, Build } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { ContentMeta } from "@/features/content";

/*
* NodeCard component representing a concept or skill in the learning tree.
*/
interface NodeCardProps {
  item: ContentMeta;
  completed: boolean;
  progress: string | null;
  setNodeRef: (id: string) => (el: HTMLDivElement | null) => void;
  onHoverStart: (id: string) => void;
  onHoverEnd: () => void;
}

/*
* NodeCard component representing a concept or skill in the learning tree.
*
* @param item - The content item (concept or skill) to display.
* @param completed - Whether the item is completed.
* @param progress - Progress string to display (e.g., "3/5 exercises completed").
* @param setNodeRef - Function to set the ref for the node element.
* @param onHoverStart - Callback when hover starts, receives the item ID.
* @param onHoverEnd - Callback when hover ends.
*/
export function NodeCard({
  item,
  completed,
  progress,
  setNodeRef,
  onHoverStart,
  onHoverEnd,
}: NodeCardProps) {
  const type = item.type;
  const Icon = type === "concept" ? MenuBook : Build;
  const hoverTimerRef = useRef<number | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current);
    onHoverStart(item.id);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = window.setTimeout(() => onHoverEnd(), 60);
  };

  return (
    <Box
      ref={setNodeRef(item.id)}
      sx={{
        width: 160,
        zIndex: 1,
      }}
    >
      <Link
        to={`/${type}/${item.id}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <Tooltip
          title={item.description}
          placement="top"
          arrow
          enterDelay={500}
          leaveDelay={200}
        >
          <Card
            variant={completed ? "outlined" : undefined}
            sx={{
              width: "100%",
              height: 80,
              display: "flex",
              flexDirection: "column",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: type === "concept" ? 1 : 3,
              transition:
                "box-shadow 90ms cubic-bezier(.2,.7,.2,1), border-color 90ms cubic-bezier(.2,.7,.2,1), background-color 90ms cubic-bezier(.2,.7,.2,1)",
              backgroundColor: "background.paper",
              cursor: "pointer",
              "&:hover": {
                boxShadow: 4,
                borderColor: "primary.light",
                backgroundColor: "action.hover",
              },
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <CardContent
              sx={{
                p: 1,
                flexGrow: 1,
                minHeight: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box sx={{ textAlign: "center" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.5,
                    mb: 0.5,
                  }}
                >
                  <Icon
                    fontSize="small"
                    color={type === "concept" ? "action" : "primary"}
                  />
                  {completed && (
                    <Tooltip
                      disableInteractive
                      title={type === "concept" ? "Understood" : "Mastered"}
                    >
                      <CheckCircle color="success" fontSize="small" />
                    </Tooltip>
                  )}
                </Box>
                <Typography
                  variant="body2"
                  component="h3"
                  sx={{
                    fontWeight: 500,
                    color: completed ? "text.secondary" : "text.primary",
                    fontSize: "0.95rem",
                    lineHeight: 1.2,
                  }}
                >
                  {item.name}
                </Typography>
                {progress && (
                  <Typography
                    variant="caption"
                    color="primary"
                    sx={{
                      display: "block",
                      fontWeight: 600,
                      fontSize: "0.65rem",
                    }}
                  >
                    {progress}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Tooltip>
      </Link>
    </Box>
  );
}
