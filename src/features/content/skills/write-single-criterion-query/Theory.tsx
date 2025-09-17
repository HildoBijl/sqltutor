import { Box, Typography } from '@mui/material';

export function Theory() {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography variant="body1">
        You can set up a basic query to extract data from tables by combining a projection and a filter. For instance, you can use "SELECT firstName, lastName FROM people WHERE age {"<"} 18". (This skill only considers single-criterion conditions and not multi-criterion conditions.)
      </Typography>
    </Box>
  );
}

export default Theory;
