import { type ReactNode } from 'react';
import { Typography, type TypographyProps } from '@mui/material';

export type ForeignKeyProps = TypographyProps & {
  children: ReactNode;
};

export function ForeignKey({ children, sx, ...props }: ForeignKeyProps) {
  return (
    <Typography
      component="span"
      variant="inherit"
      sx={{ fontStyle: 'italic', ...sx }}
      {...props}
    >
      {children}
    </Typography>
  );
}
