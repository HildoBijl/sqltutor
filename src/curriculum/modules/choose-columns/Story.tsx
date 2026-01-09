import { Box, Typography } from '@mui/material';

export function Story() {
  return (
    <Box display="flex" flexDirection="column" gap={1.5}>
      <Typography variant="body1">
        Some story will appear here.
      </Typography>
    </Box>
  );
}

export default Story;
