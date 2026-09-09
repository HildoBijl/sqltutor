import { Box, LinearProgress, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link } from '@sqlvalley/ui';
import { treeColors } from '../../utils/graphics/treeColors';

interface PlanningProgressIndicatorProps {
  nextStepName: string;
  nextStepHref: string | null;
  completedCount: number;
  totalCount: number;
  hasGoal: boolean;
}

export function PlanningProgressIndicator({
  nextStepName,
  nextStepHref,
  completedCount,
  totalCount,
  hasGoal,
}: PlanningProgressIndicatorProps) {
  const theme = useTheme();
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 1000,
        backgroundColor: 'background.paper',
        borderRadius: 2,
        p: 2,
        width: 220,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      {hasGoal ? (
        <>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Goal Progress
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'wrap',
            }}
          >
            Next Step:{' '}
            {nextStepHref ? (
              <Link to={nextStepHref} style={{ color: 'red', fontWeight: 700 }}>
                {nextStepName}
              </Link>
            ) : (
              <strong style={{ color: 'red' }}>{nextStepName}</strong>
            )}
          </Typography>

          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.palette.grey[200],
              '& .MuiLinearProgress-bar': {
                backgroundColor:
                  progress < 33
                    ? 'red'
                    : progress < 66
                      ? 'orange'
                      : progress === 100
                        ? treeColors.goal
                        : 'green',
                borderRadius: 4,
              },
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {completedCount} / {totalCount} modules completed
          </Typography>
        </>
      ) : (
        <>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Goal Progress
          </Typography>
          <Typography
            variant="body2"
            sx={{
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'wrap',
            }}
          >
            No goal set. Click on a pin to set your learning goal!
          </Typography>
        </>
      )}
    </Box>
  );
}
