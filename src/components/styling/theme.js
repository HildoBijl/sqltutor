import { createTheme } from '@mui/material/styles'

import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

import { themeColor, secondaryColor } from './settings'
import './main.css'

export const createCustomTheme = () => createTheme({
	palette: {
		mode: 'dark',
		primary: {
			main: themeColor,
		},
		secondary: {
			main: secondaryColor,
		},
		background: {
			default: '#282c34',
			paper: '#21252b',
		},
		text: {
			primary: '#abb2bf',
		},
		divider: '#3e4451',
	},
	components: {
		MuiTableCell: {
			styleOverrides: {
				root: {
					borderColor: '#3e4451', // Border color to match theme
				},
				// header of the table
				head: {
					backgroundColor: '#282c34',
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
