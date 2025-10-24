import { type ReactNode } from 'react';
import { Typography, type TypographyProps } from '@mui/material';

export type TermProps = TypographyProps & {
  children: ReactNode;
};

export function Term({ children, sx, ...props }: TermProps) {
  return (
    <Typography
      component="strong"
      fontWeight="bold"
      sx={{ ...sx }}
      {...props}
    >
      {children}
    </Typography>
  );
}
