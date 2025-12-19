import { Typography, Box } from '@mui/material';

export function Story() {
  return (
    <Box display="flex" flexDirection="column" gap={1.5}>
      <Typography variant="body1">
        You're a fresh graduate looking for a job. You heard there's a database of companies that you can easily search to find the optimal job. But wait ... you've never even heard of a database before. What is it?
      </Typography>
    </Box>
  );
}

export default Story;
