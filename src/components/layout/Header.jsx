import { useNavigate } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import { ArrowBack } from '@mui/icons-material'

import { siteTitle } from 'settings'
import { useCurrentRoute } from 'routing'

import { Container } from './Container'

export function Header() {
	const navigate = useNavigate()

	// If the route indicated no header should be present, don't render a header.
	const route = useCurrentRoute()
	if (route.header === false)
		return null

	// Render the Header.
	return <Box>
		<AppBar position="static" enableColorOnDark>
			<Container>
				<Toolbar disableGutters={true} sx={{ px: 1 }}>
					<IconButton edge="start" color="inherit" sx={{ mr: 2 }} onClick={() => navigate(route.back || '/')}>
						<ArrowBack />
					</IconButton>
					<Typography variant="h6" color="inherit" component="div">
						{route.title || siteTitle}
					</Typography>
				</Toolbar>
			</Container>
		</AppBar>
	</Box>
}
