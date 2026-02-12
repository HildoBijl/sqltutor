import { Box, Typography, LinearProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface PlanningProgressIndicatorProps {
  nextStepName: string;
  completedCount: number;
  totalCount: number;
}

export function PlanningProgressIndicator({
  nextStepName,
  completedCount,
  totalCount,
}: PlanningProgressIndicatorProps) {
  const theme = useTheme();
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Box
      sx={{
        position: "absolute",
        top: 16,
        left: 16,
        zIndex: 1000,
        backgroundColor: "background.paper",
        borderRadius: 2,
        p: 2,
        minWidth: 200,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        Goal Progress
      </Typography>

      <Typography
        variant="body2"
        sx={{
          mb: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        Next Step: <strong style={{ color: "red" }}>{nextStepName}</strong>
      </Typography>

      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: theme.palette.grey[200],
          "& .MuiLinearProgress-bar": {
            backgroundColor: progress < 33 ? "red" : progress < 66 ? "orange" : progress == 100 ? "purple" : "green",
            borderRadius: 4,
          },
        }}
      />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {completedCount} / {totalCount} modules completed
      </Typography>
    </Box>
  );
}
