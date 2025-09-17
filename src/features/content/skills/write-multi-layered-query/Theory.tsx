import { Box, Typography } from '@mui/material';

export function Theory() {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography variant="body1">
        Sometimes you need to write queries having multiple layers. Key is to keep things structured. One way to do this is to write your own temporary queries, defining them with WITH (making a Common Table Expression (CTE)). However, if you want to use parameters of outer queries inside inner queries, then this isn't possible, and multiple queries need to be nested inside each other. Often multiple solutions are possible, so it's up to you to find one that not only works but is also easy enough to understand. This reduces potential oversights and errors. (Subqueries may require also a simple aggregation like finding a minimum or maximum value, or using some arithmetic on columns values. Internal note: the exercise set on Canvas on Advanced SQL covers this skill for a large part.)
      </Typography>
    </Box>
  );
}

export default Theory;
