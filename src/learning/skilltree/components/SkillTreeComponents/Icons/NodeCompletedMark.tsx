import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useTheme } from "@mui/material/";

interface NodeCompletedMarkProps {
  iconSize: number;
}

export function NodeCompletedMark({
  iconSize,
}: NodeCompletedMarkProps) {
  const theme = useTheme();

  return (
    <div
      style={{
        position: "absolute",
        top: -10,
        right: -5,
        width: iconSize,
        height: iconSize,
        backgroundColor: theme.palette.background.paper,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CheckCircleIcon style={{ fontSize: iconSize, color: "#4CAF50" }} />
    </div>
  );
}
