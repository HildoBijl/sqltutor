import { useState } from "react";
import PushPinIcon from "@mui/icons-material/PushPin";
import { PlayArrow } from "@mui/icons-material";
import { useTheme } from "@mui/material/";

interface NodeGoalPinProps {
  variant: "set" | "active" | "next-step";
  checkmarkSize: number;
  onSetGoal?: () => void;
}

export function NodeGoalPin({ variant, checkmarkSize, onSetGoal }: NodeGoalPinProps) {
  const theme = useTheme();
  const [isPinHovered, setIsPinHovered] = useState(false);

  const containerStyle: React.CSSProperties = {
    position: "absolute",
    top: -15,
    right: -15,
    width: 2 * checkmarkSize,
    height: 2 * checkmarkSize,
    backgroundColor: theme.palette.background.paper,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    pointerEvents: "auto",
  };

  if (variant === "next-step") {
    return (
      <div style={{ ...containerStyle, border: "1px solid", color: "#FFD700" }}>
        <PlayArrow style={{ fontSize: checkmarkSize - 4, color: "#FFD700" }} />
      </div>
    );
  }

  const isActive = variant === "active";

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (onSetGoal) onSetGoal();
      }}
      onMouseEnter={() => setIsPinHovered(true)}
      onMouseLeave={() => setIsPinHovered(false)}
      style={{
        ...containerStyle,
        border: `1px solid ${
          isActive
            ? isPinHovered ? "#616161" : "purple"
            : isPinHovered ? "purple" : "#616161"
        }`,
      }}
    >
      <PushPinIcon
        style={{
          fontSize: checkmarkSize - 4,
          color: isActive
            ? isPinHovered ? "#9aa0a6" : "purple"
            : isPinHovered ? "purple" : "#9aa0a6",
        }}
      />
    </div>
  );
}
