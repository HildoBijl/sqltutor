import { Par, type ParProps } from './Par';

export type QuoteProps = ParProps;

export function Quote({ children, sx, ...props }: ParProps) {
  return <Par sx={{
    fontSize: '0.85em',
    fontStyle: 'italic',
    textAlign: 'center',
    ...sx,
  }}
    {...props}
  >
    {children}
  </Par>
}
