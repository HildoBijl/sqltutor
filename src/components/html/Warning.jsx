import { Alert } from '@mui/material'

export function Warning({ children, ...props }) {
	return <Alert severity="warning" {...props}>{children}</Alert>
}
