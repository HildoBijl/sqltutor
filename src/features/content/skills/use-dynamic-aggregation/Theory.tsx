import { Box, Typography } from '@mui/material';

export function Theory() {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography variant="body1">
        In case you want to apply different types of aggregations (only one column A, only on column B, on columns A and B, and so forth) then dynamic aggregations are useful. The standard is the CUBE command, but in case of hierarchical data the ROLLUP command can also be useful.
      </Typography>
    </Box>
  );
}

export default Theory;
