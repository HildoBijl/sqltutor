import { type ReactNode } from 'react';
import { Typography, type TypographyProps } from '@mui/material';

export type RelationNameProps = TypographyProps & {
  children: ReactNode;
};

export function RelationName({ children, sx, ...props }: RelationNameProps) {
  return <Typography
    component="strong"
    variant="inherit"
    fontWeight="bold"
    sx={{ ...sx }}
    {...props}
  >
    {children}
  </Typography>;
}
