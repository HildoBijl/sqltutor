import { type TypographyProps, Typography } from '@mui/material';

export type HeadProps = TypographyProps;

export function Head({ children, ...props }: HeadProps) {
  return <Typography variant="h5" component="h2" {...props}>
    {children}
  </Typography>;
}
