import { type ReactNode } from 'react';
import { Typography, type TypographyProps } from '@mui/material';

export type EmProps = TypographyProps & {
  children: ReactNode;
};

export function Em({ children, sx, ...props }: EmProps) {
  return <Typography
    component="em"
    sx={{
      fontSize: 'inherit',
      fontWeight: 'inherit',
      ...sx,
    }}
    {...props}
  >
    {children}
  </Typography>;
}
