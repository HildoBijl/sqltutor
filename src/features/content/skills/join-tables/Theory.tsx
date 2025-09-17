import { Box, Typography } from '@mui/material';

export function Theory() {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography variant="body1">
        When there are multiple linked tables, you can join them together. SQL has a large variety of tools to do so. You can do so using a simple WHERE statement, which gives all combinations of rows. These can then of course be filtered. The short-cut is the JOIN. There is either the NATURAL JOIN that compares equally named attributes, or the JOIN itself which can specify the join conditions through "ON". On top of that, there is a distinction between the INNER JOIN and the OUTER JOIN. (This skill does not involve complicated filtering to be done on the resulting joins yet. The focus is on joining tables. Basic filters can be included.)
      </Typography>
    </Box>
  );
}

export default Theory;
