import { type BoxProps, Box } from '@mui/material';

import { Head } from './Head';

export type SectionProps = BoxProps & {
	title?: string;
};

export function Section({ title, children, ...props }: SectionProps) {
	return <Box display="flex" flexDirection="column" gap={1} {...props}>
		{title ? <Head>{title}</Head> : null}
		{children}
	</Box>;
}
