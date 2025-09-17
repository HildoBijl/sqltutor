import { Typography, Box, Paper } from '@mui/material';

const exampleQueries = [
  "SELECT *\nFROM companies\nWHERE country = 'Netherlands';",
  "SELECT *\nFROM companies\nWHERE company_name LIKE 'M%';",
];

export function Theory() {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography variant="body1">
        You can filter rows in SQL by adding a &quot;WHERE&quot; clause to an SQL query.
        How to set up the filter depends on the data type that's being considered.
        You can use &quot;=&quot;, &quot;&gt;&quot;, &quot;&lt;&quot; and &quot;&lt;&gt;&quot; and this is
        processed accordingly for numbers, strings, dates, etcetera. For strings,
        the filler &quot;%&quot; is useful. For lists, you can use lists as in
        <code> name IN ('Alice', 'Bob', 'Carl')</code>.
        [Edit: perhaps move &quot;IN&quot; to the filtering rows on multiple criteria?]
      </Typography>
      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Examples
        </Typography>
        {exampleQueries.map((snippet, index) => (
          <Paper
            key={index}
            variant="outlined"
            sx={{ p: 2, bgcolor: 'background.default', mb: index === 0 ? 2 : 0 }}
          >
            <Typography component="pre" sx={{ m: 0, fontFamily: 'monospace', whiteSpace: 'pre' }}>
              {snippet}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

export default Theory;
