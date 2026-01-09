import { Box, type BoxProps } from '@mui/material';

export type ParProps = BoxProps;

export function Par({ children, sx, ...props }: ParProps) {
  return <Box
    component="div"
    sx={{
      display: 'block',
      textAlign: 'justify',
      ...sx,
    }}
    {...props}
  >
    {children}
  </Box>;
}
