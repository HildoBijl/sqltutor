import { Box, Typography } from '@mui/material';

export function Theory() {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Box
        component="iframe"
        title="Embedded Media titled: Initial trial - DIY studio(02)"
        aria-label="Embedded Media titled: Initial trial - DIY studio(02)"
        src="https://tue.video.yuja.com/V/Video?v=953393&node=5343019&a=1322910&preload=false"
        width="100%"
        height="315"
        loading="lazy"
        frameBorder="0"
        allowFullScreen
        sx={{
          border: 0,
          aspectRatio: '16 / 9',
          maxWidth: '100%',
        }}
      />
      <Typography variant="body1">
        In a database table, we need to find a way to uniquely identify rows. These are the so-called keys. There are super keys, candidate keys and primary keys. Super keys uniquely identify the row (assuming there are no duplicates), candidate keys do so as well but are minimal, and the primary key is the candidate key that we choose to use in practice.
      </Typography>
    </Box>
  );
}

export default Theory;
