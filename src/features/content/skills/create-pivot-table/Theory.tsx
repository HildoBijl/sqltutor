import { Box, Typography } from '@mui/material';

export function Theory() {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography variant="body1">
        Using aggregation, you can easily make pivot tables. For this, first set up the table you wish to aggregate on. Then apply the aggregation to create the key-value table. Then apply the SQL pivot command to set up the pivot table.
      </Typography>
    </Box>
  );
}

export default Theory;
