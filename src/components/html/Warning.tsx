import { Alert, type AlertProps } from './Alert';

export type WarningProps = Omit<AlertProps, 'severity'>;

export function Warning({ children, ...props }: WarningProps) {
	return (
		<Alert severity="warning" {...props}>
			{children}
		</Alert>
	);
}
