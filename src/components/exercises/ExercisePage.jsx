import { useEffect } from 'react'

import { useLocalStorageState } from 'util'
import { useComponent } from 'edu'
import * as content from 'content'

import { selectAndGenerateExercise } from './util'
import { Exercises } from './Exercises'

export function ExercisePage() {
	// Extract data needed to render the exercise page.
	const skill = useComponent()
	const skillModule = content[skill.id]
	const [skillState, setSkillState] = useLocalStorageState(`component-${skill.id}`, {})

	// Whenever there are no exercises, initialize the first exercise.
	useEffect(() => {
		if ((skillState.exerciseHistory || []).length !== 0)
			return
		setSkillState(skillState => {
			if ((skillState.exerciseHistory || []).length !== 0)
				return skillState
			return { ...skillState, exerciseHistory: [selectAndGenerateExercise(skillModule.exercises, skillState.exercises || [])] }
		})
	}, [skillModule, skillState, setSkillState])

	// When no exercises are in the state yet, we are most likely initializing one. For now, show a loading note.
	const history = skillState.exerciseHistory || []
	if (history.length === 0)
		return <p>Generating exercise...</p>

	// Show the exercises that have been done so far.
	return <Exercises skill={skill} history={history} />
}
