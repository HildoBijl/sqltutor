import { type ReactNode } from 'react';
import { Box, type BoxProps } from '@mui/material';

export type ParProps = BoxProps & {
  children: ReactNode;
};

export function Par({ children, sx, ...props }: ParProps) {
  return (
    <Box
      component="div"
      sx={{
        display: 'block',
        my: 2,
        textAlign: 'justify',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}
