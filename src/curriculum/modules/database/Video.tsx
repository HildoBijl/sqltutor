import { Box } from '@mui/material';

export function Video() {
  return (
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
  );
}

export default Video;
