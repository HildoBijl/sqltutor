import { type ReactNode } from 'react';
import { Link as MuiLink, type LinkProps as MuiLinkProps } from '@mui/material';

export type LinkProps = MuiLinkProps & {
  to: string;
  children: ReactNode;
};

export function Link({ to, children, ...props }: LinkProps) {
  return (
    <MuiLink
      href={to}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </MuiLink>
  );
}
