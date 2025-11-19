import { type ReactNode } from 'react';
import { Link as MuiLink, type LinkProps as MuiLinkProps } from '@mui/material';

export type LinkProps = MuiLinkProps & {
  to: string;
  children: ReactNode;
};

export function Link({ to, children, ...props }: LinkProps) {
  const external = (to[0] !== '/');
  return <MuiLink
    href={to}
    target={external ? '_blank' : 'self'}
    rel={external ? 'noopener noreferrer' : ''}
    {...props}
    sx={{
      ...(props.sx || {}),
      fontWeight: 500,
      textDecoration: 'none',
      '&:hover': { textDecoration: 'none' },
    }}
  >
    {children}
  </MuiLink>;
}
