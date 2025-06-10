import { Alert } from '@mui/material'

export function Info({ children, ...props }) {
	return <Alert severity="info" {...props}>{children}</Alert>
}
