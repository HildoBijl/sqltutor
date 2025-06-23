import { Box, Button } from '@mui/material'
import { Check } from '@mui/icons-material'

import { useComponent, useComponentState } from 'edu'

export function CompleteConcept() {
	const component = useComponent()
	const [componentState, setComponentState] = useComponentState(component.id)

	// Don't show this button if the concept has already been understood.
	if (!componentState || componentState.understood)
		return null

	// Render the button.
	return <Box sx={{ my: 2, display: 'flex', flexFlow: 'row wrap', justifyContent: 'flex-end' }}>
		<Button variant="contained" startIcon={<Check />} onClick={() => setComponentState(skillState => ({ ...skillState, understood: true }))}>
			Yes, makes sense!
		</Button>
	</Box>
}
