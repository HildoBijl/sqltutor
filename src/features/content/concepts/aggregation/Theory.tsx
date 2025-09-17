import { Box, Typography } from '@mui/material';

export function Theory() {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography variant="body1">
        Sometimes you want to calculate a quantity (like a min/max/average) for various groups within your table. This is what aggregation means: making groups within your table and squashing each group into a single value (or set of values).
      </Typography>
    </Box>
  );
}

export default Theory;
