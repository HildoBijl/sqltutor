import { Alert, Box, Typography } from '@mui/material';

export function Theory() {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography variant="body1">
        You can also apply filters when using aggregation. Key here is to ask yourself: should the filter be applied before or after the aggregation? In the first case use WHERE and in the second case use HAVING. On top of this, you may also apply arithmetic within aggregation. Crucial is to keep in mind Null-values. Some aggregation functions don't deal well with them, so these edge-cases should be caught.
      </Typography>
      <Alert severity="info">
        Keep the logic readable by naming aggregated columns with aliases and reusing them in the HAVING clause when
        your database allows it.
      </Alert>
    </Box>
  );
}

export default Theory;
