import { Box, Typography } from '@mui/material';

export function Theory() {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography variant="body1">
        When there are two tables, one referencing the other, then you can run a filter on the other table, find the keys that match that filter, and subsequently use an outer query to extract data from the first table based on a criterion from the second table.
      </Typography>
    </Box>
  );
}

export default Theory;
