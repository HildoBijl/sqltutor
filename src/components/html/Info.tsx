import { Alert, type AlertProps } from './Alert';

export type InfoProps = Omit<AlertProps, 'severity'>;

export function Info({ children, ...props }: InfoProps) {
  return (
    <Alert severity="info" {...props}>
      {children}
    </Alert>
  );
}
