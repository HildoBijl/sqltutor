import { Box, Button, Tooltip } from "@mui/material";

/*
* ZoomControls component that provides buttons for zooming in, zooming out, resetting the view, and centering the view.
*/
interface ZoomControlsProps {
  onZoomIn: (step?: number, animationTime?: number) => void;
  onZoomOut: (step?: number, animationTime?: number) => void;
  onReset: (animationTime?: number) => void;
  onCenter: (scale?: number, animationTime?: number) => void;
}

/*
* ZoomControls component that provides buttons for zooming in, zooming out, resetting the view, and centering the view.
*
* @param onZoomIn - Callback function to zoom in.
* @param onZoomOut - Callback function to zoom out.
* @param onReset - Callback function to reset the view.
* @param onCenter - Callback function to center the view.
*/
export function ZoomControls({
  onZoomIn,
  onZoomOut,
  onReset,
  onCenter,
}: ZoomControlsProps) {
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
        boxShadow: 2,
        p: 1,
      }}
    >
      <Tooltip title="Zoom In" placement="left">
        <Button
          variant="outlined"
          size="small"
          onClick={() => onZoomIn()}
          sx={{ minWidth: "40px" }}
        >
          +
        </Button>
      </Tooltip>
      <Tooltip title="Zoom Out" placement="left">
        <Button
          variant="outlined"
          size="small"
          onClick={() => onZoomOut()}
          sx={{ minWidth: "40px" }}
        >
          −
        </Button>
      </Tooltip>
      <Tooltip title="Reset View" placement="left">
        <Button
          variant="outlined"
          size="small"
          onClick={() => onReset()}
          sx={{ minWidth: "40px" }}
        >
          ⟲
        </Button>
      </Tooltip>
      <Tooltip title="Center View" placement="left">
        <Button
          variant="outlined"
          size="small"
          onClick={() => onCenter()}
          sx={{ minWidth: "40px" }}
        >
          ◉
        </Button>
      </Tooltip>
    </Box>
  );
}
