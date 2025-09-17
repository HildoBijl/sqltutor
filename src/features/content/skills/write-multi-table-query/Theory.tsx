import { Box, Typography } from '@mui/material';

export function Theory() {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography variant="body1">
        Often you need to combine multiple tables to set up a proper filtering. You then have two options: either join the tables, and apply the corresponding filtering, or use a subquery on one table and apply IN, NOT IN, EXISTS and NOT EXISTS on this subquery. Which one works better depends on the situation and on personal preferences. In very special circumstances, you may also have to combine tables using UNION, INTERSECT and EXCEPT. (Internal note: the exercise set on Canvas on Basic SQL covers this skill for a very large part.)
      </Typography>
    </Box>
  );
}

export default Theory;
