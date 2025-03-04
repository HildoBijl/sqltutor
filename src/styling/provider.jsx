import { useMemo } from 'react'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'

import { createCustomTheme } from './theme'

export function ThemeProvider({ children }) {
	const theme = useMemo(() => createCustomTheme(), [])
	return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
}
