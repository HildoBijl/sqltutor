import { Box, Typography } from '@mui/material';

export function Theory() {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography variant="body1">
        When you have data that depends on multiple parameters, you can turn a key-value database into a pivot table.
      </Typography>
    </Box>
  );
}

export default Theory;
