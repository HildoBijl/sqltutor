import { Alert } from '@mui/material'

export function Info({ children, ...props }) {
	return <Alert severity="info" {...{ ...props, sx: { textAlign: 'justify', ...(props.sx || {}) } }}>{children}</Alert>
}
