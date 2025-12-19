import type { ReactNode } from 'react';

import { Box, Paper, Typography, Divider } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

interface ExerciseSectionProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  sx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
  showDivider?: boolean;
}

export function ExerciseSection({
  title,
  children,
  actions,
  sx,
  contentSx,
  showDivider = true,
}: ExerciseSectionProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        mt: 3,
        mb: 3,
        borderRadius: 2,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: 'none',
        ...sx,
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        {actions}
      </Box>
      {showDivider && <Divider sx={{ mx: 1, mb: 2 }} />}
      <Box sx={{ px: 2.5, pb: 2.5, ...contentSx }}>{children}</Box>
    </Paper>
  );
}
