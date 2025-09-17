import { Alert, Box, Typography } from '@mui/material';

export function Theory() {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Alert severity="warning">
        This theory page is still under development. The contents below only offer a meta-description of what will
        be taught in this component.
      </Alert>
      <Typography variant="body1">
        When a database consists of tables (it is a relational database) these tables are called relations. It has columns known as attributes and it has rows known as tuples. A single element in the database is called a cell or a field. The database design is called the schema, and the data is the instance.
      </Typography>
    </Box>
  );
}

export default Theory;
