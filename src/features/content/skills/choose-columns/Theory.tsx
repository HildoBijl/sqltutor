import { Box, Typography } from '@mui/material';

export function Theory() {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography variant="body1">
        You can choose columns in SQL by adding them after the SELECT statement. Columns can be renamed using the "as" operator, or this "as" can be omitted altogether.
      </Typography>
    </Box>
  );
}

export default Theory;
