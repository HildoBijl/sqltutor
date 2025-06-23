import { Alert } from '@mui/material'

export function Warning({ children, ...props }) {
	return <Alert severity="warning" {...{ ...props, sx: { my: 2, textAlign: 'justify', ...(props.sx || {}) } }}>{children}</Alert>
}
