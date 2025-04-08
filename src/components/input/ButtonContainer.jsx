import { Box } from '@mui/material'

export function ButtonContainer({ children }) {
	return <Box sx={{ display: 'flex', flexFlow: 'row', justifyContent: 'flex-end', gap: 2, my: 2 }}>{children}</Box>
}
