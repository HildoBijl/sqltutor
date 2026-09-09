import { useState } from "react";
import PushPinIcon from "@mui/icons-material/PushPin";
import { PlayArrow } from "@mui/icons-material";
import { useTheme } from "@mui/material/";
import { treeColors } from "../../../utils/graphics/treeColors";

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
      <div style={{ ...containerStyle, border: "1px solid", color: treeColors.ready }}>
        <PlayArrow style={{ fontSize: checkmarkSize - 4, color: treeColors.ready }} />
      </div>
    );
  }

  const isActive = variant === "active";

  return (
    <div
      onPointerDown={(e) => {
        e.stopPropagation();
        if (onSetGoal) onSetGoal();
      }}
      onMouseEnter={() => setIsPinHovered(true)}
      onMouseLeave={() => setIsPinHovered(false)}
      style={{
        ...containerStyle,
        border: `1px solid ${
          isActive
            ? isPinHovered ? treeColors.icon : treeColors.goal
            : isPinHovered ? treeColors.goal : treeColors.icon
        }`,
      }}
    >
      <PushPinIcon
        style={{
          fontSize: checkmarkSize - 4,
          color: isActive
            ? isPinHovered ? treeColors.neutral : treeColors.goal
            : isPinHovered ? treeColors.goal : treeColors.neutral,
        }}
      />
    </div>
  );
}
