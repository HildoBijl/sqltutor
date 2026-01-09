import { type AlertProps as AlertPropsMUI, Alert as AlertMUI } from '@mui/material';

export type AlertProps = AlertPropsMUI;

export function Alert({ children, severity = 'info', sx, ...props }: AlertProps) {
	return <AlertMUI
		severity={severity}
		sx={{
			textAlign: 'justify',
			...sx,
		}}
		{...props}
	>
		{children}
	</AlertMUI>;
}
