import { Box, Button } from '@mui/material'
import { Check } from '@mui/icons-material'

import { useLocalStorageState } from 'components'
import { useComponent } from 'edu'

export function CompleteConcept() {
	const skill = useComponent()
	const [skillState, setSkillState] = useLocalStorageState(`component-${skill.id}`, { skillId: skill.id })

	// Don't show this button if the concept has already been completed.
	if (skillState.complete)
		return null

	// Render the button.
	return <Box sx={{ display: 'flex', flexFlow: 'row wrap', justifyContent: 'flex-end' }}>
		<Button variant="contained" startIcon={<Check />} onClick={() => setSkillState(skillState => ({ ...skillState, understood: true, complete: true }))}>
			I understand this concept
		</Button>
	</Box>
}
