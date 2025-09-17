import { Alert, Box, Typography } from '@mui/material';

export function Theory() {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Alert severity="warning">
        This theory page is still under development. The contents below only offer a meta-description of what will
        be taught in this component.
      </Alert>
      <Typography variant="body1">
        In a database table, we need to find a way to uniquely identify rows. These are the so-called keys. There are super keys, candidate keys and primary keys. Super keys uniquely identify the row (assuming there are no duplicates), candidate keys do so as well but are minimal, and the primary key is the candidate key that we choose to use in practice.
      </Typography>
    </Box>
  );
}

export default Theory;
