import { type BoxProps, Box } from '@mui/material';

export type PageProps = BoxProps;

export function Page({ children, ...props }: PageProps) {
	return <Box display="flex" flexDirection="column" gap={4} {...props}>
		{children}
	</Box>;
}
