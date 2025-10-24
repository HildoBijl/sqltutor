import { type ReactNode } from 'react';
import { Typography, type TypographyProps } from '@mui/material';

export type HeadProps = TypographyProps & {
  children: ReactNode;
};

export function Head({ children, ...props }: HeadProps) {
  return (
    <Typography variant="h5" component="h2" {...props}>
      {children}
    </Typography>
  );
}
