import { Box, Typography } from '@mui/material';

export function Summary() {
  return (
    <Box display="flex" flexDirection="column" gap={1.5}>
      <Typography variant="body1">
        This summary is still under development. It should come in the next few weeks.
      </Typography>
    </Box>
  );
}

export default Summary;
