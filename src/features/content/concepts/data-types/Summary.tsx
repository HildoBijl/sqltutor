import { Box, Typography } from '@mui/material';

export function Summary() {
  return (
    <Box display="flex" flexDirection="column" gap={1.5}>
      <Typography variant="body1">
        Some summary will appear here.
      </Typography>
    </Box>
  );
}

export default Summary;
