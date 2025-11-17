import { Alert, Box, Typography } from '@mui/material';

export function Theory() {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Alert severity="info">
        SQL supports several join flavours. Decide whether unmatched rows should appear in the result before choosing the
        join type.
      </Alert>
      <Typography variant="body1">
        When every object in a set has sub-elements, a join is smooth. But what if a join doesn't have sub-elements? In this case we can either exclude the object in the join (an inner join) or include it with Null values (an outer join). There are also variations, with left inner join, right outer join, and so forth.
      </Typography>
    </Box>
  );
}

export default Theory;
