import { createTheme } from '@mui/material/styles'

import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

import './main.css'

export const createCustomTheme = () => createTheme({
	palette: {
		mode: 'dark',
		primary: {
			main: '#c81919',
		},
		secondary: {
			main: '#262626',
		},
		background: {
			default: '#282C34',
			paper: '#21252B',
		},
		text: {
			primary: '#ABB2BF',
		},
		divider: '#3E4451',
	},
	components: {
		MuiTableCell: {
			styleOverrides: {
				root: {
					borderColor: '#3E4451', // Border color to match theme
				},
				// header of the table
				head: {
					backgroundColor: '#282C34',
					color: '#c81919',
					fontWeight: 'bold',
				},
				// body text in the row #ABB2BF - alternative color
				body: {
					color: '#eaecf1',
				}
			}
		},
	},
})
