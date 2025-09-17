import { Alert, Box, Typography } from '@mui/material';

export function Theory() {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography variant="body1">
        In SQL it is possible to create new columns using arithmetic. For instance, you can use "SELECT firstGrade*0.4 + secondGrade*0.6 as finalGrade FROM results". It is important to distinguish DECIMAL and FLOAT data types here. Possibly some CAST functions might have to be used. Other useful options include ROUND, CEIL, FLOOR and ABS.
      </Typography>
      <Alert severity="info">
        Pay attention to data types. Integer division truncates decimals. Use casts (CAST(... AS DECIMAL)) or
        functions like ROUND to control precision.
      </Alert>
    </Box>
  );
}

export default Theory;
