import { type ReactNode } from 'react';
import { Alert as AlertMUI, type AlertProps as AlertPropsMUI } from '@mui/material';

export type AlertProps = AlertPropsMUI & {
	children: ReactNode;
};

export function Alert({ children, severity = 'info', sx, ...props }: AlertProps) {
	return (
		<AlertMUI
			severity={severity}
			sx={{
				my: 2,
				textAlign: 'justify',
				...sx,
			}}
			{...props}
		>
			{children}
		</AlertMUI>
	);
}
