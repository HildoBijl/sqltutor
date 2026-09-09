import { Box, Button, Tooltip } from "@mui/material";
import { Add, Remove, Refresh, OutlinedFlag, HelpOutline} from "@mui/icons-material";
import { treeColors } from "../../utils/graphics/treeColors";

/*
 * ZoomControls component that provides buttons for zooming in, zooming out, resetting the view, and centering the view.
 */
interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onCenter: () => void;
  planningMode?: boolean;
  onTogglePlanningMode?: () => void;
  allowZoom?: boolean;
  onHelp?: () => void;
}

/*
 * ZoomControls component that provides buttons for zooming in, zooming out, resetting the view, and centering the view.
 *
 * @param onZoomIn - Callback function to zoom in.
 * @param onZoomOut - Callback function to zoom out.
 * @param onReset - Callback function to reset the view.
 * @param onCenter - Callback function to center the view.
 * @param onHelp - Callback function to show instructions.
 */
export function ZoomControls({
  onZoomIn,
  onZoomOut,
  onReset,
  onTogglePlanningMode,
  onHelp,
  planningMode,
  allowZoom = true,
}: ZoomControlsProps) {
  if (!allowZoom && !onTogglePlanningMode && !onHelp) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        top: 16,
        right: 16,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        backgroundColor: "background.paper",
        borderRadius: 2,
        p: 1,
      }}
    >
      {allowZoom && (
        <>
          <Tooltip title="Zoom In" placement="left">
            <Button
              variant="outlined"
              size="small"
              onClick={() => onZoomIn()}
              sx={{ minWidth: "40px" }}
            >
              <Add fontSize="small" color="primary" />
            </Button>
          </Tooltip>
          <Tooltip title="Zoom Out" placement="left">
            <Button
              variant="outlined"
              size="small"
              onClick={() => onZoomOut()}
              sx={{ minWidth: "40px" }}
            >
              <Remove fontSize="small" color="primary" />
            </Button>
          </Tooltip>
          <Tooltip title="Reset View" placement="left">
            <Button
              variant="outlined"
              size="small"
              onClick={() => onReset()}
              sx={{ minWidth: "40px", fontSize: "15px" }}
            >
              <Refresh fontSize="small" color="primary" />
            </Button>
          </Tooltip>
        </>
      )}
      {onTogglePlanningMode && (
        <Tooltip title="Planning Mode" placement="left">
          <Button
            variant={planningMode ? "contained" : "outlined"}
            size="small"
            onClick={onTogglePlanningMode}
            sx={{
              minWidth: "40px",
              fontSize: "15px",
              ...(planningMode && {
                backgroundColor: treeColors.goal,
                borderColor: treeColors.goal,
                "&:hover": { backgroundColor: treeColors.goalHover },
              }),
            }}
          >
            <OutlinedFlag
              fontSize="small"
              sx={{ color: planningMode ? "white" : "primary" }}
            />
          </Button>
        </Tooltip>
      )}
      {onHelp && (
        <Tooltip title="Help" placement="left">
          <Button
            variant="outlined"
            size="small"
            onClick={onHelp}
            sx={{ minWidth: "40px", fontSize: "15px" }}
          >
            <HelpOutline fontSize="small" color="primary" />
          </Button>
        </Tooltip>
      )}
    </Box>
  );
}
