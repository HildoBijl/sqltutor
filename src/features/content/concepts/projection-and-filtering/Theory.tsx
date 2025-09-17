import { Box, Typography } from '@mui/material';

export function Theory() {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography variant="body1">
        You can manipulate database tables in certain ways. A common operation is to only pick certain rows or columns, or both. Only picking certain columns is called a projection. Only picking certain skills is called a filter. The outcome is again a database table.
      </Typography>
    </Box>
  );
}

export default Theory;
