import type { ReactNode } from "react";
import { Element, useDrawingMousePosition } from "@/components";
import { useTheme } from "@mui/material/";

interface TooltipProps {
  children?: ReactNode;
}

export function Tooltip({ children }: TooltipProps) {
  const mousePosition = useDrawingMousePosition();
  const theme = useTheme();

  if (!children || !mousePosition) return null;

  return (
    <Element anchor={[-1, -1]} position={mousePosition.add([20, 10])}>
      <div
        style={{
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          padding: "8px 12px",
          borderRadius: "4px",
          fontSize: "14px",
          maxWidth: "300px",
          zIndex: 1000,
          boxShadow: theme.shadows[4],
        }}
      >
        {children}
      </div>
    </Element>
  );
}
