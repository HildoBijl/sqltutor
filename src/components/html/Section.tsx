import { type ReactNode } from 'react';
import { type BoxProps, Box } from '@mui/material';

import { Head } from './Head';

export type SectionProps = Omit<BoxProps, 'title'> & {
	title?: ReactNode;
};

export function Section({ title, children, ...props }: SectionProps) {
	return <Box display="flex" flexDirection="column" gap={1.5} {...props}>
		{title ? <Head>{title}</Head> : null}
		{children}
	</Box>;
}
