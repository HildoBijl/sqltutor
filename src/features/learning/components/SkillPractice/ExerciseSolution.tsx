import { useState } from 'react';

import { Box, Button, Collapse, Paper, Typography } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

interface ExerciseSolutionProps {
  solution?: string | null;
  show?: boolean;
}

export function ExerciseSolution({ solution, show = true }: ExerciseSolutionProps) {
  const [expanded, setExpanded] = useState(true);

  if (!solution || !show) {
    return null;
  }

  return (
    <Paper sx={{ mt: 3, p: 2, bgcolor: 'success.light' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Typography variant="h6" sx={{ color: 'success.dark' }}>
          Solution
        </Typography>
        <Button
          size="small"
          onClick={() => setExpanded((prev) => !prev)}
          endIcon={expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
        >
          {expanded ? 'Hide' : 'Show'}
        </Button>
      </Box>
      <Collapse in={expanded} unmountOnExit>
        <Paper variant="outlined" sx={{ mt: 2, p: 2, bgcolor: 'background.paper' }}>
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
      </Collapse>
    </Paper>
  );
}
