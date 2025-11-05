import { useState } from 'react';

import { Box, Button, Collapse, Divider, Paper, Typography } from '@mui/material';
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
    <Paper
      variant="outlined"
      sx={{
        mt: 3,
        mb: 3,
        p: 2.5,
        borderRadius: 2,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: 'none',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Solution
        </Typography>
        <Button
          size="small"
          color="primary"
          variant="text"
          onClick={() => setExpanded((prev) => !prev)}
          endIcon={expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
          sx={{ textTransform: 'none', fontWeight: 500, px: 1 }}
        >
          {expanded ? 'Hide' : 'Show'}
        </Button>
      </Box>
      <Collapse in={expanded} unmountOnExit>
        <Divider sx={{ my: 2 }} />
        <Box
          component="pre"
          sx={{
            m: 0,
            px: 2,
            py: 1.5,
            borderRadius: 1,
            bgcolor: 'grey.50',
            fontFamily: 'Fira Code, monospace',
            fontSize: '0.95rem',
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            overflowX: 'auto',
          }}
        >
          {solution}
        </Box>
      </Collapse>
    </Paper>
  );
}
