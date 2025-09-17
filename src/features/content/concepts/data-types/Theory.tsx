import { Alert, Box, Typography } from '@mui/material';

export function Theory() {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Alert severity="warning">
        This theory page is still under development. The contents below only offer a meta-description of what will
        be taught in this component.
      </Alert>
      <Typography variant="body1">
        In relational databases, fields can be numbers, text, dates or more. So there are different data types. Numbers can even be of different types. Data types are determined per column. SQL also has the "NULL" value which means "empty" or "unknown".
      </Typography>
    </Box>
  );
}

export default Theory;
