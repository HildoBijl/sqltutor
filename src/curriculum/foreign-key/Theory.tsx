import { Alert, Box } from '@mui/material';

export function Theory() {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Alert severity="info">
        Theory for this concept will come soon.
        {/* Foreign key explanation will come here: how to reference one table from another. */}
      </Alert>
    </Box>
  );
}

export default Theory;
