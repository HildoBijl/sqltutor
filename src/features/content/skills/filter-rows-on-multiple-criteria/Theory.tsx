import { Alert, Box, Typography } from '@mui/material';

export function Theory() {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography variant="body1">
        If there are multiple conditions, they can be patched together using AND and OR, applying brackets where needed. Sometimes the BETWEEN operator or the NOT keyword is also useful. It is also important to deal with Null values, when they appear. (This skill does not include using subqueries through IN, EXISTS, etcetera.)
      </Typography>
      <Alert severity="info">
        Remember that NULL never equals anything even another NULL. Use IS NULL and IS NOT NULL when handling
        optional data.
      </Alert>
    </Box>
  );
}

export default Theory;
