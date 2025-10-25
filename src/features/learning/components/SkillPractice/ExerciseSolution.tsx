import { Paper, Typography } from '@mui/material';

interface ExerciseSolutionProps {
  solution?: string | null;
}

export function ExerciseSolution({ solution }: ExerciseSolutionProps) {
  if (!solution) {
    return null;
  }

  return (
    <Paper sx={{ mt: 3, p: 2, bgcolor: 'success.light' }}>
      <Typography variant="h6" gutterBottom sx={{ color: 'success.dark' }}>
        Solution
      </Typography>
      <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Typography
          component="pre"
          sx={{
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            m: 0,
          }}
        >
          {solution}
        </Typography>
      </Paper>
    </Paper>
  );
}

