import { type ReactNode } from 'react';
import { Box } from '@mui/material';

import { Head } from './Head';

export type SectionProps = {
	title: string;
	children: ReactNode;
};

export function Section({ title, children }: SectionProps) {
	return (
		<Box display="flex" flexDirection="column" gap={1.5}>
			<Head>{title}</Head>
			{children}
		</Box>
	);
}
