import { Box, Typography } from '@mui/material';

export function Theory() {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography variant="body1">
        To aggregate columns in SQL, use the aggregation functions MIN, MAX, AVG, SUM, COUNT and so forth, for numerical values. Note that because multiple rows get merged, you cannot pick other columns. You can do this for the whole table, or you can use the GROUP BY to make groups. In this case, you can pick the grouped-by columns.
        
      </Typography>
    </Box>
  );
}

export default Theory;
